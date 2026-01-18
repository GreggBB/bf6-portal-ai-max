# Pattern: Spatial Math

> **SDK Version**: 1.1.3.0 (Battlefield 6)
> **Source**: mods/BumperCars/BumperCars.ts:1569-1708, mods/AcePursuit/AcePursuit.ts:1128-1140, 1267-1331, 1470-1531

---

## Overview

Spatial math utilities for positioning, rotation, and layout calculations. These patterns are used for:
- Distributing spawn points around an arena
- Calculating rotation angles for objects to face directions
- Converting Godot quaternions to euler angles
- Generating spawn lines perpendicular to paths
- Creating circles in 3D space oriented to face a direction

---

## Vector3 Type

Most patterns use a simple Vector3 type (not `mod.Vector`):

```typescript
type Vector3 = { x: number; y: number; z: number };
```

Convert to/from mod.Vector as needed:

```typescript
function toModVector(v: Vector3): mod.Vector {
    return mod.CreateVector(v.x, v.y, v.z);
}

function fromModVector(v: mod.Vector): Vector3 {
    return {
        x: mod.XComponentOf(v),
        y: mod.YComponentOf(v),
        z: mod.ZComponentOf(v)
    };
}
```

---

## Circle Point Distribution

Generate evenly-spaced points around a center (horizontal plane):

```typescript
/**
 * Returns an array of points distributed evenly around a center point.
 *
 * @param center - The center point { x, y, z }
 * @param radius - The distance from center to each point
 * @param numPoints - The number of points to generate
 * @returns Array of points on a circle (Y stays constant)
 */
function getPointsAround(
    center: Vector3,
    radius: number,
    numPoints: number
): Vector3[] {
    const points: Vector3[] = [];

    for (let i = 0; i < numPoints; i++) {
        const angle = (2 * Math.PI * i) / numPoints;

        const x = center.x + radius * Math.cos(angle);
        const z = center.z + radius * Math.sin(angle);
        const y = center.y;  // Keep Y fixed (height)

        points.push({ x, y, z });
    }

    return points;
}

// Usage: Spawn 8 vehicles around arena center
const spawnPoints = getPointsAround(arenaCenterPoint, 50, playerCount);
```

---

## 3D Circle (Oriented to Face a Direction)

Generate points on a circle oriented perpendicular to a direction:

```typescript
/**
 * Generate points in a circle oriented to face a direction.
 * Useful for checkpoint rings that face the path direction.
 */
function generatePointsInACircle(
    center: Vector3,
    lookAt: Vector3,
    radius: number,
    segments: number
): Vector3[] {
    const positions: Vector3[] = [];

    // Compute forward direction vector
    const forward = normalizeVector(subtractVectors(lookAt, center));

    // Choose arbitrary up vector
    const worldUp = { x: 0, y: 1, z: 0 };

    // Compute right vector (perpendicular to forward and up)
    let right = crossProduct(worldUp, forward);
    if (length(right) < 0.0001) {
        // If forward is parallel to worldUp, use another reference
        right = crossProduct({ x: 1, y: 0, z: 0 }, forward);
    }
    right = normalizeVector(right);

    // Compute actual up vector perpendicular to forward and right
    const up = normalizeVector(crossProduct(forward, right));

    for (let i = 0; i < segments; i++) {
        const angle = (i / segments) * Math.PI * 2;
        const cosA = Math.cos(angle) * radius;
        const sinA = Math.sin(angle) * radius;

        const point = {
            x: center.x + right.x * cosA + up.x * sinA,
            y: center.y + right.y * cosA + up.y * sinA,
            z: center.z + right.z * cosA + up.z * sinA,
        };

        positions.push(point);
    }

    return positions;
}
```

---

## Direction Vector (Normalized)

Get a normalized direction vector from one point to another:

```typescript
/**
 * Returns a normalized direction vector from point A to point B.
 *
 * @param from - Starting point
 * @param to - Target point
 * @param flip - If true, returns direction from to→from instead
 * @returns Normalized direction vector
 */
function getDirectionVector(
    from: Vector3,
    to: Vector3,
    flip: boolean = false
): Vector3 {
    let dx = to.x - from.x;
    let dy = to.y - from.y;
    let dz = to.z - from.z;

    if (flip) {
        dx *= -1;
        dy *= -1;
        dz *= -1;
    }

    const len = Math.sqrt(dx * dx + dy * dy + dz * dz);
    if (len === 0) return { x: 0, y: 0, z: 0 };

    return { x: dx / len, y: dy / len, z: dz / len };
}
```

---

## Direction to Euler Angles

Convert a direction vector to euler angles (pitch, yaw, roll):

```typescript
/**
 * Convert a direction vector to euler angles.
 * Returns { pitch, yaw, roll } in radians.
 */
function directionToEuler(dir: Vector3): { pitch: number; yaw: number; roll: number } {
    const yaw = Math.atan2(dir.x, dir.z);   // Rotation around Y axis
    const pitch = Math.asin(-dir.y);         // Rotation around X axis
    const roll = 0;                          // Usually 0 unless tilted

    return { pitch, yaw, roll };
}

// Usage: Make spawner face toward arena center
const direction = getDirectionVector(spawnPoint, arenaCenter);
const rotation = directionToEuler(direction);
const spawner = mod.SpawnObject(
    mod.RuntimeSpawn_Common.VehicleSpawner,
    mod.CreateVector(spawnPoint.x, spawnPoint.y, spawnPoint.z),
    mod.CreateVector(rotation.pitch, rotation.yaw, rotation.roll),
    mod.CreateVector(1, 1, 1)
);
```

---

## Look-At Rotation

Get rotation to make an object face from one point toward another:

```typescript
/**
 * Calculate pitch/yaw rotation to look from one point to another.
 * Returns { x: pitch, y: yaw, z: roll } in radians.
 */
function getLookAtRotation(from: Vector3, to: Vector3): Vector3 {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const dz = to.z - from.z;

    const distanceXZ = Math.sqrt(dx * dx + dz * dz);

    const pitch = Math.atan2(dy, distanceXZ);
    const yaw = Math.atan2(dx, dz);
    const roll = 0;

    return { x: pitch, y: yaw, z: roll };
}

// Usage: Spawn vehicle facing toward forward position
const rotation = getLookAtRotation(spawnPosition, forwardPosition);
const spawner = mod.SpawnObject(
    mod.RuntimeSpawn_Common.VehicleSpawner,
    toModVector(spawnPosition),
    toModVector(rotation)
);
```

---

## Quaternion to Euler

Convert quaternion rotation (from Godot export data) to euler angles:

```typescript
/**
 * Convert quaternion to euler angles (x=roll, y=pitch, z=yaw).
 * Use for Godot-exported object rotations.
 */
function quaternionToEuler(
    q: { x: number; y: number; z: number; w: number },
    eps: number = 0.001
): Vector3 {
    const { x, y, z, w } = q;

    const sinr_cosp = 2 * (w * x + y * z);
    const cosr_cosp = 1 - 2 * (x * x + y * y);
    let roll = Math.atan2(sinr_cosp, cosr_cosp);

    const sinp = 2 * (w * y - z * x);
    let pitch: number;
    let yaw: number;

    if (Math.abs(sinp) > 0.999999) {
        // Gimbal lock case
        pitch = Math.sign(sinp) * (Math.PI / 2);
        roll = 0;
        yaw = 2 * Math.atan2(z, w) + (sinp > 0 ? eps : -eps);
    } else {
        pitch = Math.asin(sinp);
        const siny_cosp = 2 * (w * z + x * y);
        const cosy_cosp = 1 - 2 * (y * y + z * z);
        yaw = Math.atan2(siny_cosp, cosy_cosp);
    }

    // Normalize angles to [-PI, PI]
    function norm(a: number): number {
        while (a > Math.PI) a -= 2 * Math.PI;
        while (a < -Math.PI) a += 2 * Math.PI;
        return a;
    }

    return { x: norm(roll), y: norm(pitch), z: norm(yaw) };
}

// Usage with Godot export data
interface GodotTransform {
    position: Vector3;
    rotation: { x: number; y: number; z: number; w: number };
    scale: Vector3;
}

const euler = quaternionToEuler(godotObject.rotation);
const obj = mod.SpawnObject(
    objectType,
    toModVector(godotObject.position),
    mod.CreateVector(euler.x, euler.y, euler.z),
    toModVector(godotObject.scale)
);
```

---

## Spawn Line Generation

Generate evenly-spaced spawn points along a line, with offset positions perpendicular to the line:

```typescript
interface SpawnPoint {
    position: Vector3;        // Point on the line
    forwardPosition: Vector3; // Point offset perpendicular to line
}

/**
 * Generate spawn points along a line with perpendicular offsets.
 * Useful for race start grids, checkpoint spawns, etc.
 */
function generateSpawnLine(
    start: Vector3,
    end: Vector3,
    count: number,
    direction: "left" | "right" = "left",
    distance: number = 10,
    up: Vector3 = { x: 0, y: 1, z: 0 }
): SpawnPoint[] {
    if (count < 2) {
        throw new Error("Count must be at least 2");
    }

    const spawnPoints: SpawnPoint[] = [];

    // Forward vector along line
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const dz = end.z - start.z;
    const len = Math.sqrt(dx * dx + dy * dy + dz * dz);
    const forward = { x: dx / len, y: dy / len, z: dz / len };

    // Compute left = up × forward (cross product)
    const left = {
        x: up.y * forward.z - up.z * forward.y,
        y: up.z * forward.x - up.x * forward.z,
        z: up.x * forward.y - up.y * forward.x,
    };

    // Scale left vector to desired offset distance
    const sideScaled = {
        x: left.x * distance,
        y: left.y * distance,
        z: left.z * distance
    };

    // Step size along line
    const stepX = dx / (count - 1);
    const stepY = dy / (count - 1);
    const stepZ = dz / (count - 1);

    for (let i = 0; i < count; i++) {
        const position = {
            x: start.x + stepX * i,
            y: start.y + stepY * i,
            z: start.z + stepZ * i,
        };

        const forwardPosition = {
            x: position.x + sideScaled.x,
            y: position.y + sideScaled.y,
            z: position.z + sideScaled.z,
        };

        spawnPoints.push({ position, forwardPosition });
    }

    // Reverse order if "right" direction specified
    if (direction === "right") {
        return spawnPoints.reverse();
    }

    return spawnPoints;
}

// Usage: Create race start grid
const startLine = generateSpawnLine(
    checkpoint.checkpointStart,
    checkpoint.checkpointEnd,
    8,      // 8 spawn positions
    "left", // Facing left
    10      // 10 units offset
);
```

---

## Vector Utility Functions

Common helper functions:

```typescript
function subtractVectors(a: Vector3, b: Vector3): Vector3 {
    return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
}

function normalizeVector(v: Vector3): Vector3 {
    const len = length(v);
    return len === 0
        ? { x: 0, y: 0, z: 0 }
        : { x: v.x / len, y: v.y / len, z: v.z / len };
}

function crossProduct(a: Vector3, b: Vector3): Vector3 {
    return {
        x: a.y * b.z - a.z * b.y,
        y: a.z * b.x - a.x * b.z,
        z: a.x * b.y - a.y * b.x,
    };
}

function length(v: Vector3): number {
    return Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
}

function Lerp(a: number, b: number, t: number): number {
    return a + (b - a) * t;
}

function getCenterPosition(objects: { position: Vector3 }[]): Vector3 | undefined {
    if (objects.length === 0) return undefined;

    let sumX = 0, sumY = 0, sumZ = 0;

    for (const obj of objects) {
        sumX += obj.position.x;
        sumY += obj.position.y;
        sumZ += obj.position.z;
    }

    const count = objects.length;
    return { x: sumX / count, y: sumY / count, z: sumZ / count };
}
```

---

## SDK Vector Functions

Portal SDK provides these vector operations:

| Function | Signature | Description |
|----------|-----------|-------------|
| `CreateVector` | `(x, y, z): Vector` | Create a new vector |
| `XComponentOf` | `(vector): number` | Get X component |
| `YComponentOf` | `(vector): number` | Get Y component |
| `ZComponentOf` | `(vector): number` | Get Z component |
| `DistanceBetween` | `(a, b): number` | Distance between vectors |
| `Add` | `(a, b): Vector` | Add two vectors |

---

## Constraints & Gotchas

1. **Angle Units**: All angle functions return radians, not degrees. Portal SDK's `SpawnObject` expects radians.

2. **Coordinate System**: Y is typically "up" in Portal. The horizontal plane is X-Z.

3. **Quaternion Order**: Godot exports quaternions as `{ x, y, z, w }`. The `w` component is the scalar part.

4. **Division by Zero**: Always check for zero-length vectors before normalizing.

5. **mod.Vector vs Vector3**: SDK functions require `mod.Vector`. Use conversion functions when mixing with pure JS calculations.
