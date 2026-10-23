import { useEffect, useRef, useState, type TouchEvent } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import Lightbox from './Lightbox'
import MediaFrame from './MediaFrame'
import { ArrowUpRight, ChevronLeft, ChevronRight, CloseIcon, ExpandIcon, GitHubIcon } from './icons'
import { isVideo, type CaseItem } from '@/lib/cases'
import { EASE } from '@/lib/motion'
import { playClick } from '@/lib/sound'

/**
 * The piece of media on show. Client sites are screenshots of a page, so they're cropped from the
 * top; projects are shown whole, letterboxed if they need it.
 */
function Media({ src, whole, onEnlarge }: { src: string; whole: boolean; onEnlarge: () => void }) {
  const fit = whole ? 'object-contain' : 'object-cover object-top'
  return (
    <button type="button" onClick={onEnlarge} aria-label="Enlarge" className="group relative block aspect-[16/10] w-full overflow-hidden bg-black">
      {isVideo(src) ? (
        <video key={src} src={src} autoPlay loop muted playsInline className={`h-full w-full ${fit}`} />
      ) : (
        <img key={src} src={src} alt="" className={`h-full w-full ${fit}`} />
      )}
      <span className="absolute right-3 bottom-3 flex h-9 w-9 items-center justify-center bg-black/70 text-ink opacity-0 transition-opacity group-hover:opacity-100">
        <ExpandIcon size={15} />
      </span>
    </button>
  )
}

const iconButton = 'flex h-11 w-11 items-center justify-center text-ink-dim transition-colors hover:text-ink'

/**
 * Full-screen case study for a client site or a project, over a dimmed sky: the walkthrough video
 * and screenshots on one side, and on the other the name, what it is, and the ways in, set like the
 * credits. Sized off the screen's height as well as its width, so it all fits without scrolling on
 * a desktop. Arrow keys / swipe move between items, Escape closes. Portaled to <body> so
 * `position: fixed` is never captured by a transformed ancestor.
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

  const kindLabel = item?.kind === 'client' ? 'client site' : 'project'

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
            className="fixed inset-0 z-[995] overflow-y-auto overscroll-contain bg-black/85 text-ink outline-none backdrop-blur-sm"
          >
            <div className="flex min-h-full flex-col px-[4vw] py-3 sm:py-4">
              <div className="flex items-center justify-between gap-4">
                <div className="credit text-[15px] text-ink/60 [text-shadow:none]">
                  {kindLabel} <span className="tabular-nums">{String(index! + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')}</span>
                </div>
                <div className="flex items-center gap-1">
                  <button type="button" onClick={() => go(-1)} aria-label="Previous" className={iconButton}>
                    <ChevronLeft size={18} />
                  </button>
                  <button type="button" onClick={() => go(1)} aria-label="Next" className={iconButton}>
                    <ChevronRight size={18} />
                  </button>
                  <button type="button" onClick={onClose} aria-label="Close" className={`ml-2 ${iconButton}`}>
                    <CloseIcon size={20} />
                  </button>
                </div>
              </div>

              <div className="grid flex-1 grid-cols-1 items-center">
                <AnimatePresence mode="wait" initial={false} custom={dir}>
                  <motion.article
                    key={item.key}
                    custom={dir}
                    initial={{ opacity: 0, x: dir * 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: dir * -50 }}
                    transition={{ duration: 0.35, ease: EASE }}
                    className="grid grid-cols-1 items-center gap-[4vh] py-[3vh] lg:grid-cols-[auto_24rem] lg:justify-center lg:gap-[4vw]"
                  >
                    {/* Media: as wide as the screen allows beside the text, but never taller than
                        it has room for once the top bar and the thumbnails are accounted for. */}
                    <div
                      onTouchStart={onTouchStart}
                      onTouchEnd={onTouchEnd}
                      className="mx-auto w-full min-w-0 lg:w-[min(calc(92vw-24rem-4vw),calc((100svh-260px)*1.6))]"
                    >
                      {item.media.length > 0 && (
                        <MediaFrame chrome={!!item.domain} domain={item.domain}>
                          <Media src={item.media[mediaIdx]} whole={item.kind === 'project'} onEnlarge={() => setLightbox(item.media[mediaIdx])} />
                        </MediaFrame>
                      )}
                      {item.media.length > 1 && (
                        <div className="mt-3 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
                          {item.media.map((m, i) => (
                            <button
                              key={m}
                              type="button"
                              onClick={() => setMediaIdx(i)}
                              aria-label={`Show ${isVideo(m) ? 'video' : 'screenshot'} ${i + 1}`}
                              className={`relative h-[clamp(40px,7vh,64px)] shrink-0 overflow-hidden border bg-black transition-opacity [aspect-ratio:16/10] ${i === mediaIdx ? 'border-ink/70' : 'border-line opacity-50 hover:opacity-90'}`}
                            >
                              {isVideo(m) ? (
                                <>
                                  <video src={m} muted playsInline preload="metadata" className="h-full w-full object-cover object-top" />
                                  <span className="absolute inset-0 flex items-center justify-center font-mono text-[9px] tracking-wide text-ink uppercase">
                                    <span className="bg-black/70 px-1.5 py-0.5">▶ video</span>
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

                    {/* The story, set like the credits and centered. */}
                    <div className="credit text-center">
                      {item.titleImage ? (
                        <>
                          <h2 className="sr-only">{item.name}</h2>
                          <img src={item.titleImage} alt="" className="mx-auto h-auto max-h-[clamp(44px,6vw,96px)] w-auto max-w-full object-contain" />
                        </>
                      ) : (
                        <h2 className="text-[clamp(28px,2.8vw,48px)] leading-[1.1] font-normal">{item.name}</h2>
                      )}

                      <div className="mt-3 font-mono text-[10px] tracking-[0.14em] text-ink-faint uppercase [text-shadow:none] sm:text-[11px]">
                        {item.tag} · {item.meta}
                      </div>

                      <p className="mx-auto mt-[3vh] max-w-[32em] text-[clamp(15px,1.1vw,18px)] leading-relaxed text-ink/80">{item.desc}</p>

                      {item.quote && (
                        <figure className="mx-auto mt-[3vh] max-w-[30em] border-t border-line pt-[3vh]">
                          <blockquote className="text-[clamp(16px,1.25vw,20px)] leading-snug">“{item.quote}”</blockquote>
                          {item.attr && (
                            <figcaption className="mt-3 font-mono text-[10px] tracking-[0.12em] text-ink-faint uppercase [text-shadow:none]">{item.attr}</figcaption>
                          )}
                        </figure>
                      )}

                      <div className="mt-[3.5vh] flex items-center justify-center gap-7 text-[clamp(17px,1.4vw,22px)]">
                        {item.url && (
                          <a href={item.url} target="_blank" rel="noreferrer" className="credit-link inline-flex items-center gap-2">
                            visit site <ArrowUpRight size={13} />
                          </a>
                        )}
                        {item.repo && (
                          <a href={item.repo} target="_blank" rel="noreferrer" aria-label={`${item.name} source on GitHub`} title="Source on GitHub" className="credit-link text-ink/85 hover:text-ink">
                            <GitHubIcon size={24} />
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
