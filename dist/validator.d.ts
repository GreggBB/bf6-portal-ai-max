/**
 * Spatial document validator
 * Validates generated spatial JSON for common issues
 */
import type { SpatialDocument } from './types/spatial.js';
/** Validation result */
export interface ValidationResult {
    /** Whether validation passed */
    valid: boolean;
    /** Error messages (if any) */
    errors: string[];
    /** Warning messages (if any) */
    warnings: string[];
}
/**
 * Validate a spatial document
 * @param document The document to validate
 */
export declare function validateDocument(document: SpatialDocument): ValidationResult;
/**
 * Validate and return formatted report
 * @param document The document to validate
 */
export declare function validateAndReport(document: SpatialDocument): string;
//# sourceMappingURL=validator.d.ts.map