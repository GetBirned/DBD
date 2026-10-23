import { experience } from '@/data/experience'
import Credit, { type CreditName } from '../Credit'
import { pass, type Timeline } from '../motion'

interface Card {
  role?: string
  names: (string | CreditName)[]
  note?: string
}

const job = (i: number): Card => {
  const e = experience[i]
  return {
    role: e.role.toLowerCase(),
    names: [e.company.replace(' Inc.', '')],
    note: [e.dateRange, e.badge ? 'Featured intern' : e.location.split(' · ')[0]].join(' · '),
  }
}

/** The opening credits — everything basic, one card at a time. */
const CARDS: Card[] = [
  { names: ['Dart Birnie'], note: 'Software engineer & developer' },
  job(0),
  job(1),
  { role: 'founder and web designer', names: ['Designs By Dart'], note: 'Since 2022 · Alton, NH' },
  job(2),
  { role: 'b.s. in computer science', names: ['University of New Hampshire'], note: "May 2025 · Dean's List" },
  {
    role: 'approved web design contractor',
    names: [{ text: 'NH SBDC', href: 'https://www.nhsbdc.org/' }, 'and', { text: 'GRDC', href: 'https://graftonrdc.org/' }],
  },
  { role: 'based in', names: ['Alton, New Hampshire'] },
]

/** Screens of scroll: open space at first, then each card, then a beat before About. */
const OPEN = 0.9
const CARD_LEN = 0.8
const OUT = 0.4
export const OPENING_LEN = OPEN + CARDS.length * CARD_LEN + OUT

/**
 * The opening credits, centered under the title the way the film's sit under ALIEN: the page opens
 * on empty space, then each card dissolves in and out in its own stretch of the scroll.
 */
export default function Hero({ still = false }: { still?: boolean }) {
  if (still) {
    return (
      <div className="space-y-[14vh] px-[6vw] pt-[16vh] pb-[6vh]">
        <h1 className="sr-only">Dart Birnie — software engineer and developer</h1>
        {CARDS.map((c, i) => (
          <Credit key={i} role={c.role} names={c.names} note={c.note} />
        ))}
      </div>
    )
  }

  return (
    <div className="h-full">
      <h1 className="sr-only">Dart Birnie — software engineer and developer</h1>
      {CARDS.map((c, i) => (
        <div key={i} data-card className="absolute inset-x-[6vw] top-[58%] -translate-y-1/2">
          <Credit role={c.role} names={c.names} note={c.note} />
        </div>
      ))}
      <div data-hint className="scene-label absolute inset-x-0 bottom-8 text-center text-[10px] text-ink-faint">
        Scroll
      </div>
    </div>
  )
}

export function buildHero(tl: Timeline, root: Element, start: number) {
  root.querySelectorAll('[data-card]').forEach((card, i) => {
    pass(tl, card, start + OPEN + i * CARD_LEN, CARD_LEN, { drift: 0.006, enter: 0.3, exit: 0.3 })
  })
  tl.to(root.querySelector('[data-hint]'), { autoAlpha: 0, duration: 0.25 }, start)
}
