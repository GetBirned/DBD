import { useEffect, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import Monitor, { BarButton } from '@/components/Monitor'
import { EASE } from '@/lib/motion'
import { useCloseScreens } from '@/lib/ship'
import { terminal } from '@/lib/sound'

/**
 * A screen that opens over the journey — a role's details, the testimonials, what I'm into — set
 * as one of the ship's monitors, switching on the way a CRT does: a bright line that opens out to
 * the full picture. Rendered into <body> rather than inside the scene that opened it, because
 * those scenes are moved by transforms, which would trap a fixed overlay inside them. While it's
 * open the page can't scroll, so the film holds still behind it. Escape or a click outside closes
 * it.
 */
export default function Popup({
  open,
  onClose,
  title,
  hint = 'esc: exit',
  shortcut = true,
  children,
}: {
  open: boolean
  onClose: () => void
  /** The title bar's text, which also names the dialog. */
  title: string
  hint?: string
  /** Whether the hints mention /, the way to MU/TH/UR from any screen (not on its own). */
  shortcut?: boolean
  children: ReactNode
}) {
  // Read through a ref, so a parent passing a fresh arrow each render doesn't re-run the effect.
  const close = useRef(onClose)
  useEffect(() => {
    close.current = onClose
  })

  // / from any screen switches it off on the way to MU/TH/UR.
  useCloseScreens(() => open && close.current())

  // The screen's sounds: switching on as it opens, off as it closes.
  const wasOpen = useRef(false)
  useEffect(() => {
    if (open && !wasOpen.current) terminal.on()
    if (!open && wasOpen.current) terminal.off()
    wasOpen.current = open
  }, [open])

  useEffect(() => {
    if (!open) return
    const html = document.documentElement
    const prev = html.style.overflow
    html.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close.current()
    window.addEventListener('keydown', onKey)
    return () => {
      html.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: EASE }}
          onClick={onClose}
          className="fixed inset-0 z-[996] flex items-center justify-center bg-black/80 px-[4vw] backdrop-blur-sm"
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial={{ scaleY: 0.02, opacity: 0.6 }}
            animate={{ scaleY: 1, opacity: 1 }}
            exit={{ scaleY: 0.02, opacity: 0 }}
            transition={{ duration: 0.35, ease: EASE }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[60rem]"
          >
            <Monitor
              title={title}
              hint={shortcut ? `${hint} | /: mu/th/ur` : hint}
              className="max-h-[88svh]"
              controls={
                <BarButton label="Close" onClick={onClose}>
                  [x]
                </BarButton>
              }
            >
              {children}
            </Monitor>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
