import { Fragment, useState } from 'react'
import { experience, type ExperienceEntry } from '@/data/experience'
import { Ascii } from '@/components/Monitor'
import { useScreens } from '@/lib/ship'
import AltonMap from '../AltonMap'
import Credit, { type CreditName } from '../Credit'
import { pass, type Timeline } from '../motion'
import Popup from '../Popup'

interface Card {
  role?: string
  names: (string | CreditName)[]
  note?: string
}

/** What I did in one role, as it opens from its card: a personnel file on the ship's screen. */
function RoleDetails({ e }: { e: ExperienceEntry }) {
  const rows: [string, string][] = [
    ['role', e.role],
    ['employer', e.company.replace(' Inc.', '')],
    ['dates', e.dateRange],
    ['location', e.location],
  ]
  return (
    <div>
      {/* The record, with the company's mark in ASCII beside it (above it, on a phone). */}
      <div className="grid items-center gap-6 sm:grid-cols-[minmax(0,1fr)_minmax(0,13rem)]">
        {e.ascii && (
          <div className="mx-auto w-[min(100%,13rem)] sm:order-2">
            <Ascii art={e.ascii} />
          </div>
        )}
        <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-5 gap-y-1 uppercase sm:order-1">
          {rows.map(([k, v]) => (
            <Fragment key={k}>
              <dt className="crt-dim">{k}</dt>
              <dd>{v}</dd>
            </Fragment>
          ))}
        </dl>
      </div>
      <div className="crt-box mt-6 p-4 sm:p-5">{e.desc}</div>
      {e.badge &&
        (e.badgeUrl ? (
          <a href={e.badgeUrl} target="_blank" rel="noreferrer" className="crt-link mt-5 inline-block px-1 uppercase">
            &gt; {e.badge}
          </a>
        ) : (
          <p className="mt-5 uppercase">&gt; {e.badge}</p>
        ))}
    </div>
  )
}

/** Screens of scroll: open space at first, then each card, then a beat before what's next. */
const OPEN = 0.9
const CARD_LEN = 0.8
const OUT = 0.4
/** How many cards there are — keep in step with `cards` below. */
const COUNT = 8
export const OPENING_LEN = OPEN + COUNT * CARD_LEN + OUT

/**
 * The opening credits, centered under the title the way the film's sit under ALIEN: the page opens
 * on empty space, then each card dissolves in and out in its own stretch of the scroll. A company
 * name on a job's card opens what I did there; the town on the last card opens a map of it.
 */
export default function Hero({ still = false }: { still?: boolean }) {
  const [open, setOpen] = useState<number | null>(null)
  const [map, setMap] = useState(false)
  // The ship's computer can call up a personnel file or the map.
  useScreens((id) => {
    if (id === 'map') setMap(true)
    else if (id.startsWith('personnel:')) setOpen(Number(id.slice('personnel:'.length)))
  })

  const job = (i: number): Card => {
    const e = experience[i]
    return {
      role: e.role.toLowerCase(),
      // Dates and the rest live in the popup the company name opens.
      names: [{ text: e.company.replace(' Inc.', ''), onClick: () => setOpen(i) }],
    }
  }

  const cards: Card[] = [
    {
      names: [
        {
          text: (
            <>
              <span className="text-ink/75">a</span> Dart Birnie <span className="text-ink/75">site</span>
            </>
          ),
        },
      ],
    },
    job(0),
    job(1),
    { role: 'founder and web designer', names: ['Designs By Dart'] },
    job(2),
    { role: 'b.s. in computer science at', names: ['University of New Hampshire'] },
    {
      role: 'approved web design contractor',
      names: [{ text: 'NH SBDC', href: 'https://www.nhsbdc.org/' }, { text: 'GRDC', href: 'https://graftonrdc.org/' }],
    },
    { role: 'filmed in', names: [{ text: 'Alton, NH', onClick: () => setMap(true) }] },
  ]

  const details = open === null ? null : experience[open]
  const popup = (
    <>
      <Popup open={!!details} onClose={() => setOpen(null)} title={details ? `personnel file · ${details.company.replace(' Inc.', '')}` : ''}>
        {details && <RoleDetails e={details} />}
      </Popup>
      <Popup open={map} onClose={() => setMap(false)} title="survey map · alton bay, nh" hint="point to take a reading | esc: exit">
        <AltonMap />
      </Popup>
    </>
  )

  if (still) {
    return (
      <div className="space-y-[14vh] px-[6vw] pt-[16vh] pb-[6vh]">
        <h1 className="sr-only">Dart Birnie — software engineer and developer</h1>
        {cards.map((c, i) => (
          <Credit key={i} role={c.role} names={c.names} note={c.note} />
        ))}
        {popup}
      </div>
    )
  }

  return (
    <div className="h-full">
      <h1 className="sr-only">Dart Birnie — software engineer and developer</h1>
      {cards.map((c, i) => (
        <div key={i} data-card className="absolute inset-x-[6vw] top-[58%] -translate-y-1/2">
          <Credit role={c.role} names={c.names} note={c.note} />
        </div>
      ))}
      <div data-hint className="scene-label absolute inset-x-0 bottom-8 text-center text-[10px] text-ink-faint">
        Scroll
      </div>
      {popup}
    </div>
  )
}

export function buildHero(tl: Timeline, root: Element, start: number) {
  root.querySelectorAll('[data-card]').forEach((card, i) => {
    pass(tl, card, start + OPEN + i * CARD_LEN, CARD_LEN, { drift: 0.006, enter: 0.3, exit: 0.3 })
  })
  tl.to(root.querySelector('[data-hint]'), { autoAlpha: 0, duration: 0.25 }, start)
}
