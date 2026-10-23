import { useEffect, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { CloseIcon } from '@/components/icons'
import { EASE } from '@/lib/motion'

/**
 * A card that opens over the journey — a role's details, the testimonials. Rendered into <body>
 * rather than inside the scene that opened it, because those scenes are moved by transforms, which
 * would trap a fixed overlay inside them. While it's open the page can't scroll, so the film holds
 * still behind it. Escape or a click outside closes it.
 */
export default function Popup({ open, onClose, label, children }: { open: boolean; onClose: () => void; label: string; children: ReactNode }) {
  // Read through a ref, so a parent passing a fresh arrow each render doesn't re-run the effect.
  const close = useRef(onClose)
  useEffect(() => {
    close.current = onClose
  })

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
          transition={{ duration: 0.35, ease: EASE }}
          onClick={onClose}
          className="fixed inset-0 z-[996] flex items-center justify-center bg-black/75 px-[5vw] backdrop-blur-sm"
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={label}
            initial={{ y: 14 }}
            animate={{ y: 0 }}
            exit={{ y: 8 }}
            transition={{ duration: 0.4, ease: EASE }}
            onClick={(e) => e.stopPropagation()}
            className="film relative max-h-[86svh] w-full max-w-[56rem] overflow-y-auto border border-line bg-[#060504]/95 px-[6vw] py-[7vh] sm:px-14"
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center text-ink-dim transition-colors hover:text-ink"
            >
              <CloseIcon size={18} />
            </button>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
