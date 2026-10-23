import { useEffect, useRef, useState } from 'react'
import MediaFrame from '@/components/MediaFrame'
import { clientCases, isVideo, type CaseItem } from '@/lib/cases'
import { pass, type Timeline } from '../motion'

/**
 * A client site in a browser window. Shows a screenshot until hovered, then fades into the site's
 * scrolling walkthrough video — which isn't fetched at all until the first hover.
 */
function SiteCard({ item, onOpen }: { item: CaseItem; onOpen: () => void }) {
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
      className="group w-[74vw] shrink-0 snap-center text-left sm:w-[min(24vw,calc((100svh-360px)*1.6))]"
      aria-label={`${item.name} — open case study`}
    >
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
      {/* The name in the credits' type, glowing a little when the site is pointed at. */}
      <div className="credit mt-4 truncate text-center text-[clamp(18px,1.6vw,28px)] transition-[text-shadow] duration-300 group-hover:[text-shadow:0_0_1px_rgb(255_255_255/0.7),0_0_14px_rgb(255_255_255/0.45),0_0_30px_rgb(255_214_150/0.3)]">
        {item.name}
      </div>
    </button>
  )
}

/** Scroll, in screens, per client site in the passing row. */
export const CLIENTS_PER = 0.3
export const CLIENT_COUNT = clientCases.length

/**
 * Client work as a credit: "i've done sites for" on the left of the axis, and the sites themselves
 * on the right, a row that travels right to left past it with the planet. With reduced motion it's
 * a row you swipe yourself.
 */
export default function Clients({ still = false, onOpen }: { still?: boolean; onOpen: (i: number) => void }) {
  return (
    <div className={`flex flex-col items-center justify-center gap-[4vh] sm:flex-row sm:gap-0 ${still ? 'py-[8vh]' : 'h-full pt-[14vh] sm:pt-[10vh]'}`}>
      <h2
        data-heading
        className="credit shrink-0 px-[6vw] text-center text-[clamp(20px,2.6vw,46px)] leading-[1.18] text-ink/75 sm:w-[30vw] sm:px-0 sm:pr-[2.6vw] sm:text-right"
      >
        i've done sites for
      </h2>
      {/* The window the row passes through, its edges faded so sites drift in and out of view. */}
      <div
        className={`w-full sm:flex-1 ${still ? 'overflow-x-auto [scrollbar-width:none]' : 'overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_7%,#000_93%,transparent)]'}`}
      >
        <div data-track className={`flex w-max gap-[5vw] sm:gap-[2.6vw] ${still ? 'snap-x snap-mandatory px-[6vw] pb-6' : ''}`}>
          {clientCases.map((c, i) => (
            <SiteCard key={c.key} item={c} onOpen={() => onOpen(i)} />
          ))}
        </div>
      </div>
    </div>
  )
}

export function buildClients(tl: Timeline, root: Element, start: number, len: number) {
  const track = root.querySelector<HTMLElement>('[data-track]')
  if (!track) return
  const frame = track.parentElement!
  pass(tl, root.querySelector('[data-heading]'), start, len, { drift: 0.02, enter: 0.08, exit: 0.07 })
  // The row's first site enters at the window's right edge and its last leaves past the left.
  tl.fromTo(
    track,
    { x: () => frame.clientWidth * 0.95 },
    { x: () => -(track.scrollWidth - frame.clientWidth * 0.05), duration: len, ease: 'none', immediateRender: false },
    start,
  )
  tl.fromTo(track, { autoAlpha: 0 }, { autoAlpha: 1, duration: len * 0.06 }, start)
  tl.to(track, { autoAlpha: 0, duration: len * 0.06 }, start + len * 0.94)
}
