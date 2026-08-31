import { useRef } from 'react'
import { Link } from 'react-router-dom'
import Logo3D, { LogoIcon, LOGO_ASPECT, type LogoVariant } from './Logo3D'
import { ChevronDown } from './icons'

const ROUTES: Record<LogoVariant, string> = { db: '/', dbd: '/dbd', code: '/fun' }
const LABELS: Record<LogoVariant, string> = { db: 'Home', dbd: 'Designs By Dart', code: 'Fun Projects' }
const ORDER: LogoVariant[] = ['db', 'dbd', 'code']

const STAGE_WIDTH: Record<LogoVariant, number> = { db: 640, dbd: 780, code: 460 }
const STAGE_SIZE: Record<LogoVariant, { width: number; height: number }> = Object.fromEntries(
  ORDER.map((v) => [v, { width: STAGE_WIDTH[v], height: STAGE_WIDTH[v] / LOGO_ASPECT[v] }]),
) as Record<LogoVariant, { width: number; height: number }>

/** An icon with a soft gradient glow behind it on hover — no button chrome, no border. */
function GlowIcon({ children, href, to, label }: { children: React.ReactNode; href?: string; to?: string; label: string }) {
  const className = 'group relative flex items-center justify-center transition-transform duration-250 ease-out hover:-translate-y-0.5'
  const inner = (
    <>
      <span className="absolute -inset-3 -z-10 rounded-full bg-gradient-to-br from-grad-a to-grad-b opacity-0 blur-lg transition-opacity duration-300 group-hover:opacity-45" />
      {children}
    </>
  )
  if (to) {
    return (
      <Link to={to} aria-label={label} className={className}>
        {inner}
      </Link>
    )
  }
  return (
    <a href={href} target="_blank" rel="noreferrer" aria-label={label} className={className}>
      {inner}
    </a>
  )
}

export default function IconHero({
  active,
  showScrollCue = true,
  minHeight = '100dvh',
}: {
  active: LogoVariant
  showScrollCue?: boolean
  minHeight?: number | string
}) {
  const others = ORDER.filter((v) => v !== active)
  const size = STAGE_SIZE[active]
  const heroRef = useRef<HTMLElement>(null)

  const scrollToNext = () => {
    heroRef.current?.nextElementSibling?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <section
      ref={heroRef}
      className="relative flex flex-col items-center justify-center overflow-hidden"
      style={{ minHeight }}
    >
      {/*
        `ellipse closest-side` (not `circle` with a % stop) so the gradient is
        mathematically guaranteed to reach fully transparent right at the box's
        nearest edge in every direction, regardless of aspect ratio. `circle`'s
        percentage stops size off the farthest CORNER, so on a wide-but-short
        section (common on real desktop windows) the "transparent" radius could
        still exceed the section's height — leaving visible color exactly at the
        bottom edge, which this section's overflow-hidden then hard-clipped into
        a visible seam. The extra color stops ease the falloff so it fades
        smoothly instead of showing a ring where the gradient math changes rate.
      */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse closest-side at 38% 42%, oklch(0.62 0.16 255 / .26) 0%, oklch(0.62 0.16 255 / .12) 45%, oklch(0.62 0.16 255 / .04) 75%, transparent 100%), radial-gradient(ellipse closest-side at 62% 58%, oklch(0.55 0.19 305 / .22) 0%, oklch(0.55 0.19 305 / .1) 45%, oklch(0.55 0.19 305 / .04) 75%, transparent 100%)',
        }}
      />
      <Logo3D variant={active} interactionRef={heroRef} width={size.width} height={size.height} />

      <div className="relative z-10 mt-10 flex items-center gap-7">
        {others.map((v) => (
          <GlowIcon key={v} to={ROUTES[v]} label={LABELS[v]}>
            <LogoIcon variant={v} height={22} />
          </GlowIcon>
        ))}
        <span className="h-5 w-px bg-line" />
        <GlowIcon href="https://github.com/GetBirned" label="GitHub">
          <img src="/logos/github.png" alt="" className="h-9 w-9" />
        </GlowIcon>
        <GlowIcon href="https://www.linkedin.com/in/dartagnan-birnie/" label="LinkedIn">
          <img src="/logos/linkedIn.png" alt="" className="h-9 w-9" />
        </GlowIcon>
      </div>

      {showScrollCue && (
        <button
          type="button"
          onClick={scrollToNext}
          aria-label="Scroll for more"
          className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 text-ink-faint transition-colors hover:text-grad-a"
        >
          <ChevronDown className="scroll-bounce block" />
        </button>
      )}
    </section>
  )
}
