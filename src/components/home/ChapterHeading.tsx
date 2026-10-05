import { motion } from 'framer-motion'
import { EASE, useMotionOK } from '@/lib/motion'

/**
 * Section opener: a large title whose words rise out of a clip mask as it scrolls in. Wrap a word
 * in asterisks — "Things I've *built*." — to set it in the italic serif accent. Chapter names
 * live only in the nav (see CHAPTER_LINKS); there's deliberately no visible label above the title.
 */
export default function ChapterHeading({
  title,
  className = 'mb-12 sm:mb-16',
}: {
  title: string
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
      <h2 className="font-display text-[clamp(42px,7.2vw,104px)] leading-[0.98] font-extrabold tracking-[-0.045em] text-ink">
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
    </motion.header>
  )
}
