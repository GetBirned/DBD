import { useEffect, useMemo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { setRedraw, sky } from './store'

/*
 * The planet isn't a mesh: a mesh sphere this much bigger than the screen shows its facets along
 * the limb. Instead one full-screen quad works out a perfect sphere per pixel, so the horizon is
 * exact at any size — then adds the stars behind it, the thin silver light along its edge, the
 * faint texture of its night side, and a ring of dust around it.
 *
 * It's seen through a very long lens, so it's drawn orthographically: screen units, with the
 * screen 2 tall and 2 × aspect wide, centered on 0.
 */

/** The planet's radius: a little over two screen-heights, so only ever a part of it is in frame. */
const RADIUS = 4.5
/** Its center sits below the eye line, so the limb leans like a horizon rather than standing up. */
const CY = -1

/**
 * The planet's center x for the journey's planet position (see `sky.pos`): 0→1 its left limb
 * crosses the middle of the screen from the right edge to the left; 2→3 its right limb does.
 */
function planetX(pos: number, aspect: number) {
  const half = Math.sqrt(RADIUS * RADIUS - CY * CY)
  const at = (u: number) => (2 * u - 1) * aspect
  if (pos <= 1) return at(1 - pos) + half
  if (pos >= 2) return at(1 - (pos - 2)) - half
  const from = at(0) + half
  const to = at(1) - half
  return from + (to - from) * (pos - 1)
}

const VERT = /* glsl */ `
void main() {
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`

const FRAG = /* glsl */ `
uniform vec2 uRes;
uniform float uDpr;
uniform vec2 uC;
uniform float uR;
uniform float uPos;
uniform vec3 uRingN;
uniform vec3 uLight;

float hash12(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

vec3 hash32(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * vec3(0.1031, 0.1030, 0.0973));
  p3 += dot(p3, p3.yxz + 33.33);
  return fract((p3.xxy + p3.yzz) * p3.zyx);
}

float hash13(vec3 p3) {
  p3 = fract(p3 * 0.1031);
  p3 += dot(p3, p3.zyx + 31.32);
  return fract((p3.x + p3.y) * p3.z);
}

float noise(vec3 p) {
  vec3 i = floor(p);
  vec3 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(mix(hash13(i), hash13(i + vec3(1, 0, 0)), f.x), mix(hash13(i + vec3(0, 1, 0)), hash13(i + vec3(1, 1, 0)), f.x), f.y),
    mix(mix(hash13(i + vec3(0, 0, 1)), hash13(i + vec3(1, 0, 1)), f.x), mix(hash13(i + vec3(0, 1, 1)), hash13(i + vec3(1, 1, 1)), f.x), f.y),
    f.z
  );
}

float fbm(vec3 p, int octaves) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 6; i++) {
    if (i >= octaves) break;
    v += a * noise(p);
    p = p * 2.03 + vec3(1.7, 9.2, 3.1);
    a *= 0.5;
  }
  return v;
}

// One layer of stars: some cells of a grid (cells "cell" CSS px across) hold one star, at a random
// spot, size and brightness. Most are white; a few run warm or cool.
vec3 starLayer(vec2 px, float cell, float chance, vec2 radius, vec2 bright, float seed) {
  vec2 id = floor(px / cell);
  vec3 h = hash32(id + seed);
  if (h.x > chance) return vec3(0.0);
  vec2 at = (id + 0.15 + 0.7 * h.yz) * cell;
  float d = length(px - at);
  float r = mix(radius.x, radius.y, hash12(id + seed + 7.0));
  float b = mix(bright.x, bright.y, pow(hash12(id + seed + 13.0), 2.0));
  float tint = hash12(id + seed + 21.0);
  vec3 c = tint < 0.1 ? vec3(1.0, 0.9, 0.8) : (tint < 0.2 ? vec3(0.82, 0.88, 1.0) : vec3(1.0));
  return c * b * exp(-d * d / (r * r));
}

void main() {
  vec2 frag = gl_FragCoord.xy;
  vec2 px = frag / uDpr;
  float aspect = uRes.x / uRes.y;
  vec2 ndc = frag / uRes * 2.0 - 1.0;
  vec2 p = ndc * vec2(aspect, 1.0);

  // Stars, nearly still: each layer slides a little as the journey goes, the nearest most.
  vec3 col = starLayer(px + vec2(uPos * 14.0, 0.0), 12.0, 0.06, vec2(0.6, 0.8), vec2(0.08, 0.3), 0.0)
           + starLayer(px + vec2(uPos * 32.0, 0.0), 31.0, 0.09, vec2(0.65, 0.95), vec2(0.22, 0.55), 50.0)
           + starLayer(px + vec2(uPos * 60.0, 0.0), 89.0, 0.18, vec2(0.8, 1.3), vec2(0.45, 0.9), 100.0);

  // The planet. Facing us is +z.
  vec2 rel = (p - uC) / uR;
  float dist = length(rel);
  float zs = -1.0;
  if (dist < 1.0) {
    zs = sqrt(1.0 - dist * dist);
    vec3 n = vec3(rel, zs);
    // The night side: very dark, with slow, faint variation in the ground and finer grain in it.
    float big = fbm(n * 7.0, 4);
    float mid = fbm(n * 24.0 + 9.0, 3);
    float fine = fbm(n * 90.0 + 4.0, 2);
    float albedo = 0.011 + 0.075 * big * big + 0.016 * mid + 0.008 * fine;
    vec3 surface = vec3(albedo) * vec3(0.92, 0.94, 1.0);
    // Backlit: the sun is behind the planet, so light only catches a thin sliver along the limb.
    float lit = max(dot(n, uLight), 0.0);
    surface += vec3(0.80, 0.84, 0.92) * lit * (0.3 + 0.5 * big);
    surface += vec3(0.55, 0.60, 0.70) * pow(1.0 - zs, 6.0) * 0.18;
    col = surface;
  } else {
    // Just off the limb: a thin line of atmosphere glow, brightest toward the light.
    float x = dist - 1.0;
    float facing = 0.3 + 0.7 * clamp(dot(normalize(rel), uLight.xy) * 0.5 + 0.5, 0.0, 1.0);
    col += vec3(0.72, 0.78, 0.9) * (exp(-x / 0.0016) * 0.3 + exp(-x / 0.014) * 0.045) * facing;
  }

  // The ring: faint dusty bands around the planet, hidden where it's behind the planet.
  if (abs(uRingN.z) > 1e-3) {
    float zr = -(uRingN.x * rel.x + uRingN.y * rel.y) / uRingN.z;
    if (zs < 0.0 || zr > zs) {
      float r = length(vec3(rel, zr));
      float band = smoothstep(1.3, 1.45, r) * (1.0 - smoothstep(1.95, 2.35, r));
      float stripes = 0.5 + 0.5 * sin(r * 70.0) * sin(r * 17.0 + 2.0);
      float dust = 0.6 + 0.4 * noise(vec3(r * 40.0, 0.5, 0.5));
      col += vec3(0.6, 0.57, 0.52) * band * stripes * dust * 0.045;
    }
  }

  // A soft vignette, and a little noise so the near-blacks don't band.
  col *= 1.0 - 0.22 * dot(ndc * 0.75, ndc * 0.75);
  col += (hash12(frag) - 0.5) / 255.0;
  gl_FragColor = vec4(col, 1.0);
}
`

function Backdrop() {
  const { gl, size, invalidate } = useThree()
  const uniforms = useMemo(
    () => ({
      uRes: { value: new THREE.Vector2(1, 1) },
      uDpr: { value: 1 },
      uC: { value: new THREE.Vector2(10, CY) },
      uR: { value: RADIUS },
      uPos: { value: sky.pos },
      uRingN: { value: new THREE.Vector3(0.12, 0.55, 1).normalize() },
      uLight: { value: new THREE.Vector3(0, 0.45, -1).normalize() },
    }),
    [],
  )

  // Scroll is the only thing that moves the sky, so it repaints only when the timeline asks.
  useEffect(() => {
    setRedraw(() => invalidate())
    return () => setRedraw(() => {})
  }, [invalidate])

  useFrame(() => {
    gl.getDrawingBufferSize(uniforms.uRes.value)
    uniforms.uDpr.value = gl.getPixelRatio()
    uniforms.uPos.value = sky.pos
    uniforms.uC.value.set(planetX(sky.pos, size.width / size.height), CY)
  })

  return (
    <mesh frustumCulled={false}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial vertexShader={VERT} fragmentShader={FRAG} uniforms={uniforms} depthTest={false} depthWrite={false} />
    </mesh>
  )
}

/**
 * The space the whole site happens in, after the opening of Alien (1979): sparse stars and an
 * enormous dark planet whose position is set by the scroll timeline. Nothing here runs on a
 * clock — it draws a frame when the scroll moves it, and otherwise sits still.
 */
export default function Sky() {
  return (
    <Canvas
      // The sky is soft except for the stars, so it doesn't need a phone's full pixel density.
      dpr={[1, 1.25]}
      frameloop="demand"
      gl={{ antialias: false, alpha: false, powerPreference: 'high-performance' }}
      onCreated={({ gl }) => gl.setClearColor('#020203')}
      style={{ position: 'absolute', inset: 0 }}
    >
      <Backdrop />
    </Canvas>
  )
}
