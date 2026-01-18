/**
 * Floor grid generator
 * Creates a grid of floor tiles for elevated platforms
 */
import type { SpatialObject, Vector3, Bounds } from '../types/spatial.js';
import { type FloorAssetType } from '../types/assets.js';
/** Configuration for floor grid generation */
export interface FloorGridConfig {
    /** Starting corner position (world coordinates) */
    origin: Vector3;
    /** Number of tiles in X direction */
    tilesX: number;
    /** Number of tiles in Z direction */
    tilesZ: number;
    /** Y elevation (default: 90) */
    elevation?: number;
    /** Floor asset type (default: FiringRange_Floor_A) */
    assetType?: FloorAssetType;
    /** ID prefix for generated tiles (default: "Node3D/Floor") */
    idPrefix?: string;
}
/** Result of floor grid generation */
export interface FloorGridResult {
    /** Generated floor tile objects */
    objects: SpatialObject[];
    /** Bounds of the generated grid */
    bounds: Bounds;
    /** Center point of the grid */
    center: Vector3;
}
/**
 * Generate a grid of floor tiles
 * @param config Floor grid configuration
 * @returns Generated objects and bounds information
 */
export declare function generateFloorGrid(config: FloorGridConfig): FloorGridResult;
/**
 * Calculate the total size of a floor grid
 * @param tilesX Number of tiles in X direction
 * @param tilesZ Number of tiles in Z direction
 * @param assetType Floor asset type
 */
export declare function calculateGridSize(tilesX: number, tilesZ: number, assetType?: FloorAssetType): {
    width: number;
    length: number;
};
//# sourceMappingURL=floor-grid.d.ts.map