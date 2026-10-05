import { useEffect, useRef, useState, type TouchEvent } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import Lightbox from './Lightbox'
import MediaFrame from './MediaFrame'
import { ArrowUpRight, ChevronLeft, ChevronRight, CloseIcon, ExpandIcon, GitHubIcon } from './icons'
import { isVideo, type CaseItem } from '@/lib/cases'
import { EASE } from '@/lib/motion'
import { playClick } from '@/lib/sound'

function Media({ src, onEnlarge }: { src: string; onEnlarge: () => void }) {
  return (
    <button type="button" onClick={onEnlarge} aria-label="Enlarge" className="group relative block aspect-[16/10] w-full overflow-hidden bg-black">
      {isVideo(src) ? (
        <video key={src} src={src} autoPlay loop muted playsInline className="h-full w-full object-cover object-top" />
      ) : (
        <img key={src} src={src} alt="" className="h-full w-full object-cover object-top" />
      )}
      <span className="absolute right-3 bottom-3 flex h-10 w-10 items-center justify-center rounded-full bg-black/55 text-white opacity-0 backdrop-blur transition-opacity group-hover:opacity-100">
        <ExpandIcon size={16} />
      </span>
    </button>
  )
}

/**
 * Full-screen case study for a client site or a project: the walkthrough video and screenshots on
 * one side, the story on the other. Arrow keys / swipe move between items, Escape closes.
 * Portaled to <body> so `position: fixed` is never captured by a transformed ancestor.
 */
export default function CaseViewer({
  items,
  index,
  onIndex,
  onClose,
}: {
  items: CaseItem[]
  index: number | null
  onIndex: (i: number) => void
  onClose: () => void
}) {
  const open = index !== null
  const item = open ? items[index] : null
  const [mediaIdx, setMediaIdx] = useState(0)
  const [dir, setDir] = useState(1)
  const [lightbox, setLightbox] = useState<string | null>(null)
  const dialogRef = useRef<HTMLDivElement>(null)
  const returnFocus = useRef<HTMLElement | null>(null)

  const go = (delta: number) => {
    if (index === null) return
    setDir(delta)
    onIndex((index + delta + items.length) % items.length)
  }

  // New item → back to its first piece of media.
  useEffect(() => {
    setMediaIdx(0)
  }, [index])

  // Lock page scroll and move focus into the dialog while open; give both back on close.
  useEffect(() => {
    if (!open) return
    returnFocus.current = document.activeElement as HTMLElement | null
    const html = document.documentElement
    const prev = html.style.overflow
    html.style.overflow = 'hidden'
    dialogRef.current?.focus()
    return () => {
      html.style.overflow = prev
      returnFocus.current?.focus?.()
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      // The lightbox owns Escape while it's up — don't close the whole viewer underneath it.
      if (lightbox) return
      if (e.key === 'Escape') onClose()
      else if (e.key === 'ArrowRight') go(1)
      else if (e.key === 'ArrowLeft') go(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const touch = useRef<{ x: number; y: number } | null>(null)
  const onTouchStart = (e: TouchEvent) => (touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY })
  const onTouchEnd = (e: TouchEvent) => {
    const s = touch.current
    touch.current = null
    if (!s) return
    const dx = e.changedTouches[0].clientX - s.x
    const dy = e.changedTouches[0].clientY - s.y
    if (Math.abs(dx) < 50 || Math.abs(dx) < Math.abs(dy)) return
    playClick()
    go(dx < 0 ? 1 : -1)
  }

  const kindLabel = item?.kind === 'client' ? 'Client site' : 'Project'

  return createPortal(
    <>
      <AnimatePresence>
        {item && (
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-label={`${kindLabel}: ${item.name}`}
            tabIndex={-1}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[995] overflow-y-auto overscroll-contain bg-[oklch(0.11_0.02_282)] outline-none"
          >
            {/* The item's own color, glowing behind the case study. */}
            <div
              aria-hidden
              className="pointer-events-none fixed inset-0 transition-[background] duration-700"
              style={{ background: `radial-gradient(ellipse 60% 55% at 25% 35%, color-mix(in oklch, ${item.tint} 32%, transparent), transparent 70%)` }}
            />

            <div className="relative mx-auto flex min-h-full max-w-[1400px] flex-col px-4 py-4 sm:px-8 sm:py-6">
              <div className="flex items-center justify-between gap-4">
                <div className="font-mono text-[11px] tracking-[0.18em] text-white/50 uppercase">
                  {kindLabel} · {String(index! + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')}
                </div>
                <div className="flex items-center gap-2">
                  {[
                    { label: 'Previous', icon: <ChevronLeft />, on: () => go(-1) },
                    { label: 'Next', icon: <ChevronRight />, on: () => go(1) },
                  ].map((b) => (
                    <button
                      key={b.label}
                      type="button"
                      onClick={b.on}
                      aria-label={b.label}
                      className="flex h-10 w-10 items-center justify-center rounded-full text-white/75 ring-1 ring-white/15 transition-colors hover:bg-white/10 hover:text-white"
                    >
                      {b.icon}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={onClose}
                    aria-label="Close"
                    className="ml-2 flex h-10 w-10 items-center justify-center rounded-full bg-white text-black transition-transform hover:scale-105"
                  >
                    <CloseIcon size={18} />
                  </button>
                </div>
              </div>

              <div className="grid flex-1 items-center">
                <AnimatePresence mode="wait" initial={false} custom={dir}>
                  <motion.article
                    key={item.key}
                    custom={dir}
                    initial={{ opacity: 0, x: dir * 60 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: dir * -60 }}
                    transition={{ duration: 0.35, ease: EASE }}
                    className="grid gap-8 py-8 lg:grid-cols-[minmax(0,8fr)_minmax(0,4fr)] lg:items-center lg:gap-12"
                  >
                    <div onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
                      {item.media.length > 0 && (
                        <MediaFrame chrome={!!item.domain} domain={item.domain}>
                          <Media src={item.media[mediaIdx]} onEnlarge={() => setLightbox(item.media[mediaIdx])} />
                        </MediaFrame>
                      )}
                      {item.media.length > 1 && (
                        <div className="mt-4 grid grid-cols-4 gap-3">
                          {item.media.map((m, i) => (
                            <button
                              key={m}
                              type="button"
                              onClick={() => setMediaIdx(i)}
                              aria-label={`Show ${isVideo(m) ? 'video' : 'screenshot'} ${i + 1}`}
                              className={`relative aspect-[16/10] overflow-hidden rounded-xl bg-black ring-2 transition-all ${i === mediaIdx ? 'ring-white' : 'opacity-55 ring-transparent hover:opacity-90'}`}
                            >
                              {isVideo(m) ? (
                                <>
                                  <video src={m} muted playsInline preload="metadata" className="h-full w-full object-cover object-top" />
                                  <span className="absolute inset-0 flex items-center justify-center">
                                    <span className="rounded-full bg-black/60 px-2 py-0.5 font-mono text-[9px] tracking-wide text-white uppercase">
                                      ▶ Video
                                    </span>
                                  </span>
                                </>
                              ) : (
                                <img src={m} alt="" loading="lazy" className="h-full w-full object-cover object-top" />
                              )}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="text-white">
                      {item.titleImage ? (
                        <>
                          <h2 className="sr-only">{item.name}</h2>
                          <img
                            src={item.titleImage}
                            alt=""
                            className={`h-auto max-h-16 w-auto max-w-full object-contain ${item.titleInvert ? 'invert' : ''}`}
                          />
                        </>
                      ) : (
                        <div className="flex items-center gap-4">
                          {item.logo && (
                            <img src={item.logo} alt="" className="h-14 w-14 shrink-0 rounded-full bg-white object-contain p-1.5" />
                          )}
                          <h2 className="text-[clamp(28px,3vw,40px)] leading-[1.05] tracking-[-0.03em]">{item.name}</h2>
                        </div>
                      )}

                      <div className="mt-5 flex flex-wrap gap-2">
                        {[item.tag, item.meta].map((t) => (
                          <span key={t} className="rounded-full px-3 py-1 font-mono text-[11px] text-white/70 ring-1 ring-white/15">
                            {t}
                          </span>
                        ))}
                      </div>

                      <p className="mt-6 text-[16px] leading-[1.75] text-white/80">{item.desc}</p>

                      {item.quote && (
                        <figure className="mt-7 border-l-2 border-white/25 pl-5">
                          <blockquote className="accent text-[22px] leading-snug text-white">“{item.quote}”</blockquote>
                          {item.attr && <figcaption className="mt-3 font-mono text-[11px] text-white/50">{item.attr}</figcaption>}
                        </figure>
                      )}

                      <div className="mt-8 flex flex-wrap gap-3">
                        {item.url && (
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 font-mono text-xs tracking-wide text-black uppercase transition-transform hover:-translate-y-0.5"
                          >
                            Visit site <ArrowUpRight />
                          </a>
                        )}
                        {item.repo && (
                          <a
                            href={item.repo}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 rounded-full px-5 py-3 font-mono text-xs tracking-wide text-white uppercase ring-1 ring-white/25 transition-colors hover:bg-white/10"
                          >
                            <GitHubIcon size={14} /> View code
                          </a>
                        )}
                      </div>
                    </div>
                  </motion.article>
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <Lightbox src={lightbox} onClose={() => setLightbox(null)} />
    </>,
    document.body,
  )
}
