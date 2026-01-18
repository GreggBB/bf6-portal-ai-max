# Pattern: Runtime Object Spawning

> SDK Version: 1.1.3.0 (Battlefield 6)
> Source: mods/BumperCars/BumperCars.ts:451-457, 497-519, mods/AcePursuit/AcePursuit.ts:1179

---

## Overview

`SpawnObject` allows dynamic creation of props, VFX, gameplay objects, and more at runtime. Objects come from `RuntimeSpawn_*` enums - Common items work on all maps, while map-specific enums contain level-specific assets.

---

## Core API

### SpawnObject

```typescript
// Full signature (with scale)
mod.SpawnObject(
    prefabEnum: RuntimeSpawn_*,  // What to spawn
    position: mod.Vector,        // Where to spawn
    rotation: mod.Vector,        // Euler rotation (radians)
    scale: mod.Vector            // Scale multiplier
): mod.Any;

// Short signature (default scale 1,1,1)
mod.SpawnObject(
    prefabEnum: RuntimeSpawn_*,
    position: mod.Vector,
    rotation: mod.Vector
): mod.Any;
```

### UnspawnObject

```typescript
mod.UnspawnObject(obj: mod.Object): void;
```

---

## Working Code Examples

### Spawning Props
> Source: mods/BumperCars/BumperCars.ts:504-511

```typescript
// Spawn floor tiles for a platform
const platformTiles = [
    { id: mod.RuntimeSpawn_Common.FiringRange_Floor_A, position: { x: -569.28, y: 139.21, z: -128.87 } },
    { id: mod.RuntimeSpawn_Common.FiringRange_Floor_A, position: { x: -569.28, y: 139.21, z: -125.30 } },
    { id: mod.RuntimeSpawn_Common.FiringRange_Floor_A, position: { x: -574.28, y: 139.21, z: -125.30 } },
];

const spawnedObjects: mod.Object[] = [];

for (const tile of platformTiles) {
    const obj = mod.SpawnObject(
        tile.id,
        mod.CreateVector(tile.position.x, tile.position.y, tile.position.z),
        mod.CreateVector(0, 0, 0),  // No rotation
        mod.CreateVector(1, 1, 1)   // Default scale
    );
    spawnedObjects.push(obj);
}
```

### Spawning Vehicle Spawners
> Source: mods/AcePursuit/AcePursuit.ts:1179

```typescript
// Spawn a vehicle spawner at a position
const vehSpawner = mod.SpawnObject(
    mod.RuntimeSpawn_Common.VehicleSpawner,
    targetPosition,
    targetRotation
);

// Configure and trigger the spawner
mod.SetVehicleSpawnerVehicleType(vehSpawner, mod.VehicleList.CAV_Brawler);
mod.ForceVehicleSpawnerSpawn(vehSpawner);
```

### Spawning with Rotation and Scale
> Source: mods/BumperCars/BumperCars.ts:515

```typescript
// Spawn a decorative ring with rotation and scale
const decorativeRing = mod.SpawnObject(
    mod.RuntimeSpawn_Aftermath.Metrobus_Wreck_Rim_Front,
    mod.CreateVector(-611.16, 131.24, -33.66),
    mod.CreateVector(-0.197, -0.197, 0.679),  // Rotation (Euler radians)
    mod.CreateVector(6.0, 6.0, 6.0)           // 6x scale
);
```

### Object Cleanup Pattern
> Source: mods/BumperCars/BumperCars.ts:1048-1058

```typescript
class ObjectManager {
    static spawnedObjects: mod.Object[] = [];

    static SpawnPlatform(positions: {x: number, y: number, z: number}[]) {
        for (const pos of positions) {
            const obj = mod.SpawnObject(
                mod.RuntimeSpawn_Common.FiringRange_Floor_A,
                mod.CreateVector(pos.x, pos.y, pos.z),
                mod.CreateVector(0, 0, 0)
            );
            this.spawnedObjects.push(obj);
        }
    }

    static ClearAll() {
        for (const obj of this.spawnedObjects) {
            try {
                mod.UnspawnObject(obj);
            } catch (error) {
                // Object may already be destroyed
            }
        }
        this.spawnedObjects = [];
    }
}
```

### Shrinking Arena Pattern
> Source: mods/BumperCars/BumperCars.ts (ring deletion logic)

```typescript
class ShrinkingArena {
    static platformRings: mod.Object[][] = [];

    static async ShrinkArena(ringIndex: number) {
        if (ringIndex < 0 || ringIndex >= this.platformRings.length) return;

        const ring = this.platformRings[ringIndex];

        // Delete each platform in the ring
        for (const platform of ring) {
            try {
                mod.UnspawnObject(platform);
            } catch (error) {
                console.log("Platform already destroyed");
            }
        }

        // Clear the ring array
        this.platformRings[ringIndex] = [];
    }
}
```

---

## RuntimeSpawn Enums

### Common Objects (All Maps)

```typescript
// Gameplay Objects
mod.RuntimeSpawn_Common.VehicleSpawner     // Vehicle spawn point
mod.RuntimeSpawn_Common.WorldIcon          // 3D UI marker
mod.RuntimeSpawn_Common.AreaTrigger        // Trigger zone
mod.RuntimeSpawn_Common.CapturePoint       // Conquest flag
mod.RuntimeSpawn_Common.AI_Spawner         // AI spawn point
mod.RuntimeSpawn_Common.AI_WaypointPath    // AI navigation path

// Floor Tiles
mod.RuntimeSpawn_Common.FiringRange_Floor_A  // Standard floor tile

// Barriers & Cover
mod.RuntimeSpawn_Common.BarrierStoneBlock_01_A
mod.RuntimeSpawn_Common.BarrierStoneBlock_01_B
mod.RuntimeSpawn_Common.BarrierStoneBlock_01_C
mod.RuntimeSpawn_Common.BarrierStoneBlock_01_D
mod.RuntimeSpawn_Common.BarrierStoneBlock_01_E
mod.RuntimeSpawn_Common.BarrierStoneBlock_01_F
mod.RuntimeSpawn_Common.BarrierStoneBlock_01_G
mod.RuntimeSpawn_Common.BarrierStoneBlock_01_H
mod.RuntimeSpawn_Common.BarriersPedestrian_01_B
mod.RuntimeSpawn_Common.BarbedWire_01_B

// Props
mod.RuntimeSpawn_Common.BarrelOil_01_A
mod.RuntimeSpawn_Common.BarrelOilExplosive_01  // Explodes when shot!
mod.RuntimeSpawn_Common.BarrelOilFire_01
mod.RuntimeSpawn_Common.Basketball_01
mod.RuntimeSpawn_Common.BallGo01
mod.RuntimeSpawn_Common.ChairPlastic_01_A
mod.RuntimeSpawn_Common.BeverageFridge_01_B
mod.RuntimeSpawn_Common.CameraSurveillance_01_B
mod.RuntimeSpawn_Common.AmmoChest_Small_01

// Trees
mod.RuntimeSpawn_Common.BroadleafUrban_01_L_A
mod.RuntimeSpawn_Common.BroadleafUrban_01_M_B
```

### Map-Specific Enums

Each map has its own RuntimeSpawn enum with level-specific assets:

```typescript
mod.RuntimeSpawn_Aftermath.*     // Earthquake aftermath props
mod.RuntimeSpawn_Battery.*       // Industrial base props
mod.RuntimeSpawn_Capstone.*      // Arctic facility props
mod.RuntimeSpawn_Dumbo.*         // Brooklyn bridge props
mod.RuntimeSpawn_FireStorm.*     // Desert/fire props
mod.RuntimeSpawn_Limestone.*     // Alpine mountain props
mod.RuntimeSpawn_Outskirts.*     // Suburban props
mod.RuntimeSpawn_Tungsten.*      // Mining facility props
mod.RuntimeSpawn_Abbasid.*       // Middle Eastern props
mod.RuntimeSpawn_Badlands.*      // Badlands map props
mod.RuntimeSpawn_Eastwood.*      // Eastern European props

// Granite map zones
mod.RuntimeSpawn_Granite_Downtown.*
mod.RuntimeSpawn_Granite_Marina.*
mod.RuntimeSpawn_Granite_MilitaryRnD.*
mod.RuntimeSpawn_Granite_MilitaryStorage.*
mod.RuntimeSpawn_Granite_ResidentialNorth.*
mod.RuntimeSpawn_Granite_TechCenter.*

mod.RuntimeSpawn_Sand.*          // Sand/desert map props
```

### Aftermath-Specific Examples

```typescript
mod.RuntimeSpawn_Aftermath.FX_GenDest_Rubble_Pile_Stone_L_GS
mod.RuntimeSpawn_Aftermath.FX_MacroDest_EUU_Building_Ruin_FallingDustRubble_01_Cont
mod.RuntimeSpawn_Aftermath.Metrobus_Wreck_Rim_Front   // Decorative debris
```

---

## Function Reference

| Function | Signature | Description |
|----------|-----------|-------------|
| `SpawnObject` | `(prefab, position, rotation, scale): Any` | Spawn with full transform |
| `SpawnObject` | `(prefab, position, rotation): Any` | Spawn with default scale |
| `UnspawnObject` | `(obj: Object): void` | Remove spawned object |
| `GetObjId` | `(object: Any): number` | Get object's unique ID |

---

## Object Transform Guide

### Position
Standard XYZ world coordinates:
```typescript
mod.CreateVector(x, y, z)
// y is vertical (up)
```

### Rotation
Euler angles in radians:
```typescript
// No rotation
mod.CreateVector(0, 0, 0)

// 90 degrees on Y axis
mod.CreateVector(0, Math.PI / 2, 0)

// 180 degrees on Y axis
mod.CreateVector(0, Math.PI, 0)
```

### Scale
Multiplier on each axis:
```typescript
// Default size
mod.CreateVector(1, 1, 1)

// Double size
mod.CreateVector(2, 2, 2)

// Stretched on X
mod.CreateVector(2, 1, 1)
```

---

## Common Patterns

### Building Elevated Platforms

```typescript
const FLOOR_TILE = mod.RuntimeSpawn_Common.FiringRange_Floor_A;
const TILE_X_SPACING = 3.537;  // From spatial-generator research
const TILE_Z_SPACING = 5.0101;

function BuildPlatform(center: mod.Vector, width: number, depth: number): mod.Object[] {
    const objects: mod.Object[] = [];
    const startX = mod.XComponentOf(center) - (width * TILE_X_SPACING) / 2;
    const startZ = mod.ZComponentOf(center) - (depth * TILE_Z_SPACING) / 2;
    const y = mod.YComponentOf(center);

    for (let xi = 0; xi < width; xi++) {
        for (let zi = 0; zi < depth; zi++) {
            const x = startX + xi * TILE_X_SPACING;
            const z = startZ + zi * TILE_Z_SPACING;
            const obj = mod.SpawnObject(
                FLOOR_TILE,
                mod.CreateVector(x, y, z),
                mod.CreateVector(0, 0, 0)
            );
            objects.push(obj);
        }
    }
    return objects;
}
```

### Spawning Barricades Around a Point

```typescript
function SpawnBarricadesInCircle(center: mod.Vector, radius: number, count: number): mod.Object[] {
    const objects: mod.Object[] = [];

    for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2;
        const x = mod.XComponentOf(center) + Math.cos(angle) * radius;
        const z = mod.ZComponentOf(center) + Math.sin(angle) * radius;
        const y = mod.YComponentOf(center);

        // Face the barricade toward center
        const rotation = mod.CreateVector(0, angle + Math.PI, 0);

        const obj = mod.SpawnObject(
            mod.RuntimeSpawn_Common.BarrierStoneBlock_01_A,
            mod.CreateVector(x, y, z),
            rotation
        );
        objects.push(obj);
    }
    return objects;
}
```

---

## Constraints & Gotchas

1. **Map-Specific Objects Only Work on That Map**: `RuntimeSpawn_Aftermath.*` items only work on the Aftermath map. Using them on other maps may cause errors or invisible objects.

2. **Object Limits**: The engine has limits on spawned objects. Clean up with `UnspawnObject` when no longer needed.

3. **Return Type is `Any`**: `SpawnObject` returns a generic `Any` type. Cast or use `GetObjId` to work with specific object types.

4. **Explosive Barrels**: `BarrelOilExplosive_01` actually explodes when damaged - useful for gameplay but be careful with placement!

5. **Scale Affects Physics**: Large scale multipliers can cause physics/collision issues. Test scaled objects carefully.

6. **VFX vs Objects**: VFX spawned via `SpawnObject` need `EnableVFX()` to activate. See [vfx.md](vfx.md).

---

## Related Patterns

- [vfx.md](vfx.md) - VFX-specific spawning (FX_* prefabs)
- [world-icons.md](world-icons.md) - WorldIcon spawning
- [vehicles.md](../gameplay/vehicles.md) - Vehicle spawner configuration
- [math.md](math.md) - Position calculations for spawning
