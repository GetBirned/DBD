import { useEffect, useRef, useState } from 'react'
import { motion, useInView, type Variants } from 'framer-motion'
import { ChevronLeft, ChevronRight } from '@/components/icons'
import { EASE, useMotionOK } from '@/lib/motion'

export interface ReelQuote {
  quote: string
  /** Who said it, as one line — "name · title, company". */
  caption: string
}

// Short quotes set bigger and long ones smaller, so a two-liner doesn't look lost and a
// paragraph doesn't take over the screen.
const size = (q: string) =>
  q.length <= 80
    ? 'text-[clamp(19px,2.5vw,42px)]'
    : q.length <= 170
      ? 'text-[clamp(18px,2.1vw,35px)]'
      : 'text-[clamp(17px,1.75vw,29px)]'

// Outgoing fades first, incoming follows — a dissolve, like the credits.
const swap: Variants = {
  shown: { opacity: 1, transition: { duration: 0.9, ease: EASE, delay: 0.3 } },
  hidden: { opacity: 0, transition: { duration: 0.35, ease: EASE } },
}

/**
 * Quotes as a credit — `label` on the left of the axis, the quote on the right — one at a time,
 * advancing on their own while on screen. A row of thin segments shows how many there are and
 * how far along you are, and jumps to any of them.
 */
export default function QuoteReel({
  label,
  items,
  noun,
  interval = 8,
}: {
  label: string
  items: ReelQuote[]
  /** What one quote is called, for the controls' labels — "Shoutout", "Testimonial". */
  noun: string
  /** Seconds each quote stays up. */
  interval?: number
}) {
  const motionOK = useMotionOK()
  const ref = useRef<HTMLDivElement>(null)
  // Only ticks while it's actually being looked at, so nobody arrives mid-rotation.
  const inView = useInView(ref, { margin: '-25% 0px' })
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)
  const running = motionOK && inView && !paused && items.length > 1

  useEffect(() => {
    if (!running) return
    const t = setTimeout(() => setActive((a) => (a + 1) % items.length), interval * 1000)
    return () => clearTimeout(t)
  }, [running, active, items.length, interval])

  if (items.length === 0) return null
  const go = (d: number) => setActive((a) => (a + d + items.length) % items.length)

  return (
    <div
      ref={ref}
      className="credit mx-auto grid w-full max-w-[1400px] grid-cols-1 gap-y-6 sm:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] sm:gap-x-[0.9em]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="text-center text-[clamp(19px,2.7vw,48px)] leading-[1.18] text-ink/75 sm:text-right">{label}</div>

      <div>
        {/* Every quote stacked in one grid cell: the cell sizes to the tallest, so the section
            never jumps in height as they rotate. Only the active one is visible. */}
        <div className="grid">
          {items.map((q, i) => {
            const on = i === active
            return (
              <motion.figure
                key={i}
                aria-hidden={!on}
                initial={false}
                animate={on ? 'shown' : 'hidden'}
                variants={motionOK ? swap : undefined}
                style={motionOK ? undefined : { opacity: on ? 1 : 0 }}
                className={`col-start-1 row-start-1 ${on ? '' : 'pointer-events-none'}`}
              >
                <blockquote className={`${size(q.quote)} max-w-[27em] leading-[1.28]`}>“{q.quote}”</blockquote>
                <figcaption className="mt-5 font-mono text-[11px] tracking-[0.16em] text-ink-faint uppercase [text-shadow:none]">{q.caption}</figcaption>
              </motion.figure>
            )
          })}
        </div>

        {items.length > 1 && (
          <div className="mt-9 flex items-center gap-6 [text-shadow:none]">
            {/* One thin segment per quote: seen ones lit, the current one filling over its
                interval (the auto-advance timer), the rest dim. */}
            <div className="flex flex-1 items-center gap-1">
              {items.map((_, i) => {
                const on = i === active
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setActive(i)}
                    aria-label={`${noun} ${i + 1} of ${items.length}`}
                    aria-current={on ? 'true' : undefined}
                    className="group flex-1 py-3"
                  >
                    <span className={`block h-px overflow-hidden transition-colors duration-300 ${i < active ? 'bg-ink/60' : 'bg-ink/15 group-hover:bg-ink/40'}`}>
                      {on && (
                        <motion.span
                          key={`${active}-${running}`}
                          className="block h-full bg-ink"
                          initial={{ width: running ? '0%' : '100%' }}
                          animate={{ width: '100%' }}
                          transition={{ duration: running ? interval : 0, ease: 'linear' }}
                        />
                      )}
                    </span>
                  </button>
                )
              })}
            </div>
            <div className="flex shrink-0 items-center gap-3 font-mono text-[11px] tracking-[0.14em] text-ink-faint">
              <button type="button" onClick={() => go(-1)} aria-label={`Previous ${noun.toLowerCase()}`} className="p-2 transition-colors hover:text-ink">
                <ChevronLeft />
              </button>
              <span className="tabular-nums">
                {String(active + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')}
              </span>
              <button type="button" onClick={() => go(1)} aria-label={`Next ${noun.toLowerCase()}`} className="p-2 transition-colors hover:text-ink">
                <ChevronRight />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
