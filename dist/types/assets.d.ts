/**
 * Asset definitions and constants for spatial generation
 */
/** Floor tile asset definitions */
export declare const FloorAssets: {
    readonly FiringRange_Floor_A: {
        readonly type: "FiringRange_Floor_A";
        readonly spacingX: 3.537;
        readonly spacingZ: 5.0101;
    };
    readonly FiringRange_Floor_B: {
        readonly type: "FiringRange_Floor_B";
        readonly spacingX: 3.537;
        readonly spacingZ: 5.0101;
    };
};
/** Wall asset definitions */
export declare const WallAssets: {
    readonly FiringRange_Wall_1024_01: {
        readonly type: "FiringRange_Wall_1024_01";
        readonly length: 1024;
    };
    readonly FiringRange_WallPanelContact_01: {
        readonly type: "FiringRange_WallPanelContact_01";
    };
    readonly BarrierConcreteWall_01_192x320: {
        readonly type: "BarrierConcreteWall_01_192x320";
        readonly width: 192;
        readonly height: 320;
    };
};
/** Barrier asset definitions */
export declare const BarrierAssets: {
    readonly BarrierStoneBlock_01_A: {
        readonly type: "BarrierStoneBlock_01_A";
    };
    readonly BarrierStoneBlock_01_B: {
        readonly type: "BarrierStoneBlock_01_B";
    };
    readonly BarrierStoneBlock_01_C: {
        readonly type: "BarrierStoneBlock_01_C";
    };
    readonly BarrierJersey_01_256x124: {
        readonly type: "BarrierJersey_01_256x124";
    };
    readonly BarrierHesco_01_128x240: {
        readonly type: "BarrierHesco_01_128x240";
    };
};
/** Standard elevation values */
export declare const Elevations: {
    /** Typical ground level on most maps */
    readonly Ground: 64;
    /** Standard elevated platform height */
    readonly Platform: 90;
    /** Combat area polygon Y level */
    readonly CombatPolygon: 121;
    /** Deploy camera height */
    readonly DeployCam: 167;
};
/** Default floor tile configuration */
export declare const DefaultFloorTile: {
    readonly type: "FiringRange_Floor_A";
    readonly spacingX: 3.537;
    readonly spacingZ: 5.0101;
};
/** Floor tile type for typing */
export type FloorAssetType = keyof typeof FloorAssets;
/** Wall asset type for typing */
export type WallAssetType = keyof typeof WallAssets;
/** Barrier asset type for typing */
export type BarrierAssetType = keyof typeof BarrierAssets;
//# sourceMappingURL=assets.d.ts.map