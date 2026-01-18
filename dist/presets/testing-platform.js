/**
 * Testing Platform Preset
 * Quick generation of elevated testing platforms
 */
import { Elevations } from '../types/assets.js';
import { vec3 } from '../utils/vector.js';
import { SpatialBuilder } from '../builder.js';
/**
 * Create a simple elevated testing platform
 * Includes: floor grid, team spawns, combat area, sector, deploy cam
 *
 * @param options Platform configuration
 * @returns Complete spatial document ready for export
 */
export function createTestingPlatform(options = {}) {
    const { width = 10, length = 20, elevation = Elevations.Platform, spawnsPerTeam = 3, origin = vec3(-80, elevation, -50), combatPadding = 10, spawnPadding = 5, } = options;
    const builder = new SpatialBuilder()
        .setMapTarget('MP_Abbasid')
        .addFloorGrid({
        origin,
        tilesX: width,
        tilesZ: length,
        elevation,
    })
        .addTeamSpawns({
        spawnCount: spawnsPerTeam,
        padding: spawnPadding,
    })
        .addCombatArea({
        padding: combatPadding,
    })
        .addSector()
        .addDeployCam();
    return builder.build();
}
/**
 * Create a small testing platform (5x10)
 * Good for 1v1 or small team testing
 */
export function createSmallPlatform() {
    return createTestingPlatform({
        width: 5,
        length: 10,
        spawnsPerTeam: 2,
    });
}
/**
 * Create a large testing platform (20x40)
 * Good for full team battles
 */
export function createLargePlatform() {
    return createTestingPlatform({
        width: 20,
        length: 40,
        spawnsPerTeam: 8,
    });
}
/**
 * Create a square arena platform (15x15)
 * Good for symmetric gameplay
 */
export function createArenaPlatform() {
    return createTestingPlatform({
        width: 15,
        length: 15,
        spawnsPerTeam: 4,
    });
}
//# sourceMappingURL=testing-platform.js.map