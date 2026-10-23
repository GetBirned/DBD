import { useState } from 'react'
import { motion, type Variants } from 'framer-motion'
import { ChevronLeft, ChevronRight } from '@/components/icons'
import { clients } from '@/data/clients'
import { experience, type ExperienceEntry } from '@/data/experience'
import { EASE, useMotionOK } from '@/lib/motion'
import { pass, type Timeline } from '../motion'

interface Quote {
  quote: string
  /** Who said it, as one line. */
  caption: string
}

/**
 * Every coworker referral, dealt round-robin by role so the first few to come up aren't all from
 * one job.
 */
function collectShoutouts(entries: ExperienceEntry[]): Quote[] {
  const lists = entries.map((e) =>
    (e.referrals ?? []).map((r): Quote => {
      const company = e.company.replace(' Inc.', '')
      const [name, title] = (r.name ?? '').split(/,\s*/)
      return { quote: r.quote, caption: `${name || `A ${company} coworker`} · ${title ? `${title}, ` : ''}${company}` }
    }),
  )
  const total = lists.reduce((n, l) => n + l.length, 0)
  const out: Quote[] = []
  for (let i = 0; out.length < total; i++) for (const l of lists) if (l[i]) out.push(l[i])
  return out
}

const SETS = {
  coworkers: { label: "in my coworkers' words", noun: 'Shoutout', items: collectShoutouts(experience) },
  clients: {
    label: "in my clients' words",
    noun: 'Testimonial',
    items: clients.filter((c) => c.quote).map((c) => ({ quote: c.quote!, caption: c.attr ?? c.name })),
  },
}

// Short quotes set bigger and long ones smaller, so a two-liner doesn't look lost and a paragraph
// doesn't take over the screen.
const size = (q: string) =>
  q.length <= 80 ? 'text-[clamp(19px,2.4vw,40px)]' : q.length <= 170 ? 'text-[clamp(18px,2vw,33px)]' : 'text-[clamp(16px,1.65vw,27px)]'

const swap: Variants = {
  shown: { opacity: 1, transition: { duration: 0.7, ease: EASE, delay: 0.2 } },
  hidden: { opacity: 0, transition: { duration: 0.25, ease: EASE } },
}

/**
 * Quotes as a credit — the label on the left of the axis, one quote on the right. They never
 * advance on their own (nothing on this page moves unless you move it): a row of thin segments and
 * arrows step through them.
 */
export default function Words({ set, still = false }: { set: keyof typeof SETS; still?: boolean }) {
  const { label, noun, items } = SETS[set]
  const motionOK = useMotionOK()
  const [active, setActive] = useState(0)
  const go = (d: number) => setActive((a) => (a + d + items.length) % items.length)

  return (
    <div className={`flex items-center px-[7vw] ${still ? 'py-[8vh]' : 'h-full'}`}>
      <div
        data-in
        className="credit mx-auto grid w-full max-w-[1400px] grid-cols-1 gap-y-6 sm:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] sm:gap-x-[0.9em]"
      >
        <div className="text-center text-[clamp(19px,2.6vw,46px)] leading-[1.18] text-ink/75 sm:text-right">{label}</div>
        <div>
          {/* Every quote stacked in one grid cell: the cell sizes to the tallest, so nothing
              shifts as they change. Only the active one is visible. */}
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
                  <figcaption className="mt-5 font-mono text-[10px] tracking-[0.16em] text-ink-faint uppercase [text-shadow:none] sm:text-[11px]">
                    {q.caption}
                  </figcaption>
                </motion.figure>
              )
            })}
          </div>

          {items.length > 1 && (
            <div className="mt-8 flex items-center gap-5 [text-shadow:none]">
              <div className="flex flex-1 items-center gap-1">
                {items.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setActive(i)}
                    aria-label={`${noun} ${i + 1} of ${items.length}`}
                    aria-current={i === active ? 'true' : undefined}
                    className="group flex-1 py-3"
                  >
                    <span
                      className={`block h-px transition-colors duration-300 ${i === active ? 'bg-ink' : i < active ? 'bg-ink/50' : 'bg-ink/15 group-hover:bg-ink/40'}`}
                    />
                  </button>
                ))}
              </div>
              <div className="flex shrink-0 items-center gap-2 font-mono text-[11px] tracking-[0.14em] text-ink-faint">
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
    </div>
  )
}

export function buildWords(tl: Timeline, root: Element, start: number, len: number) {
  pass(tl, root.querySelector('[data-in]'), start, len, { drift: 0.04, enter: 0.28, exit: 0.24 })
}
