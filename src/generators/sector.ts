/**
 * Sector generator
 * Creates sectors that manage objectives and boundaries
 */

import type { SpatialObject, Vector3 } from '../types/spatial.js';
import type { Sector } from '../types/game-objects.js';
import { vec3 } from '../utils/vector.js';
import { Rotations } from '../utils/rotation.js';

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
export function generateSector(config: SectorConfig): Sector {
  const {
    name,
    position,
    capturePoints = [],
    sectorAreaId,
    objId,
  } = config;

  const sector: Sector = {
    name,
    type: 'Sector',
    id: name,
    CapturePoints: capturePoints,
    SectorArea: sectorAreaId,
    position,
    right: Rotations.Identity.right,
    up: Rotations.Identity.up,
    front: Rotations.Identity.front,
    linked: ['SectorArea', 'CapturePoints'],
  };

  if (objId !== undefined) {
    sector.ObjId = objId;
  }

  return sector;
}

/**
 * Generate a simple sector linked to a combat area
 * (No capture points - for testing platforms)
 * @param combatPolygonId ID of the combat area polygon
 * @param centerPosition Center position for the sector
 */
export function generateSimpleSector(
  combatPolygonId: string,
  centerPosition: Vector3
): Sector {
  return generateSector({
    name: 'Sector',
    position: centerPosition,
    capturePoints: [],
    sectorAreaId: combatPolygonId,
  });
}
