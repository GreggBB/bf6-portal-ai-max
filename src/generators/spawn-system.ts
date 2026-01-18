/**
 * Spawn system generator
 * Creates HQ spawners with infantry spawn points and protection areas
 */

import type { SpatialObject, Vector3 } from '../types/spatial.js';
import type { HQPlayerSpawner, SpawnPoint, PolygonVolume } from '../types/game-objects.js';
import { HQObjIds } from '../types/game-objects.js';
import { Elevations } from '../types/assets.js';
import { vec3, add } from '../utils/vector.js';
import { createYawRotation, Rotations } from '../utils/rotation.js';
import {
  generateSpawnPointId,
  generateHQAreaId,
  IdPrefixes,
} from '../utils/id.js';

/** Team number type */
export type TeamNumber = 1 | 2;

/** Configuration for spawn system generation */
export interface SpawnSystemConfig {
  /** Team number (1 or 2) */
  teamNumber: TeamNumber;
  /** Center position of the spawn area */
  basePosition: Vector3;
  /** Number of spawn points to create */
  spawnCount: number;
  /** Spacing between spawn points */
  spacing?: number;
  /** Direction spawns face (degrees, 0 = +Z, 90 = +X) */
  facingAngle?: number;
  /** Custom ID prefix (overrides default) */
  idPrefix?: string;
  /** Size of HQ protection area polygon */
  hqAreaSize?: number;
}

/** Result of spawn system generation */
export interface SpawnSystemResult {
  /** All generated objects (HQ, spawn points, area polygon) */
  objects: SpatialObject[];
  /** Reference to the HQ spawner */
  hqSpawner: HQPlayerSpawner;
  /** References to spawn points */
  spawnPoints: SpawnPoint[];
  /** Reference to HQ area polygon */
  hqArea: PolygonVolume;
}

/**
 * Generate a spawn system with HQ, spawn points, and protection area
 * @param config Spawn system configuration
 */
export function generateSpawnSystem(config: SpawnSystemConfig): SpawnSystemResult {
  const {
    teamNumber,
    basePosition,
    spawnCount,
    spacing = 3,
    facingAngle = 0,
    hqAreaSize = 15,
  } = config;

  const hqId = teamNumber === 1 ? IdPrefixes.Team1HQ : IdPrefixes.Team2HQ;
  const rotation = createYawRotation(facingAngle);
  const objects: SpatialObject[] = [];
  const spawnPoints: SpawnPoint[] = [];

  // Calculate spawn point positions (line formation perpendicular to facing)
  const perpAngle = facingAngle + 90;
  const perpRad = (perpAngle * Math.PI) / 180;
  const perpDir = vec3(Math.sin(perpRad), 0, Math.cos(perpRad));

  // Generate spawn points
  const spawnIds: string[] = [];
  const halfWidth = ((spawnCount - 1) * spacing) / 2;

  for (let i = 0; i < spawnCount; i++) {
    const offset = -halfWidth + i * spacing;
    const position = vec3(
      basePosition.x + perpDir.x * offset,
      basePosition.y,
      basePosition.z + perpDir.z * offset
    );

    const spawnId = generateSpawnPointId(hqId, teamNumber, i + 1);
    spawnIds.push(spawnId);

    const spawnPoint: SpawnPoint = {
      name: `SpawnPoint_${teamNumber}_${i + 1}`,
      type: 'SpawnPoint',
      id: spawnId,
      position,
      right: rotation.right,
      up: rotation.up,
      front: rotation.front,
    };

    spawnPoints.push(spawnPoint);
    objects.push(spawnPoint);
  }

  // Generate HQ area polygon
  const hqAreaId = generateHQAreaId(hqId, teamNumber);
  const polyY = Elevations.CombatPolygon;
  const halfSize = hqAreaSize / 2;

  const hqArea: PolygonVolume = {
    name: `HQ_Team${teamNumber}`,
    type: 'PolygonVolume',
    id: hqAreaId,
    height: 500,
    points: [
      vec3(basePosition.x - halfSize, polyY, basePosition.z - halfSize),
      vec3(basePosition.x + halfSize, polyY, basePosition.z - halfSize),
      vec3(basePosition.x + halfSize, polyY, basePosition.z + halfSize),
      vec3(basePosition.x - halfSize, polyY, basePosition.z + halfSize),
    ],
  };
  objects.push(hqArea as unknown as SpatialObject);

  // Generate HQ spawner
  const hqSpawner: HQPlayerSpawner = {
    name: `TEAM_${teamNumber}_HQ`,
    type: 'HQ_PlayerSpawner',
    id: hqId,
    ObjId: teamNumber === 1 ? HQObjIds.Team1 : HQObjIds.Team2,
    AltTeam: 'TeamNeutral',
    VehicleSpawnersEnabled: true,
    InfantrySpawns: spawnIds,
    HQArea: hqAreaId,
    position: basePosition,
    right: Rotations.Identity.right,
    up: Rotations.Identity.up,
    front: Rotations.Identity.front,
    linked: ['HQArea', 'InfantrySpawns'],
  };

  // Add Team property for Team 2
  if (teamNumber === 2) {
    hqSpawner.Team = 'Team2';
  }

  objects.push(hqSpawner);

  return {
    objects,
    hqSpawner,
    spawnPoints,
    hqArea,
  };
}

/**
 * Generate spawn systems for both teams at opposite ends of a platform
 * @param bounds Platform bounds
 * @param spawnCount Number of spawns per team
 * @param elevation Y position for spawns
 * @param padding Distance from edge
 */
export function generateTeamSpawns(
  bounds: { min: Vector3; max: Vector3 },
  spawnCount: number = 3,
  elevation: number = Elevations.Platform,
  padding: number = 5
): { team1: SpawnSystemResult; team2: SpawnSystemResult } {
  const centerX = (bounds.min.x + bounds.max.x) / 2;

  // Team 1 at south end (min Z), facing north
  const team1 = generateSpawnSystem({
    teamNumber: 1,
    basePosition: vec3(centerX, elevation, bounds.min.z + padding),
    spawnCount,
    facingAngle: 0, // Face north (+Z)
  });

  // Team 2 at north end (max Z), facing south
  const team2 = generateSpawnSystem({
    teamNumber: 2,
    basePosition: vec3(centerX, elevation, bounds.max.z - padding),
    spawnCount,
    facingAngle: 180, // Face south (-Z)
  });

  return { team1, team2 };
}
