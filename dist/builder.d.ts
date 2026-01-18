/**
 * SpatialBuilder - Fluent API for generating spatial JSON documents
 */
import type { SpatialObject, SpatialDocument, Vector3, Bounds } from './types/spatial.js';
import { type FloorGridConfig } from './generators/floor-grid.js';
/** Options for team spawns */
export interface TeamSpawnOptions {
    /** Number of spawn points per team */
    spawnCount?: number;
    /** Distance from platform edge */
    padding?: number;
}
/** Options for combat area */
export interface CombatAreaOptions {
    /** Padding around the floor grid */
    padding?: number;
}
/** Options for deploy camera */
export interface DeployCamOptions {
    /** Custom height above platform */
    height?: number;
}
/**
 * Fluent builder for generating spatial JSON documents
 */
export declare class SpatialBuilder {
    private objects;
    private targetMap;
    private floorGrid;
    private team1Spawns;
    private team2Spawns;
    private combatArea;
    private sector;
    private hasDeployCam;
    constructor();
    /**
     * Set the target map (for coordinate reference)
     * @param mapId Map identifier (e.g., "MP_Abbasid" for Cairo)
     */
    setMapTarget(mapId: string): this;
    /**
     * Add a floor grid to the platform
     * @param config Floor grid configuration
     */
    addFloorGrid(config: Omit<FloorGridConfig, 'origin'> & {
        origin?: Vector3;
    }): this;
    /**
     * Add team spawns at opposite ends of the floor grid
     * @param options Team spawn options
     */
    addTeamSpawns(options?: TeamSpawnOptions): this;
    /**
     * Add a combat area boundary
     * @param options Combat area options
     */
    addCombatArea(options?: CombatAreaOptions): this;
    /**
     * Add a sector (links to combat area)
     */
    addSector(): this;
    /**
     * Add a deploy camera above the platform center
     * @param options Deploy camera options
     */
    addDeployCam(options?: DeployCamOptions): this;
    /**
     * Add a custom spatial object
     * @param object The object to add
     */
    addObject(object: SpatialObject): this;
    /**
     * Add multiple custom spatial objects
     * @param objects The objects to add
     */
    addObjects(objects: SpatialObject[]): this;
    /**
     * Get the current bounds of the platform
     */
    getBounds(): Bounds | null;
    /**
     * Get the center of the platform
     */
    getCenter(): Vector3 | null;
    /**
     * Build the spatial document
     */
    build(): SpatialDocument;
    /**
     * Build and serialize to JSON string
     * @param pretty Whether to format with indentation
     */
    toJSON(pretty?: boolean): string;
}
/**
 * Create a new SpatialBuilder instance
 */
export declare function createBuilder(): SpatialBuilder;
//# sourceMappingURL=builder.d.ts.map