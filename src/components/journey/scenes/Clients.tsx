import { useEffect, useRef, useState } from 'react'
import MediaFrame from '@/components/MediaFrame'
import { ArrowUpRight } from '@/components/icons'
import { clientCases, isVideo, type CaseItem } from '@/lib/cases'
import { pass, vw, type Timeline } from '../motion'

/**
 * A client site in a browser window. Shows a screenshot until hovered, then fades into the site's
 * scrolling walkthrough video — which isn't fetched at all until the first hover.
 */
function SiteCard({ item, index, onOpen }: { item: CaseItem; index: number; onOpen: () => void }) {
  const [hover, setHover] = useState(false)
  const [armed, setArmed] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const poster = item.media.find((m) => !isVideo(m))
  const video = item.media.find(isVideo)

  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    if (hover) v.play().catch(() => {})
    else v.pause()
  }, [hover, armed])

  return (
    <button
      type="button"
      onClick={onOpen}
      onMouseEnter={() => {
        setHover(true)
        setArmed(true)
      }}
      onMouseLeave={() => setHover(false)}
      className="group w-[74vw] shrink-0 snap-center text-left sm:w-[min(27vw,calc((100svh-330px)*1.6))]"
      aria-label={`${item.name} — open case study`}
    >
      <div className="mb-3 flex items-baseline justify-between border-b border-line pb-2 font-mono text-[10px] tracking-[0.12em] text-ink-faint uppercase sm:text-[11px]">
        <span>{String(index + 1).padStart(2, '0')}</span>
        <span className="truncate pl-3">{item.tag}</span>
      </div>
      <div className="transition-[transform,filter] duration-500 ease-out group-hover:-translate-y-1 group-hover:brightness-110">
        <MediaFrame chrome domain={item.domain}>
          <div className="relative aspect-[16/10] overflow-hidden bg-bg-soft">
            {poster && <img src={poster} alt="" loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover object-top" />}
            {armed && video && (
              <video
                ref={videoRef}
                src={video}
                muted
                loop
                playsInline
                className={`absolute inset-0 h-full w-full object-cover object-top transition-opacity duration-500 ${hover ? 'opacity-100' : 'opacity-0'}`}
              />
            )}
          </div>
        </MediaFrame>
      </div>
      <div className="mt-4 flex items-end justify-between gap-4">
        <div className="min-w-0">
          <div className="truncate text-[clamp(18px,1.6vw,28px)] text-ink">{item.name}</div>
          <div className="mt-1 truncate font-mono text-[10px] tracking-[0.1em] text-ink-faint uppercase sm:text-[11px]">{item.meta}</div>
        </div>
        <span className="flex h-10 w-10 shrink-0 items-center justify-center border border-line text-ink-dim transition-colors group-hover:border-ink group-hover:text-ink">
          <ArrowUpRight />
        </span>
      </div>
    </button>
  )
}

/** Scroll, in screens, per client site in the passing row. */
export const CLIENTS_PER = 0.3
export const CLIENT_COUNT = clientCases.length

/**
 * Client work as a row of sites that travels right to left across the frame with the planet,
 * the way the rest of the journey moves. With reduced motion it's a row you swipe yourself.
 */
export default function Clients({ still = false, onOpen }: { still?: boolean; onOpen: (i: number) => void }) {
  return (
    <div className={still ? 'py-[8vh]' : 'flex h-full flex-col justify-center'}>
      <div data-heading className={`px-[8vw] ${still ? '' : 'absolute top-[12vh] left-0'}`}>
        <h2 className="scene-heading">Client work</h2>
        <p className="mt-3 max-w-[34em] text-[clamp(13px,1vw,16px)] leading-relaxed text-ink-dim">
          Designs By Dart — websites for small businesses, designed and built from scratch since 2022.
        </p>
      </div>
      <div
        data-track
        className={`flex gap-[5vw] sm:gap-[2.6vw] ${still ? 'mt-10 snap-x snap-mandatory overflow-x-auto px-[8vw] pb-6 [scrollbar-width:none]' : 'mt-[8vh] w-max sm:mt-[6vh]'}`}
      >
        {clientCases.map((c, i) => (
          <SiteCard key={c.key} item={c} index={i} onOpen={() => onOpen(i)} />
        ))}
      </div>
    </div>
  )
}

export function buildClients(tl: Timeline, root: Element, start: number, len: number) {
  const track = root.querySelector<HTMLElement>('[data-track]')
  if (!track) return
  pass(tl, root.querySelector('[data-heading]'), start, len, { drift: 0.02, enter: 0.08, exit: 0.07 })
  // The row's first site enters at the right edge and its last leaves past the left.
  tl.fromTo(
    track,
    { x: vw(0.9) },
    { x: () => -(track.scrollWidth - window.innerWidth * 0.1), duration: len, ease: 'none', immediateRender: false },
    start,
  )
  tl.fromTo(track, { autoAlpha: 0 }, { autoAlpha: 1, duration: len * 0.06 }, start)
  tl.to(track, { autoAlpha: 0, duration: len * 0.06 }, start + len * 0.94)
}
