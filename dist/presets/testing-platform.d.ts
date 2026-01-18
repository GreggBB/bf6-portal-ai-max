/**
 * Testing Platform Preset
 * Quick generation of elevated testing platforms
 */
import type { SpatialDocument, Vector3 } from '../types/spatial.js';
/** Options for creating a testing platform */
export interface TestingPlatformOptions {
    /** Width in tiles (default: 10) */
    width?: number;
    /** Length in tiles (default: 20) */
    length?: number;
    /** Y elevation (default: 90) */
    elevation?: number;
    /** Number of spawn points per team (default: 3) */
    spawnsPerTeam?: number;
    /** Origin position (default: auto-centered) */
    origin?: Vector3;
    /** Combat area padding (default: 10) */
    combatPadding?: number;
    /** Spawn padding from edge (default: 5) */
    spawnPadding?: number;
}
/**
 * Create a simple elevated testing platform
 * Includes: floor grid, team spawns, combat area, sector, deploy cam
 *
 * @param options Platform configuration
 * @returns Complete spatial document ready for export
 */
export declare function createTestingPlatform(options?: TestingPlatformOptions): SpatialDocument;
/**
 * Create a small testing platform (5x10)
 * Good for 1v1 or small team testing
 */
export declare function createSmallPlatform(): SpatialDocument;
/**
 * Create a large testing platform (20x40)
 * Good for full team battles
 */
export declare function createLargePlatform(): SpatialDocument;
/**
 * Create a square arena platform (15x15)
 * Good for symmetric gameplay
 */
export declare function createArenaPlatform(): SpatialDocument;
//# sourceMappingURL=testing-platform.d.ts.map