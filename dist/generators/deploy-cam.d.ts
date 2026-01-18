/**
 * Deploy camera generator
 * Creates the deployment screen camera for player spawning
 */
import type { Vector3 } from '../types/spatial.js';
import type { DeployCam } from '../types/game-objects.js';
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
export declare function generateDeployCam(config: DeployCamConfig): DeployCam;
/**
 * Generate a deploy camera centered over a platform
 * @param center Center position of the platform
 * @param elevation Platform elevation
 */
export declare function generateDeployCamOverPlatform(center: Vector3, elevation?: number): DeployCam;
//# sourceMappingURL=deploy-cam.d.ts.map