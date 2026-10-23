import { motion } from 'framer-motion'
import { EASE, useMotionOK } from '@/lib/motion'

/**
 * Section opener: a poster-sized title in condensed caps, sized off the viewport width so it runs
 * edge to edge on any screen. Its words rise out of a clip mask as it scrolls in. Wrap a word in
 * asterisks — "Things I've *built*." — to set it in the accent color. Chapter names live only in
 * the nav (see CHAPTER_LINKS); there's deliberately no visible label above the title.
 */
export default function ChapterHeading({
  title,
  className = 'mb-[7vw] sm:mb-[5vw]',
  tone = 'ink',
  size = 'text-[clamp(52px,13.5vw,250px)] sm:text-[clamp(52px,11.5vw,250px)]',
}: {
  title: string
  className?: string
  /** `paper` for titles set on an ink band. */
  tone?: 'ink' | 'paper'
  /** Font-size classes. Defaults to full-width poster size; narrower columns pass their own. */
  size?: string
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
      <h2
        className={`display ${size} ${tone === 'paper' ? 'text-paper' : 'text-ink'}`}
      >
        {words.map((raw, i) => {
          const accent = /^\*.+\*[.,!?]?$/.test(raw)
          const word = accent ? raw.replace(/\*/g, '') : raw
          return (
            // Each word sits in its own clip so it can slide up from below its baseline.
            <span key={i} className="inline-block overflow-hidden pt-[0.04em] align-bottom">
              <motion.span
                className={`inline-block ${accent ? 'text-accent' : ''}`}
                variants={{ hidden: { y: '105%' }, shown: { y: '0%' } }}
                transition={{ duration: 0.85, ease: EASE, delay: 0.06 + i * 0.06 }}
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
