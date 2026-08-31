import { useRef, useState, type TouchEvent } from 'react'
import { AnimatePresence, motion, type Variants } from 'framer-motion'
import Reveal from './Reveal'
import ReferralCarousel from './ReferralCarousel'
import { ChevronLeft, ChevronRight } from './icons'
import { playClick } from '@/lib/sound'
import type { ExperienceEntry } from '@/data/experience'

// Slide direction: 1 = advancing (old exits left, new enters from right), -1 = reverse.
const slideVariants: Variants = {
  enter: (dir: number) => ({ x: dir < 0 ? '-100%' : '100%' }),
  center: { x: '0%' },
  exit: (dir: number) => ({ x: dir < 0 ? '100%' : '-100%' }),
}

export default function Experience({ items }: { items: ExperienceEntry[] }) {
  const [idx, setIdx] = useState(0)
  const [direction, setDirection] = useState(1)
  const current = items[idx]

  const next = () => {
    setDirection(1)
    setIdx((i) => (i + 1) % items.length)
  }
  const prev = () => {
    setDirection(-1)
    setIdx((i) => (i - 1 + items.length) % items.length)
  }
  const goTo = (i: number) => {
    setDirection(i > idx ? 1 : i < idx ? -1 : direction)
    setIdx(i)
  }

  // Swipe navigation (mobile) — same technique as the project/client Showcase.
  const touchStart = useRef<{ x: number; y: number } | null>(null)
  const SWIPE_THRESHOLD = 45

  const onTouchStart = (e: TouchEvent) => {
    const t = e.touches[0]
    touchStart.current = { x: t.clientX, y: t.clientY }
  }
  const onTouchEnd = (e: TouchEvent) => {
    const start = touchStart.current
    touchStart.current = null
    if (!start) return
    const t = e.changedTouches[0]
    const dx = t.clientX - start.x
    const dy = t.clientY - start.y
    if (Math.abs(dx) < SWIPE_THRESHOLD || Math.abs(dx) < Math.abs(dy)) return
    playClick()
    if (dx < 0) next()
    else prev()
  }

  return (
    <div>
      {/* Shadow + radius live here, on a wrapper that never sets overflow-hidden itself —
          overflow-hidden clips an element's own box-shadow, so the shadow has to sit one
          level above the clipping wrapper below. */}
      <Reveal
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        className="relative rounded-[28px] shadow-[0_20px_50px_-30px_oklch(0.3_0.05_270_/_0.25)]"
      >
        {/* Clips the sliding cards to the rounded frame. A CSS-grid single-cell stack (each
            card is col-start-1/row-start-1) lets outgoing and incoming cards overlap without
            absolute positioning, so the frame's height tracks whichever card is tallest. */}
        <div className="grid overflow-hidden rounded-[28px]">
          <AnimatePresence initial={false} custom={direction}>
            <motion.div
              key={`${current.company}-${current.role}`}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="relative col-start-1 row-start-1 border border-transparent p-9 backdrop-blur-lg transition-[background] duration-500"
              style={{
                background: [
                  current.cardTexture,
                  `linear-gradient(${current.cardBg ?? 'var(--color-panel)'}, ${current.cardBg ?? 'var(--color-panel)'}) padding-box`,
                  `linear-gradient(135deg, var(--color-grad-a), ${current.tint}) border-box`,
                ]
                  .filter(Boolean)
                  .join(', '),
              }}
            >
              {current.cardBgVideo && (
                <>
                  <video
                    src={current.cardBgVideo}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="absolute inset-0 -z-10 h-full w-full rounded-[inherit] object-cover"
                  />
                  <div
                    className="absolute inset-0 -z-10 rounded-[inherit]"
                    style={{ background: `rgba(0,0,0,${(current.cardScrim ?? 60) / 100})` }}
                  />
                </>
              )}
              {current.cardBgImage && (
                <>
                  <img
                    src={current.cardBgImage}
                    alt=""
                    className="absolute inset-0 -z-10 h-full w-full rounded-[inherit] object-cover"
                  />
                  <div
                    className="absolute inset-0 -z-10 rounded-[inherit]"
                    style={{ background: `rgba(0,0,0,${(current.cardScrim ?? 60) / 100})` }}
                  />
                </>
              )}

              <div className="flex flex-wrap items-start justify-between gap-6">
                <div className="flex items-center gap-4">
                  {current.logo && (
                    <img
                      src={current.cardDark && current.logoDark ? current.logoDark : current.logo}
                      alt=""
                      className="h-11 w-11 shrink-0 object-contain"
                    />
                  )}
                  <div>
                    <div className={`mb-2 font-mono text-xs ${current.cardDark ? 'text-white/70' : 'text-grad-a'}`}>{current.role}</div>
                    <h2 className={`text-[32px] leading-none sm:text-[38px] ${current.cardDark ? 'text-white' : ''}`}>{current.company}</h2>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span
                    className={`rounded-full border px-3.5 py-1.5 font-mono text-[11px] whitespace-nowrap ${current.cardDark ? 'border-white/20 text-white/80' : 'border-line text-ink-dim'}`}
                  >
                    {current.location}
                  </span>
                  <span
                    className={`rounded-full border px-3.5 py-1.5 font-mono text-[11px] whitespace-nowrap ${current.cardDark ? 'border-white/20 text-white/80' : 'border-line text-ink-dim'}`}
                  >
                    {current.dateRange}
                  </span>
                </div>
              </div>

              {current.badge && (
                <span
                  className="mt-5 inline-block self-start rounded-full border border-transparent px-3.5 py-1.5 font-mono text-[10px] tracking-wide uppercase"
                  style={{
                    color: current.tint,
                    background: `linear-gradient(var(--color-bg), var(--color-bg)) padding-box, linear-gradient(135deg, var(--color-grad-a), ${current.tint}) border-box`,
                  }}
                >
                  {current.badge}
                </span>
              )}

              <p className={`mt-5 max-w-[640px] text-[15px] leading-[1.7] ${current.cardDark ? 'text-white/85' : 'text-ink-dim'}`}>
                {current.desc}
              </p>

              {current.referrals && current.referrals.length > 0 && (
                <ReferralCarousel items={current.referrals} dark={current.cardDark} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </Reveal>

      <div className="mt-7 flex items-center justify-center gap-5">
        <button
          onClick={prev}
          aria-label="Previous"
          className="flex h-10.5 w-10.5 items-center justify-center rounded-full border border-line text-ink-dim transition-colors hover:border-grad-b hover:text-ink"
        >
          <ChevronLeft />
        </button>
        <div className="hidden items-center gap-2.5 sm:flex">
          {items.map((item, i) => (
            <button
              key={`${item.company}-${item.role}`}
              onClick={() => goTo(i)}
              aria-label={`${item.company} — ${item.role}`}
              className={`h-2.5 rounded-full transition-all duration-250 ${
                i === idx ? 'w-5.5 bg-gradient-to-br from-grad-a to-grad-b' : 'w-2.5 bg-line'
              }`}
            />
          ))}
        </div>
        <button
          onClick={next}
          aria-label="Next"
          className="flex h-10.5 w-10.5 items-center justify-center rounded-full border border-line text-ink-dim transition-colors hover:border-grad-b hover:text-ink"
        >
          <ChevronRight />
        </button>
        <div className="min-w-11 text-right font-mono text-xs text-ink-faint">
          {idx + 1} / {items.length}
        </div>
      </div>
    </div>
  )
}
