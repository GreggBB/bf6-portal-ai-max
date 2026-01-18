/**
 * Vector3 math utilities
 */
import type { Vector3 } from '../types/spatial.js';
/** Create a new Vector3 */
export declare function vec3(x: number, y: number, z: number): Vector3;
/** Create a zero vector */
export declare function zero(): Vector3;
/** Add two vectors */
export declare function add(a: Vector3, b: Vector3): Vector3;
/** Subtract vector b from vector a */
export declare function subtract(a: Vector3, b: Vector3): Vector3;
/** Scale a vector by a scalar */
export declare function scale(v: Vector3, scalar: number): Vector3;
/** Calculate distance between two points */
export declare function distance(a: Vector3, b: Vector3): number;
/** Calculate magnitude (length) of a vector */
export declare function magnitude(v: Vector3): number;
/** Normalize a vector to unit length */
export declare function normalize(v: Vector3): Vector3;
/** Linear interpolation between two vectors */
export declare function lerp(a: Vector3, b: Vector3, t: number): Vector3;
/** Calculate center point between two vectors */
export declare function midpoint(a: Vector3, b: Vector3): Vector3;
/** Clone a vector */
export declare function clone(v: Vector3): Vector3;
/** Check if two vectors are equal (within epsilon) */
export declare function equals(a: Vector3, b: Vector3, epsilon?: number): boolean;
//# sourceMappingURL=vector.d.ts.map