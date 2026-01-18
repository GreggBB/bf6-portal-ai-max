/**
 * Deploy camera generator
 * Creates the deployment screen camera for player spawning
 */

import type { SpatialObject, Vector3 } from '../types/spatial.js';
import type { DeployCam } from '../types/game-objects.js';
import { Elevations } from '../types/assets.js';
import { vec3 } from '../utils/vector.js';
import { createTopDown } from '../utils/rotation.js';

/** Configuration for deploy camera generation */
export interface DeployCamConfig {
  /** Position to look at (camera will be above this) */
  lookAt: Vector3;
  /** Height above the lookAt position */
  height?: number;
  /** Custom ID */
  id?: string;
}

/**
 * Generate a deploy camera
 * @param config Deploy camera configuration
 */
export function generateDeployCam(config: DeployCamConfig): DeployCam {
  const {
    lookAt,
    height = Elevations.DeployCam - Elevations.Platform,
    id = 'DeployCam',
  } = config;

  const rotation = createTopDown();

  const deployCam: DeployCam = {
    name: 'DeployCam',
    type: 'DeployCam',
    id,
    position: vec3(lookAt.x, lookAt.y + height, lookAt.z),
    right: rotation.right,
    up: rotation.up,
    front: rotation.front,
  };

  return deployCam;
}

/**
 * Generate a deploy camera centered over a platform
 * @param center Center position of the platform
 * @param elevation Platform elevation
 */
export function generateDeployCamOverPlatform(
  center: Vector3,
  elevation: number = Elevations.Platform
): DeployCam {
  return generateDeployCam({
    lookAt: vec3(center.x, elevation, center.z),
    height: Elevations.DeployCam - elevation,
  });
}
