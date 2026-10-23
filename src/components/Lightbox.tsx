import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CloseIcon } from './icons'

/** Full-screen preview for a clicked screenshot. Closes on backdrop click, the X, or Escape. */
export default function Lightbox({ src, onClose }: { src: string | null; onClose: () => void }) {
  useEffect(() => {
    if (!src) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [src, onClose])

  return (
    <AnimatePresence>
      {src && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          role="dialog"
          aria-modal="true"
          aria-label="Enlarged media"
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/95 p-6"
          onClick={onClose}
        >
          {src.endsWith('.webm') ? (
            <motion.video
              key={src}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              src={src}
              autoPlay
              loop
              muted
              playsInline
              className="max-h-[90vh] max-w-[90vw] object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <motion.img
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              src={src}
              alt=""
              className="max-h-[90vh] max-w-[90vw] object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute top-6 right-6 flex h-11 w-11 items-center justify-center border border-line text-ink transition-colors hover:border-ink"
          >
            <CloseIcon />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
