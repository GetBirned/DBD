import { useEffect, useRef } from 'react'
import { useMotionOK } from '@/lib/motion'

/** Small seeded PRNG, so one seed reproduces one sky — and a fresh seed per visit gives a new one. */
function mulberry32(seed: number) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

interface LayerSpec {
  /** Stars per CSS pixel². */
  density: number
  size: [number, number]
  alpha: [number, number]
  /** Sideways drift, CSS px per second. */
  drift: number
  /** How far the layer moves per pixel scrolled — far stars barely move, near ones more. */
  parallax: number
}

const LAYERS: LayerSpec[] = [
  { density: 0.0004, size: [0.35, 0.8], alpha: [0.18, 0.55], drift: 1.2, parallax: 0.015 },
  { density: 0.00013, size: [0.6, 1.25], alpha: [0.35, 0.85], drift: 2.6, parallax: 0.04 },
  { density: 0.000025, size: [1.0, 1.9], alpha: [0.7, 1], drift: 4.5, parallax: 0.09 },
]

/** The haze is this many screens tall, so there's room for it to rise as the page scrolls. */
const HAZE_HEIGHT = 1.8

/** Mostly white stars, with the odd warm or cool one — real starfields aren't uniformly grey. */
function starColor(r: () => number) {
  const roll = r()
  if (roll < 0.12) return [255, 222, 190]
  if (roll < 0.22) return [196, 214, 255]
  return [255, 255, 255]
}

interface Twinkler {
  layer: number
  x: number
  y: number
  size: number
  phase: number
  speed: number
}

/**
 * The page's sky, after the opening of Alien (1979): a black starfield in three parallax layers
 * drifting slowly sideways, a few stars twinkling, and faint dusty bands of planetary haze sweeping
 * diagonally across it. Generated fresh on every visit from a random seed — nothing is a video or
 * an image. Pre-renders each layer once (on load and resize), so a frame is a handful of
 * drawImage calls; pauses while the tab is hidden. With reduced motion it's a still frame.
 */
export default function SpaceBackground() {
  const motionOK = useMotionOK()
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const seed = (Math.random() * 2 ** 32) >>> 0
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5)

    let w = 0
    let h = 0
    let tiles: HTMLCanvasElement[] = []
    let haze: HTMLCanvasElement | null = null
    let twinklers: Twinkler[] = []
    let hazeAngle = 0
    let raf = 0
    const start = performance.now()

    const build = () => {
      const rect = canvas.getBoundingClientRect()
      w = rect.width
      h = rect.height
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
      const rand = mulberry32(seed)

      // One tile per layer, exactly a screen in size; drawn twice side by side (and stacked) so
      // its drift and parallax wrap seamlessly.
      tiles = LAYERS.map((spec, li) => {
        const tile = document.createElement('canvas')
        tile.width = Math.round(w * dpr)
        tile.height = Math.round(h * dpr)
        const t = tile.getContext('2d')!
        t.scale(dpr, dpr)
        const count = Math.round(w * h * spec.density)
        for (let i = 0; i < count; i++) {
          const x = rand() * w
          const y = rand() * h
          const size = spec.size[0] + rand() * (spec.size[1] - spec.size[0])
          const a = spec.alpha[0] + rand() * (spec.alpha[1] - spec.alpha[0])
          const [cr, cg, cb] = starColor(rand)
          if (li === 2) {
            // Near stars get a faint halo.
            const g = t.createRadialGradient(x, y, 0, x, y, size * 4)
            g.addColorStop(0, `rgba(${cr},${cg},${cb},${a * 0.35})`)
            g.addColorStop(1, `rgba(${cr},${cg},${cb},0)`)
            t.fillStyle = g
            t.fillRect(x - size * 4, y - size * 4, size * 8, size * 8)
          }
          t.fillStyle = `rgba(${cr},${cg},${cb},${a})`
          t.beginPath()
          t.arc(x, y, size, 0, Math.PI * 2)
          t.fill()
        }
        return tile
      })

      twinklers = Array.from({ length: Math.round((w * h) / 26000) }, () => ({
        layer: 1 + Math.floor(rand() * 2),
        x: rand() * w,
        y: rand() * h,
        size: 0.8 + rand() * 1.2,
        phase: rand() * Math.PI * 2,
        speed: 0.6 + rand() * 1.6,
      }))

      // The haze: the planet's rings, as faint dusty streaks — a handful of soft concentric arcs
      // painted small and blurred, then scaled up. It's all low frequency, so a quarter-resolution
      // canvas is plenty and keeps the blur cheap. Taller than the screen, so it can rise as you
      // scroll without its edge ever showing.
      haze = document.createElement('canvas')
      const hw = Math.max(64, Math.round(w / 4))
      const S = Math.max(64, Math.round(h / 4))
      const hh = Math.round(S * HAZE_HEIGHT)
      haze.width = hw
      haze.height = hh
      const hz = haze.getContext('2d')!
      hazeAngle = -0.28 - rand() * 0.22
      const cx = hw * (0.8 + rand() * 0.4)
      const cy = S * (1.5 + rand() * 0.3)
      const R = Math.max(hw, S) * (1.1 + rand() * 0.25)
      hz.filter = `blur(${Math.max(1, Math.round(hw / 50))}px)`
      const arc = (r: number, width: number, rgb: number[], a: number) => {
        hz.strokeStyle = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${a})`
        hz.lineWidth = width
        hz.beginPath()
        hz.ellipse(cx, cy, r * 1.35, r, hazeAngle, Math.PI * 0.8, Math.PI * 1.95)
        hz.stroke()
      }
      // One broad glow, then a few narrower rings inside it, each a slightly different dust color.
      arc(R * 0.86, S * 0.5, [140, 112, 80], 0.1)
      for (let i = 0; i < 6; i++) {
        const warm = rand()
        arc(
          R * (0.64 + i * 0.065 + rand() * 0.03),
          S * (0.025 + rand() * 0.11),
          [Math.round(130 + warm * 50), Math.round(108 + warm * 28), Math.round(88 - warm * 10)],
          0.08 + rand() * 0.2,
        )
      }
      // A speckle of fine dust inside the haze, like the grain in the film's bands.
      hz.filter = 'none'
      for (let i = 0; i < hw * hh * 0.012; i++) {
        hz.fillStyle = `rgba(230,205,170,${rand() * 0.12})`
        hz.fillRect(rand() * hw, rand() * hh, 1, 1)
      }
      // Fade the top and bottom out, so neither edge is ever a line across the sky.
      const fade = hz.createLinearGradient(0, 0, 0, hh)
      fade.addColorStop(0, 'rgba(0,0,0,0)')
      fade.addColorStop(0.14, 'rgba(0,0,0,1)')
      fade.addColorStop(0.86, 'rgba(0,0,0,1)')
      fade.addColorStop(1, 'rgba(0,0,0,0)')
      hz.globalCompositeOperation = 'destination-in'
      hz.fillStyle = fade
      hz.fillRect(0, 0, hw, hh)
      hz.globalCompositeOperation = 'source-over'
    }

    /** Draws a screen-sized tile offset by (ox, oy), wrapping in both directions. */
    const wrapDraw = (tile: HTMLCanvasElement, ox: number, oy: number) => {
      const W = canvas.width
      const H = canvas.height
      const x = (((ox * dpr) % W) + W) % W
      const y = (((oy * dpr) % H) + H) % H
      ctx.drawImage(tile, -x, -y)
      ctx.drawImage(tile, W - x, -y)
      ctx.drawImage(tile, -x, H - y)
      ctx.drawImage(tile, W - x, H - y)
    }

    const frame = (now: number) => {
      const t = motionOK ? (now - start) / 1000 : 0
      const scroll = motionOK ? window.scrollY : 0
      const vh = h || 1
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.fillStyle = '#020203'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Haze: fades in over the first seconds, strongest through the opening credits, then
      // settles back as the page moves on to the work. It rises a little as you scroll.
      if (haze) {
        const intro = Math.min(1, t / 3.5)
        const screens = scroll / vh
        const settle = screens < 8 ? 1 : Math.max(0.45, 1 - (screens - 8) * 0.2)
        ctx.globalAlpha = (motionOK ? intro : 1) * settle
        ctx.imageSmoothingEnabled = true
        const rise = -Math.min(scroll * 0.05, vh * 0.6)
        const sway = Math.sin(t / 40) * 0.02 * w
        ctx.drawImage(haze, (sway - w * 0.05) * dpr, (rise - vh * 0.05) * dpr, w * 1.1 * dpr, vh * HAZE_HEIGHT * dpr)
        ctx.globalAlpha = 1
      }

      tiles.forEach((tile, i) => {
        const spec = LAYERS[i]
        wrapDraw(tile, t * spec.drift, scroll * spec.parallax)
      })

      if (motionOK) {
        for (const s of twinklers) {
          const spec = LAYERS[s.layer]
          const a = Math.max(0, Math.sin(t * s.speed + s.phase)) ** 3
          if (a < 0.05) continue
          const x = (((s.x - t * spec.drift) % w) + w) % w
          const y = (((s.y - scroll * spec.parallax) % vh) + vh) % vh
          ctx.fillStyle = `rgba(255,255,255,${a * 0.9})`
          ctx.beginPath()
          ctx.arc(x * dpr, y * dpr, s.size * dpr, 0, Math.PI * 2)
          ctx.fill()
        }
      }

      if (motionOK) raf = requestAnimationFrame(frame)
    }

    build()
    frame(performance.now())

    let resizeTimer = 0
    const onResize = () => {
      // Phones resize the viewport every time the address bar slides in or out; regenerating the
      // sky for that would be wasted work mid-scroll. Only a real change in size rebuilds it.
      const rect = canvas.getBoundingClientRect()
      const dw = Math.abs(rect.width - w)
      const dh = Math.abs(rect.height - h) / (h || 1)
      if (dw < 2 && dh < 0.2) return
      clearTimeout(resizeTimer)
      resizeTimer = window.setTimeout(() => {
        build()
        frame(performance.now())
      }, 150)
    }
    // Hidden tabs don't need a sky.
    const onVisibility = () => {
      cancelAnimationFrame(raf)
      if (!document.hidden && motionOK) raf = requestAnimationFrame(frame)
    }
    window.addEventListener('resize', onResize)
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      cancelAnimationFrame(raf)
      clearTimeout(resizeTimer)
      window.removeEventListener('resize', onResize)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [motionOK])

  // Sized to the *large* viewport height, so it doesn't stretch as a phone's address bar comes and goes.
  return <canvas ref={ref} aria-hidden className="pointer-events-none fixed top-0 left-0 z-0 h-[100lvh] w-full" />
}
