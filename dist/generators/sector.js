/**
 * Sector generator
 * Creates sectors that manage objectives and boundaries
 */
import { Rotations } from '../utils/rotation.js';
/**
 * Generate a sector
 * @param config Sector configuration
 */
export function generateSector(config) {
    const { name, position, capturePoints = [], sectorAreaId, objId, } = config;
    const sector = {
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
export function generateSimpleSector(combatPolygonId, centerPosition) {
    return generateSector({
        name: 'Sector',
        position: centerPosition,
        capturePoints: [],
        sectorAreaId: combatPolygonId,
    });
}
//# sourceMappingURL=sector.js.map