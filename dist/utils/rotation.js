/**
 * Rotation matrix utilities
 */
/** Create an identity rotation (no rotation) */
export function createIdentity() {
    return {
        right: { x: 1, y: 0, z: 0 },
        up: { x: 0, y: 1, z: 0 },
        front: { x: 0, y: 0, z: 1 },
    };
}
/**
 * Create a rotation matrix for Y-axis rotation (yaw)
 * @param degrees Rotation angle in degrees (positive = counter-clockwise when viewed from above)
 */
export function createYawRotation(degrees) {
    const radians = (degrees * Math.PI) / 180;
    const cos = Math.cos(radians);
    const sin = Math.sin(radians);
    return {
        right: { x: cos, y: 0, z: -sin },
        up: { x: 0, y: 1, z: 0 },
        front: { x: sin, y: 0, z: cos },
    };
}
/**
 * Create a top-down camera rotation (looks straight down)
 * Used for DeployCam
 */
export function createTopDown() {
    return {
        right: { x: 1, y: 0, z: 0 },
        up: { x: 0, y: 0, z: -1 },
        front: { x: 0, y: 1, z: 0 },
    };
}
/**
 * Create a 90-degree Y rotation
 * Commonly used for floor tiles
 */
export function createY90() {
    // Note: The small values (-4.37114e-08) are floating point artifacts from Godot
    // We use clean zeros for generation
    return {
        right: { x: 0, y: 0, z: -1 },
        up: { x: 0, y: 1, z: 0 },
        front: { x: 1, y: 0, z: 0 },
    };
}
/**
 * Create rotation to face a target direction (horizontal only)
 * @param direction Direction vector (Y component is ignored)
 */
export function createFacingDirection(direction) {
    // Normalize in XZ plane
    const len = Math.sqrt(direction.x * direction.x + direction.z * direction.z);
    if (len === 0)
        return createIdentity();
    const nx = direction.x / len;
    const nz = direction.z / len;
    return {
        right: { x: nz, y: 0, z: -nx },
        up: { x: 0, y: 1, z: 0 },
        front: { x: nx, y: 0, z: nz },
    };
}
/** Preset rotations for convenience */
export const Rotations = {
    /** No rotation */
    Identity: createIdentity(),
    /** 90 degrees around Y axis */
    Y90: createY90(),
    /** 180 degrees around Y axis */
    Y180: createYawRotation(180),
    /** 270 degrees around Y axis */
    Y270: createYawRotation(270),
    /** Top-down view for cameras */
    TopDown: createTopDown(),
    /** Face north (+Z) */
    FaceNorth: createIdentity(),
    /** Face south (-Z) */
    FaceSouth: createYawRotation(180),
    /** Face east (+X) */
    FaceEast: createYawRotation(90),
    /** Face west (-X) */
    FaceWest: createYawRotation(-90),
};
//# sourceMappingURL=rotation.js.map