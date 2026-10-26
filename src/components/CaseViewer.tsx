import { useEffect, useRef, useState, type TouchEvent } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import Lightbox from './Lightbox'
import Monitor, { Ascii, BarButton } from './Monitor'
import { ExpandIcon } from './icons'
import { isVideo, type CaseItem } from '@/lib/cases'
import { EASE } from '@/lib/motion'
import { terminal } from '@/lib/sound'

/**
 * The piece of media on show, with the screen's phosphor cast until it's pointed at. Client sites
 * are screenshots of a page, so they're cropped from the top; projects are shown whole,
 * letterboxed if they need it.
 */
function Media({ src, whole, onEnlarge }: { src: string; whole: boolean; onEnlarge: () => void }) {
  const fit = whole ? 'object-contain' : 'object-cover object-top'
  return (
    <button type="button" onClick={onEnlarge} aria-label="Enlarge" className="crt-tint group block aspect-[16/10] w-full overflow-hidden bg-black">
      {isVideo(src) ? (
        <video key={src} src={src} autoPlay loop muted playsInline className={`h-full w-full ${fit}`} />
      ) : (
        <img key={src} src={src} alt="" className={`h-full w-full ${fit}`} />
      )}
      <span className="absolute right-2 bottom-2 z-[1] flex h-8 w-8 items-center justify-center bg-black/70 opacity-0 transition-opacity group-hover:opacity-100">
        <ExpandIcon size={15} />
      </span>
    </button>
  )
}

/**
 * How a project is built, as an ASCII schematic filling the media frame, sized to fit it either
 * way and printing in a row at a time (all at once with reduced motion).
 */
function Schematic({ art, name }: { art: string; name: string }) {
  const lines = art.split('\n')
  const cols = Math.max(...lines.map((l) => l.length))
  const leading = 1.12
  return (
    <div className="aspect-[16/10] w-full overflow-hidden bg-black [container-type:size]">
      <div className="flex h-full items-center justify-center">
        <pre
          role="img"
          aria-label={`Architecture schematic of ${name}`}
          className="schematic-print tracking-normal whitespace-pre [font-family:'VT323',monospace]"
          style={{
            fontSize: `min(calc(94cqw / ${0.41 * cols}), calc(90cqh / ${lines.length * leading}))`,
            lineHeight: leading,
            animationTimingFunction: `steps(${lines.length}, end)`,
          }}
        >
          {art}
        </pre>
      </div>
    </div>
  )
}

/**
 * Full-screen case study for a client site or a project, on one of the ship's monitors: the
 * walkthrough video and screenshots on one side, and on the other the name, what it is, the
 * client's word on it, and the ways in. The title bar carries the record number and the keys to
 * step through or leave. Sized off the screen's height as well as its width, so it all fits
 * without scrolling on a desktop. Arrow keys / swipe move between items, Escape closes. Portaled
 * to <body> so `position: fixed` is never captured by a transformed ancestor.
 */
export default function CaseViewer({
  items,
  index,
  view,
  onIndex,
  onClose,
}: {
  items: CaseItem[]
  index: number | null
  /** Open on the item's schematic rather than its first piece of media. */
  view?: 'schematic'
  onIndex: (i: number) => void
  onClose: () => void
}) {
  const open = index !== null
  const item = open ? items[index] : null
  const [mediaIdx, setMediaIdx] = useState(0)
  const [lightbox, setLightbox] = useState<string | null>(null)
  const dialogRef = useRef<HTMLDivElement>(null)
  const returnFocus = useRef<HTMLElement | null>(null)

  const go = (delta: number) => {
    if (index === null) return
    terminal.page()
    onIndex((index + delta + items.length) % items.length)
  }

  // The screen's sounds: switching on as it opens, off as it closes.
  const wasOpen = useRef(false)
  useEffect(() => {
    if (open && !wasOpen.current) terminal.on()
    if (!open && wasOpen.current) terminal.off()
    wasOpen.current = open
  }, [open])

  // New item → back to its first piece of media (or straight to its schematic, if asked for).
  useEffect(() => {
    const it = index === null ? null : items[index]
    setMediaIdx(view === 'schematic' && it?.schematic ? it.media.length : 0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, view])

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
    go(dx < 0 ? 1 : -1)
  }

  const kindLabel = item?.kind === 'client' ? 'site record' : 'project record'
  const count = (n: number) => String(n).padStart(2, '0')

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
            className="fixed inset-0 z-[995] flex items-center justify-center bg-black/85 p-[2vw] outline-none backdrop-blur-sm"
          >
            {/* Switches on like a CRT: a bright line opening out to the picture. */}
            <motion.div
              initial={{ scaleY: 0.02, opacity: 0.6 }}
              animate={{ scaleY: 1, opacity: 1 }}
              exit={{ scaleY: 0.02, opacity: 0 }}
              transition={{ duration: 0.35, ease: EASE }}
              className="w-full max-w-[1600px]"
            >
              {/* As tall as what's on it, up to nearly the full window. */}
              <Monitor
                className="max-h-[min(96svh,1100px)]"
                title={`${kindLabel} ${count(index! + 1)} / ${count(items.length)} · ${item.domain ?? item.name}`}
                hint="left, right: browse | esc: exit | /: mu/th/ur"
                controls={
                  <>
                    <BarButton label="Previous" onClick={() => go(-1)}>
                      [&lt;]
                    </BarButton>
                    <BarButton label="Next" onClick={() => go(1)}>
                      [&gt;]
                    </BarButton>
                    <BarButton label="Close" onClick={onClose}>
                      [x]
                    </BarButton>
                  </>
                }
              >
                {/* Sized against the monitor, not the window: the monitor stops growing at its
                    maximum width, and on a big screen the window keeps going. */}
                <div className="[container-type:inline-size]">
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.article
                      key={item.key}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="grid grid-cols-1 items-center gap-[3vh] lg:grid-cols-[auto_22rem] lg:justify-center lg:gap-[3vw]"
                    >
                      {/* Media: as wide as the monitor allows beside the text, but never taller than
                          it has room for under the title bar, above the thumbnails and the hints. */}
                      <div
                        onTouchStart={onTouchStart}
                        onTouchEnd={onTouchEnd}
                        className="mx-auto w-full min-w-0 lg:w-[min(calc(100cqw-22rem-3vw-4px),calc((min(96svh,1100px)-300px)*1.6))]"
                      >
                        {item.schematic && mediaIdx === item.media.length ? (
                          <div className="crt-box">
                            <Schematic key={item.key} art={item.schematic} name={item.name} />
                          </div>
                        ) : (
                          item.media.length > 0 && (
                            <div className="crt-box">
                              <Media src={item.media[mediaIdx]} whole={item.kind === 'project'} onEnlarge={() => setLightbox(item.media[mediaIdx])} />
                            </div>
                          )
                        )}
                        {(item.media.length > 1 || item.schematic) && (
                          <div className="mt-3 flex gap-2 overflow-x-auto p-0.5 [scrollbar-width:none]">
                            {item.media.map((m, i) => (
                              <button
                                key={m}
                                type="button"
                                onClick={() => {
                                  terminal.select()
                                  setMediaIdx(i)
                                }}
                                aria-label={`Show ${isVideo(m) ? 'video' : 'screenshot'} ${i + 1}`}
                                className={`crt-box crt-tint h-[clamp(36px,6vh,56px)] shrink-0 overflow-hidden bg-black transition-opacity [aspect-ratio:16/10] ${i === mediaIdx ? '' : 'opacity-45 hover:opacity-90'}`}
                              >
                                {isVideo(m) ? (
                                  <>
                                    <video src={m} muted playsInline preload="metadata" className="h-full w-full object-cover object-top" />
                                    <span className="absolute inset-0 flex items-center justify-center text-[14px] uppercase">
                                      <span className="bg-black/70 px-1">▶ vid</span>
                                    </span>
                                  </>
                                ) : (
                                  <img src={m} alt="" loading="lazy" className="h-full w-full object-cover object-top" />
                                )}
                              </button>
                            ))}
                            {item.schematic && (
                              <button
                                type="button"
                                onClick={() => {
                                  terminal.page()
                                  setMediaIdx(item.media.length)
                                }}
                                aria-label="Show how it's built"
                                className={`crt-box flex h-[clamp(36px,6vh,56px)] shrink-0 items-center bg-black px-3 text-[clamp(10px,0.8vw,12px)] uppercase transition-opacity ${mediaIdx === item.media.length ? '' : 'opacity-45 hover:opacity-90'}`}
                              >
                                schematic
                              </button>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="min-w-0">
                        {item.titleAscii ? (
                          <>
                            <h2 className="sr-only">{item.name}</h2>
                            <Ascii art={item.titleAscii} />
                          </>
                        ) : item.titleImage ? (
                          <>
                            <h2 className="sr-only">{item.name}</h2>
                            <span className="crt-tint inline-block max-w-full">
                              <img src={item.titleImage} alt="" className="block h-auto max-h-[clamp(40px,5vw,84px)] w-auto max-w-full object-contain object-left" />
                            </span>
                          </>
                        ) : (
                          <h2 className="text-[clamp(34px,3vw,52px)] leading-none font-normal uppercase">{item.name}</h2>
                        )}

                        <p className="mt-[3vh]">{item.desc}</p>

                        {item.quote && (
                          <div className="crt-box mt-[3vh] p-4">
                            <div className="crt-dim uppercase">transmission{item.attr ? ` from ${item.attr}` : ''}</div>
                            <blockquote className="mt-2">“{item.quote}”</blockquote>
                          </div>
                        )}

                        <div className="mt-[3vh] flex flex-col items-start gap-1 uppercase">
                          {item.url && (
                            <a href={item.url} target="_blank" rel="noreferrer" className="crt-link px-1">
                              &gt; visit site
                            </a>
                          )}
                          {item.repo && (
                            <a href={item.repo} target="_blank" rel="noreferrer" className="crt-link px-1">
                              &gt; source code
                            </a>
                          )}
                        </div>
                      </div>
                    </motion.article>
                  </AnimatePresence>
                </div>
              </Monitor>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <Lightbox src={lightbox} onClose={() => setLightbox(null)} />
    </>,
    document.body,
  )
}
