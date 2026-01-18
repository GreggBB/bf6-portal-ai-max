/**
 * Spawn system generator
 * Creates HQ spawners with infantry spawn points and protection areas
 */
import type { SpatialObject, Vector3 } from '../types/spatial.js';
import type { HQPlayerSpawner, SpawnPoint, PolygonVolume } from '../types/game-objects.js';
/** Team number type */
export type TeamNumber = 1 | 2;
/** Configuration for spawn system generation */
export interface SpawnSystemConfig {
    /** Team number (1 or 2) */
    teamNumber: TeamNumber;
    /** Center position of the spawn area */
    basePosition: Vector3;
    /** Number of spawn points to create */
    spawnCount: number;
    /** Spacing between spawn points */
    spacing?: number;
    /** Direction spawns face (degrees, 0 = +Z, 90 = +X) */
    facingAngle?: number;
    /** Custom ID prefix (overrides default) */
    idPrefix?: string;
    /** Size of HQ protection area polygon */
    hqAreaSize?: number;
}
/** Result of spawn system generation */
export interface SpawnSystemResult {
    /** All generated objects (HQ, spawn points, area polygon) */
    objects: SpatialObject[];
    /** Reference to the HQ spawner */
    hqSpawner: HQPlayerSpawner;
    /** References to spawn points */
    spawnPoints: SpawnPoint[];
    /** Reference to HQ area polygon */
    hqArea: PolygonVolume;
}
/**
 * Generate a spawn system with HQ, spawn points, and protection area
 * @param config Spawn system configuration
 */
export declare function generateSpawnSystem(config: SpawnSystemConfig): SpawnSystemResult;
/**
 * Generate spawn systems for both teams at opposite ends of a platform
 * @param bounds Platform bounds
 * @param spawnCount Number of spawns per team
 * @param elevation Y position for spawns
 * @param padding Distance from edge
 */
export declare function generateTeamSpawns(bounds: {
    min: Vector3;
    max: Vector3;
}, spawnCount?: number, elevation?: number, padding?: number): {
    team1: SpawnSystemResult;
    team2: SpawnSystemResult;
};
//# sourceMappingURL=spawn-system.d.ts.map