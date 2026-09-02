import { useEffect, useRef, type CSSProperties, type RefObject } from 'react'

export type LogoVariant = 'db' | 'dbd' | 'code'

/** Real logo files, masked and recolored per depth layer. DB/DBD are traced to SVG so the
 * hero mark stays crisp — the source PNGs were only 395px/493px wide but render up to
 * 640px/780px, i.e. a >3x upscale on a 2x-DPR display. */
const LOGO_SRC: Record<LogoVariant, string> = {
  db: '/logos/DB_black.svg',
  dbd: '/logos/DBD.svg',
  code: '/logos/codeSymbol.webp',
}

/** Natural pixel aspect ratio (width / height) of each mark. */
export const LOGO_ASPECT: Record<LogoVariant, number> = {
  db: 395 / 280,
  dbd: 493 / 255,
  code: 700 / 700,
}

/** A single-color flat mark, sized to its natural aspect ratio — used for small nav icons. */
export function LogoIcon({ variant, height = 18, className }: { variant: LogoVariant; height?: number; className?: string }) {
  return (
    <img
      src={LOGO_SRC[variant]}
      alt=""
      style={{ height, width: 'auto', display: 'block' }}
      className={className}
    />
  )
}

const LAYER_COLORS = [
  'oklch(0.32 0.10 285)',
  'oklch(0.36 0.11 285)',
  'oklch(0.40 0.12 288)',
  'oklch(0.44 0.13 290)',
  'oklch(0.48 0.14 292)',
  'oklch(0.52 0.15 295)',
]
const LAYER_Z = [-36, -30, -24, -18, -12, -6, 0]
const BRAND_GRADIENT = 'linear-gradient(135deg, var(--color-grad-a), var(--color-grad-b))'

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v))

/** iOS 13+ gates deviceorientation behind an explicit, gesture-triggered permission
 * prompt; other browsers just fire the event with no ask. */
type DeviceOrientationEventiOS = typeof DeviceOrientationEvent & {
  requestPermission?: () => Promise<'granted' | 'denied'>
}

/**
 * Mouse-follow 3D tilt on desktop, eased toward the cursor; device-orientation tilt
 * on phones, eased toward however the phone is physically tilted. Both track across
 * the whole `interactionRef` element (or, for orientation, the whole device), not
 * just the mark itself. Bypasses React state for a smooth loop.
 */
function useTilt3D(interactionRef: RefObject<HTMLElement | null>, groupRef: RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const container = interactionRef.current
    const group = groupRef.current
    if (!container || !group) return

    let tx = 0
    let ty = 0
    let cx = 0
    let cy = 0
    let raf = 0

    const onMove = (e: MouseEvent) => {
      const r = container.getBoundingClientRect()
      const px = (e.clientX - r.left) / r.width - 0.5
      const py = (e.clientY - r.top) / r.height - 0.5
      // Pitch (rotateX, from vertical mouse position) reads far more subtly than yaw on
      // a wide, flat mark like this one — the depth-layer parallax it creates is much
      // less pronounced than yaw's, so it needs a noticeably stronger multiplier to
      // actually look like it's changing.
      tx = px * 42
      ty = py * -65
    }
    const onLeave = () => {
      tx = 0
      ty = 0
    }
    const tick = () => {
      cx += (tx - cx) * 0.08
      cy += (ty - cy) * 0.08
      group.style.transform = `rotateX(${cy}deg) rotateY(${cx}deg)`
      raf = requestAnimationFrame(tick)
    }

    container.addEventListener('mousemove', onMove)
    container.addEventListener('mouseleave', onLeave)
    raf = requestAnimationFrame(tick)

    // --- device tilt, for phones/tablets (coarse pointer, no hover) ---
    let baseBeta: number | null = null
    let baseGamma: number | null = null
    let lastOrientTime: number | null = null
    const TILT_RANGE = 30 // degrees of physical phone tilt that maps to the full mouse range
    // Baseline catches up to the current reading with this time constant (seconds), not a
    // fixed per-event step — deviceorientation fires at wildly different rates across devices
    // (iOS Safari can be ~60Hz, some Android browsers throttle to ~10Hz or less), so a fixed
    // per-event decay converges 6x slower in real time on a slow-firing phone. Time-based decay
    // behaves the same regardless of how often events actually arrive.
    const DRIFT_TIME_CONSTANT = 2.5

    const onOrientation = (e: DeviceOrientationEvent) => {
      if (e.beta == null || e.gamma == null) return
      const now = performance.now()
      // "Neutral" starts from the first reading — people don't hold a phone level, so
      // this tilts relative to however they're already holding it, not to dead flat.
      // But that first reading can land on a noisy/transient sensor spike (this was
      // reported stuck pointing one direction and never recovering — a bad one-shot
      // baseline is the classic cause). So instead of locking it forever, let it keep
      // drifting toward wherever the phone actually is: real intentional tilts happen
      // much faster than this drift and still read clearly, but a bad initial sample
      // (or someone just resettling how they're holding it) corrects itself within a
      // couple of seconds instead of staying wrong for the rest of the visit.
      if (baseBeta === null || baseGamma === null) {
        baseBeta = e.beta
        baseGamma = e.gamma
        lastOrientTime = now
        return
      }
      // Clamp dt so a backgrounded tab / sensor hiccup can't produce one giant jump.
      const dt = Math.min(0.5, (now - (lastOrientTime ?? now)) / 1000)
      lastOrientTime = now
      const alpha = 1 - Math.exp(-dt / DRIFT_TIME_CONSTANT)
      baseBeta += (e.beta - baseBeta) * alpha
      baseGamma += (e.gamma - baseGamma) * alpha

      const dBeta = clamp(e.beta - baseBeta, -TILT_RANGE, TILT_RANGE) / TILT_RANGE
      const dGamma = clamp(e.gamma - baseGamma, -TILT_RANGE, TILT_RANGE) / TILT_RANGE
      tx = dGamma * 42
      ty = dBeta * -65
    }

    let cleanupOrientation = () => {}
    const isTouchPrimary = window.matchMedia('(hover: none) and (pointer: coarse)').matches
    const DOE = window.DeviceOrientationEvent as DeviceOrientationEventiOS | undefined

    if (isTouchPrimary && DOE) {
      if (typeof DOE.requestPermission === 'function') {
        // iOS: requesting permission must happen inside a user-gesture handler.
        const onFirstTouch = () => {
          DOE.requestPermission?.()
            .then((state) => {
              if (state === 'granted') window.addEventListener('deviceorientation', onOrientation)
            })
            .catch(() => {})
        }
        container.addEventListener('touchstart', onFirstTouch, { once: true })
        cleanupOrientation = () => {
          container.removeEventListener('touchstart', onFirstTouch)
          window.removeEventListener('deviceorientation', onOrientation)
        }
      } else {
        window.addEventListener('deviceorientation', onOrientation)
        cleanupOrientation = () => window.removeEventListener('deviceorientation', onOrientation)
      }
    }

    return () => {
      container.removeEventListener('mousemove', onMove)
      container.removeEventListener('mouseleave', onLeave)
      cancelAnimationFrame(raf)
      cleanupOrientation()
    }
  }, [interactionRef, groupRef])
}

/** One depth layer of the real logo mark, recolored via a CSS mask so the exact shape is preserved. */
function MaskedLayer({ src, z, background }: { src: string; z: number; background: string }) {
  const maskProps: CSSProperties = {
    WebkitMaskImage: `url(${src})`,
    maskImage: `url(${src})`,
    WebkitMaskSize: 'contain',
    maskSize: 'contain',
    WebkitMaskRepeat: 'no-repeat',
    maskRepeat: 'no-repeat',
    WebkitMaskPosition: 'center',
    maskPosition: 'center',
  }
  return (
    <div
      className="absolute inset-0 h-full w-full"
      style={{ transform: `translateZ(${z}px)`, background, ...maskProps }}
    />
  )
}

/**
 * The large, mouse-reactive "3D" hero mark: the real logo stacked at several CSS-3D
 * depths (dark at the back, brand gradient at the front), tilted toward the cursor
 * anywhere within `interactionRef`. Real CSS 3D transforms, not WebGL. A soft ground
 * shadow sits beneath it.
 */
export default function Logo3D({
  variant,
  width,
  height,
  interactionRef,
}: {
  variant: LogoVariant
  width: number
  height: number
  interactionRef: RefObject<HTMLElement | null>
}) {
  const groupRef = useRef<HTMLDivElement>(null)
  useTilt3D(interactionRef, groupRef)

  return (
    <div className="relative z-10 flex flex-col items-center">
      <div className="animate-float">
        <div
          className="relative"
          style={{
            width: `min(80vw, ${width}px)`,
            aspectRatio: `${width} / ${height}`,
            perspective: 900,
          }}
        >
          <div ref={groupRef} className="relative h-full w-full" style={{ transformStyle: 'preserve-3d' }}>
            {LAYER_Z.map((z, i) => (
              <MaskedLayer
                key={z}
                src={LOGO_SRC[variant]}
                z={z}
                background={i === LAYER_Z.length - 1 ? BRAND_GRADIENT : LAYER_COLORS[i]}
              />
            ))}
          </div>
        </div>
      </div>
      <div
        className="-mt-2 h-8 rounded-full blur-xl"
        style={{ width: `min(56vw, ${width * 0.7}px)`, background: 'oklch(0.12 0.02 260 / .32)' }}
      />
    </div>
  )
}
