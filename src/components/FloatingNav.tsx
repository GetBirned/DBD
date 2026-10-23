import { useState } from 'react'
import { AnimatePresence, motion, useScroll, useSpring } from 'framer-motion'
import { GitHubIcon, LinkedInIcon } from './icons'
import { CHAPTER_LINKS, goToChapter, useChapter, type ChapterId } from './chapters'
import { EASE } from '@/lib/motion'

const GITHUB = 'https://github.com/GetBirned'
const LINKEDIN = 'https://www.linkedin.com/in/dartagnan-birnie/'

/**
 * Site nav: a slim, see-through bar across the top, kept out of the opening frame — it appears once
 * the title has gone. Desktop lists every chapter, underlining whichever one you're in; phones show
 * that chapter's name and a menu for the rest. Each one jumps to its point in the journey. Its
 * bottom edge doubles as a progress line.
 */
export default function FloatingNav() {
  const { current } = useChapter()
  const { scrollYProgress } = useScroll()
  const [menu, setMenu] = useState(false)
  const bar = useSpring(scrollYProgress, { stiffness: 220, damping: 40 })
  const shown = current !== 'top'
  // Closing the menu when the nav hides — adjusted during render rather than in an effect.
  if (!shown && menu) setMenu(false)

  // No playClick() here: these are <button>s, and ClickSound already plays for every button.
  const jump = (id: ChapterId) => {
    setMenu(false)
    goToChapter(id)
  }
  const currentLabel = CHAPTER_LINKS.find((c) => c.id === current)?.label

  return (
    <AnimatePresence>
      {shown && (
        <motion.nav
          aria-label="Site"
          initial={{ y: '-100%' }}
          animate={{ y: 0 }}
          exit={{ y: '-100%' }}
          transition={{ duration: 0.4, ease: EASE }}
          className="fixed inset-x-0 top-0 z-[990] border-b border-line bg-paper/75 backdrop-blur-md"
        >
          <div className="flex h-14 items-center gap-4 px-[4vw]">
            <button type="button" onClick={() => jump('top')} aria-label="Back to top" className="flex h-10 items-center">
              <img src="/logos/DB_black.svg" alt="" className="h-[18px] w-auto opacity-90 invert" />
            </button>

            {/* Desktop: every chapter. */}
            <div className="ml-6 hidden flex-1 items-center gap-1 lg:flex">
              {CHAPTER_LINKS.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => jump(c.id)}
                  aria-current={current === c.id ? 'true' : undefined}
                  className={`relative px-3 py-2 font-mono text-[12px] tracking-[0.1em] uppercase transition-colors ${current === c.id ? 'text-ink' : 'text-ink-faint hover:text-ink'}`}
                >
                  {c.label}
                  {current === c.id && (
                    <motion.span
                      layoutId="nav-underline"
                      transition={{ type: 'spring', stiffness: 420, damping: 36 }}
                      className="absolute inset-x-3 -bottom-px h-px bg-ink"
                    />
                  )}
                </button>
              ))}
            </div>

            {/* Phones: the chapter you're in, swapping as you scroll. */}
            <div className="relative h-10 flex-1 overflow-hidden lg:hidden">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={currentLabel ?? 'home'}
                  initial={{ y: 18, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -18, opacity: 0 }}
                  transition={{ duration: 0.3, ease: EASE }}
                  className="absolute inset-0 flex items-center font-mono text-[11px] tracking-[0.12em] text-ink uppercase"
                >
                  {currentLabel ?? 'Home'}
                </motion.span>
              </AnimatePresence>
            </div>

            <div className="flex items-center gap-1">
              <a href={GITHUB} target="_blank" rel="noreferrer" aria-label="GitHub" className="hidden h-10 w-10 items-center justify-center text-ink-dim transition-colors hover:text-ink lg:flex">
                <GitHubIcon size={17} />
              </a>
              <a href={LINKEDIN} target="_blank" rel="noreferrer" aria-label="LinkedIn" className="mr-2 hidden h-10 w-10 items-center justify-center text-ink-dim transition-colors hover:text-ink lg:flex">
                <LinkedInIcon size={16} />
              </a>
              <button
                type="button"
                onClick={() => setMenu((m) => !m)}
                aria-expanded={menu}
                aria-label={menu ? 'Close menu' : 'Open menu'}
                className="mr-1 flex h-10 w-10 flex-col items-center justify-center gap-[5px] lg:hidden"
              >
                <span className={`h-[2px] w-5 bg-ink transition-transform duration-300 ${menu ? 'translate-y-[3.5px] rotate-45' : ''}`} />
                <span className={`h-[2px] w-5 bg-ink transition-transform duration-300 ${menu ? '-translate-y-[3.5px] -rotate-45' : ''}`} />
              </button>
              <a
                href="/resume.pdf"
                download="Dartagnan_Birnie_Resume.pdf"
                className="border border-line px-4 py-2.5 font-mono text-[11px] tracking-[0.1em] text-ink uppercase transition-colors hover:border-ink"
              >
                Résumé
              </a>
            </div>
          </div>

          <motion.div aria-hidden style={{ scaleX: bar }} className="absolute inset-x-0 -bottom-px h-px origin-left bg-ink/70" />

          <AnimatePresence>
            {menu && (
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: 'auto' }}
                exit={{ height: 0 }}
                transition={{ duration: 0.35, ease: EASE }}
                className="overflow-hidden border-t border-line lg:hidden"
              >
                <div className="px-[4vw] py-3">
                  {CHAPTER_LINKS.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => jump(c.id)}
                      className={`scene-label block w-full py-3 text-left text-[14px] ${current === c.id ? 'text-ink' : 'text-ink-faint'}`}
                    >
                      {c.label}
                    </button>
                  ))}
                  <div className="mt-3 flex gap-6 border-t border-line pt-4 pb-2 font-mono text-[11px] tracking-[0.1em] uppercase">
                    <a href={GITHUB} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2">
                      <GitHubIcon size={14} /> GitHub
                    </a>
                    <a href={LINKEDIN} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2">
                      <LinkedInIcon size={13} /> LinkedIn
                    </a>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.nav>
      )}
    </AnimatePresence>
  )
}
