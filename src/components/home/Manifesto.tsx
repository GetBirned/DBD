import { useRef, type ReactNode } from 'react'
import { motion, useScroll, useSpring, useTransform, type MotionValue } from 'framer-motion'
import { companies } from '@/data/companies'
import { useMotionOK } from '@/lib/motion'

/** A word, or an inline brand chip, that brightens as its slice of the scroll is reached. */
type Token = { text: string; accent?: boolean } | { chip: ReactNode }

const chip = (children: ReactNode): Token => ({
  chip: (
    <span className="mx-[0.08em] inline-flex h-[0.95em] translate-y-[0.12em] items-center gap-[0.22em] rounded-full border border-line bg-white px-[0.32em] align-baseline shadow-[0_6px_18px_-10px_oklch(0.3_0.08_280_/_0.5)]">
      {children}
    </span>
  ),
})

// `*word*` marks a word for the italic serif accent.
const words = (s: string): Token[] =>
  s.split(' ').map((w) => (/^\*.+\*[.,]?$/.test(w) ? { text: w.replace(/\*/g, ''), accent: true } : { text: w }))

const TOKENS: Token[] = [
  ...words('I lead enterprise software implementations at'),
  chip(<img src="/logos/company_logos/trimble.png" alt="" className="h-[0.62em] w-auto" />),
  ...words(`Trimble, I've put ${companies.length} local businesses *online* through`),
  chip(<img src="/logos/DBD.svg" alt="" className="h-[0.5em] w-auto" />),
  ...words('Designs By Dart, and off the clock I build'),
  chip(<img src="/logos/codeSymbol.webp" alt="" className="h-[0.58em] w-auto" />),
  ...words('games, tools, and apps just for the *fun* of it.'),
]

function Piece({ token, range, progress }: { token: Token; range: [number, number]; progress: MotionValue<number> }) {
  const opacity = useTransform(progress, range, [0.14, 1])
  // Chips get a small pop as they're reached, so the brand marks register as more than text.
  const scale = useTransform(progress, range, 'chip' in token ? [0.8, 1] : [1, 1])
  return (
    <motion.span style={{ opacity, scale }} className={`inline-block ${'text' in token && token.accent ? 'accent grad-text pr-[0.05em] text-[1.1em]' : ''}`}>
      {'text' in token ? token.text : token.chip}
    </motion.span>
  )
}

/**
 * A one-sentence introduction set large, lighting up word by word as it scrolls through the
 * middle of the screen — the "about me" without a paragraph of copy.
 */
export default function Manifesto() {
  const motionOK = useMotionOK()
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.8', 'end 0.6'] })
  const smooth = useSpring(scrollYProgress, { stiffness: 160, damping: 30, mass: 0.4 })
  const n = TOKENS.length

  return (
    <section ref={ref} className="relative px-6 py-[16vh] sm:px-12">
      <div className="mx-auto mb-8 max-w-[1120px] font-mono text-xs tracking-[0.2em] text-ink-faint uppercase">
        Hi, I'm Dart —
      </div>
      <p
        className="mx-auto max-w-[1120px] font-display text-[clamp(30px,5vw,68px)] leading-[1.18] font-bold tracking-[-0.03em] text-ink"
        // Chips are decorative — each is followed by the name in plain text — so leave them out
        // of what a screen reader hears, or it'd say "Trimble Trimble".
        aria-label={TOKENS.flatMap((t) => ('text' in t ? [t.text] : [])).join(' ')}
      >
        {TOKENS.map((t, i) => (
          <span key={i} aria-hidden>
            {motionOK ? (
              <Piece token={t} range={[i / n, (i + 1) / n]} progress={smooth} />
            ) : (
              <span className={`inline-block ${'text' in t && t.accent ? 'accent grad-text pr-[0.05em] text-[1.1em]' : ''}`}>
                {'text' in t ? t.text : t.chip}
              </span>
            )}{' '}
          </span>
        ))}
      </p>
    </section>
  )
}
