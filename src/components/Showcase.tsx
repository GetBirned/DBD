import { useRef, useState, type ReactNode, type TouchEvent } from 'react'
import { AnimatePresence, motion, type Variants } from 'framer-motion'
import { ChevronLeft, ChevronRight, PlayIcon, ExpandIcon } from './icons'
import Reveal from './Reveal'
import Lightbox from './Lightbox'
import { playClick } from '@/lib/sound'

// Slide direction: 1 = advancing (old exits left, new enters from right), -1 = reverse.
const slideVariants: Variants = {
  enter: (dir: number) => ({ x: dir < 0 ? '-100%' : '100%' }),
  center: { x: '0%' },
  exit: (dir: number) => ({ x: dir < 0 ? '100%' : '-100%' }),
}

export interface ShowcaseBaseItem {
  name: string
  tag: string
  /** Location for a client, tech stack for a project — whatever belongs under the title. */
  meta: string
  tint: string
  desc: string
  vidLabel: string
  logo?: string
  /** Real screenshots, when available. Without `video`, [0] fills the main area and [1..3] fill
   * the thumbnail row. With `video`, the main area shows the video instead and [0..2] fill the
   * thumbnail row directly. Falls back to the placeholder play-button box / empty thumbnails for
   * any missing slot. */
  screenshots?: string[]
  /** A real screen-recording (e.g. scrolling through the site) — takes over the main area from
   * screenshots[0] when present. Autoplays muted/looped, so keep it short. */
  video?: string
}

export default function Showcase<T extends ShowcaseBaseItem>({
  items,
  eyebrow,
  renderFooter,
}: {
  items: T[]
  eyebrow: string
  renderFooter: (item: T) => ReactNode
}) {
  const [idx, setIdx] = useState(0)
  const [direction, setDirection] = useState(1)
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null)
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

  // Swipe navigation (mobile). Track horizontal delta only, and bail if the gesture
  // turns out to be more vertical (a normal page scroll) than horizontal.
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
    <div className="mx-auto max-w-[1120px] px-6 pb-12 sm:px-12 sm:pb-20 lg:max-w-[1440px] lg:px-16 xl:max-w-[1680px] xl:px-20">
      <div className="mb-4 font-mono text-xs tracking-widest text-ink-faint uppercase sm:mb-6">
        {eyebrow} — {idx + 1} / {items.length}
      </div>

      {/* Shadow + radius live here, on a wrapper that never sets overflow-hidden itself —
          overflow-hidden clips an element's own box-shadow, so the shadow has to sit one
          level above the clipping wrapper below. */}
      <Reveal
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        className="relative rounded-[24px] shadow-[0_30px_60px_-35px_oklch(0.3_0.05_270_/_0.3)] sm:rounded-[32px] lg:rounded-[40px]"
      >
        {/* Clips the sliding cards to the rounded frame. A CSS-grid single-cell stack (each
            card is col-start-1/row-start-1) lets outgoing and incoming cards overlap without
            absolute positioning, so the frame's height tracks whichever card is tallest. */}
        <div className="grid overflow-hidden rounded-[24px] sm:rounded-[32px] lg:rounded-[40px]">
          <AnimatePresence initial={false} custom={direction}>
            <motion.div
              key={current.name}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="col-start-1 row-start-1 grid grid-cols-1 gap-5 rounded-[24px] border border-transparent p-5 backdrop-blur-xl transition-[background] duration-500 sm:gap-12 sm:rounded-[32px] sm:p-11 md:grid-cols-2 lg:gap-16 lg:rounded-[40px] lg:p-16 xl:gap-20 xl:p-20"
              style={{
                background: `linear-gradient(var(--color-panel), var(--color-panel)) padding-box, linear-gradient(135deg, var(--color-grad-a), ${current.tint}) border-box`,
              }}
            >
              <div className="flex flex-col justify-center">
                {current.logo && (
                  <img src={current.logo} alt="" className="mx-auto mb-3 h-12 w-auto max-w-[160px] object-contain sm:mb-4 sm:h-16 sm:max-w-[200px] md:hidden" />
                )}
                <div className="relative flex aspect-16/10 items-center justify-center overflow-hidden rounded-[20px] border border-line bg-bg-soft lg:rounded-3xl">
                  {current.video ? (
                    <video
                      key={current.video}
                      src={current.video}
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="h-full w-full object-cover"
                    />
                  ) : current.screenshots?.[0] ? (
                    <button
                      type="button"
                      onClick={() => setLightboxSrc(current.screenshots![0])}
                      aria-label={`Enlarge ${current.vidLabel}`}
                      className="group/img relative h-full w-full cursor-zoom-in"
                    >
                      <img
                        src={current.screenshots[0]}
                        alt={current.vidLabel}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover/img:scale-105"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all duration-250 group-hover/img:bg-black/25 group-hover/img:opacity-100">
                        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-ink shadow-lg lg:h-12 lg:w-12">
                          <ExpandIcon />
                        </span>
                      </div>
                    </button>
                  ) : (
                    <>
                      <div
                        className="flex h-14 w-14 items-center justify-center rounded-full text-white transition-[background] duration-500 lg:h-20 lg:w-20"
                        style={{ background: `linear-gradient(135deg, var(--color-grad-a), ${current.tint})` }}
                      >
                        <PlayIcon />
                      </div>
                      <div className="absolute bottom-3.5 left-4 font-mono text-[10px] text-ink-faint lg:bottom-5 lg:left-6 lg:text-xs">
                        [ {current.vidLabel} ]
                      </div>
                    </>
                  )}
                </div>
                <div className="mt-2 grid grid-cols-3 gap-2 sm:mt-2.5 sm:gap-2.5 lg:mt-4 lg:gap-4">
                  {[0, 1, 2].map((i) => {
                    // Without a video, screenshots[0] is the main image, so thumbnails start at [1].
                    // With a video, the main area is taken, so thumbnails use [0..2] directly.
                    const thumbIdx = current.video ? i : i + 1
                    const src = current.screenshots?.[thumbIdx]
                    return src ? (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setLightboxSrc(src)}
                        aria-label={`Enlarge screenshot ${thumbIdx + 1}`}
                        className="group/thumb relative aspect-4/3 cursor-zoom-in overflow-hidden rounded-xl border border-line bg-bg-soft lg:rounded-2xl"
                      >
                        {src.endsWith('.webm') ? (
                          <video
                            src={src}
                            autoPlay
                            loop
                            muted
                            playsInline
                            className="h-full w-full object-cover transition-transform duration-500 group-hover/thumb:scale-105"
                          />
                        ) : (
                          <img
                            src={src}
                            alt=""
                            className="h-full w-full object-cover transition-transform duration-500 group-hover/thumb:scale-105"
                          />
                        )}
                        <div className="absolute inset-0 flex items-center justify-center bg-black/0 text-white opacity-0 transition-all duration-250 group-hover/thumb:bg-black/25 group-hover/thumb:opacity-100">
                          <ExpandIcon size={16} />
                          <span className="sr-only">Enlarge</span>
                        </div>
                      </button>
                    ) : (
                      <div key={i} className="aspect-4/3 rounded-xl border border-line bg-bg-soft lg:rounded-2xl" />
                    )
                  })}
                </div>
              </div>

              <div className="flex flex-col justify-center">
                {current.logo && (
                  <img
                    src={current.logo}
                    alt=""
                    className="-ml-1.5 mb-4 hidden h-16 w-auto max-w-[200px] object-contain md:block lg:mb-5 lg:h-20 lg:max-w-[240px]"
                  />
                )}
                <h2 className="text-[28px] leading-[1.05] font-bold font-display sm:text-[38px] lg:text-[54px] xl:text-[60px]">{current.name}</h2>
                <div className="my-1.5 font-mono text-xs text-ink-faint sm:my-2.5 lg:my-3.5 lg:text-sm">{current.meta}</div>
                <span
                  className="mb-2.5 inline-block self-start rounded-full border border-transparent px-3.5 py-1.5 font-mono text-[10px] tracking-wider uppercase transition-[background,color] duration-500 sm:mb-3.5 lg:mb-4 lg:px-4 lg:py-2 lg:text-[11px]"
                  style={{
                    color: current.tint,
                    background: `linear-gradient(var(--color-bg), var(--color-bg)) padding-box, linear-gradient(135deg, var(--color-grad-a), ${current.tint}) border-box`,
                  }}
                >
                  {current.tag}
                </span>
                <p className="text-[14px] leading-[1.6] text-ink-dim sm:text-[15px] sm:leading-[1.7] lg:text-[17px]">{current.desc}</p>
                <div className="mt-3.5 border-t border-line pt-3.5 sm:mt-5 sm:pt-5 lg:mt-7 lg:pt-7">{renderFooter(current)}</div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </Reveal>

      <div className="mt-5 flex items-center justify-center gap-5 sm:mt-7">
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
              key={item.name}
              onClick={() => goTo(i)}
              aria-label={item.name}
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

      <Lightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />
    </div>
  )
}
