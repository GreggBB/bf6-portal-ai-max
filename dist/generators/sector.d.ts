/**
 * Sector generator
 * Creates sectors that manage objectives and boundaries
 */
import type { Vector3 } from '../types/spatial.js';
import type { Sector } from '../types/game-objects.js';
/** Configuration for sector generation */
export interface SectorConfig {
    /** Sector name/ID */
    name: string;
    /** Position of the sector object */
    position: Vector3;
    /** Array of capture point IDs (empty for no objectives) */
    capturePoints?: string[];
    /** Reference to the sector area polygon ID */
    sectorAreaId: string;
    /** Optional ObjId */
    objId?: number;
}
/**
 * Generate a sector
 * @param config Sector configuration
 */
export declare function generateSector(config: SectorConfig): Sector;
/**
 * Generate a simple sector linked to a combat area
 * (No capture points - for testing platforms)
 * @param combatPolygonId ID of the combat area polygon
 * @param centerPosition Center position for the sector
 */
export declare function generateSimpleSector(combatPolygonId: string, centerPosition: Vector3): Sector;
//# sourceMappingURL=sector.d.ts.map