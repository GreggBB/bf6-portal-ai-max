/**
 * Spatial document validator
 * Validates generated spatial JSON for common issues
 */
/** Required object types for a valid testing platform */
const REQUIRED_TYPES = [
    'Sector',
    'CombatArea',
    'PolygonVolume',
    'HQ_PlayerSpawner',
    'SpawnPoint',
    'DeployCam',
];
/**
 * Validate a spatial document
 * @param document The document to validate
 */
export function validateDocument(document) {
    const errors = [];
    const warnings = [];
    const objects = document.Portal_Dynamic;
    if (!objects || objects.length === 0) {
        errors.push('Document has no objects in Portal_Dynamic');
        return { valid: false, errors, warnings };
    }
    // Build maps for validation
    const objectById = new Map();
    const objectsByType = new Map();
    const objIds = new Map();
    for (const obj of objects) {
        // Check for duplicate IDs
        if (objectById.has(obj.id)) {
            errors.push(`Duplicate object ID: ${obj.id}`);
        }
        objectById.set(obj.id, obj);
        // Track by type
        const typeList = objectsByType.get(obj.type) ?? [];
        typeList.push(obj);
        objectsByType.set(obj.type, typeList);
        // Check for duplicate ObjIds
        if (obj.ObjId !== undefined) {
            if (objIds.has(obj.ObjId)) {
                errors.push(`Duplicate ObjId ${obj.ObjId}: ${obj.id} and ${objIds.get(obj.ObjId)}`);
            }
            objIds.set(obj.ObjId, obj.id);
        }
    }
    // Check for required object types
    for (const requiredType of REQUIRED_TYPES) {
        const typeObjects = objectsByType.get(requiredType);
        if (!typeObjects || typeObjects.length === 0) {
            warnings.push(`Missing required object type: ${requiredType}`);
        }
    }
    // Check for at least 2 HQ spawners (one per team)
    const hqSpawners = objectsByType.get('HQ_PlayerSpawner') ?? [];
    if (hqSpawners.length < 2) {
        warnings.push(`Only ${hqSpawners.length} HQ spawner(s) found (2 recommended for teams)`);
    }
    // Validate linked references
    for (const obj of objects) {
        if (obj.linked && Array.isArray(obj.linked)) {
            for (const linkProp of obj.linked) {
                const linkValue = obj[linkProp];
                if (typeof linkValue === 'string') {
                    if (!objectById.has(linkValue)) {
                        errors.push(`Broken reference in ${obj.id}.${linkProp}: ${linkValue}`);
                    }
                }
                else if (Array.isArray(linkValue)) {
                    for (const ref of linkValue) {
                        if (typeof ref === 'string' && !objectById.has(ref)) {
                            errors.push(`Broken reference in ${obj.id}.${linkProp}: ${ref}`);
                        }
                    }
                }
            }
        }
    }
    // Check HQ ObjId conventions
    const team1HQ = hqSpawners.find((h) => !h.Team || h.Team === 'Team1');
    const team2HQ = hqSpawners.find((h) => h.Team === 'Team2');
    if (team1HQ && team1HQ.ObjId !== 1) {
        warnings.push(`Team 1 HQ ObjId is ${team1HQ.ObjId}, expected 1`);
    }
    if (team2HQ && team2HQ.ObjId !== 2) {
        warnings.push(`Team 2 HQ ObjId is ${team2HQ.ObjId}, expected 2`);
    }
    return {
        valid: errors.length === 0,
        errors,
        warnings,
    };
}
/**
 * Validate and return formatted report
 * @param document The document to validate
 */
export function validateAndReport(document) {
    const result = validateDocument(document);
    const lines = [];
    lines.push(`Validation ${result.valid ? 'PASSED' : 'FAILED'}`);
    lines.push(`Objects: ${document.Portal_Dynamic.length}`);
    lines.push('');
    if (result.errors.length > 0) {
        lines.push('ERRORS:');
        for (const error of result.errors) {
            lines.push(`  ❌ ${error}`);
        }
        lines.push('');
    }
    if (result.warnings.length > 0) {
        lines.push('WARNINGS:');
        for (const warning of result.warnings) {
            lines.push(`  ⚠️  ${warning}`);
        }
    }
    if (result.errors.length === 0 && result.warnings.length === 0) {
        lines.push('✅ No issues found');
    }
    return lines.join('\n');
}
//# sourceMappingURL=validator.js.map