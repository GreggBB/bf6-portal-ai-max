/**
 * SpatialBuilder - Fluent API for generating spatial JSON documents
 */
import { Elevations } from './types/assets.js';
import { vec3 } from './utils/vector.js';
import { resetIdCounter, generateCombatPolygonId, IdPrefixes } from './utils/id.js';
import { generateFloorGrid, } from './generators/floor-grid.js';
import { generateTeamSpawns, } from './generators/spawn-system.js';
import { generateCombatArea, } from './generators/combat-area.js';
import { generateSimpleSector } from './generators/sector.js';
import { generateDeployCamOverPlatform } from './generators/deploy-cam.js';
/**
 * Fluent builder for generating spatial JSON documents
 */
export class SpatialBuilder {
    objects = [];
    targetMap = 'MP_Abbasid';
    floorGrid = null;
    team1Spawns = null;
    team2Spawns = null;
    combatArea = null;
    sector = null;
    hasDeployCam = false;
    constructor() {
        resetIdCounter();
    }
    /**
     * Set the target map (for coordinate reference)
     * @param mapId Map identifier (e.g., "MP_Abbasid" for Cairo)
     */
    setMapTarget(mapId) {
        this.targetMap = mapId;
        return this;
    }
    /**
     * Add a floor grid to the platform
     * @param config Floor grid configuration
     */
    addFloorGrid(config) {
        const fullConfig = {
            origin: config.origin ?? vec3(-80, Elevations.Platform, -50),
            tilesX: config.tilesX,
            tilesZ: config.tilesZ,
            elevation: config.elevation ?? Elevations.Platform,
            assetType: config.assetType,
            idPrefix: config.idPrefix,
        };
        this.floorGrid = generateFloorGrid(fullConfig);
        this.objects.push(...this.floorGrid.objects);
        return this;
    }
    /**
     * Add team spawns at opposite ends of the floor grid
     * @param options Team spawn options
     */
    addTeamSpawns(options = {}) {
        if (!this.floorGrid) {
            throw new Error('Must add floor grid before team spawns');
        }
        const { spawnCount = 3, padding = 5 } = options;
        const bounds = this.floorGrid.bounds;
        const elevation = bounds.min.y;
        const spawns = generateTeamSpawns(bounds, spawnCount, elevation, padding);
        this.team1Spawns = spawns.team1;
        this.team2Spawns = spawns.team2;
        this.objects.push(...spawns.team1.objects);
        this.objects.push(...spawns.team2.objects);
        return this;
    }
    /**
     * Add a combat area boundary
     * @param options Combat area options
     */
    addCombatArea(options = {}) {
        if (!this.floorGrid) {
            throw new Error('Must add floor grid before combat area');
        }
        const { padding = 10 } = options;
        this.combatArea = generateCombatArea({
            bounds: this.floorGrid.bounds,
            padding,
        });
        this.objects.push(...this.combatArea.objects);
        return this;
    }
    /**
     * Add a sector (links to combat area)
     */
    addSector() {
        if (!this.combatArea) {
            throw new Error('Must add combat area before sector');
        }
        if (!this.floorGrid) {
            throw new Error('Must add floor grid before sector');
        }
        const polygonId = generateCombatPolygonId(IdPrefixes.CombatArea);
        this.sector = generateSimpleSector(polygonId, this.floorGrid.center);
        this.objects.push(this.sector);
        return this;
    }
    /**
     * Add a deploy camera above the platform center
     * @param options Deploy camera options
     */
    addDeployCam(options = {}) {
        if (!this.floorGrid) {
            throw new Error('Must add floor grid before deploy camera');
        }
        const deployCam = generateDeployCamOverPlatform(this.floorGrid.center, this.floorGrid.bounds.min.y);
        this.objects.push(deployCam);
        this.hasDeployCam = true;
        return this;
    }
    /**
     * Add a custom spatial object
     * @param object The object to add
     */
    addObject(object) {
        this.objects.push(object);
        return this;
    }
    /**
     * Add multiple custom spatial objects
     * @param objects The objects to add
     */
    addObjects(objects) {
        this.objects.push(...objects);
        return this;
    }
    /**
     * Get the current bounds of the platform
     */
    getBounds() {
        return this.floorGrid?.bounds ?? null;
    }
    /**
     * Get the center of the platform
     */
    getCenter() {
        return this.floorGrid?.center ?? null;
    }
    /**
     * Build the spatial document
     */
    build() {
        return {
            Portal_Dynamic: this.objects,
        };
    }
    /**
     * Build and serialize to JSON string
     * @param pretty Whether to format with indentation
     */
    toJSON(pretty = true) {
        const document = this.build();
        return JSON.stringify(document, null, pretty ? 2 : undefined);
    }
}
/**
 * Create a new SpatialBuilder instance
 */
export function createBuilder() {
    return new SpatialBuilder();
}
//# sourceMappingURL=builder.js.map