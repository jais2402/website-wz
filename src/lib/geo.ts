import { latLonToVec3 } from './shapes'

type V3 = [number, number, number]

const len = (v: V3) => Math.hypot(v[0], v[1], v[2])
const norm = (v: V3): V3 => {
  const l = len(v) || 1
  return [v[0] / l, v[1] / l, v[2] / l]
}

/**
 * Points along a great-circle arc between two lat/lon positions on a sphere of `radius`, lifted off the surface
 * by up to `lift` × radius at the midpoint (scaled by how far apart the endpoints are), like a flight path.
 * Returns `segments + 1` points as a flat xyz array.
 */
export function arcPoints(
  from: { lat: number; lon: number },
  to: { lat: number; lon: number },
  radius: number,
  segments = 64,
  lift = 0.32,
): Float32Array {
  const a = norm(latLonToVec3(from.lat, from.lon, 1))
  const b = norm(latLonToVec3(to.lat, to.lon, 1))
  const dot = Math.min(1, Math.max(-1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2]))
  const omega = Math.acos(dot)
  const out = new Float32Array((segments + 1) * 3)
  for (let i = 0; i <= segments; i++) {
    const t = i / segments
    // Spherical linear interpolation; falls back to lerp for (near-)identical points.
    const s = Math.sin(omega)
    const ka = s < 1e-6 ? 1 - t : Math.sin((1 - t) * omega) / s
    const kb = s < 1e-6 ? t : Math.sin(t * omega) / s
    const p = norm([a[0] * ka + b[0] * kb, a[1] * ka + b[1] * kb, a[2] * ka + b[2] * kb])
    const h = radius * (1 + lift * (omega / Math.PI) * Math.sin(Math.PI * t))
    out.set([p[0] * h, p[1] * h, p[2] * h], i * 3)
  }
  return out
}

/** Y rotation (radians) that turns the globe so longitude `lon` faces the camera (+z). */
export function facingRotationY(lon: number): number {
  return Math.PI / 2 - ((lon + 180) * Math.PI) / 180
}
