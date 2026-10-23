import { useEffect, useRef, useState } from 'react'
import { motion, useMotionValueEvent, useScroll, useTransform, type MotionValue } from 'framer-motion'
import Credit, { type CreditName } from './Credit'
import { experience } from '@/data/experience'
import { useMotionOK } from '@/lib/motion'

/**
 * The title, drawn as strokes in Helvetica Black's proportions (cap height 100): every stem,
 * diagonal, bar and bowl is its own shape, so the word can arrive one stroke at a time the way
 * ALIEN does. Drawn rather than typeset, so it looks the same everywhere and never waits on a font.
 */
const LETTERS: { width: number; strokes: string[] }[] = [
  {
    // D: stem, bowl
    width: 88,
    strokes: [
      'M0 0H27V100H0Z',
      'M25 0H46C72 0 88 18 88 50C88 82 72 100 46 100H25V76H43C56 76 61 67 61 50C61 33 56 24 43 24H25Z',
    ],
  },
  {
    // A: left leg, right leg, crossbar
    width: 100,
    strokes: ['M0 100L34 0H61L28 100Z', 'M100 100L66 0H39L72 100Z', 'M39 58H61L68 79H32Z'],
  },
  {
    // R: stem, bowl, leg
    width: 90,
    strokes: [
      'M0 0H27V100H0Z',
      'M25 0H52C74 0 86 12 86 30C86 48 74 60 52 60H25V38H48C55 38 59 35 59 30C59 25 55 22 48 22H25Z',
      'M46 52H74L90 100H61Z',
    ],
  },
  {
    // T: bar, stem
    width: 88,
    strokes: ['M0 0H88V24H0Z', 'M30.5 22H57.5V100H30.5Z'],
  },
]

/**
 * Which stroke arrives when, as [letter, stroke]. Uprights and diagonals first, so for a while
 * it's a row of disconnected lines — "| / | |", then "| Λ |\ |" — and the bars and bowls that make
 * it readable come last.
 */
const ORDER: [number, number][] = [
  [2, 0],
  [1, 0],
  [3, 1],
  [0, 0],
  [2, 2],
  [1, 1],
  [3, 0],
  [0, 1],
  [2, 1],
  [1, 2],
]
/** Seconds after load for each stroke in ORDER — slow at first, quickening. */
const TIMES = [1.0, 1.9, 2.7, 3.4, 4.0, 4.6, 5.1, 5.6, 6.05, 6.5]

interface Card {
  role?: string
  names: (string | CreditName)[]
  note?: string
  /** Where the credit sits on the frame (its center, as % of the stage) — the film moves its
   * credits around rather than stacking every one in the middle. Phones always center. */
  at: [number, number]
}

const job = (i: number, at: [number, number]): Card => {
  const e = experience[i]
  return {
    role: e.role.toLowerCase(),
    names: [e.company.replace(' Inc.', '')],
    note: [e.dateRange, e.badge ? 'Featured intern' : e.location.split(' · ')[0]].join(' · '),
    at,
  }
}

/** The opening credits — everything basic, one card at a time. */
const CARDS: Card[] = [
  { names: ['Dartagnan Birnie'], at: [50, 52] },
  job(0, [44, 60]),
  job(1, [57, 50]),
  { role: 'founder and web designer', names: ['Designs By Dart'], note: 'Since 2022 · Alton, NH', at: [46, 62] },
  job(2, [55, 52]),
  { role: 'b.s. in computer science', names: ['University of New Hampshire'], note: "May 2025 · Dean's List", at: [48, 58] },
  {
    role: 'approved web design contractor',
    names: [{ text: 'NH SBDC', href: 'https://www.nhsbdc.org/' }, 'and', { text: 'GRDC', href: 'https://graftonrdc.org/' }],
    at: [52, 56],
  },
  { role: 'based in', names: ['Alton, New Hampshire'], at: [50, 64] },
]

/** Screens of scroll: the opening (title alone), each card, and the fade-out at the end. */
const OPEN = 0.9
const PER = 0.85
const OUT = 0.7
const TOTAL = OPEN + CARDS.length * PER + OUT

function Letter({ index, shown }: { index: number; shown: number }) {
  const { width, strokes } = LETTERS[index]
  return (
    <svg
      viewBox={`0 0 ${width} 100`}
      style={{ aspectRatio: `${width} / 100` }}
      className="title-glyph h-[clamp(30px,4.9vw,94px)] w-auto overflow-visible"
      aria-hidden
    >
      {strokes.map((d, si) => {
        const k = ORDER.findIndex(([l, s]) => l === index && s === si)
        // Each stroke mounts when its turn comes, which is what plays its flicker-in.
        return k < shown ? <path key={si} d={d} fill="#f4f6ff" className="piece-in" /> : null
      })}
    </svg>
  )
}

/**
 * How many strokes are up. Runs on a clock from page load; scrolling on before it's finished
 * speeds the clock up, so nobody reaches the credits under half a title.
 */
function useStrokes(motionOK: boolean, progress: MotionValue<number>) {
  const [shown, setShown] = useState(motionOK ? 0 : ORDER.length)
  const hurry = useRef(false)

  useMotionValueEvent(progress, 'change', (p) => {
    if (p > (OPEN * 0.4) / TOTAL) hurry.current = true
  })

  useEffect(() => {
    if (!motionOK) return
    let clock = 0
    let last = performance.now()
    let raf = 0
    const tick = (now: number) => {
      clock += ((now - last) / 1000) * (hurry.current ? 6 : 1)
      last = now
      const count = TIMES.filter((t) => t <= clock).length
      setShown((s) => (s === count ? s : count))
      if (count < ORDER.length) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [motionOK])

  return shown
}

function SequenceCard({ card, index, progress }: { card: Card; index: number; progress: MotionValue<number> }) {
  const s = (OPEN + index * PER) / TOTAL
  const e = (OPEN + (index + 1) * PER) / TOTAL
  const span = e - s
  // A plain dissolve, as in the film: in, hold, out — and a beat of empty space between cards.
  const opacity = useTransform(progress, [s, s + span * 0.3, e - span * 0.3, e], [0, 1, 1, 0])
  return (
    <motion.div
      style={{ opacity, '--x': `${card.at[0]}%`, '--y': `${card.at[1]}%` } as never}
      className="pointer-events-none absolute top-[58%] left-1/2 w-[88vw] -translate-x-1/2 -translate-y-1/2 sm:top-[var(--y)] sm:left-[var(--x)] sm:w-max sm:max-w-[80vw] [&_a]:pointer-events-auto"
    >
      <Credit role={card.role} names={card.names} note={card.note} />
    </motion.div>
  )
}

/**
 * The opening, after the title sequence of Alien (1979): DART assembles stroke by stroke across
 * the top of the screen, and the basic facts follow as credits that dissolve in and out as you
 * scroll, over the generated sky behind the whole page. With reduced motion it's the same credits
 * as a plain list under a complete title.
 */
export default function TitleSequence() {
  const motionOK = useMotionOK()
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const shown = useStrokes(motionOK, scrollYProgress)
  const titleOpacity = useTransform(scrollYProgress, [1 - (OUT * 0.8) / TOTAL, 1], [1, 0])
  const hintOpacity = useTransform(scrollYProgress, [0, (OPEN * 0.6) / TOTAL], [1, 0])
  const done = shown === ORDER.length

  const skip = () => {
    const el = ref.current
    if (el) window.scrollTo({ top: el.offsetTop + el.offsetHeight - window.innerHeight * 0.15, behavior: 'smooth' })
  }

  const title = (
    <div className="flex w-full items-start justify-between px-[7vw]">
      {LETTERS.map((_, i) => (
        <Letter key={i} index={i} shown={shown} />
      ))}
    </div>
  )

  if (!motionOK) {
    return (
      <section id="title-sequence" className="relative pt-[15vh] pb-[10vh]">
        <h1 className="sr-only">Dartagnan Birnie — software engineer and web designer</h1>
        {title}
        <div className="mt-[18vh] space-y-[16vh] px-[6vw]">
          {CARDS.map((c, i) => (
            <Credit key={i} role={c.role} names={c.names} note={c.note} />
          ))}
        </div>
      </section>
    )
  }

  return (
    // One screen taller than the sequence, because the stage only stays pinned for the runway's
    // height minus its own — this way scroll progress maps straight onto TOTAL screens.
    <section ref={ref} id="title-sequence" className="relative" style={{ height: `${(TOTAL + 1) * 100}svh` }}>
      <h1 className="sr-only">Dartagnan Birnie — software engineer and web designer</h1>
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <motion.div style={{ opacity: titleOpacity }} className="absolute inset-x-0 top-[15vh]">
          {title}
        </motion.div>

        {CARDS.map((c, i) => (
          <SequenceCard key={i} card={c} index={i} progress={scrollYProgress} />
        ))}

        {/* Two layers on purpose: the outer fades with scroll, the inner waits for the title. */}
        <motion.div style={{ opacity: hintOpacity }} className="absolute inset-x-0 bottom-8 text-center">
          <span
            className={`font-mono text-[11px] tracking-[0.3em] text-ink-faint uppercase transition-opacity duration-[1500ms] ${done ? 'opacity-100' : 'opacity-0'}`}
          >
            scroll
          </span>
        </motion.div>

        <button
          type="button"
          onClick={skip}
          className="absolute right-[4vw] bottom-7 font-mono text-[11px] tracking-[0.2em] text-ink-faint uppercase transition-colors hover:text-ink"
        >
          skip ↓
        </button>
      </div>
    </section>
  )
}
