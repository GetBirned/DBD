import { useState } from 'react'
import { AnimatePresence, motion, useMotionValueEvent, useScroll, useSpring } from 'framer-motion'
import { LogoIcon } from './Logo3D'
import { GitHubIcon, LinkedInIcon } from './icons'
import { CHAPTER_LINKS, goToChapter, useChapter, type ChapterId } from './chapters'
import { EASE, useMotionOK } from '@/lib/motion'

const GITHUB = 'https://github.com/GetBirned'
const LINKEDIN = 'https://www.linkedin.com/in/dartagnan-birnie/'

function ResumeButton() {
  return (
    <a
      href="/resume.pdf"
      download="Dartagnan_Birnie_Resume.pdf"
      className="brand-gradient rounded-full px-4 py-2.5 font-mono text-[11px] tracking-wide text-white uppercase transition-transform hover:-translate-y-px"
    >
      Résumé
    </a>
  )
}

/**
 * Floating site nav, shown once the hero's own icon row has gone. Desktop: every chapter, with a
 * highlight that slides to whichever one you're reading. Phones: the current chapter's name, and
 * a menu sheet for the rest. A scroll-progress line runs along the top edge.
 */
export default function FloatingNav() {
  const { current } = useChapter()
  const motionOK = useMotionOK()
  const { scrollY, scrollYProgress } = useScroll()
  // With reduced motion the hero is shown already settled, and that state has its icon row
  // faded out — so the nav is up from the start rather than waiting for a scroll.
  const [shown, setShown] = useState(!motionOK)
  const [menu, setMenu] = useState(false)
  const bar = useSpring(scrollYProgress, { stiffness: 220, damping: 40 })

  useMotionValueEvent(scrollY, 'change', (y) => {
    const show = !motionOK || y > window.innerHeight * 0.12
    setShown(show)
    if (!show) setMenu(false)
  })

  // No playClick() here: these are <button>s, and ClickSound already plays for every button.
  const jump = (id: ChapterId) => {
    setMenu(false)
    goToChapter(id)
  }
  const currentLabel = CHAPTER_LINKS.find((c) => c.id === current)?.label

  return (
    <>
      <motion.div
        aria-hidden
        style={{ scaleX: bar }}
        className="fixed inset-x-0 top-0 z-[990] h-[3px] origin-left bg-gradient-to-r from-grad-a via-grad-b to-grad-c"
      />
      <AnimatePresence>
        {shown && (
          <motion.nav
            aria-label="Site"
            initial={{ y: -80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -80, opacity: 0 }}
            transition={{ duration: 0.45, ease: EASE }}
            className="fixed inset-x-3 top-3 z-[990] mx-auto w-auto max-w-fit sm:top-4"
          >
            <div className="flex items-center gap-1 rounded-full bg-[oklch(0.17_0.02_282/0.72)] p-1.5 shadow-[0_16px_40px_-16px_rgba(0,0,0,0.8)] ring-1 ring-white/10 backdrop-blur-xl">
              <button
                type="button"
                onClick={() => jump('top')}
                aria-label="Back to top"
                className="flex h-9 items-center rounded-full px-3 transition-colors hover:bg-white/10"
              >
                <LogoIcon variant="db" height={16} className="invert" />
              </button>

              {/* Desktop: every chapter. */}
              <div className="hidden items-center lg:flex">
                {CHAPTER_LINKS.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => jump(c.id)}
                    aria-current={current === c.id ? 'true' : undefined}
                    className={`relative rounded-full px-3.5 py-2 text-[13px] font-semibold transition-colors ${current === c.id ? 'text-white' : 'text-white/55 hover:text-white'}`}
                  >
                    {current === c.id && (
                      <motion.span
                        layoutId="nav-active"
                        transition={{ type: 'spring', stiffness: 380, damping: 34 }}
                        className="absolute inset-0 rounded-full bg-white/[0.12] ring-1 ring-white/15"
                      />
                    )}
                    <span className="relative">{c.label}</span>
                  </button>
                ))}
                <span className="mx-1.5 h-5 w-px bg-white/15" />
                <a href={GITHUB} target="_blank" rel="noreferrer" aria-label="GitHub" className="flex h-9 w-9 items-center justify-center rounded-full text-white/60 transition-colors hover:bg-white/10 hover:text-white">
                  <GitHubIcon size={17} />
                </a>
                <a href={LINKEDIN} target="_blank" rel="noreferrer" aria-label="LinkedIn" className="mr-1 flex h-9 w-9 items-center justify-center rounded-full text-white/60 transition-colors hover:bg-white/10 hover:text-white">
                  <LinkedInIcon size={16} />
                </a>
              </div>

              {/* Phones: the chapter you're in, swapping as you scroll. */}
              <div className="relative h-9 w-[124px] overflow-hidden lg:hidden">
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.span
                    key={currentLabel ?? 'intro'}
                    initial={{ y: 18, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -18, opacity: 0 }}
                    transition={{ duration: 0.3, ease: EASE }}
                    className="absolute inset-0 flex items-center justify-center font-mono text-[11px] tracking-[0.14em] text-white/75 uppercase"
                  >
                    {currentLabel ?? 'Intro'}
                  </motion.span>
                </AnimatePresence>
              </div>
              <button
                type="button"
                onClick={() => setMenu((m) => !m)}
                aria-expanded={menu}
                aria-label={menu ? 'Close menu' : 'Open menu'}
                className="flex h-9 w-9 flex-col items-center justify-center gap-[5px] rounded-full transition-colors hover:bg-white/10 lg:hidden"
              >
                <span className={`h-[1.5px] w-4 bg-white transition-transform duration-300 ${menu ? 'translate-y-[3.25px] rotate-45' : ''}`} />
                <span className={`h-[1.5px] w-4 bg-white transition-transform duration-300 ${menu ? '-translate-y-[3.25px] -rotate-45' : ''}`} />
              </button>

              <ResumeButton />
            </div>

            <AnimatePresence>
              {menu && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.97 }}
                  transition={{ duration: 0.25, ease: EASE }}
                  className="mt-2 origin-top rounded-3xl bg-[oklch(0.17_0.02_282/0.94)] p-3 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.9)] ring-1 ring-white/10 backdrop-blur-xl lg:hidden"
                >
                  {CHAPTER_LINKS.map((c, i) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => jump(c.id)}
                      className={`flex w-full items-center justify-between rounded-2xl px-4 py-3.5 text-left font-display text-lg font-bold transition-colors ${current === c.id ? 'bg-white/10 text-white' : 'text-white/70 hover:bg-white/5'}`}
                    >
                      {c.label}
                      <span className="font-mono text-[11px] text-white/35">0{i + 1}</span>
                    </button>
                  ))}
                  <div className="mt-2 flex gap-2 border-t border-white/10 px-1 pt-3">
                    <a href={GITHUB} target="_blank" rel="noreferrer" className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-white/5 py-3 font-mono text-[11px] text-white/75 uppercase">
                      <GitHubIcon size={14} /> GitHub
                    </a>
                    <a href={LINKEDIN} target="_blank" rel="noreferrer" className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-white/5 py-3 font-mono text-[11px] text-white/75 uppercase">
                      <LinkedInIcon size={13} /> LinkedIn
                    </a>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.nav>
        )}
      </AnimatePresence>
    </>
  )
}
