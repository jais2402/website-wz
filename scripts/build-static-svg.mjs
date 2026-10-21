#!/usr/bin/env node
// SVG versions of the full-tier 3D scenes for the static tier (no WebGL). Not screenshots: the same maths as the
// shaders (loom/shaders.ts, scene/threadShaders.ts, scene/Globe.tsx) evaluated here, projected through the same
// cameras and written as vector threads, rings, dots and glows. Re-run whenever a scene changes:
//
//   node scripts/build-static-svg.mjs        → public/lite/*.svg
//
// Kept in sync by hand with the shaders (same seeds, same formulas); fewer strands than the GPU draws, with the
// opacity raised to match the density.

import { mkdirSync, writeFileSync } from 'node:fs'
import * as THREE from 'three'
import { countries, reach } from '../src/content/site.ts'

const OUT = 'public/lite'
mkdirSync(OUT, { recursive: true })

// ---------------------------------------------------------------------------------------------------------------
// Shared helpers (mirrors of src/lib/shapes.ts, src/lib/loom.ts, src/lib/geo.ts)

function mulberry32(seed) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Strand seeds exactly as buildStrands() draws them (4 rng calls per strand). */
function strandSeeds(count, seed) {
  const rng = mulberry32(seed)
  return Array.from({ length: count }, () => [rng(), rng(), rng(), rng()])
}

/** Particles as buildParticles() draws them: a strand, a phase and a speed each. */
function particles(count, seeds, seed) {
  const rng = mulberry32(seed)
  return Array.from({ length: count }, () => {
    const s = seeds[Math.floor(rng() * seeds.length)]
    return { s, phase: rng(), speed: 0.018 + rng() * 0.035 }
  })
}

const clamp = (v, a, b) => Math.min(b, Math.max(a, v))
const mix = (a, b, t) => a + (b - a) * t
const mix3 = (a, b, t) => [mix(a[0], b[0], t), mix(a[1], b[1], t), mix(a[2], b[2], t)]
const smooth = (e0, e1, x) => {
  const t = clamp((x - e0) / (e1 - e0), 0, 1)
  return t * t * (3 - 2 * t)
}
const fract = (x) => x - Math.floor(x)

function latLonToVec3(lat, lon, r) {
  const phi = ((90 - lat) * Math.PI) / 180
  const theta = ((lon + 180) * Math.PI) / 180
  return [-r * Math.sin(phi) * Math.cos(theta), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(theta)]
}
const norm = (v) => {
  const l = Math.hypot(...v) || 1
  return [v[0] / l, v[1] / l, v[2] / l]
}
function arcPoints(from, to, radius, segments, lift = 0.32) {
  const a = norm(latLonToVec3(from.lat, from.lon, 1))
  const b = norm(latLonToVec3(to.lat, to.lon, 1))
  const omega = Math.acos(clamp(a[0] * b[0] + a[1] * b[1] + a[2] * b[2], -1, 1))
  const out = []
  for (let i = 0; i <= segments; i++) {
    const t = i / segments
    const s = Math.sin(omega)
    const ka = s < 1e-6 ? 1 - t : Math.sin((1 - t) * omega) / s
    const kb = s < 1e-6 ? t : Math.sin(t * omega) / s
    const p = norm([a[0] * ka + b[0] * kb, a[1] * ka + b[1] * kb, a[2] * ka + b[2] * kb])
    const h = radius * (1 + lift * (omega / Math.PI) * Math.sin(Math.PI * t))
    out.push([p[0] * h, p[1] * h, p[2] * h])
  }
  return out
}

// ---------------------------------------------------------------------------------------------------------------
// A tiny SVG scene: project world points through a three.js camera + group matrix into a W×H frame.

class Frame {
  constructor({ w, h, fov, pos, look, bg }) {
    this.w = w
    this.h = h
    this.bg = bg
    this.cam = new THREE.PerspectiveCamera(fov, w / h, 0.1, 100)
    this.cam.position.set(...pos)
    this.cam.lookAt(new THREE.Vector3(...look))
    this.cam.updateMatrixWorld()
    this.cam.updateProjectionMatrix()
    // Pixels per world unit at view depth 1.
    this.focal = h / 2 / Math.tan(THREE.MathUtils.degToRad(fov / 2))
    this.matrix = new THREE.Matrix4()
    this.v = new THREE.Vector3()
    this.layers = { back: [], threads: [], dots: [], front: [], glow: [] }
    this.classes = new Map()
    this.defs = []
  }
  /** Group transform for the following points (position, rotation XYZ, uniform scale). */
  group(position = [0, 0, 0], rotation = [0, 0, 0], scale = 1) {
    const o = new THREE.Object3D()
    o.position.set(...position)
    o.rotation.set(...rotation)
    o.scale.setScalar(scale)
    o.updateMatrixWorld()
    this.matrix.copy(o.matrixWorld)
  }
  /** World point → [x, y, depth] in pixels (depth = distance in front of the camera). */
  project(p) {
    const v = this.v.set(p[0], p[1], p[2]).applyMatrix4(this.matrix)
    const view = v.clone().applyMatrix4(this.cam.matrixWorldInverse)
    v.project(this.cam)
    return [((v.x + 1) / 2) * this.w, ((1 - v.y) / 2) * this.h, -view.z]
  }
  /** World scale of the current group (for sizes). */
  get scale() {
    return new THREE.Vector3().setFromMatrixScale(this.matrix).x
  }
  cls(color, alpha, width) {
    const key = `${hex(color)}|${q(alpha, 0.02)}|${width}`
    if (!this.classes.has(key)) this.classes.set(key, `k${this.classes.size.toString(36)}`)
    return this.classes.get(key)
  }
  /** A polyline (array of projected points) with one colour/alpha, additive. */
  line(layer, pts, color, alpha, width = 1) {
    if (pts.length < 2 || alpha < 0.004) return
    const a = Math.min(1, alpha)
    let d = `M${f(pts[0][0])} ${f(pts[0][1])}`
    for (let i = 1; i < pts.length; i++) d += `l${f(pts[i][0] - pts[i - 1][0])} ${f(pts[i][1] - pts[i - 1][1])}`
    this.layers[layer].push(`<path class="${this.cls(color, a, width)}" d="${d}"/>`)
  }
  /** A soft additive dot (radial gradient), like a gl point sprite. */
  dot(layer, x, y, r, color, alpha) {
    if (alpha < 0.01 || r < 0.2 || x < -r || y < -r || x > this.w + r || y > this.h + r) return
    const g = this.grad(color)
    this.layers[layer].push(
      `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}" fill="url(#${g})" opacity="${q(Math.min(1, alpha), 0.01)}"/>`,
    )
  }
  grad(color) {
    const id = `g${hex(color).slice(1)}`
    if (!this.defs.some((d) => d.includes(`id="${id}"`)))
      this.defs.push(
        `<radialGradient id="${id}"><stop offset="0" stop-color="${hex(color)}"/><stop offset=".3" stop-color="${hex(color)}" stop-opacity=".55"/><stop offset=".65" stop-color="${hex(color)}" stop-opacity=".12"/><stop offset="1" stop-color="${hex(color)}" stop-opacity="0"/></radialGradient>`,
      )
    return id
  }
  /** A big glow sprite: the loom's Billboard glow, a = pow(1 - r, 3). */
  glow(p, worldSize, color, alpha) {
    const [x, y, z] = this.project(p)
    const r = ((worldSize / 2) * this.focal * this.scale) / z
    const id = `h${this.defs.length}`
    this.defs.push(
      `<radialGradient id="${id}"><stop offset="0" stop-color="${hex(color)}" stop-opacity="${q(alpha, 0.01)}"/><stop offset=".2" stop-color="${hex(color)}" stop-opacity="${q(alpha * 0.51, 0.01)}"/><stop offset=".45" stop-color="${hex(color)}" stop-opacity="${q(alpha * 0.17, 0.01)}"/><stop offset=".7" stop-color="${hex(color)}" stop-opacity="${q(alpha * 0.03, 0.005)}"/><stop offset="1" stop-color="${hex(color)}" stop-opacity="0"/></radialGradient>`,
    )
    this.layers.glow.push(`<circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}" fill="url(#${id})"/>`)
  }
  svg({ vignette = true, bloom = 5 } = {}) {
    const css = [...this.classes.entries()]
      .map(([key, c]) => {
        const [col, a, wd] = key.split('|')
        return `.${c}{stroke:${col};stroke-opacity:${a}${wd !== '1' ? `;stroke-width:${wd}` : ''}}`
      })
      .join('')
    const W = this.w
    const H = this.h
    return [
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">`,
      `<style>path{fill:none;stroke-width:.65;stroke-linecap:round;stroke-linejoin:round}.a>*{mix-blend-mode:plus-lighter}${css}</style>`,
      '<defs>',
      ...this.defs,
      // Bloom: the bright parts spread into a soft halo, like the postprocessing pass.
      `<filter id="bloom" x="-10%" y="-10%" width="120%" height="120%" color-interpolation-filters="sRGB"><feGaussianBlur stdDeviation="${bloom}" result="b"/><feComponentTransfer in="b" result="c"><feFuncA type="linear" slope="1.6"/></feComponentTransfer><feMerge><feMergeNode in="c"/><feMergeNode in="SourceGraphic"/></feMerge></filter>`,
      `<radialGradient id="vig" cx=".5" cy=".5" r=".75"><stop offset=".45" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".72"/></radialGradient>`,
      '</defs>',
      this.bg ? `<rect width="${W}" height="${H}" fill="${this.bg}"/>` : '',
      `<g class="a">${this.layers.glow.join('')}</g>`,
      `<g>${this.layers.back.join('')}</g>`,
      `<g class="a" filter="url(#bloom)">${this.layers.threads.join('')}${this.layers.dots.join('')}</g>`,
      `<g>${this.layers.front.join('')}</g>`,
      vignette ? `<rect width="${W}" height="${H}" fill="url(#vig)"/>` : '',
      '</svg>',
    ].join('')
  }
}

const f = (n) => (Math.round(n * 10) / 10).toString().replace(/^(-?)0\./, '$1.')
const q = (n, step) => {
  const v = Math.round(n / step) * step
  return Number(v.toFixed(3)).toString().replace(/^0\./, '.')
}
const hex = (c) =>
  '#' +
  c
    .map((v) =>
      Math.round(clamp(v, 0, 1) * 15)
        .toString(16)
        .repeat(2),
    )
    .join('')
    .replace(/^(.)\1(.)\2(.)\3$/, '$1$2$3')

/** Splits a strand into chunks of `n` points; each chunk gets the mean colour and alpha of its points. */
let strandNo = 0
function emitStrand(fr, layer, pts, n = 8) {
  // Chunk boundaries are staggered per strand, so no common seam line shows across the bundle.
  const off = strandNo++ % n
  for (let i = off ? off - n : 0; i < pts.length - 1; i += n) {
    const chunk = pts.slice(Math.max(0, i), Math.min(pts.length, i + n + 1))
    if (chunk.length < 2) continue
    let a = 0
    const col = [0, 0, 0]
    for (const p of chunk) {
      a += p.a
      col[0] += p.c[0]
      col[1] += p.c[1]
      col[2] += p.c[2]
    }
    const k = chunk.length
    fr.line(
      layer,
      chunk.map((p) => p.xy),
      col.map((v) => v / k),
      a / k,
    )
  }
}

// ---------------------------------------------------------------------------------------------------------------
// The loom (loom/shaders.ts strandPos + LoomScene.tsx Loom)

const LOOM_PALETTE = [
  [0.24, [0.45, 0.22, 1.0]],
  [0.42, [0.05, 0.72, 0.95]],
  [0.58, [0.95, 0.12, 0.62]],
  [0.72, [1.0, 0.55, 0.22]],
  [0.86, [0.95, 0.12, 0.2]],
  [9, [0.78, 1.0, 0.24]],
]
const palette = (h) => LOOM_PALETTE.find(([e]) => h < e)[1]

const VARIANTS = {
  classic: {
    range: [0, 1],
    woven: [0.95, 0.78, 0.5],
    fray: 0,
    rotation: [0, 0, 0],
    lamp: [1, 0.95, 0.85],
    mouthGlow: [1, 0.945, 0.863],
    haloGlow: [0.5, 0.42, 1],
    dishGlow: [1, 0.85, 0.6],
  },
  spindle: {
    range: [0, 0.42],
    woven: [0.62, 0.8, 1],
    fray: 0,
    rotation: [0, 0, 0.62],
    lamp: [0.65, 0.85, 1],
    mouthGlow: [0.894, 0.945, 1],
    haloGlow: [0.3, 0.62, 1],
    dishGlow: [0.6, 0.8, 1],
  },
  frayed: {
    range: [0.42, 0.44],
    woven: [1, 0.55, 0.42],
    fray: 1,
    rotation: [0.18, 0.1, -0.22],
    lamp: [1, 0.55, 0.4],
    mouthGlow: [1, 0.882, 0.831],
    haloGlow: [1, 0.48, 0.35],
    dishGlow: [0.9, 0.4, 0.3],
  },
}

const chaosEnvelope = (x) => Math.pow(1 - smooth(-9, 0.4, x), 0.55)
const bundleRadius = (x) => mix(1.15, 0.34, smooth(-1.5, 4.6, x))

function strandPos(t, s, time, v, spread = 1) {
  const x = mix(-15, 18, t)
  const env = Math.max(chaosEnvelope(x), v.fray * 0.8)
  const ang = s[0] * Math.PI * 2
  const br = Math.sqrt(s[1]) * bundleRadius(x)
  const disc = [Math.cos(ang) * br, Math.sin(ang) * br]
  const k = x * 0.32
  const sp = (0.45 + s[3] * 0.75) * (0.55 + clamp(-x / 9, 0, 1.6) * 0.65) * spread
  const tangle = [
    (Math.sin(k * 1.3 + s[0] * 23 + time * 0.35) * 1.9 + Math.sin(k * 2.9 + s[1] * 13 - time * 0.6) * 0.9) * sp,
    (Math.cos(k * 1.1 + s[2] * 17 + time * 0.42) * 2.2 + Math.sin(k * 3.4 + s[3] * 11 + time * 0.55) * 0.9) * sp,
  ]
  const y = mix(disc[0], disc[0] + tangle[0], env) + Math.sin(x * 0.35 - time * 0.8) * 0.05 * (1 - env) * (x >= 4.6)
  const z = mix(disc[1], disc[1] + tangle[1], env)
  return [x, y, z]
}

const RINGS = [
  { x: 0, r: 1.38, tube: 0.075 },
  { x: 0.75, r: 1.12, tube: 0.05 },
  { x: 1.6, r: 0.88, tube: 0.05 },
  { x: 2.55, r: 0.68, tube: 0.045 },
  { x: 3.45, r: 0.56, tube: 0.06 },
  { x: 4.5, r: 0.44, tube: 0.045 },
]
const DISH = { x: 5.6, r: 1.15 }

/** A torus as a projected ring, split into the half behind its centre and the half in front of it. */
function ring(fr, center, rotation, r, tube, style) {
  const o = new THREE.Object3D()
  o.position.set(...center)
  o.rotation.set(...rotation)
  o.updateMatrixWorld()
  const centreDepth = fr.project(center)[2]
  const back = []
  const front = []
  let cur = null
  let curSide = null
  const flush = () => {
    if (cur && cur.length > 1) (curSide ? front : back).push(cur)
  }
  for (let i = 0; i <= 96; i++) {
    const a = (i / 96) * Math.PI * 2
    // Torus in its local XY plane, like THREE.TorusGeometry.
    const p = new THREE.Vector3(Math.cos(a) * r, Math.sin(a) * r, 0).applyMatrix4(o.matrixWorld)
    const pr = fr.project([p.x, p.y, p.z])
    const side = pr[2] < centreDepth
    if (side !== curSide) {
      flush()
      cur = cur ? [cur[cur.length - 1]] : []
      curSide = side
    }
    cur.push(pr)
  }
  flush()
  const width = Math.max(0.6, (2 * tube * fr.focal * fr.scale) / centreDepth)
  for (const [layer, paths] of [
    ['back', back],
    ['front', front],
  ])
    for (const pts of paths) style(layer, pts, width)
}

function metal(fr) {
  return (layer, pts, width) => {
    fr.line(layer, pts, [0.17, 0.19, 0.26], 1, f(width))
    // Lit rim: the warm point light at the mouth catches the top of every ring.
    fr.line(layer, pts, [0.62, 0.66, 0.8], layer === 'front' ? 0.42 : 0.22, f(Math.max(0.5, width * 0.32)))
  }
}

function buildLoom({ name, w, h, view, variant, camera, strands, points, parts, alphaBoost, time = 6 }) {
  const v = VARIANTS[variant]
  const fr = new Frame({ w, h, fov: 40, ...camera, bg: view === 'contact' ? '#07070c' : '#04050c' })

  // Far background glow (outside the loom group).
  fr.group()
  fr.glow([-14, 0, -12], 40, [0.1 * 0.6, 0.137 * 0.6, 0.314 * 0.6], 1)

  fr.group([0, 0, 0], v.rotation)
  fr.glow([-0.4, 0, 0], 9, v.haloGlow, 0.22)
  fr.glow([-0.25, 0, 0], 2.8, v.mouthGlow, 0.9)
  fr.glow([-0.25, 0, 0], 4.2, v.mouthGlow, 0.75)
  fr.glow([-0.1, 0, 0], 7, v.mouthGlow, 0.55)

  // Threads.
  const seeds = strandSeeds(strands, 11)
  for (const s of seeds) {
    const pts = []
    for (let i = 0; i < points; i++) {
      const t = i / (points - 1)
      const p = strandPos(t, s, time, v)
      const env = Math.max(chaosEnvelope(p[0]), v.fray * 0.8)
      const base = palette(v.range[0] + s[2] * v.range[1])
      const woven = mix3(v.woven, base, 0.25)
      const col = mix3(woven, base, smooth(0, 0.25, env))
      const hot = Math.exp(-(((p[0] - 0) / 1.6) ** 2))
      const c = mix3(mix3(col, [1, 0.96, 0.94], 0.3), [1, 0.95, 0.88], hot * 0.6)
      const fade = smooth(0, 0.1, t) * (1 - smooth(0.88, 1, t))
      const a = (fade * mix(0.022, 0.4, env) * (0.45 + s[3]) + hot * 0.035) * alphaBoost
      pts.push({ xy: fr.project(p), c, a })
    }
    emitStrand(fr, 'threads', pts, 5)
  }

  // Particles riding the threads.
  for (const pt of particles(parts, seeds, 23)) {
    const t = fract(pt.phase + time * pt.speed)
    const p = strandPos(t, pt.s, time, v)
    const env = Math.max(chaosEnvelope(p[0]), v.fray * 0.8)
    const hot = Math.exp(-(((p[0] - 0) / 1.4) ** 2))
    const c = mix3(mix3(v.woven.map((x) => x * 1.05), palette(v.range[0] + pt.s[2] * v.range[1]), env), [1, 1, 1], hot)
    const a = smooth(0, 0.06, t) * (1 - smooth(0.9, 1, t)) * (mix(0.18, 0.7, env) + hot * 0.5)
    const [x, y, z] = fr.project(p)
    const size = ((14 + hot * 26 + env * 6) * fr.h) / 900 / (z / 14)
    fr.dot('dots', x, y, size * 0.3, c, a * 0.75)
  }

  // The loom machine.
  const frayed = variant === 'frayed'
  const style = metal(fr)
  RINGS.forEach((r, i) => {
    const pos = frayed ? [r.x + i * 0.12, Math.sin(i * 1.7) * 0.32, Math.cos(i * 2.3) * 0.28] : [r.x, 0, 0]
    const rot = frayed ? [i % 2 ? 0.32 : -0.26, Math.PI / 2 + Math.sin(i) * 0.38, 0] : [0, Math.PI / 2, 0]
    ring(fr, pos, rot, r.r, r.tube, style)
  })
  if (!frayed) {
    const col = variant === 'spindle' ? [0.72, 0.83, 1] : [0.73, 0.75, 0.86]
    const cage = 0.5 // the cage's turn at the moment of the picture
    for (let i = 0; i < RINGS.length - 1; i++) {
      const a = RINGS[i]
      const b = RINGS[i + 1]
      for (let k = 0; k < 14; k++) {
        const t0 = (k / 14) * Math.PI * 2 + cage
        const t1 = ((k + 0.5) / 14) * Math.PI * 2 + cage
        for (const [u, w2] of [
          [t0, t1],
          [t1, t0],
        ]) {
          const p0 = fr.project([a.x, Math.cos(u) * a.r, Math.sin(u) * a.r])
          const p1 = fr.project([b.x, Math.cos(w2) * b.r, Math.sin(w2) * b.r])
          fr.line(p0[2] < p1[2] ? 'front' : 'back', [p0, p1], col, 0.32)
        }
      }
    }
    const last = RINGS[RINGS.length - 1]
    for (let k = 0; k < 10; k++) {
      const t = (k / 10) * Math.PI * 2
      fr.line(
        'back',
        [
          fr.project([last.x, Math.cos(t) * last.r, Math.sin(t) * last.r]),
          fr.project([DISH.x, Math.cos(t) * DISH.r, Math.sin(t) * DISH.r]),
        ],
        col,
        0.25,
      )
    }
  }
  if (variant === 'spindle')
    for (const k of [0, 1])
      ring(fr, [2.3, 0, 0], [k ? 0.9 : -0.9, Math.PI / 2, 0.4], 1.9 + k * 0.35, 0.012, (layer, pts) => {
        fr.line('threads', pts, [0.55, 0.78, 1], 0.85, 1.4)
      })

  // Lamps round the mouth: bright points that bloom.
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2
    const [x, y, z] = fr.project([-0.02, Math.cos(a) * 1.38, Math.sin(a) * 1.38])
    const dim = frayed && i % 3 === 0
    fr.dot('dots', x, y, (0.22 * fr.focal) / z, dim ? [0.4, 0.2, 0.15] : v.lamp, dim ? 0.5 : 1)
  }

  // Spindle plate: dish band, rim, glowing inner ring, hub collar.
  const dishPos = [DISH.x, frayed ? -0.6 : 0, frayed ? 0.4 : 0]
  const dishRot = frayed ? [0.5, 0.3 + Math.PI / 2, 0.35] : [0, Math.PI / 2, 0]
  ring(fr, dishPos, dishRot, DISH.r, 0.06, style)
  ring(fr, dishPos, dishRot, DISH.r * 0.55, 0.02, (layer, pts, wd) => {
    fr.line('threads', pts, v.dishGlow, 0.9, f(Math.max(1.2, wd)))
  })
  ring(fr, [dishPos[0] - 0.2, dishPos[1], dishPos[2]], dishRot, 0.36, 0.05, style)
  ring(fr, [dishPos[0] + 0.25, dishPos[1], dishPos[2]], dishRot, 0.3, 0.04, style)

  writeFileSync(`${OUT}/${name}.svg`, fr.svg({ bloom: view === 'hero' ? 6 : 4 }))
}

// ---------------------------------------------------------------------------------------------------------------
// Story threads (scene/threadShaders.ts) and the countries globe (scene/Globe.tsx)

const STORY_W = 1600
const STORY_H = 900
const storyCam = { w: STORY_W, h: STORY_H, fov: 45, pos: [0, 0, 7.5], look: [0, 0, 0] }
const VIEW_W = 2 * 7.5 * Math.tan(THREE.MathUtils.degToRad(22.5)) * (STORY_W / STORY_H)

const PI = Math.PI
const TAU = PI * 2
function weave(t, s) {
  if (s[0] < 0.5) {
    const row = Math.floor(s[1] * 18)
    const x = mix(-2.1, 2.1, t)
    return [x, (row / 17 - 0.5) * 2.5, Math.sin(x * PI * 2.9 + row * PI) * 0.09]
  }
  const col = Math.floor(s[1] * 28)
  const y = mix(-1.25, 1.25, t)
  return [(col / 27 - 0.5) * 4.2, y, -Math.sin(y * PI * 3.5 + col * PI) * 0.09]
}
function helixCone(t, s) {
  const dir = s[2] > 0.5 ? 1 : -1
  const a = s[0] * TAU + t * 5.5 * dir
  const r = 0.3 + t * t * 1.8
  return [Math.cos(a) * r, -2 + t * 4, Math.sin(a) * r]
}
function sphereWrap(t, s) {
  const axis = new THREE.Vector3(s[0] * 2 - 1 + 1e-4, s[1] * 2 - 1 + 1e-4, s[2] * 2 - 1 + 1e-4).normalize()
  const helper = Math.abs(axis.y) < 0.9 ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(1, 0, 0)
  const u = new THREE.Vector3().crossVectors(axis, helper).normalize()
  const v = new THREE.Vector3().crossVectors(axis, u)
  const a = t * TAU
  const r = 1.9 + s[3] * 0.18
  return [(u.x * Math.cos(a) + v.x * Math.sin(a)) * r, (u.y * Math.cos(a) + v.y * Math.sin(a)) * r, (u.z * Math.cos(a) + v.z * Math.sin(a)) * r]
}
const SHAPES = [null, weave, helixCone, sphereWrap]
function storyColor(s) {
  const gold = [0.95, 0.78, 0.5]
  const lime = [0.78, 1.0, 0.24]
  const violet = [0.55, 0.48, 1.0]
  return s[2] > 0.82 ? violet : mix3(gold, lime, s[1])
}

const STAGE_OFFSET_X = [0.08, 0.2, 0.22, 0.22]

function buildStory(name, stage, spin, strands = 300, points = 64, riders = 260) {
  const fr = new Frame({ ...storyCam })
  const w = [0, 0, 0, 0]
  w[stage] = 1
  const turning = w[2] + w[3]
  fr.group(
    [STAGE_OFFSET_X[stage] * VIEW_W, 0, 0],
    [0.12 * w[1] + 0.22 * w[2] + 0.15 * w[3], spin * turning - w[1] * 0.18, 0],
    Math.min(1, VIEW_W / 11),
  )
  const boost = (760 / strands) * (stage === 1 ? 0.75 : 0.55)
  const seeds = strandSeeds(strands, 31)
  const shape = SHAPES[stage]
  for (const s of seeds) {
    const c = mix3(storyColor(s), [1, 1, 0.92], 0.2)
    const a = 0.085 * (0.55 + s[3] * 0.9) * boost
    const pts = []
    for (let i = 0; i < points; i++) pts.push({ xy: fr.project(shape(i / (points - 1), s)), c, a })
    emitStrand(fr, 'threads', pts, 12)
  }
  for (const r of particles(riders, seeds, 47)) {
    const t = fract(r.phase + 4 * r.speed)
    const [x, y, z] = fr.project(shape(t, r.s))
    const c = mix3(storyColor(r.s), [1, 1, 1], 0.45)
    const a = (1 - smooth(0.9, 1, t)) * (0.35 + r.s[3] * 0.35) * 0.55
    fr.dot('dots', x, y, (((16 + r.s[3] * 14) * fr.h) / 900 / (z / 7.5)) * 0.32, c, a)
  }
  if (stage === 3) {
    // The glowing core inside the Secure sphere.
    fr.glow([0, 0, 0], 3.2, [1, 0.93, 0.7], 0.55)
    fr.glow([0, 0, 0], 0.9, [1, 0.98, 0.9], 1)
    const [cx, cy, cz] = fr.project([0, 0, 0])
    fr.layers.front.push(`<circle cx="${f(cx)}" cy="${f(cy)}" r="${f((0.3 * fr.focal) / cz)}" fill="#fffdf6"/>`)
  }
  writeFileSync(`${OUT}/${name}.svg`, fr.svg({ vignette: false, bloom: 3 }))
}

function buildGlobe(name, dots = 1500) {
  const R = 1.9
  // Square and centred: the static page shows it in a square beside the country list.
  const fr = new Frame({ ...storyCam, w: 900, h: 900 })
  const x = 0
  const viewAngle = Math.atan2(-x, 7.5)
  const baseRotY = PI / 2 - ((62 + 180) * PI) / 180
  fr.group([x, 0, 0], [0.28, baseRotY + viewAngle, 0], 1.12)

  // Dot shell (Fibonacci sphere); the far side shows through, dimmer.
  const centreDepth = fr.project([0, 0, 0])[2]
  for (let i = 0; i < dots; i++) {
    const k = i + 0.5
    const phi = Math.acos(1 - (2 * k) / dots)
    const theta = PI * (1 + Math.sqrt(5)) * k
    const [px, py, z] = fr.project([Math.cos(theta) * Math.sin(phi) * R, Math.cos(phi) * R, Math.sin(theta) * Math.sin(phi) * R])
    const near = z < centreDepth
    fr.layers.back.push(
      `<circle cx="${f(px)}" cy="${f(py)}" r="${near ? 1.2 : 0.9}" fill="#9aa3c7" opacity="${near ? 0.55 : 0.28}"/>`,
    )
  }
  for (const lat of [-60, -30, 0, 30, 60]) {
    const pts = []
    for (let i = 0; i <= 96; i++) pts.push(fr.project(latLonToVec3(lat, (i / 96) * 360 - 180, R * 1.002)))
    fr.line('back', pts, [0.55, 0.77, 1], 0.16)
  }
  const hqIndex = countries.findIndex((c) => c.name === reach.hq)
  const hq = countries[hqIndex]
  countries.forEach((c, ci) => {
    if (ci === hqIndex) return
    const pts = arcPoints(hq, c, R, 72).map((p) => fr.project(p))
    fr.line('threads', pts, [0.42, 0.68, 1], 0.6, 1.3)
    // One travelling light pulse per arc, frozen where it is.
    const at = fract(0.137 * ci * 1.7 + 0.2)
    const from = Math.floor(at * 60)
    fr.line('threads', pts.slice(from, from + 8), [0.9, 0.96, 1], 0.9, 1.8)
  })
  countries.forEach((c, i) => {
    const [px, py, z] = fr.project(latLonToVec3(c.lat, c.lon, R * 1.01))
    const isHq = i === hqIndex
    const r = ((0.035 * (isHq ? 1.8 : 1) * fr.focal) / z) * 2.4
    fr.dot('dots', px, py, r, isHq ? [0.85, 0.95, 1] : [0.35, 0.65, 1], 1)
    fr.dot('dots', px, py, r * 0.35, [1, 1, 1], 1)
  })
  writeFileSync(`${OUT}/${name}.svg`, fr.svg({ vignette: false, bloom: 3 }))
}

// ---------------------------------------------------------------------------------------------------------------
// The scenes, framed like the full tier at rest (scroll at the top, pointer centred, reduced-motion clock).

const HERO = { strands: 300, points: 60, parts: 500, alphaBoost: 1.5 }
buildLoom({
  name: 'loom-hero',
  w: 1600,
  h: 900,
  view: 'hero',
  variant: 'classic',
  camera: { pos: [-3.6, 0.6, 14], look: [-4.0, -1.8, 0] },
  ...HERO,
})
// Contact (960 wide canvas): ContactRig with no sway.
buildLoom({
  name: 'loom-contact',
  w: 960,
  h: 684,
  view: 'contact',
  variant: 'classic',
  camera: { pos: [-1.6, 2.2, 11], look: [0.8, -0.5, 0] },
  ...HERO,
})
// About (spindle) and 404 (frayed): the narrow inner-page frame.
buildLoom({
  name: 'loom-spindle',
  w: 624,
  h: 500,
  view: 'contact',
  variant: 'spindle',
  camera: { pos: [-0.6, 2.8, 12.5], look: [2.2, 1.5, 0] },
  ...HERO,
})
buildLoom({
  name: 'loom-frayed',
  w: 624,
  h: 500,
  view: 'contact',
  variant: 'frayed',
  camera: { pos: [-1.6, 2.2, 12.5], look: [2.4, 0, 0] },
  ...HERO,
})
buildStory('story-simplify', 1, 0)
buildStory('story-scale', 2, 0.55)
buildStory('story-secure', 3, 0.9)
buildGlobe('globe')

for (const n of [
  'loom-hero',
  'loom-contact',
  'loom-spindle',
  'loom-frayed',
  'story-simplify',
  'story-scale',
  'story-secure',
  'globe',
]) {
  const { size } = await import('node:fs').then((fs) => fs.statSync(`${OUT}/${n}.svg`))
  console.log(`${OUT}/${n}.svg  ${Math.round(size / 1024)} KB`)
}
