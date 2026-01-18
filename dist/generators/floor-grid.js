/**
 * Floor grid generator
 * Creates a grid of floor tiles for elevated platforms
 */
import { FloorAssets, DefaultFloorTile } from '../types/assets.js';
import { vec3 } from '../utils/vector.js';
import { Rotations } from '../utils/rotation.js';
import { generateFloorTileId, IdPrefixes } from '../utils/id.js';
/**
 * Generate a grid of floor tiles
 * @param config Floor grid configuration
 * @returns Generated objects and bounds information
 */
export function generateFloorGrid(config) {
    const { origin, tilesX, tilesZ, elevation = 90, assetType = 'FiringRange_Floor_A', idPrefix = IdPrefixes.Floor, } = config;
    const asset = FloorAssets[assetType] ?? DefaultFloorTile;
    const rotation = Rotations.Y90;
    const objects = [];
    let tileIndex = 0;
    // Generate grid of tiles
    for (let xIdx = 0; xIdx < tilesX; xIdx++) {
        for (let zIdx = 0; zIdx < tilesZ; zIdx++) {
            const position = vec3(origin.x + xIdx * asset.spacingX, elevation, origin.z + zIdx * asset.spacingZ);
            const tile = {
                name: asset.type,
                type: asset.type,
                id: generateFloorTileId(idPrefix, asset.type, tileIndex),
                position,
                right: rotation.right,
                up: rotation.up,
                front: rotation.front,
            };
            objects.push(tile);
            tileIndex++;
        }
    }
    // Calculate bounds
    const maxX = origin.x + (tilesX - 1) * asset.spacingX;
    const maxZ = origin.z + (tilesZ - 1) * asset.spacingZ;
    const bounds = {
        min: vec3(origin.x, elevation, origin.z),
        max: vec3(maxX, elevation, maxZ),
    };
    // Calculate center
    const center = vec3((origin.x + maxX) / 2, elevation, (origin.z + maxZ) / 2);
    return { objects, bounds, center };
}
/**
 * Calculate the total size of a floor grid
 * @param tilesX Number of tiles in X direction
 * @param tilesZ Number of tiles in Z direction
 * @param assetType Floor asset type
 */
export function calculateGridSize(tilesX, tilesZ, assetType = 'FiringRange_Floor_A') {
    const asset = FloorAssets[assetType] ?? DefaultFloorTile;
    return {
        width: (tilesX - 1) * asset.spacingX,
        length: (tilesZ - 1) * asset.spacingZ,
    };
}
//# sourceMappingURL=floor-grid.js.map