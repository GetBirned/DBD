import { useEffect, useState } from 'react'
import { clients } from '@/data/clients'
import { experience, type ExperienceEntry } from '@/data/experience'
import Credit from '../Credit'
import { useScreens } from '@/lib/ship'
import { terminal } from '@/lib/sound'
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

/**
 * One set of quotes on the ship's screen, as incoming transmissions, one at a time. They never
 * advance on their own: the arrows (on screen or on the keyboard) and a row of blocks, one per
 * message, step through them.
 */
function Reel({ set }: { set: SetName }) {
  const { noun, items } = SETS[set]
  const [active, setActive] = useState(0)
  // Every step to another message sounds the screen's "bip-bip".
  const show = (i: number) => {
    terminal.page()
    setActive(i)
  }
  const go = (d: number) => show((active + d + items.length) % items.length)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return
      terminal.page()
      setActive((a) => (a + (e.key === 'ArrowRight' ? 1 : -1) + items.length) % items.length)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [items.length])

  return (
    <div>
      <div className="crt-dim uppercase">
        message {String(active + 1).padStart(2, '0')} of {String(items.length).padStart(2, '0')}
      </div>
      {/* Every message stacked in one cell, so the box keeps the height of the longest. */}
      <div className="crt-box mt-3 grid p-4 sm:p-5">
        {items.map((q, i) => (
          <figure key={i} aria-hidden={i !== active} className={`col-start-1 row-start-1 ${i === active ? '' : 'invisible'}`}>
            <blockquote className="text-[clamp(20px,1.7vw,26px)] leading-[1.3]">“{q.quote}”</blockquote>
            <figcaption className="crt-dim mt-4 uppercase">from: {q.caption}</figcaption>
          </figure>
        ))}
      </div>
      {items.length > 1 && (
        <div className="mt-4 flex items-center justify-between gap-4 uppercase">
          <button type="button" onClick={() => go(-1)} aria-label={`Previous ${noun.toLowerCase()}`} className="crt-link shrink-0 px-1">
            &lt; prev
          </button>
          <div className="flex flex-wrap justify-center gap-1">
            {items.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => show(i)}
                aria-label={`${noun} ${i + 1} of ${items.length}`}
                aria-current={i === active ? 'true' : undefined}
                className={`h-3 w-3 border border-[rgb(var(--crt)/0.6)] transition-colors ${i === active ? 'bg-[rgb(var(--crt))] shadow-[0_0_8px_rgb(var(--crt-glow)/0.6)]' : 'hover:bg-[rgb(var(--crt)/0.4)]'}`}
              />
            ))}
          </div>
          <button type="button" onClick={() => go(1)} aria-label={`Next ${noun.toLowerCase()}`} className="crt-link shrink-0 px-1">
            next &gt;
          </button>
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
  // The ship's computer can call up either set of transmissions.
  useScreens((id) => id.startsWith('words:') && setOpen(id.slice('words:'.length) as SetName))
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
      <Popup
        open={!!open}
        onClose={() => setOpen(null)}
        title={open ? `incoming transmissions · ${SETS[open].label}` : ''}
        hint="left, right: scroll | esc: exit"
      >
        {open && <Reel set={open} />}
      </Popup>
    </div>
  )
}

export function buildWords(tl: Timeline, root: Element, start: number, len: number) {
  pass(tl, root.querySelector('[data-in]'), start, len, { drift: 0.03, enter: 0.28, exit: 0.24 })
}
