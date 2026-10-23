import { createContext, useContext, useState, type ReactNode } from 'react'
import { motion } from 'framer-motion'

export type ChapterId = 'top' | 'about' | 'experience' | 'clients' | 'projects' | 'skills' | 'life' | 'contact'

export const CHAPTER_LINKS: { id: ChapterId; label: string }[] = [
  { id: 'about', label: 'About' },
  { id: 'experience', label: 'Experience' },
  { id: 'clients', label: 'Clients' },
  { id: 'projects', label: 'Projects' },
  { id: 'skills', label: 'Skills' },
  { id: 'life', label: 'Off the clock' },
  { id: 'contact', label: 'Contact' },
]

const ChapterContext = createContext<{ current: ChapterId; setCurrent: (id: ChapterId) => void }>({
  current: 'top',
  setCurrent: () => {},
})

export function ChapterProvider({ children }: { children: ReactNode }) {
  const [current, setCurrent] = useState<ChapterId>('top')
  return <ChapterContext.Provider value={{ current, setCurrent }}>{children}</ChapterContext.Provider>
}

export const useChapter = () => useContext(ChapterContext)

/**
 * A stretch of the plain (reduced-motion) page that counts as one chapter: whichever is crossing
 * the middle of the screen becomes current. The cinematic page sets the chapter from its timeline
 * instead.
 */
export function Chapter({ id, children }: { id: ChapterId; children: ReactNode }) {
  const { setCurrent } = useChapter()
  return (
    <motion.div id={id} viewport={{ margin: '-48% 0px -48% 0px' }} onViewportEnter={() => setCurrent(id)}>
      {children}
    </motion.div>
  )
}

type Jump = (id: ChapterId, instant: boolean) => boolean
let jump: Jump | null = null

/** The cinematic page registers how to reach a chapter: a point on its timeline, not an element. */
export function setChapterJump(fn: Jump | null) {
  jump = fn
}

/** Scrolls to a chapter (or the very top). */
export function goToChapter(id: ChapterId, instant = false) {
  if (jump?.(id, instant)) return
  const behavior = instant ? 'instant' : 'smooth'
  if (id === 'top') {
    window.scrollTo({ top: 0, behavior })
    return
  }
  document.getElementById(id)?.scrollIntoView({ behavior, block: 'start' })
}
