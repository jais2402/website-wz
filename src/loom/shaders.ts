// Shared GLSL for the time-loom. Strands and the particles riding them use the exact same `strandPos`,
// so particles always sit on a visible thread.

const common = /* glsl */ `
uniform float uTime;
uniform float uOrder;     // 0 = natural chaos, 1 = scrolled: chaos calmed down
uniform vec2 uPointer;    // pointer in world units on the z=0 plane
uniform float uPointerStrength;
uniform vec2 uRange;      // which slice of the palette this loom uses (start, width)
uniform vec3 uWoven;      // colour of the threads once they are ordered
uniform float uFray;      // 0 = threads order after the loom, 1 = they stay frayed (the 404 loom)
uniform float uSpread;    // how far the tangle reaches: 1 normally, less on the lite hero (concentrated middle)

const float X0 = -15.0;
const float X1 = 18.0;
const float MOUTH = 0.0;
const float THROAT = 4.6;

// Mirrors chaosEnvelope() in src/lib/loom.ts.
float chaosEnvelope(float x) {
  float s = 1.0 - smoothstep(MOUTH - 9.0, MOUTH + 0.4, x);
  return pow(s, 0.55);
}

// Radius of the bundle: wide at the mouth, squeezed through the throat, tight afterwards.
float bundleRadius(float x) {
  float inFunnel = smoothstep(MOUTH - 1.5, THROAT, x);
  return mix(1.15, 0.34, inFunnel);
}

vec3 palette(float h) {
  vec3 violet = vec3(0.45, 0.22, 1.0);
  vec3 magenta = vec3(0.95, 0.12, 0.62);
  vec3 cyan = vec3(0.05, 0.72, 0.95);
  vec3 orange = vec3(1.0, 0.55, 0.22);
  vec3 red = vec3(0.95, 0.12, 0.2);
  vec3 lime = vec3(0.78, 1.0, 0.24);
  if (h < 0.24) return violet;
  if (h < 0.42) return cyan;
  if (h < 0.58) return magenta;
  if (h < 0.72) return orange;
  if (h < 0.86) return red;
  return lime;
}

vec3 strandPos(float t, vec4 seed, float time) {
  float x = mix(X0, X1, t);
  float env = max(chaosEnvelope(x), uFray * 0.8) * (1.0 - uOrder * 0.75);

  // Ordered position inside the bundle (uniform over a disc).
  float ang = seed.x * 6.2831853;
  vec2 disc = vec2(cos(ang), sin(ang)) * sqrt(seed.y) * bundleRadius(x);

  // Tangled position: layered, slowly drifting waves that grow wilder further from the loom.
  float k = x * 0.32;
  float spread = (0.45 + seed.w * 0.75) * (0.55 + clamp(-x / 9.0, 0.0, 1.6) * 0.65) * uSpread;
  vec2 tangle = vec2(
    sin(k * 1.3 + seed.x * 23.0 + time * 0.35) * 1.9 + sin(k * 2.9 + seed.y * 13.0 - time * 0.6) * 0.9,
    cos(k * 1.1 + seed.z * 17.0 + time * 0.42) * 2.2 + sin(k * 3.4 + seed.w * 11.0 + time * 0.55) * 0.9
  ) * spread;

  vec2 yz = mix(disc, disc + tangle, env);

  // The woven timeline keeps a gentle breathing wave.
  float woven = 1.0 - env;
  yz.x += sin(x * 0.35 - time * 0.8) * 0.05 * woven * step(THROAT, x);

  vec3 p = vec3(x, yz.x, yz.y);

  // Pointer pushes loose threads apart (only where they are still tangled).
  vec2 d = p.xy - uPointer;
  float dist = length(d);
  p.xy += normalize(d + 0.0001) * smoothstep(2.6, 0.0, dist) * 1.3 * env * uPointerStrength;
  return p;
}
`

export const strandVertex = /* glsl */ `
${common}
attribute float aT;
attribute vec4 aSeed;
varying vec3 vColor;
varying float vAlpha;

void main() {
  vec3 p = strandPos(aT, aSeed, uTime);
  float x = p.x;
  float env = max(chaosEnvelope(x), uFray * 0.8);

  vec3 base = palette(uRange.x + aSeed.z * uRange.y);
  vec3 woven = mix(uWoven, base, 0.25);                        // the loom's woven colour once ordered
  vec3 col = mix(woven, base, smoothstep(0.0, 0.25, env));
  float hot = exp(-pow((x - MOUTH) / 1.6, 2.0));               // white-hot at the mouth
  vColor = mix(col, vec3(1.0, 0.95, 0.88), hot * 0.6);

  float fadeL = smoothstep(0.0, 0.1, aT);
  float fadeR = 1.0 - smoothstep(0.88, 1.0, aT);
  vAlpha = fadeL * fadeR * mix(0.022, 0.4, env) * (0.45 + aSeed.w) + hot * 0.035;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
}
`

export const strandFragment = /* glsl */ `
varying vec3 vColor;
varying float vAlpha;
void main() {
  gl_FragColor = vec4(vColor, vAlpha);
}
`

export const particleVertex = /* glsl */ `
${common}
uniform float uPixelRatio;
attribute vec4 aSeed;
attribute float aPhase;
attribute float aSpeed;
varying vec3 vColor;
varying float vAlpha;

void main() {
  float t = fract(aPhase + uTime * aSpeed);
  vec3 p = strandPos(t, aSeed, uTime);
  float env = max(chaosEnvelope(p.x), uFray * 0.8);
  float hot = exp(-pow((p.x - MOUTH) / 1.4, 2.0));

  vColor = mix(mix(uWoven * 1.05, palette(uRange.x + aSeed.z * uRange.y), env), vec3(1.0), hot);
  vAlpha = smoothstep(0.0, 0.06, t) * (1.0 - smoothstep(0.9, 1.0, t)) * (mix(0.18, 0.7, env) + hot * 0.5);

  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = (14.0 + hot * 26.0 + env * 6.0) * uPixelRatio / -mv.z;
}
`

export const particleFragment = /* glsl */ `
varying vec3 vColor;
varying float vAlpha;
void main() {
  float r = length(gl_PointCoord - 0.5);
  if (r > 0.5) discard;
  float glow = pow(smoothstep(0.5, 0.0, r), 1.8);
  gl_FragColor = vec4(vColor, glow * vAlpha);
}
`

/** Soft radial glow sprite for the loom mouth. */
export const glowVertex = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

export const glowFragment = /* glsl */ `
uniform float uTime;
uniform vec3 uColor;
varying vec2 vUv;
void main() {
  float r = length(vUv - 0.5) * 2.0;
  float core = smoothstep(1.0, 0.0, r);
  float a = pow(core, 3.0) * (0.85 + 0.15 * sin(uTime * 3.0));
  gl_FragColor = vec4(uColor, a);
}
`
