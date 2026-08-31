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
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/80 p-6 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.img
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            src={src}
            alt=""
            className="max-h-[90vh] max-w-[90vw] rounded-2xl object-contain shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)]"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute top-6 right-6 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-lg transition-colors hover:bg-white/20"
          >
            <CloseIcon />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
