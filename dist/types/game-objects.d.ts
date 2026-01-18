/**
 * Type definitions for Portal game objects
 */
import type { SpatialObject, Vector3 } from './spatial.js';
/** Deploy camera for player spawn view */
export interface DeployCam extends SpatialObject {
    type: 'DeployCam';
}
/** Combat area boundary - links to a PolygonVolume */
export interface CombatArea extends SpatialObject {
    type: 'CombatArea';
    /** Reference to the boundary polygon */
    CombatVolume: string;
}
/** Polygon volume defining a 3D boundary */
export interface PolygonVolume extends Omit<SpatialObject, 'position' | 'right' | 'up' | 'front'> {
    type: 'PolygonVolume';
    /** Vertical extent of the volume */
    height: number;
    /** Array of 3D points defining the polygon (all at same Y level) */
    points: Vector3[];
}
/** Sector managing objectives and boundaries */
export interface Sector extends SpatialObject {
    type: 'Sector';
    /** Array of capture point IDs */
    CapturePoints: string[];
    /** Reference to the sector area polygon */
    SectorArea: string;
}
/** Team HQ spawner with spawn protection zone */
export interface HQPlayerSpawner extends SpatialObject {
    type: 'HQ_PlayerSpawner';
    /** Numeric ID (1 for Team1, 2 for Team2) */
    ObjId: number;
    /** Whether vehicle spawners in this HQ are enabled */
    VehicleSpawnersEnabled: boolean;
    /** Array of spawn point IDs */
    InfantrySpawns: string[];
    /** Reference to the HQ area polygon */
    HQArea: string;
}
/** Individual spawn point for infantry */
export interface SpawnPoint extends SpatialObject {
    type: 'SpawnPoint';
}
/** Capture point objective */
export interface CapturePoint extends SpatialObject {
    type: 'CapturePoint';
    /** Numeric ID (starting at 200) */
    ObjId: number;
    /** Whether to outline capture area above 16 points */
    OutlineAbove16Points?: boolean;
    /** AI tactical advice for air vehicles */
    TacticalAdviceAirVehicleFriendly?: boolean;
    /** AI priority for Team 1 */
    TacticalAdvicePriorityLevel_Team1?: string;
    /** AI priority for Team 2 */
    TacticalAdvicePriorityLevel_Team2?: string;
    /** Reference to the capture area polygon */
    CaptureArea: string;
    /** Spawn points for Team 1 */
    InfantrySpawnPoints_Team1?: string[];
    /** Spawn points for Team 2 */
    InfantrySpawnPoints_Team2?: string[];
}
/** Vehicle spawner */
export interface VehicleSpawner extends SpatialObject {
    type: 'VehicleSpawner';
    /** Vehicle type to spawn */
    VehicleType: string;
    /** Whether auto-spawn is enabled */
    P_AutoSpawnEnabled?: boolean;
    /** Respawn time in seconds */
    P_DefaultRespawnTime?: number;
}
/** Standard ObjId ranges used in Portal */
export declare const ObjIdRanges: {
    /** HQ Spawners (Team1=1, Team2=2) */
    readonly HQ: {
        readonly start: 1;
        readonly end: 9;
    };
    /** AI paths, waypoints, utility objects */
    readonly Utility: {
        readonly start: 10;
        readonly end: 99;
    };
    /** Sectors */
    readonly Sectors: {
        readonly start: 100;
        readonly end: 199;
    };
    /** Objectives (CapturePoints, MCOMs) */
    readonly Objectives: {
        readonly start: 200;
        readonly end: 499;
    };
    /** Sound objects */
    readonly Sound: {
        readonly start: 500;
        readonly end: 599;
    };
    /** AreaTriggers */
    readonly AreaTriggers: {
        readonly start: 600;
        readonly end: 699;
    };
    /** Team 1 Spawn Protection */
    readonly Team1SpawnProtection: {
        readonly start: 1100;
        readonly end: 1199;
    };
    /** Team 2 Spawn Protection */
    readonly Team2SpawnProtection: {
        readonly start: 1200;
        readonly end: 1299;
    };
};
/** Standard ObjIds for HQ spawners */
export declare const HQObjIds: {
    readonly Team1: 1;
    readonly Team2: 2;
};
//# sourceMappingURL=game-objects.d.ts.map