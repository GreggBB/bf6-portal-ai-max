/**
 * Type definitions for Portal game objects
 */
/** Standard ObjId ranges used in Portal */
export const ObjIdRanges = {
    /** HQ Spawners (Team1=1, Team2=2) */
    HQ: { start: 1, end: 9 },
    /** AI paths, waypoints, utility objects */
    Utility: { start: 10, end: 99 },
    /** Sectors */
    Sectors: { start: 100, end: 199 },
    /** Objectives (CapturePoints, MCOMs) */
    Objectives: { start: 200, end: 499 },
    /** Sound objects */
    Sound: { start: 500, end: 599 },
    /** AreaTriggers */
    AreaTriggers: { start: 600, end: 699 },
    /** Team 1 Spawn Protection */
    Team1SpawnProtection: { start: 1100, end: 1199 },
    /** Team 2 Spawn Protection */
    Team2SpawnProtection: { start: 1200, end: 1299 },
};
/** Standard ObjIds for HQ spawners */
export const HQObjIds = {
    Team1: 1,
    Team2: 2,
};
//# sourceMappingURL=game-objects.js.map