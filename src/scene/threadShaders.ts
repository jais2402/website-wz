// Story threads: the loom's visual language applied to the pinned story. Every strand is a polyline whose
// position is computed here from its progress `t` and four seeds, blended across four shapes by `uStage`:
//   0 tangle (the loom's loose threads) → 1 woven panel (Simplify) → 2 helix cone (Scale) → 3 woven sphere (Secure).
// Strands and the particles that ride them share threadPos(), so particles always sit on a visible thread.

const common = /* glsl */ `
uniform float uTime;
uniform float uStage;
uniform vec2 uPointer;
uniform float uPointerStrength;
uniform float uFade; // 1 = visible; drops to 0 as the countries globe takes over

const float PI = 3.14159265;
const float TAU = 6.2831853;

float w(float s, float i) { return max(0.0, 1.0 - abs(s - i)); }

// Same palette as the loom hero, so the tangle reads as the same threads.
vec3 palette(float h) {
  if (h < 0.24) return vec3(0.45, 0.22, 1.0);
  if (h < 0.42) return vec3(0.05, 0.72, 0.95);
  if (h < 0.58) return vec3(0.95, 0.12, 0.62);
  if (h < 0.72) return vec3(1.0, 0.55, 0.22);
  if (h < 0.86) return vec3(0.95, 0.12, 0.2);
  return vec3(0.78, 1.0, 0.24);
}

// Stage 0: loose, drifting tangle spanning the frame.
vec3 tangle(float t, vec4 s, float time) {
  float x = mix(-5.5, 5.5, t);
  float k = x * 0.45;
  float y = sin(k * 1.3 + s.x * 23.0 + time * 0.35) * 1.5 + sin(k * 2.9 + s.y * 13.0 - time * 0.6) * 0.7;
  float z = cos(k * 1.1 + s.z * 17.0 + time * 0.42) * 1.4 + sin(k * 3.4 + s.w * 11.0 + time * 0.55) * 0.6;
  return vec3(x, y, z) * (0.7 + s.w * 0.5);
}

// Stage 1: a woven panel. Half the strands run across (warp), half run down (weft), going over and under.
vec3 weave(float t, vec4 s) {
  if (s.x < 0.5) {
    float row = floor(s.y * 18.0);
    float y = (row / 17.0 - 0.5) * 2.5;
    float x = mix(-2.1, 2.1, t);
    float z = sin(x * PI * 2.9 + row * PI) * 0.09;
    return vec3(x, y, z);
  }
  float col = floor(s.y * 28.0);
  float x = (col / 27.0 - 0.5) * 4.2;
  float y = mix(-1.25, 1.25, t);
  float z = -sin(y * PI * 3.5 + col * PI) * 0.09;
  return vec3(x, y, z);
}

// Stage 2: counter-rotating helices up a cone that widens as it rises: a lattice that grows.
vec3 helixCone(float t, vec4 s) {
  float dir = s.z > 0.5 ? 1.0 : -1.0;
  float a = s.x * TAU + t * 5.5 * dir;
  float r = 0.3 + t * t * 1.8;
  return vec3(cos(a) * r, -2.0 + t * 4.0, sin(a) * r);
}

// Stage 3: strands wrapped as great circles round a sphere, a woven shell around the core.
vec3 sphereWrap(float t, vec4 s) {
  vec3 axis = normalize(vec3(s.x, s.y, s.z) * 2.0 - 1.0 + 0.0001);
  vec3 helper = abs(axis.y) < 0.9 ? vec3(0.0, 1.0, 0.0) : vec3(1.0, 0.0, 0.0);
  vec3 u = normalize(cross(axis, helper));
  vec3 v = cross(axis, u);
  float a = t * TAU;
  return (u * cos(a) + v * sin(a)) * (1.9 + s.w * 0.18);
}

vec3 threadPos(float t, vec4 s, float time, out float wTangle) {
  // Stagger mid-morph so threads ripple into place; zero at rest so shapes stay crisp.
  float st = clamp(uStage + (s.w - 0.5) * 0.6 * sin(PI * fract(uStage)), 0.0, 3.0);
  wTangle = w(st, 0.0);
  vec3 p = tangle(t, s, time) * wTangle + weave(t, s) * w(st, 1.0) + helixCone(t, s) * w(st, 2.0) + sphereWrap(t, s) * w(st, 3.0);

  // Threads lift away from each other between shapes, then settle.
  float between = fract(st) < 0.001 ? 0.0 : 1.0 - abs(fract(st) - 0.5) * 2.0;
  p += normalize(p + 0.0001) * between * 0.5 * s.w;

  // Pointer parts loose threads (tangle only).
  vec2 d = p.xy - uPointer;
  p.xy += normalize(d + 0.0001) * smoothstep(2.2, 0.0, length(d)) * 1.1 * wTangle * uPointerStrength;
  return p;
}

// Colour: loose threads use the loom palette; woven threads settle into gold / lime with violet accents.
vec3 threadColor(vec4 s, float wTangle) {
  vec3 gold = vec3(0.95, 0.78, 0.5);
  vec3 lime = vec3(0.78, 1.0, 0.24);
  vec3 violet = vec3(0.55, 0.48, 1.0);
  vec3 ordered = s.z > 0.82 ? violet : mix(gold, lime, s.y);
  return mix(ordered, palette(s.z), wTangle);
}
`

export const threadVertex = /* glsl */ `
${common}
attribute float aT;
attribute vec4 aSeed;
varying vec3 vColor;
varying float vAlpha;

void main() {
  float wT;
  vec3 p = threadPos(aT, aSeed, uTime, wT);
  vColor = threadColor(aSeed, wT);
  float ends = smoothstep(0.0, 0.06, aT) * (1.0 - smoothstep(0.94, 1.0, aT));
  // Loose threads fade at their ends; closed loops (sphere) and woven strands stay solid.
  vAlpha = mix(1.0, ends, wT) * mix(0.085, 0.36, wT) * (0.55 + aSeed.w * 0.9) * uFade;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
}
`

export const threadFragment = /* glsl */ `
uniform float uBoost;
varying vec3 vColor;
varying float vAlpha;
void main() {
  gl_FragColor = vec4(vColor, vAlpha * uBoost);
}
`

export const riderVertex = /* glsl */ `
${common}
uniform float uPixelRatio;
attribute vec4 aSeed;
attribute float aPhase;
attribute float aSpeed;
varying vec3 vColor;
varying float vAlpha;

void main() {
  float t = fract(aPhase + uTime * aSpeed);
  float wT;
  vec3 p = threadPos(t, aSeed, uTime, wT);
  vColor = mix(threadColor(aSeed, wT), vec3(1.0), 0.45);
  vAlpha = (1.0 - wT * smoothstep(0.9, 1.0, t)) * (0.35 + aSeed.w * 0.35) * uFade;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = (16.0 + aSeed.w * 14.0) * uPixelRatio / -mv.z;
}
`

export const riderFragment = /* glsl */ `
uniform float uBoost;
varying vec3 vColor;
varying float vAlpha;
void main() {
  float r = length(gl_PointCoord - 0.5);
  if (r > 0.5) discard;
  gl_FragColor = vec4(vColor, pow(smoothstep(0.5, 0.0, r), 1.8) * vAlpha * uBoost);
}
`
