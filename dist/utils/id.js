/**
 * ID generation utilities for spatial objects
 */
/** Counter for generating unique IDs within a session */
let idCounter = 0;
/** Reset the ID counter (for testing or new documents) */
export function resetIdCounter() {
    idCounter = 0;
}
/**
 * Generate a unique numeric suffix
 */
export function generateUniqueNumber() {
    return ++idCounter;
}
/**
 * Build a hierarchical ID path
 * @param parts Path segments (e.g., ["TEAM_1_HQ", "SpawnPoint_1_1"])
 * @returns Joined path (e.g., "TEAM_1_HQ/SpawnPoint_1_1")
 */
export function buildHierarchicalId(...parts) {
    return parts.filter((p) => p.length > 0).join('/');
}
/**
 * Generate a unique ID for a floor tile
 * @param prefix Namespace prefix (e.g., "Node3D/Floor")
 * @param assetType Asset type name
 * @param index Grid index
 */
export function generateFloorTileId(prefix, assetType, index) {
    return buildHierarchicalId(prefix, `${assetType}_${index}`);
}
/**
 * Generate a spawn point ID
 * @param hqId Parent HQ ID (e.g., "TEAM_1_HQ")
 * @param teamNumber Team number (1 or 2)
 * @param spawnIndex Spawn point index within the team
 */
export function generateSpawnPointId(hqId, teamNumber, spawnIndex) {
    return buildHierarchicalId(hqId, `SpawnPoint_${teamNumber}_${spawnIndex}`);
}
/**
 * Generate an HQ area ID
 * @param hqId Parent HQ ID (e.g., "TEAM_1_HQ")
 * @param teamNumber Team number (1 or 2)
 */
export function generateHQAreaId(hqId, teamNumber) {
    return buildHierarchicalId(hqId, `HQ_Team${teamNumber}`);
}
/**
 * Generate a combat area polygon ID
 * @param combatAreaId Parent combat area ID
 */
export function generateCombatPolygonId(combatAreaId) {
    return buildHierarchicalId(combatAreaId, 'CollisionPolygon3D');
}
/**
 * Standard ID prefixes used in Portal
 */
export const IdPrefixes = {
    Floor: 'Node3D/Floor',
    Team1HQ: 'TEAM_1_HQ',
    Team2HQ: 'TEAM_2_HQ',
    CombatArea: 'CombatArea',
    Objectives: 'Objectives/Flags',
    Vehicles: 'Vehicles',
};
//# sourceMappingURL=id.js.map