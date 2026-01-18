/**
 * Rotation matrix utilities
 */
import type { RotationMatrix, Vector3 } from '../types/spatial.js';
/** Create an identity rotation (no rotation) */
export declare function createIdentity(): RotationMatrix;
/**
 * Create a rotation matrix for Y-axis rotation (yaw)
 * @param degrees Rotation angle in degrees (positive = counter-clockwise when viewed from above)
 */
export declare function createYawRotation(degrees: number): RotationMatrix;
/**
 * Create a top-down camera rotation (looks straight down)
 * Used for DeployCam
 */
export declare function createTopDown(): RotationMatrix;
/**
 * Create a 90-degree Y rotation
 * Commonly used for floor tiles
 */
export declare function createY90(): RotationMatrix;
/**
 * Create rotation to face a target direction (horizontal only)
 * @param direction Direction vector (Y component is ignored)
 */
export declare function createFacingDirection(direction: Vector3): RotationMatrix;
/** Preset rotations for convenience */
export declare const Rotations: {
    /** No rotation */
    readonly Identity: RotationMatrix;
    /** 90 degrees around Y axis */
    readonly Y90: RotationMatrix;
    /** 180 degrees around Y axis */
    readonly Y180: RotationMatrix;
    /** 270 degrees around Y axis */
    readonly Y270: RotationMatrix;
    /** Top-down view for cameras */
    readonly TopDown: RotationMatrix;
    /** Face north (+Z) */
    readonly FaceNorth: RotationMatrix;
    /** Face south (-Z) */
    readonly FaceSouth: RotationMatrix;
    /** Face east (+X) */
    readonly FaceEast: RotationMatrix;
    /** Face west (-X) */
    readonly FaceWest: RotationMatrix;
};
//# sourceMappingURL=rotation.d.ts.map