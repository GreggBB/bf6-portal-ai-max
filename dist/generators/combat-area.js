/**
 * Combat area generator
 * Creates playable boundary with CombatArea and PolygonVolume
 */
import { Elevations } from '../types/assets.js';
import { vec3 } from '../utils/vector.js';
import { Rotations } from '../utils/rotation.js';
import { generateCombatPolygonId, IdPrefixes } from '../utils/id.js';
/**
 * Generate a combat area with boundary polygon
 * @param config Combat area configuration
 */
export function generateCombatArea(config) {
    const { bounds, padding = 5, height = 500, id = IdPrefixes.CombatArea, } = config;
    const polygonId = generateCombatPolygonId(id);
    const polyY = Elevations.CombatPolygon;
    // Calculate padded bounds
    const minX = bounds.min.x - padding;
    const maxX = bounds.max.x + padding;
    const minZ = bounds.min.z - padding;
    const maxZ = bounds.max.z + padding;
    // Create polygon volume (rectangle)
    const polygon = {
        name: 'CollisionPolygon3D',
        type: 'PolygonVolume',
        id: polygonId,
        height,
        points: [
            vec3(minX, polyY, minZ),
            vec3(maxX, polyY, minZ),
            vec3(maxX, polyY, maxZ),
            vec3(minX, polyY, maxZ),
        ],
    };
    // Create combat area
    const combatArea = {
        name: 'CombatArea',
        type: 'CombatArea',
        id,
        CombatVolume: polygonId,
        position: vec3((minX + maxX) / 2, bounds.min.y, (minZ + maxZ) / 2),
        right: Rotations.Identity.right,
        up: Rotations.Identity.up,
        front: Rotations.Identity.front,
        linked: ['CombatVolume'],
    };
    return {
        objects: [polygon, combatArea],
        combatArea,
        polygon,
    };
}
//# sourceMappingURL=combat-area.js.map