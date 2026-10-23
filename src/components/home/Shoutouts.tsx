import { useEffect, useRef, useState } from 'react'
import { motion, useInView, type Variants } from 'framer-motion'
import { ChevronLeft, ChevronRight } from '@/components/icons'
import type { ExperienceEntry } from '@/data/experience'
import { EASE, useMotionOK } from '@/lib/motion'

export interface Shoutout {
  quote: string
  /** Who said it, without their title — absent for the unattributed ones. */
  name?: string
  /** e.g. "Co-Founder", split off the end of the name in the data. */
  title?: string
  company: string
  /** Company logo, shown on a white disc beside the attribution. */
  logo?: string
}

/**
 * Every referral across the career entries, dealt round-robin by role so the first few to come
 * up aren't all from one job.
 */
export function collectShoutouts(entries: ExperienceEntry[]): Shoutout[] {
  const lists = entries.map((e) =>
    (e.referrals ?? []).map((r): Shoutout => {
      const [name, title] = (r.name ?? '').split(/,\s*/)
      return {
        quote: r.quote,
        name: name || undefined,
        title: title || undefined,
        company: e.company.replace(' Inc.', ''),
        logo: e.logo,
      }
    }),
  )
  const total = lists.reduce((n, l) => n + l.length, 0)
  const out: Shoutout[] = []
  for (let i = 0; out.length < total; i++) for (const l of lists) if (l[i]) out.push(l[i])
  return out
}

/** Seconds each shoutout stays up — these run longer on average than the client quotes. */
const INTERVAL = 8

// Short quotes set bigger and long ones smaller, so a two-liner doesn't look lost and a
// paragraph doesn't take over the screen.
const size = (q: string) =>
  q.length <= 80
    ? 'text-[clamp(32px,4.4vw,76px)]'
    : q.length <= 170
      ? 'text-[clamp(27px,3.4vw,58px)]'
      : 'text-[clamp(23px,2.7vw,46px)]'

// Outgoing fades first, incoming follows — the same sequence as the client quotes.
const swap: Variants = {
  shown: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE, delay: 0.22 } },
  hidden: { opacity: 0, y: -14, transition: { duration: 0.22, ease: EASE } },
}

/**
 * Coworker shoutouts given the same stage as the client testimonials: one at a time and large,
 * advancing on their own while on screen. A row of story-style segments shows how many there are
 * and how far along you are, and jumps to any of them. Styled for an ink band.
 */
export default function Shoutouts({
  items,
  active,
  onChange,
}: {
  items: Shoutout[]
  active: number
  onChange: (i: number) => void
}) {
  const motionOK = useMotionOK()
  const ref = useRef<HTMLDivElement>(null)
  // Only ticks while it's actually being looked at, so nobody arrives mid-rotation.
  const inView = useInView(ref, { margin: '-25% 0px' })
  const [paused, setPaused] = useState(false)
  const running = motionOK && inView && !paused && items.length > 1

  useEffect(() => {
    if (!running) return
    const t = setTimeout(() => onChange((active + 1) % items.length), INTERVAL * 1000)
    return () => clearTimeout(t)
  }, [running, active, items.length, onChange])

  if (items.length === 0) return null
  const go = (d: number) => onChange((active + d + items.length) % items.length)

  return (
    <div
      ref={ref}
      className="relative grid gap-x-[3vw] gap-y-8 lg:grid-cols-12"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="lg:col-span-3">
        <div className="font-mono text-[12px] tracking-[0.1em] text-paper/60 uppercase">In my coworkers' words</div>
        {/* A flat cobalt quote mark, set as type rather than drawn. */}
        <div aria-hidden className="display mt-2 text-[clamp(120px,16vw,260px)] leading-[0.7] text-accent select-none">
          “
        </div>
      </div>

      <div className="lg:col-span-9">
        {/* Every quote stacked in one grid cell: the cell sizes to the tallest, so the section
            never jumps in height as they rotate. Only the active one is visible. */}
        <div className="grid">
          {items.map((s, i) => {
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
                <blockquote className={`${size(s.quote)} max-w-[24em] leading-[1.12] font-medium tracking-[-0.02em] text-paper`}>
                  {s.quote}
                </blockquote>
                <figcaption className="mt-8 flex items-center gap-4">
                  {s.logo && <img src={s.logo} alt="" className="h-11 w-11 shrink-0 bg-white object-contain p-1.5" />}
                  <div>
                    <div className="text-[16px] font-semibold text-paper">{s.name ?? `A ${s.company} coworker`}</div>
                    <div className="font-mono text-[11px] tracking-[0.06em] text-paper/55 uppercase">
                      {s.title ? `${s.title}, ` : ''}
                      {s.company}
                    </div>
                  </div>
                </figcaption>
              </motion.figure>
            )
          })}
        </div>

        <div className="mt-12 flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-8">
          {/* One slim segment per shoutout, story-style: seen ones stay lit, the current one
              fills over its interval (so the bar doubles as the auto-advance timer), the rest
              wait dim. Each is a tall, invisible hit area around a 3px line. */}
          <div className="flex flex-1 items-center gap-1 sm:gap-1.5">
            {items.map((s, i) => {
              const on = i === active
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => onChange(i)}
                  aria-label={`Shoutout ${i + 1} of ${items.length}${s.name ? ` — ${s.name}` : ''}`}
                  aria-current={on ? 'true' : undefined}
                  className="group flex-1 py-3"
                >
                  <span
                    className={`block h-[3px] overflow-hidden transition-colors duration-300 ${i < active ? 'bg-paper/70' : 'bg-paper/15 group-hover:bg-paper/40'}`}
                  >
                    {on && (
                      <motion.span
                        key={`${active}-${running}`}
                        className="block h-full bg-accent"
                        initial={{ width: running ? '0%' : '100%' }}
                        animate={{ width: '100%' }}
                        transition={{ duration: running ? INTERVAL : 0, ease: 'linear' }}
                      />
                    )}
                  </span>
                </button>
              )
            })}
          </div>

          <div className="flex shrink-0 items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Previous shoutout"
              className="flex h-11 w-11 items-center justify-center border border-paper/30 text-paper transition-colors hover:border-paper hover:bg-paper hover:text-ink"
            >
              <ChevronLeft />
            </button>
            <span className="min-w-[64px] text-center font-mono text-xs text-paper/60 tabular-nums">
              {String(active + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')}
            </span>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Next shoutout"
              className="flex h-11 w-11 items-center justify-center border border-paper/30 text-paper transition-colors hover:border-paper hover:bg-paper hover:text-ink"
            >
              <ChevronRight />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
