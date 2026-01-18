/**
 * Core spatial types for Battlefield Portal spatial JSON generation
 */

/** 3D vector for positions and directions */
export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

/** Rotation matrix represented as three orthonormal vectors */
export interface RotationMatrix {
  right: Vector3;
  up: Vector3;
  front: Vector3;
}

/** Base properties shared by all spatial objects */
export interface SpatialObjectBase {
  /** Display name in editor */
  name: string;
  /** Object type identifier */
  type: string;
  /** Unique hierarchical path identifier (e.g., "TEAM_1_HQ/SpawnPoint_1_1") */
  id: string;
  /** World position */
  position: Vector3;
  /** Rotation right vector */
  right: Vector3;
  /** Rotation up vector */
  up: Vector3;
  /** Rotation front vector */
  front: Vector3;
}

/** Extended properties for objects that support linking and ObjId */
export interface SpatialObject extends SpatialObjectBase {
  /** Numeric ID for TypeScript code access (e.g., mod.GetHQ(1)) */
  ObjId?: number;
  /** Team assignment - "Team1" or "Team2" */
  Team?: 'Team1' | 'Team2';
  /** Alternate team designation - typically "TeamNeutral" */
  AltTeam?: 'TeamNeutral';
  /** Array of property names that contain references to other objects */
  linked?: string[];
  /** Additional type-specific properties */
  [key: string]: unknown;
}

/** Root structure of a spatial JSON file */
export interface SpatialDocument {
  Portal_Dynamic: SpatialObject[];
}

/** Bounds for a region (axis-aligned bounding box) */
export interface Bounds {
  min: Vector3;
  max: Vector3;
}

/** Configuration for generating a spatial document */
export interface SpatialConfig {
  /** Target map identifier (e.g., "MP_Abbasid" for Cairo) */
  targetMap?: string;
  /** Base elevation for the platform */
  elevation?: number;
}
