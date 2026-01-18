/**
 * Deploy camera generator
 * Creates the deployment screen camera for player spawning
 */
import { Elevations } from '../types/assets.js';
import { vec3 } from '../utils/vector.js';
import { createTopDown } from '../utils/rotation.js';
/**
 * Generate a deploy camera
 * @param config Deploy camera configuration
 */
export function generateDeployCam(config) {
    const { lookAt, height = Elevations.DeployCam - Elevations.Platform, id = 'DeployCam', } = config;
    const rotation = createTopDown();
    const deployCam = {
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
export function generateDeployCamOverPlatform(center, elevation = Elevations.Platform) {
    return generateDeployCam({
        lookAt: vec3(center.x, elevation, center.z),
        height: Elevations.DeployCam - elevation,
    });
}
//# sourceMappingURL=deploy-cam.js.map