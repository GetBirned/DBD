import { motion } from 'framer-motion'
import { EASE, useMotionOK } from '@/lib/motion'

/**
 * Numbered section opener: a mono index line, then a large title whose words rise out of a clip
 * mask as it scrolls in. Wrap a word in asterisks — "Things I've *built*." — to set it in the
 * italic serif accent.
 */
export default function ChapterHeading({
  index,
  eyebrow,
  title,
  kicker,
  className = 'mb-12 sm:mb-16',
}: {
  index: string
  eyebrow: string
  title: string
  kicker?: string
  className?: string
}) {
  const motionOK = useMotionOK()
  const words = title.split(' ')

  return (
    <motion.header
      initial={motionOK ? 'hidden' : false}
      whileInView="shown"
      viewport={{ once: true, margin: '-12% 0px' }}
      className={className}
    >
      <div className="flex items-center gap-4 font-mono text-xs tracking-[0.2em] text-ink-faint uppercase">
        <span className="text-ink">{index}</span>
        <motion.span
          variants={{ hidden: { scaleX: 0 }, shown: { scaleX: 1 } }}
          transition={{ duration: 0.9, ease: EASE }}
          className="h-px w-14 origin-left bg-line"
        />
        {eyebrow}
      </div>

      <h2 className="mt-5 font-display text-[clamp(42px,7.2vw,104px)] leading-[0.98] font-extrabold tracking-[-0.045em] text-ink">
        {words.map((raw, i) => {
          const accent = /^\*.+\*[.,!?]?$/.test(raw)
          const word = accent ? raw.replace(/\*/g, '') : raw
          return (
            // Each word sits in its own clip so it can slide up from below its baseline.
            <span key={i} className="inline-block overflow-hidden pb-[0.1em] align-bottom">
              <motion.span
                className={`inline-block ${accent ? 'accent grad-text pr-[0.06em] text-[1.08em]' : ''}`}
                variants={{ hidden: { y: '110%' }, shown: { y: '0%' } }}
                transition={{ duration: 0.85, ease: EASE, delay: 0.08 + i * 0.07 }}
              >
                {word}
              </motion.span>
              {i < words.length - 1 && ' '}
            </span>
          )
        })}
      </h2>

      {kicker && (
        <motion.p
          variants={{ hidden: { opacity: 0, y: 14 }, shown: { opacity: 1, y: 0 } }}
          transition={{ duration: 0.7, ease: EASE, delay: 0.25 + words.length * 0.07 }}
          className="mt-6 max-w-[580px] text-[17px] leading-relaxed text-ink-dim"
        >
          {kicker}
        </motion.p>
      )}
    </motion.header>
  )
}
