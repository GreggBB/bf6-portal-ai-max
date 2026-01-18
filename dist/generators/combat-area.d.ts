/**
 * Combat area generator
 * Creates playable boundary with CombatArea and PolygonVolume
 */
import type { SpatialObject, Bounds } from '../types/spatial.js';
import type { CombatArea, PolygonVolume } from '../types/game-objects.js';
/** Configuration for combat area generation */
export interface CombatAreaConfig {
    /** Bounds of the playable area */
    bounds: Bounds;
    /** Padding to add around the bounds */
    padding?: number;
    /** Height of the polygon volume */
    height?: number;
    /** Custom ID for the combat area */
    id?: string;
}
/** Result of combat area generation */
export interface CombatAreaResult {
    /** All generated objects */
    objects: SpatialObject[];
    /** Reference to the combat area */
    combatArea: CombatArea;
    /** Reference to the polygon volume */
    polygon: PolygonVolume;
}
/**
 * Generate a combat area with boundary polygon
 * @param config Combat area configuration
 */
export declare function generateCombatArea(config: CombatAreaConfig): CombatAreaResult;
//# sourceMappingURL=combat-area.d.ts.map