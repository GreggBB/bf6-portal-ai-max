/**
 * ID generation utilities for spatial objects
 */
/** Reset the ID counter (for testing or new documents) */
export declare function resetIdCounter(): void;
/**
 * Generate a unique numeric suffix
 */
export declare function generateUniqueNumber(): number;
/**
 * Build a hierarchical ID path
 * @param parts Path segments (e.g., ["TEAM_1_HQ", "SpawnPoint_1_1"])
 * @returns Joined path (e.g., "TEAM_1_HQ/SpawnPoint_1_1")
 */
export declare function buildHierarchicalId(...parts: string[]): string;
/**
 * Generate a unique ID for a floor tile
 * @param prefix Namespace prefix (e.g., "Node3D/Floor")
 * @param assetType Asset type name
 * @param index Grid index
 */
export declare function generateFloorTileId(prefix: string, assetType: string, index: number): string;
/**
 * Generate a spawn point ID
 * @param hqId Parent HQ ID (e.g., "TEAM_1_HQ")
 * @param teamNumber Team number (1 or 2)
 * @param spawnIndex Spawn point index within the team
 */
export declare function generateSpawnPointId(hqId: string, teamNumber: number, spawnIndex: number): string;
/**
 * Generate an HQ area ID
 * @param hqId Parent HQ ID (e.g., "TEAM_1_HQ")
 * @param teamNumber Team number (1 or 2)
 */
export declare function generateHQAreaId(hqId: string, teamNumber: number): string;
/**
 * Generate a combat area polygon ID
 * @param combatAreaId Parent combat area ID
 */
export declare function generateCombatPolygonId(combatAreaId: string): string;
/**
 * Standard ID prefixes used in Portal
 */
export declare const IdPrefixes: {
    readonly Floor: "Node3D/Floor";
    readonly Team1HQ: "TEAM_1_HQ";
    readonly Team2HQ: "TEAM_2_HQ";
    readonly CombatArea: "CombatArea";
    readonly Objectives: "Objectives/Flags";
    readonly Vehicles: "Vehicles";
};
//# sourceMappingURL=id.d.ts.map