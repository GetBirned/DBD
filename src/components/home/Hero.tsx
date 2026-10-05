import { useRef } from 'react'
import { motion, useScroll, useSpring, useTransform } from 'framer-motion'
import Logo3D, { LOGO_ASPECT, LogoIcon } from '@/components/Logo3D'
import { ChevronDown } from '@/components/icons'
import { goToChapter } from '@/components/chapters'
import { useMotionOK } from '@/lib/motion'

const STAGE_W = 640
const STAGE_H = STAGE_W / LOGO_ASPECT.db

const iconLink =
  'group relative flex items-center justify-center transition-transform duration-250 ease-out hover:-translate-y-0.5'
const iconGlow =
  'absolute -inset-3 -z-10 rounded-full bg-gradient-to-br from-grad-a to-grad-b opacity-0 blur-lg transition-opacity duration-300 group-hover:opacity-45'

/**
 * The opening screen: the 3D DB mark with the site's links beneath it. It doesn't pin — the first
 * scroll goes straight into the career chapter — but on the way out the mark lags behind the page
 * and fades (a parallax exit), and the links hand off to the floating nav.
 */
export default function Hero() {
  const motionOK = useMotionOK()
  const ref = useRef<HTMLElement>(null)

  // 0 while the hero fills the screen, 1 once it has scrolled fully off the top.
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const p = useSpring(scrollYProgress, { stiffness: 140, damping: 28, mass: 0.4 })

  const logoY = useTransform(p, [0, 1], ['0vh', '30vh'])
  const logoScale = useTransform(p, [0, 1], [1, 0.82])
  const logoOpacity = useTransform(p, [0.1, 0.7], [1, 0])
  // Gone by the time the floating nav slides in (12% of a screen of scroll), so they swap cleanly.
  const navOpacity = useTransform(p, [0, 0.12], [1, 0])
  const navY = useTransform(p, [0, 0.12], [0, 20])
  const cueOpacity = useTransform(p, [0, 0.05], [1, 0])
  const glowA = useTransform(p, [0, 1], ['0%', '-14%'])
  const glowB = useTransform(p, [0, 1], ['0%', '16%'])
  const glowRotate = useTransform(p, [0, 1], [0, 40])

  return (
    <section
      ref={ref}
      className="relative grid h-[100svh] place-items-center overflow-hidden [&>*]:col-start-1 [&>*]:row-start-1"
    >
      {/* The name isn't shown here, but the page still needs a top-level heading for screen
          readers and search engines. */}
      <h1 className="sr-only">Dartagnan Birnie — software engineer and web designer</h1>

      {/* Two brand glows drifting apart on the way out. `ellipse closest-side` keeps each fully
          transparent by the section edge, so overflow-hidden never clips a visible seam. */}
      <motion.div
        aria-hidden
        className="absolute inset-0"
        style={{
          ...(motionOK ? { x: glowA, rotate: glowRotate } : {}),
          background:
            'radial-gradient(ellipse closest-side at 38% 42%, oklch(0.6 0.17 255 / .42) 0%, oklch(0.6 0.17 255 / .14) 50%, transparent 100%)',
        }}
      />
      <motion.div
        aria-hidden
        className="absolute inset-0"
        style={{
          ...(motionOK ? { x: glowB } : {}),
          background:
            'radial-gradient(ellipse closest-side at 62% 58%, oklch(0.55 0.21 305 / .38) 0%, oklch(0.55 0.21 305 / .12) 50%, transparent 100%)',
        }}
      />

      <div className="relative z-10 flex flex-col items-center">
        <motion.div style={motionOK ? { y: logoY, scale: logoScale, opacity: logoOpacity } : undefined}>
          <Logo3D variant="db" width={STAGE_W} height={STAGE_H} interactionRef={ref} />
        </motion.div>

        <motion.div style={motionOK ? { opacity: navOpacity, y: navY } : undefined} className="mt-10 flex items-center gap-7">
          <button type="button" aria-label="Designs By Dart — client work" className={iconLink} onClick={() => goToChapter('clients')}>
            <span className={iconGlow} />
            <LogoIcon variant="dbd" height={22} className="invert" />
          </button>
          <button type="button" aria-label="Projects" className={iconLink} onClick={() => goToChapter('projects')}>
            <span className={iconGlow} />
            <LogoIcon variant="code" height={22} className="invert" />
          </button>
          <span className="h-5 w-px bg-white/20" />
          <a href="https://github.com/GetBirned" target="_blank" rel="noreferrer" aria-label="GitHub" className={iconLink}>
            <span className={iconGlow} />
            <img src="/logos/github.png" alt="" className="h-9 w-9 invert" />
          </a>
          <a
            href="https://www.linkedin.com/in/dartagnan-birnie/"
            target="_blank"
            rel="noreferrer"
            aria-label="LinkedIn"
            className={iconLink}
          >
            <span className={iconGlow} />
            <img src="/logos/linkedIn.png" alt="" className="h-9 w-9 invert" />
          </a>
        </motion.div>
      </div>

      <motion.button
        type="button"
        onClick={() => goToChapter('career')}
        aria-label="Scroll to career"
        style={motionOK ? { opacity: cueOpacity } : undefined}
        className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2 font-mono text-[10px] tracking-[0.2em] text-ink-faint uppercase transition-colors hover:text-ink"
      >
        Scroll
        <ChevronDown className="scroll-bounce block" />
      </motion.button>
    </section>
  )
}
