import { useState } from 'react'
import { AnimatePresence, motion, type Variants } from 'framer-motion'
import { ChevronLeft, ChevronRight } from './icons'
import type { Referral } from '@/data/experience'

const slideVariants: Variants = {
  enter: (dir: number) => ({ x: dir < 0 ? '-4%' : '4%', opacity: 0 }),
  center: { x: '0%', opacity: 1 },
  exit: (dir: number) => ({ x: dir < 0 ? '4%' : '-4%', opacity: 0 }),
}

/** Cycles through coworker shoutouts one at a time, with prev/next controls. */
export default function ReferralCarousel({ items, dark }: { items: Referral[]; dark?: boolean }) {
  const [idx, setIdx] = useState(0)
  const [direction, setDirection] = useState(1)

  if (items.length === 0) return null
  const current = items[idx]

  const next = () => {
    setDirection(1)
    setIdx((i) => (i + 1) % items.length)
  }
  const prev = () => {
    setDirection(-1)
    setIdx((i) => (i - 1 + items.length) % items.length)
  }

  return (
    <div className={`mt-6 border-t pt-6 ${dark ? 'border-white/15' : 'border-line'}`}>
      <div className={`mb-3 font-mono text-[11px] tracking-wide uppercase ${dark ? 'text-white/55' : 'text-ink-faint'}`}>
        Coworker Shoutouts {items.length > 1 && `— ${idx + 1} / ${items.length}`}
      </div>
      <div className="grid">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={idx}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="col-start-1 row-start-1"
          >
            <p className={`font-body text-[15px] leading-[1.65] italic ${dark ? 'text-white/90' : 'text-ink'}`}>
              "{current.quote}"
            </p>
            {current.name && (
              <div className={`mt-2.5 font-mono text-xs ${dark ? 'text-white/50' : 'text-ink-faint'}`}>— {current.name}</div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
      {items.length > 1 && (
        <div className="mt-5 flex items-center gap-3">
          <button
            type="button"
            onClick={prev}
            aria-label="Previous shoutout"
            className={`flex h-8 w-8 items-center justify-center rounded-full border transition-colors ${
              dark ? 'border-white/20 text-white/70 hover:border-white hover:text-white' : 'border-line text-ink-dim hover:border-grad-b hover:text-ink'
            }`}
          >
            <ChevronLeft size={12} />
          </button>
          <button
            type="button"
            onClick={next}
            aria-label="Next shoutout"
            className={`flex h-8 w-8 items-center justify-center rounded-full border transition-colors ${
              dark ? 'border-white/20 text-white/70 hover:border-white hover:text-white' : 'border-line text-ink-dim hover:border-grad-b hover:text-ink'
            }`}
          >
            <ChevronRight size={12} />
          </button>
        </div>
      )}
    </div>
  )
}
