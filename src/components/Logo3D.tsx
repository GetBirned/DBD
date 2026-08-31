import { useEffect, useRef, type CSSProperties, type RefObject } from 'react'

export type LogoVariant = 'db' | 'dbd' | 'code'

/** Real logo files (transparent images), masked and recolored per depth layer. */
const LOGO_SRC: Record<LogoVariant, string> = {
  db: '/logos/DB_black.png',
  dbd: '/logos/DBD.png',
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

/**
 * Mouse-follow 3D tilt, eased toward the cursor. Tracks movement across the whole
 * `interactionRef` element (e.g. the entire hero section), not just the mark itself,
 * so the tilt responds anywhere in that space. Bypasses React state for a smooth loop.
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
      tx = px * 42
      ty = py * -42
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

    return () => {
      container.removeEventListener('mousemove', onMove)
      container.removeEventListener('mouseleave', onLeave)
      cancelAnimationFrame(raf)
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
            perspective: 1100,
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
