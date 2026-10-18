// Particle morph shader. Five position attributes (one per stage) are blended on the GPU by triangle weights
// driven by `uStage`; each particle gets a slightly staggered local stage so morphs ripple instead of snapping.

export const particleVertex = /* glsl */ `
uniform float uTime;
uniform float uStage;
uniform float uPixelRatio;
uniform float uSize;
uniform vec3 uPointer;
uniform float uPointerStrength;

attribute vec3 aPos0;
attribute vec3 aPos1;
attribute vec3 aPos2;
attribute vec3 aPos3;
attribute vec3 aPos4;
attribute float aRandom;
attribute float aTint;

varying float vTint;
varying float vAlpha;
varying float vFlash;

float w(float s, float i) { return max(0.0, 1.0 - abs(s - i)); }

void main() {
  // Stagger: mid-morph some particles lead and some lag so it flows; zero at rest so shapes stay crisp.
  float s = clamp(uStage + (aRandom - 0.5) * 0.5 * sin(3.14159 * fract(uStage)), 0.0, 4.0);
  vec3 pos = aPos0 * w(s, 0.0) + aPos1 * w(s, 1.0) + aPos2 * w(s, 2.0) + aPos3 * w(s, 3.0) + aPos4 * w(s, 4.0);

  // Mid-morph "lift": particles bulge outward between stages, then settle.
  float between = 1.0 - abs(fract(s) - 0.5) * 2.0;
  between = fract(s) < 0.001 ? 0.0 : between;
  pos += normalize(pos + 0.0001) * between * 0.6 * aRandom;

  // Idle drift, strongest in chaos.
  float chaos = w(s, 0.0);
  pos += vec3(
    sin(uTime * 0.6 + aRandom * 40.0),
    cos(uTime * 0.5 + aRandom * 30.0),
    sin(uTime * 0.4 + aRandom * 20.0)
  ) * (0.04 + chaos * 0.22);

  vec4 world = modelMatrix * vec4(pos, 1.0);

  // Pointer repulsion in world space.
  vec3 toP = world.xyz - uPointer;
  float d = length(toP.xy);
  float push = smoothstep(1.6, 0.0, d) * uPointerStrength;
  world.xy += normalize(toP.xy + 0.0001) * push * 0.9;

  vec4 mv = viewMatrix * world;
  gl_Position = projectionMatrix * mv;

  float size = uSize * (0.55 + aRandom * 0.9) * (1.0 + push * 1.5);
  gl_PointSize = size * uPixelRatio * (1.0 / -mv.z);

  vTint = aTint;
  vAlpha = 0.35 + aRandom * 0.65;
  vFlash = push + between * 0.4;
}
`

export const particleFragment = /* glsl */ `
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform float uOpacity;

varying float vTint;
varying float vAlpha;
varying float vFlash;

void main() {
  vec2 uv = gl_PointCoord - 0.5;
  float r = length(uv);
  if (r > 0.5) discard;
  // Soft core + glow falloff.
  float core = smoothstep(0.5, 0.0, r);
  float glow = pow(core, 2.2);

  vec3 col = vTint < 0.6 ? uColorA : (vTint < 0.9 ? uColorB : uColorC);
  col = mix(col, vec3(1.0), glow * 0.35 + vFlash * 0.4);

  gl_FragColor = vec4(col, glow * vAlpha * uOpacity);
}
`
