/**
 * Spawn system generator
 * Creates HQ spawners with infantry spawn points and protection areas
 */
import { HQObjIds } from '../types/game-objects.js';
import { Elevations } from '../types/assets.js';
import { vec3 } from '../utils/vector.js';
import { createYawRotation, Rotations } from '../utils/rotation.js';
import { generateSpawnPointId, generateHQAreaId, IdPrefixes, } from '../utils/id.js';
/**
 * Generate a spawn system with HQ, spawn points, and protection area
 * @param config Spawn system configuration
 */
export function generateSpawnSystem(config) {
    const { teamNumber, basePosition, spawnCount, spacing = 3, facingAngle = 0, hqAreaSize = 15, } = config;
    const hqId = teamNumber === 1 ? IdPrefixes.Team1HQ : IdPrefixes.Team2HQ;
    const rotation = createYawRotation(facingAngle);
    const objects = [];
    const spawnPoints = [];
    // Calculate spawn point positions (line formation perpendicular to facing)
    const perpAngle = facingAngle + 90;
    const perpRad = (perpAngle * Math.PI) / 180;
    const perpDir = vec3(Math.sin(perpRad), 0, Math.cos(perpRad));
    // Generate spawn points
    const spawnIds = [];
    const halfWidth = ((spawnCount - 1) * spacing) / 2;
    for (let i = 0; i < spawnCount; i++) {
        const offset = -halfWidth + i * spacing;
        const position = vec3(basePosition.x + perpDir.x * offset, basePosition.y, basePosition.z + perpDir.z * offset);
        const spawnId = generateSpawnPointId(hqId, teamNumber, i + 1);
        spawnIds.push(spawnId);
        const spawnPoint = {
            name: `SpawnPoint_${teamNumber}_${i + 1}`,
            type: 'SpawnPoint',
            id: spawnId,
            position,
            right: rotation.right,
            up: rotation.up,
            front: rotation.front,
        };
        spawnPoints.push(spawnPoint);
        objects.push(spawnPoint);
    }
    // Generate HQ area polygon
    const hqAreaId = generateHQAreaId(hqId, teamNumber);
    const polyY = Elevations.CombatPolygon;
    const halfSize = hqAreaSize / 2;
    const hqArea = {
        name: `HQ_Team${teamNumber}`,
        type: 'PolygonVolume',
        id: hqAreaId,
        height: 500,
        points: [
            vec3(basePosition.x - halfSize, polyY, basePosition.z - halfSize),
            vec3(basePosition.x + halfSize, polyY, basePosition.z - halfSize),
            vec3(basePosition.x + halfSize, polyY, basePosition.z + halfSize),
            vec3(basePosition.x - halfSize, polyY, basePosition.z + halfSize),
        ],
    };
    objects.push(hqArea);
    // Generate HQ spawner
    const hqSpawner = {
        name: `TEAM_${teamNumber}_HQ`,
        type: 'HQ_PlayerSpawner',
        id: hqId,
        ObjId: teamNumber === 1 ? HQObjIds.Team1 : HQObjIds.Team2,
        AltTeam: 'TeamNeutral',
        VehicleSpawnersEnabled: true,
        InfantrySpawns: spawnIds,
        HQArea: hqAreaId,
        position: basePosition,
        right: Rotations.Identity.right,
        up: Rotations.Identity.up,
        front: Rotations.Identity.front,
        linked: ['HQArea', 'InfantrySpawns'],
    };
    // Add Team property for Team 2
    if (teamNumber === 2) {
        hqSpawner.Team = 'Team2';
    }
    objects.push(hqSpawner);
    return {
        objects,
        hqSpawner,
        spawnPoints,
        hqArea,
    };
}
/**
 * Generate spawn systems for both teams at opposite ends of a platform
 * @param bounds Platform bounds
 * @param spawnCount Number of spawns per team
 * @param elevation Y position for spawns
 * @param padding Distance from edge
 */
export function generateTeamSpawns(bounds, spawnCount = 3, elevation = Elevations.Platform, padding = 5) {
    const centerX = (bounds.min.x + bounds.max.x) / 2;
    // Team 1 at south end (min Z), facing north
    const team1 = generateSpawnSystem({
        teamNumber: 1,
        basePosition: vec3(centerX, elevation, bounds.min.z + padding),
        spawnCount,
        facingAngle: 0, // Face north (+Z)
    });
    // Team 2 at north end (max Z), facing south
    const team2 = generateSpawnSystem({
        teamNumber: 2,
        basePosition: vec3(centerX, elevation, bounds.max.z - padding),
        spawnCount,
        facingAngle: 180, // Face south (-Z)
    });
    return { team1, team2 };
}
//# sourceMappingURL=spawn-system.js.map