import { useRef } from 'react'
import { motion, useScroll, useSpring, useTransform } from 'framer-motion'
import Logo3D, { LOGO_ASPECT } from '@/components/Logo3D'
import { ArrowUpRight } from '@/components/icons'
import { goToChapter } from '@/components/chapters'
import { useMotionOK } from '@/lib/motion'

const STAGE_W = 1100
const STAGE_H = STAGE_W / LOGO_ASPECT.db

const link =
  'group inline-flex items-center gap-1.5 font-mono text-[11px] tracking-[0.12em] text-ink uppercase transition-colors hover:text-accent sm:text-xs'

/**
 * The opening screen: the 3D DB mark as large as the screen allows, framed by a rule and a row of
 * links along the bottom edge. It doesn't pin — the first scroll goes straight into the career
 * chapter — but on the way out the mark lags behind the page and fades.
 */
export default function Hero() {
  const motionOK = useMotionOK()
  const ref = useRef<HTMLElement>(null)

  // 0 while the hero fills the screen, 1 once it has scrolled fully off the top.
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const p = useSpring(scrollYProgress, { stiffness: 140, damping: 28, mass: 0.4 })
  const logoY = useTransform(p, [0, 1], ['0vh', '26vh'])
  const logoScale = useTransform(p, [0, 1], [1, 0.86])
  const logoOpacity = useTransform(p, [0.15, 0.75], [1, 0])

  return (
    <section ref={ref} className="relative flex h-[100svh] flex-col px-[4vw] pt-20 pb-5 sm:pb-7">
      {/* The name isn't shown here, but the page still needs a top-level heading for screen
          readers and search engines. */}
      <h1 className="sr-only">Dartagnan Birnie — software engineer and web designer</h1>

      <div className="flex min-h-0 flex-1 items-center justify-center">
        <motion.div style={motionOK ? { y: logoY, scale: logoScale, opacity: logoOpacity } : undefined}>
          {/* As wide as fits — capped by height too, so it never crowds the bottom rule. */}
          <Logo3D
            variant="db"
            width={STAGE_W}
            height={STAGE_H}
            cssWidth={`min(88vw, ${STAGE_W}px, calc((100svh - 220px) * ${LOGO_ASPECT.db.toFixed(3)}))`}
            interactionRef={ref}
          />
        </motion.div>
      </div>

      <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-3 border-t border-ink pt-4">
        <nav aria-label="Elsewhere" className="flex flex-wrap gap-x-6 gap-y-2">
          <button type="button" className={link} onClick={() => goToChapter('clients')}>
            Client work
          </button>
          <button type="button" className={link} onClick={() => goToChapter('projects')}>
            Projects
          </button>
          <a href="https://github.com/GetBirned" target="_blank" rel="noreferrer" className={link}>
            GitHub <ArrowUpRight size={10} />
          </a>
          <a href="https://www.linkedin.com/in/dartagnan-birnie/" target="_blank" rel="noreferrer" className={link}>
            LinkedIn <ArrowUpRight size={10} />
          </a>
        </nav>
        <button type="button" onClick={() => goToChapter('career')} className={`${link} text-ink-faint`}>
          Scroll <span className="scroll-bounce inline-block">↓</span>
        </button>
      </div>
    </section>
  )
}
