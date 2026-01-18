/**
 * Asset definitions and constants for spatial generation
 */

/** Floor tile asset definitions */
export const FloorAssets = {
  FiringRange_Floor_A: {
    type: 'FiringRange_Floor_A',
    spacingX: 3.537,
    spacingZ: 5.0101,
  },
  FiringRange_Floor_B: {
    type: 'FiringRange_Floor_B',
    spacingX: 3.537,
    spacingZ: 5.0101,
  },
} as const;

/** Wall asset definitions */
export const WallAssets = {
  FiringRange_Wall_1024_01: {
    type: 'FiringRange_Wall_1024_01',
    length: 1024,
  },
  FiringRange_WallPanelContact_01: {
    type: 'FiringRange_WallPanelContact_01',
  },
  BarrierConcreteWall_01_192x320: {
    type: 'BarrierConcreteWall_01_192x320',
    width: 192,
    height: 320,
  },
} as const;

/** Barrier asset definitions */
export const BarrierAssets = {
  BarrierStoneBlock_01_A: { type: 'BarrierStoneBlock_01_A' },
  BarrierStoneBlock_01_B: { type: 'BarrierStoneBlock_01_B' },
  BarrierStoneBlock_01_C: { type: 'BarrierStoneBlock_01_C' },
  BarrierJersey_01_256x124: { type: 'BarrierJersey_01_256x124' },
  BarrierHesco_01_128x240: { type: 'BarrierHesco_01_128x240' },
} as const;

/** Standard elevation values */
export const Elevations = {
  /** Typical ground level on most maps */
  Ground: 64,
  /** Standard elevated platform height */
  Platform: 90,
  /** Combat area polygon Y level */
  CombatPolygon: 121,
  /** Deploy camera height */
  DeployCam: 167,
} as const;

/** Default floor tile configuration */
export const DefaultFloorTile = FloorAssets.FiringRange_Floor_A;

/** Floor tile type for typing */
export type FloorAssetType = keyof typeof FloorAssets;

/** Wall asset type for typing */
export type WallAssetType = keyof typeof WallAssets;

/** Barrier asset type for typing */
export type BarrierAssetType = keyof typeof BarrierAssets;
