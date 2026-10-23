import { useState } from 'react'
import { motion, type Variants } from 'framer-motion'
import { ChevronLeft, ChevronRight } from '@/components/icons'
import { clients } from '@/data/clients'
import { experience, type ExperienceEntry } from '@/data/experience'
import { EASE, useMotionOK } from '@/lib/motion'
import Credit from '../Credit'
import { pass, type Timeline } from '../motion'
import Popup from '../Popup'

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
  coworkers: { label: 'coworkers', noun: 'Shoutout', items: collectShoutouts(experience) },
  clients: {
    label: 'clients',
    noun: 'Testimonial',
    items: clients.filter((c) => c.quote).map((c) => ({ quote: c.quote!, caption: c.attr ?? c.name })),
  },
}
type SetName = keyof typeof SETS

// Short quotes set bigger and long ones smaller, so a two-liner doesn't look lost and a paragraph
// doesn't take over the card.
const size = (q: string) =>
  q.length <= 80 ? 'text-[clamp(19px,2.2vw,36px)]' : q.length <= 170 ? 'text-[clamp(18px,1.8vw,30px)]' : 'text-[clamp(16px,1.5vw,25px)]'

const swap: Variants = {
  shown: { opacity: 1, transition: { duration: 0.6, ease: EASE, delay: 0.15 } },
  hidden: { opacity: 0, transition: { duration: 0.2, ease: EASE } },
}

/**
 * One set of quotes, one at a time. They never advance on their own: a row of thin segments and
 * arrows step through them.
 */
function Reel({ set }: { set: SetName }) {
  const { label, noun, items } = SETS[set]
  const motionOK = useMotionOK()
  const [active, setActive] = useState(0)
  const go = (d: number) => setActive((a) => (a + d + items.length) % items.length)

  return (
    <div className="credit text-center">
      <div className="text-[clamp(18px,2vw,32px)] text-ink/75">in my {label}' words</div>
      {/* Every quote stacked in one grid cell: the cell sizes to the tallest, so nothing shifts as
          they change. Only the active one is visible. */}
      <div className="mt-[4vh] grid">
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
              <blockquote className={`${size(q.quote)} mx-auto max-w-[27em] leading-[1.28]`}>“{q.quote}”</blockquote>
              <figcaption className="mt-5 font-mono text-[10px] tracking-[0.16em] text-ink-faint uppercase [text-shadow:none] sm:text-[11px]">
                {q.caption}
              </figcaption>
            </motion.figure>
          )
        })}
      </div>

      {items.length > 1 && (
        <div className="mx-auto mt-8 flex max-w-[34rem] items-center gap-5 [text-shadow:none]">
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
  )
}

/**
 * What people say, as one title card — "in their words | Coworkers / Clients" — where each name
 * opens its set of quotes.
 */
export default function Words({ still = false }: { still?: boolean }) {
  const [open, setOpen] = useState<SetName | null>(null)
  return (
    <div className={`flex items-center justify-center px-[7vw] ${still ? 'py-[10vh]' : 'h-full pt-[12vh]'}`}>
      <div data-in>
        <Credit
          role="in their words"
          names={[
            { text: 'Coworkers', onClick: () => setOpen('coworkers') },
            { text: 'Clients', onClick: () => setOpen('clients') },
          ]}
        />
      </div>
      <Popup open={!!open} onClose={() => setOpen(null)} label={open ? `In my ${SETS[open].label}' words` : ''}>
        {open && <Reel set={open} />}
      </Popup>
    </div>
  )
}

export function buildWords(tl: Timeline, root: Element, start: number, len: number) {
  pass(tl, root.querySelector('[data-in]'), start, len, { drift: 0.03, enter: 0.28, exit: 0.24 })
}
