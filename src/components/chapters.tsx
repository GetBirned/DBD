import { createContext, useContext, useState, type ReactNode } from 'react'
import { motion } from 'framer-motion'

export type ChapterId = 'top' | 'career' | 'clients' | 'projects' | 'toolkit' | 'life'

export const CHAPTER_LINKS: { id: ChapterId; label: string }[] = [
  { id: 'career', label: 'Career' },
  { id: 'clients', label: 'Clients' },
  { id: 'projects', label: 'Projects' },
  { id: 'toolkit', label: 'Toolkit' },
  { id: 'life', label: 'Off the clock' },
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
 * A stretch of the page that counts as one chapter. Whichever chapter is crossing the middle band
 * of the screen becomes current — that's what tints the backdrop and lights up the nav.
 */
export function Chapter({ id, children }: { id: ChapterId; children: ReactNode }) {
  const { setCurrent } = useChapter()
  return (
    <motion.div
      id={id}
      viewport={{ margin: '-48% 0px -48% 0px' }}
      onViewportEnter={() => setCurrent(id)}
    >
      {children}
    </motion.div>
  )
}

/** Smooth-scrolls to a chapter (or the very top). */
export function goToChapter(id: ChapterId) {
  if (id === 'top') {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    return
  }
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
