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
    ? 'text-[clamp(32px,4.4vw,58px)]'
    : q.length <= 170
      ? 'text-[clamp(27px,3.5vw,46px)]'
      : 'text-[clamp(23px,2.8vw,37px)]'

// Outgoing fades first, incoming follows — the same sequence as the client quotes.
const swap: Variants = {
  shown: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE, delay: 0.22 } },
  hidden: { opacity: 0, y: -14, transition: { duration: 0.22, ease: EASE } },
}

/**
 * Coworker shoutouts given the same stage as the client testimonials: one at a time, large, in
 * the serif accent, advancing on their own while on screen. A row of story-style segments shows
 * how many there are and how far along you are, and jumps to any of them.
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
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* An oversized quote mark sitting behind the text. */}
      <span
        aria-hidden
        className="accent grad-text pointer-events-none absolute -top-[0.42em] -left-[0.06em] text-[clamp(180px,24vw,340px)] leading-none opacity-[0.16] select-none"
      >
        “
      </span>

      <div className="relative">
        <div className="mb-8 font-mono text-[11px] tracking-[0.18em] text-ink-faint uppercase">
          In my coworkers' words · {items.length} shoutouts
        </div>

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
                <blockquote className={`accent ${size(s.quote)} leading-[1.18] text-ink`}>
                  <span className="grad-text">“</span>
                  {s.quote}
                  <span className="grad-text">”</span>
                </blockquote>
                <figcaption className="mt-7 flex items-center gap-3.5">
                  {s.logo && <img src={s.logo} alt="" className="h-10 w-10 rounded-full bg-white object-contain p-1.5" />}
                  <div>
                    <div className="text-[15px] font-semibold text-ink">{s.name ?? `A ${s.company} coworker`}</div>
                    <div className="font-mono text-[11px] text-ink-faint">
                      {s.title ? `${s.title}, ` : ''}
                      {s.company}
                    </div>
                  </div>
                </figcaption>
              </motion.figure>
            )
          })}
        </div>

        <div className="mt-10 flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-8">
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
                    className={`block h-[3px] overflow-hidden rounded-full transition-colors duration-300 ${i < active ? 'bg-white/45' : 'bg-white/[0.13] group-hover:bg-white/30'}`}
                  >
                    {on && (
                      <motion.span
                        key={`${active}-${running}`}
                        className="brand-gradient block h-full"
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

          <div className="flex shrink-0 items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Previous shoutout"
              className="flex h-10 w-10 items-center justify-center rounded-full text-ink-dim ring-1 ring-white/15 transition-colors hover:bg-white/10 hover:text-ink"
            >
              <ChevronLeft />
            </button>
            <span className="min-w-[56px] text-center font-mono text-xs text-ink-faint tabular-nums">
              {String(active + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')}
            </span>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Next shoutout"
              className="flex h-10 w-10 items-center justify-center rounded-full text-ink-dim ring-1 ring-white/15 transition-colors hover:bg-white/10 hover:text-ink"
            >
              <ChevronRight />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
