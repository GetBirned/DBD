import { useRef } from 'react'
import {
  motion,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from 'framer-motion'
import Logo3D, { LOGO_ASPECT, LogoIcon } from '@/components/Logo3D'
import { ChevronDown } from '@/components/icons'
import { useMotionOK } from '@/lib/motion'
import { goToChapter } from '@/components/chapters'

const STAGE_W = 640
const STAGE_H = STAGE_W / LOGO_ASPECT.db

const ROLES = ['Software Engineer', 'Web Designer', 'Game & App Builder']

/**
 * A run of letters that unfolds out of an initial. `0fr → 1fr` on a single-track inline grid
 * interpolates the track between zero and the text's natural width, so it opens at exactly the
 * right size without measuring anything. The inner span needs overflow-hidden: that's what lets
 * a grid item's minimum width drop to 0 instead of its min-content.
 */
function Unfold({ text, progress }: { text: string; progress: MotionValue<number> }) {
  const cols = useTransform(progress, [0, 1], ['0fr', '1fr'])
  const opacity = useTransform(progress, [0.15, 0.85], [0, 1])
  return (
    <motion.span className="inline-grid" style={{ gridTemplateColumns: cols }}>
      <motion.span className="overflow-hidden whitespace-nowrap" style={{ opacity }}>
        {text}
      </motion.span>
    </motion.span>
  )
}

function Role({ label, index, progress }: { label: string; index: number; progress: MotionValue<number> }) {
  const start = 0.6 + index * 0.06
  const opacity = useTransform(progress, [start, start + 0.1], [0, 1])
  const y = useTransform(progress, [start, start + 0.12], [18, 0])
  return (
    <motion.li
      style={{ opacity, y }}
      className="rounded-full bg-white/[0.06] px-4 py-2 font-mono text-[11px] tracking-[0.12em] text-ink-dim uppercase ring-1 ring-white/15 backdrop-blur-sm sm:text-xs"
    >
      {label}
    </motion.li>
  )
}

const iconLink =
  'group relative flex items-center justify-center transition-transform duration-250 ease-out hover:-translate-y-0.5'
const iconGlow =
  'absolute -inset-3 -z-10 rounded-full bg-gradient-to-br from-grad-a to-grad-b opacity-0 blur-lg transition-opacity duration-300 group-hover:opacity-45'

/**
 * The home hero, pinned for a stretch of scroll while it transforms: the 3D DB mark shrinks into a
 * monogram, and the initials beneath it unfold into the full name — DB is Dartagnan Birnie.
 */
export default function HeroScroll() {
  const motionOK = useMotionOK()
  const runwayRef = useRef<HTMLElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({ target: runwayRef, offset: ['start start', 'end end'] })
  // A spring between the scrollbar and the choreography, so wheel ticks glide instead of stepping.
  const smooth = useSpring(scrollYProgress, { stiffness: 140, damping: 28, mass: 0.4 })
  // Reduced motion: hold everything at its finished state rather than scrubbing it.
  const settled = useMotionValue(1)
  const p = motionOK ? smooth : settled

  // The logo climbs a little faster than it shrinks, so it's out of the name's way before the
  // initials fade in beneath it.
  const logoScale = useTransform(p, [0, 0.34], [1, 0.34])
  const logoY = useTransform(p, [0, 0.28], ['0vh', '-25vh'])
  const navOpacity = useTransform(p, [0, 0.12], [1, 0])
  const navY = useTransform(p, [0, 0.12], [0, 24])
  const cueOpacity = useTransform(p, [0, 0.05], [1, 0])
  const nameOpacity = useTransform(p, [0.22, 0.32], [0, 1])
  const nameY = useTransform(p, [0.22, 0.38], ['9vh', '4vh'])
  const unfold = useTransform(p, [0.32, 0.64], [0, 1])
  const subOpacity = useTransform(p, [0.78, 0.9], [0, 1])
  const glowA = useTransform(p, [0, 1], ['0%', '-14%'])
  const glowB = useTransform(p, [0, 1], ['0%', '16%'])
  const glowRotate = useTransform(p, [0, 1], [0, 40])

  /** Jumps to the end of the pin, so the click itself plays the whole transformation. */
  const scrollToEnd = () => {
    const el = runwayRef.current
    if (!el) return
    window.scrollTo({ top: el.offsetTop + el.offsetHeight - window.innerHeight, behavior: 'smooth' })
  }

  return (
    <section ref={runwayRef} className={motionOK ? 'relative h-[250vh]' : 'relative'}>
      <div
        ref={stageRef}
        className="sticky top-0 grid h-[100svh] place-items-center overflow-hidden [&>*]:col-start-1 [&>*]:row-start-1"
      >
        {/* Two brand glows drifting apart as the stage transforms. `ellipse closest-side` keeps
            each one fully transparent by the stage edge, so overflow-hidden never clips a seam. */}
        <motion.div
          aria-hidden
          className="absolute inset-0"
          style={{
            x: glowA,
            rotate: glowRotate,
            background:
              'radial-gradient(ellipse closest-side at 38% 42%, oklch(0.6 0.17 255 / .42) 0%, oklch(0.6 0.17 255 / .14) 50%, transparent 100%)',
          }}
        />
        <motion.div
          aria-hidden
          className="absolute inset-0"
          style={{
            x: glowB,
            background:
              'radial-gradient(ellipse closest-side at 62% 58%, oklch(0.55 0.21 305 / .38) 0%, oklch(0.55 0.21 305 / .12) 50%, transparent 100%)',
          }}
        />

        {/* Logo and nav row share one centered column, as in the other pages' heroes, so the
            opening composition is balanced on any viewport height. Each then transforms alone. */}
        <div className="relative z-10 flex flex-col items-center">
          <motion.div style={{ scale: logoScale, y: logoY }} className="origin-center">
            <Logo3D variant="db" width={STAGE_W} height={STAGE_H} interactionRef={stageRef} />
          </motion.div>

          <motion.div
            style={{ opacity: navOpacity, y: navY }}
            className="mt-10 flex items-center gap-7"
          >
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

        <motion.div style={{ opacity: nameOpacity, y: nameY }} className="relative z-10 px-4 text-center">
          <h1 className="flex flex-col items-center font-display text-[clamp(44px,11vw,152px)] leading-[0.92] font-extrabold tracking-[-0.045em] sm:flex-row sm:gap-[0.24em]">
            <span>
              <span className="grad-text">D</span>
              <Unfold text="artagnan" progress={unfold} />
            </span>
            <span>
              <span className="grad-text">B</span>
              <Unfold text="irnie" progress={unfold} />
            </span>
          </h1>

          <ul className="mt-7 flex flex-wrap justify-center gap-2.5 sm:mt-9">
            {ROLES.map((r, i) => (
              <Role key={r} label={r} index={i} progress={p} />
            ))}
          </ul>

          <motion.p style={{ opacity: subOpacity }} className="mt-6 font-mono text-xs tracking-[0.14em] text-ink-faint uppercase">
            Alton, NH · Currently at Trimble
          </motion.p>
        </motion.div>

        {motionOK && (
          <motion.button
            type="button"
            onClick={scrollToEnd}
            aria-label="Scroll to reveal"
            style={{ opacity: cueOpacity }}
            className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2 font-mono text-[10px] tracking-[0.2em] text-ink-faint uppercase transition-colors hover:text-grad-a"
          >
            Scroll
            <ChevronDown className="scroll-bounce block" />
          </motion.button>
        )}
      </div>
    </section>
  )
}
