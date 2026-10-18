import { arcPoints, facingRotationY } from './geo'
import { latLonToVec3 } from './shapes'

const chennai = { lat: 13.08, lon: 80.27 }
const london = { lat: 51.5, lon: -0.12 }

describe('arcPoints', () => {
  const pts = arcPoints(chennai, london, 2, 32)
  const at = (i: number) => [pts[i * 3], pts[i * 3 + 1], pts[i * 3 + 2]]
  const r = (v: number[]) => Math.hypot(v[0], v[1], v[2])

  it('returns segments + 1 points', () => {
    expect(pts).toHaveLength(33 * 3)
  })

  it('starts and ends on the sphere surface at the two cities', () => {
    const start = latLonToVec3(chennai.lat, chennai.lon, 2)
    const end = latLonToVec3(london.lat, london.lon, 2)
    at(0).forEach((v, i) => expect(v).toBeCloseTo(start[i], 4))
    at(32).forEach((v, i) => expect(v).toBeCloseTo(end[i], 4))
  })

  it('lifts off the surface in the middle', () => {
    expect(r(at(16))).toBeGreaterThan(2.05)
  })

  it('handles identical endpoints without NaN', () => {
    expect(arcPoints(chennai, chennai, 2, 8).every(Number.isFinite)).toBe(true)
  })
})

describe('facingRotationY', () => {
  it('rotates the given longitude to face +z', () => {
    for (const lon of [80.27, 0, -74, 151]) {
      const [x, , z] = latLonToVec3(0, lon, 1)
      const a = facingRotationY(lon)
      // three.js Y rotation: x' = x cos a + z sin a, z' = -x sin a + z cos a
      const xr = x * Math.cos(a) + z * Math.sin(a)
      const zr = -x * Math.sin(a) + z * Math.cos(a)
      expect(zr).toBeCloseTo(1, 5)
      expect(xr).toBeCloseTo(0, 5)
    }
  })
})
