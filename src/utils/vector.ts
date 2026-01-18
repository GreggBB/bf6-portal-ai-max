/**
 * Vector3 math utilities
 */

import type { Vector3 } from '../types/spatial.js';

/** Create a new Vector3 */
export function vec3(x: number, y: number, z: number): Vector3 {
  return { x, y, z };
}

/** Create a zero vector */
export function zero(): Vector3 {
  return { x: 0, y: 0, z: 0 };
}

/** Add two vectors */
export function add(a: Vector3, b: Vector3): Vector3 {
  return {
    x: a.x + b.x,
    y: a.y + b.y,
    z: a.z + b.z,
  };
}

/** Subtract vector b from vector a */
export function subtract(a: Vector3, b: Vector3): Vector3 {
  return {
    x: a.x - b.x,
    y: a.y - b.y,
    z: a.z - b.z,
  };
}

/** Scale a vector by a scalar */
export function scale(v: Vector3, scalar: number): Vector3 {
  return {
    x: v.x * scalar,
    y: v.y * scalar,
    z: v.z * scalar,
  };
}

/** Calculate distance between two points */
export function distance(a: Vector3, b: Vector3): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const dz = b.z - a.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

/** Calculate magnitude (length) of a vector */
export function magnitude(v: Vector3): number {
  return Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
}

/** Normalize a vector to unit length */
export function normalize(v: Vector3): Vector3 {
  const mag = magnitude(v);
  if (mag === 0) return zero();
  return scale(v, 1 / mag);
}

/** Linear interpolation between two vectors */
export function lerp(a: Vector3, b: Vector3, t: number): Vector3 {
  return {
    x: a.x + (b.x - a.x) * t,
    y: a.y + (b.y - a.y) * t,
    z: a.z + (b.z - a.z) * t,
  };
}

/** Calculate center point between two vectors */
export function midpoint(a: Vector3, b: Vector3): Vector3 {
  return lerp(a, b, 0.5);
}

/** Clone a vector */
export function clone(v: Vector3): Vector3 {
  return { x: v.x, y: v.y, z: v.z };
}

/** Check if two vectors are equal (within epsilon) */
export function equals(a: Vector3, b: Vector3, epsilon: number = 0.0001): boolean {
  return (
    Math.abs(a.x - b.x) < epsilon &&
    Math.abs(a.y - b.y) < epsilon &&
    Math.abs(a.z - b.z) < epsilon
  );
}
