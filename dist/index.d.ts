/**
 * Battlefield Portal Spatial Generator
 *
 * A programmatic API for generating .spatial.json files for Portal mods.
 *
 * @example
 * ```typescript
 * import { createTestingPlatform, validateDocument } from '@bf-portal/spatial-generator';
 * import * as fs from 'fs';
 *
 * // Create a 10x20 tile testing platform
 * const document = createTestingPlatform();
 *
 * // Validate the document
 * const validation = validateDocument(document);
 * console.log(validation.valid ? 'Valid!' : validation.errors.join('\\n'));
 *
 * // Export to file
 * fs.writeFileSync('my-platform.spatial.json', JSON.stringify(document, null, 2));
 * ```
 *
 * @example
 * ```typescript
 * import { SpatialBuilder } from '@bf-portal/spatial-generator';
 *
 * // Use the builder for custom configurations
 * const builder = new SpatialBuilder()
 *   .setMapTarget('MP_Abbasid')
 *   .addFloorGrid({ tilesX: 15, tilesZ: 30 })
 *   .addTeamSpawns({ spawnCount: 5 })
 *   .addCombatArea({ padding: 15 })
 *   .addSector()
 *   .addDeployCam();
 *
 * const json = builder.toJSON();
 * ```
 */
export type { Vector3, RotationMatrix, SpatialObject, SpatialObjectBase, SpatialDocument, Bounds, SpatialConfig, } from './types/spatial.js';
export type { DeployCam, CombatArea, PolygonVolume, Sector, HQPlayerSpawner, SpawnPoint, CapturePoint, VehicleSpawner, } from './types/game-objects.js';
export { ObjIdRanges, HQObjIds } from './types/game-objects.js';
export { FloorAssets, WallAssets, BarrierAssets, Elevations, DefaultFloorTile, type FloorAssetType, type WallAssetType, type BarrierAssetType, } from './types/assets.js';
export { vec3, zero, add, subtract, scale, distance, magnitude, normalize, lerp, midpoint, clone, equals } from './utils/vector.js';
export { createIdentity, createYawRotation, createTopDown, createY90, createFacingDirection, Rotations } from './utils/rotation.js';
export { resetIdCounter, generateUniqueNumber, buildHierarchicalId, generateFloorTileId, generateSpawnPointId, generateHQAreaId, generateCombatPolygonId, IdPrefixes } from './utils/id.js';
export { generateFloorGrid, calculateGridSize, type FloorGridConfig, type FloorGridResult, } from './generators/floor-grid.js';
export { generateSpawnSystem, generateTeamSpawns, type TeamNumber, type SpawnSystemConfig, type SpawnSystemResult, } from './generators/spawn-system.js';
export { generateCombatArea, type CombatAreaConfig, type CombatAreaResult, } from './generators/combat-area.js';
export { generateSector, generateSimpleSector, type SectorConfig } from './generators/sector.js';
export { generateDeployCam, generateDeployCamOverPlatform, type DeployCamConfig, } from './generators/deploy-cam.js';
export { SpatialBuilder, createBuilder, type TeamSpawnOptions, type CombatAreaOptions, type DeployCamOptions, } from './builder.js';
export { validateDocument, validateAndReport, type ValidationResult, } from './validator.js';
export { createTestingPlatform, createSmallPlatform, createLargePlatform, createArenaPlatform, type TestingPlatformOptions, } from './presets/testing-platform.js';
//# sourceMappingURL=index.d.ts.map