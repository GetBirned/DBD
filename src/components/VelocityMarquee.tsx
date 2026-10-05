import { useRef, type ReactNode } from 'react'
import {
  motion,
  useAnimationFrame,
  useInView,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
  wrap,
} from 'framer-motion'
import { useMotionOK } from '@/lib/motion'

/** Copies of the content in the track — enough to overfill ultra-wide screens at the wrap point. */
const COPIES = 3

/**
 * An endless row that drifts on its own and surges with scroll speed — scroll faster (either
 * direction) and it runs faster. Pauses its frame loop while off screen, and eases to a crawl
 * under the cursor so whatever's in it can actually be read.
 *
 * `children` is one copy of the row; give it trailing spacing (not a gap) so every copy is the
 * same width and the wrap is seamless. `speed` is percent of one copy per second; negative runs
 * leftward. With reduced motion, `fallback` renders instead.
 */
export function VelocityTrack({
  children,
  speed = -2.2,
  fallback,
  className = '',
}: {
  children: ReactNode
  speed?: number
  fallback?: ReactNode
  className?: string
}) {
  const motionOK = useMotionOK()
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref)
  const hovered = useRef(false)

  const base = useMotionValue(0)
  const { scrollY } = useScroll()
  const velocity = useSpring(useVelocity(scrollY), { damping: 50, stiffness: 400 })
  const boost = useTransform(velocity, [-2000, 0, 2000], [5, 0, 5], { clamp: false })
  // One copy is 1/COPIES of the track, which is the window the offset wraps inside.
  const x = useTransform(base, (v) => `${wrap(-100 / COPIES, 0, v)}%`)

  useAnimationFrame((_, delta) => {
    if (!motionOK || !inView) return
    const factor = hovered.current ? 0.15 : 1 + Math.abs(boost.get())
    base.set(base.get() + (speed / COPIES) * (delta / 1000) * factor)
  })

  if (!motionOK && fallback) return <>{fallback}</>

  return (
    <div
      ref={ref}
      className={`overflow-hidden ${className}`}
      onMouseEnter={() => (hovered.current = true)}
      onMouseLeave={() => (hovered.current = false)}
    >
      <motion.div style={{ x }} className="flex w-max">
        {Array.from({ length: COPIES }, (_, i) => (
          <div key={i} className="flex shrink-0" aria-hidden={i > 0 || undefined}>
            {children}
          </div>
        ))}
      </motion.div>
    </div>
  )
}

export interface MarqueeItem {
  name: string
  logo?: string
}

function Tile({ item }: { item: MarqueeItem }) {
  return (
    <div className="shrink-0 pr-4 sm:pr-5">
      <div
        title={item.name}
        className="flex h-24 w-40 items-center justify-center rounded-2xl bg-white px-5 transition-transform duration-300 hover:-translate-y-1 hover:scale-[1.04] sm:h-28 sm:w-48"
      >
        {item.logo ? (
          <img src={item.logo} alt={item.name} loading="lazy" decoding="async" className="max-h-14 w-auto max-w-full object-contain sm:max-h-16" />
        ) : (
          <span className="text-center font-display text-sm font-bold text-black/70">{item.name}</span>
        )}
      </div>
    </div>
  )
}

/** A row of client logos on white tiles, as a velocity track. */
export default function VelocityMarquee({ items, speed = -2.2 }: { items: MarqueeItem[]; speed?: number }) {
  return (
    <VelocityTrack
      speed={speed}
      className="marquee-mask py-2"
      fallback={
        <div className="flex flex-wrap justify-center gap-y-4 px-6">
          {items.map((it) => (
            <Tile key={it.name} item={it} />
          ))}
        </div>
      }
    >
      {items.map((it) => (
        <Tile key={it.name} item={it} />
      ))}
    </VelocityTrack>
  )
}
