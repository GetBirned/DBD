import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { motion, useScroll, useSpring, useTransform } from 'framer-motion'
import Credit from './Credit'
import MediaFrame from '@/components/MediaFrame'
import { ArrowUpRight } from '@/components/icons'
import { clientCases, isVideo, type CaseItem } from '@/lib/cases'
import { platforms } from '@/data/platforms'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { useMotionOK } from '@/lib/motion'

/**
 * A client site in a browser window. Shows a screenshot until hovered, then fades into the site's
 * scrolling walkthrough video — which isn't fetched at all until the first hover. On hover the
 * card lifts slightly and its frame brightens.
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
      className="group w-[86vw] shrink-0 snap-center text-left md:w-[min(62vw,calc((100svh-250px)*1.6),1150px)]"
      aria-label={`${item.name} — open case study`}
    >
      <div className="mb-3 flex items-baseline justify-between border-b border-line pb-2 font-mono text-[11px] tracking-[0.12em] text-ink-faint uppercase">
        <span>{String(index + 1).padStart(2, '0')}</span>
        <span>{item.tag}</span>
      </div>
      <div className="transition-[transform,filter] duration-500 ease-out group-hover:-translate-y-1 group-hover:brightness-110">
        <MediaFrame chrome domain={item.domain}>
          <div className="relative aspect-[16/10] overflow-hidden bg-bg-soft">
            {poster && (
              <img
                src={poster}
                alt=""
                loading="lazy"
                decoding="async"
                className="absolute inset-0 h-full w-full object-cover object-top"
              />
            )}
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
          <div className="credit truncate text-[clamp(21px,2.1vw,36px)]">{item.name}</div>
          <div className="mt-1.5 truncate font-mono text-[11px] tracking-[0.1em] text-ink-faint uppercase">{item.meta}</div>
        </div>
        <span className="flex h-11 w-11 shrink-0 items-center justify-center border border-line text-ink-dim transition-colors group-hover:border-ink group-hover:text-ink">
          <ArrowUpRight />
        </span>
      </div>
    </button>
  )
}

/** The gallery's opening credit, set before the first site. */
function Intro() {
  return (
    <div className="w-full shrink-0 md:w-[min(58vw,1000px)]">
      <Credit role="client websites by" names={['Designs By Dart']} note="Since 2022 · Alton, NH" className="mb-10" />
      <div className="hidden items-center justify-center gap-3 font-mono text-[11px] tracking-[0.2em] text-ink-faint uppercase md:flex">
        Keep scrolling
        <motion.span animate={{ x: [0, 8, 0] }} transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}>
          →
        </motion.span>
      </div>
    </div>
  )
}

function Outro() {
  return (
    <div className="flex w-[86vw] max-w-[520px] shrink-0 snap-center flex-col justify-center gap-10 border-l border-line pl-[4vw] md:w-[min(36vw,520px)]">
      <div>
        <div className="mb-5 font-mono text-[11px] tracking-[0.14em] text-ink-faint uppercase">Approved contractor</div>
        <div className="flex flex-wrap items-center gap-3">
          {[
            { src: '/logos/sbdc.svg', alt: "America's SBDC New Hampshire", href: 'https://www.nhsbdc.org/' },
            { src: '/logos/grdc.webp', alt: 'Grafton Regional Development Corporation', href: 'https://graftonrdc.org/' },
          ].map((c) => (
            <a key={c.src} href={c.href} target="_blank" rel="noreferrer" title={c.alt} className="opacity-75 transition-opacity hover:opacity-100">
              {/* Knocked out to white, so the marks sit in the sky rather than on white tiles. */}
              <img src={c.src} alt={c.alt} loading="lazy" className="h-11 w-auto brightness-0 invert" />
            </a>
          ))}
        </div>
      </div>
      <div>
        <div className="mb-5 font-mono text-[11px] tracking-[0.14em] text-ink-faint uppercase">Built on whatever fits</div>
        <div className="flex items-center gap-6">
          {platforms.map((p) => (
            <img key={p.name} src={p.logo} alt={p.name} title={p.name} loading="lazy" className="h-7 w-auto opacity-60 brightness-0 invert" />
          ))}
        </div>
      </div>
      <a
        href="mailto:dartbirnie@gmail.com?subject=Website%20project"
        className="inline-flex w-fit items-center gap-2 border border-line px-6 py-4 font-mono text-xs tracking-[0.12em] text-ink uppercase transition-colors hover:border-ink"
      >
        Start a site with me <ArrowUpRight />
      </a>
    </div>
  )
}

/**
 * Client sites as a gallery that scrolls sideways while the page scrolls down: the section pins
 * and its track slides left by exactly the distance it overflows the screen. On phones (and with
 * reduced motion) it's a native swipeable row instead — pinned sideways scroll fights touch.
 */
export default function ClientsGallery({ onOpen }: { onOpen: (i: number) => void }) {
  const motionOK = useMotionOK()
  const wide = useMediaQuery('(min-width: 768px)')
  const pinned = motionOK && wide
  const sectionRef = useRef<HTMLElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const [travel, setTravel] = useState(0)

  useLayoutEffect(() => {
    if (!pinned || !trackRef.current) return
    const track = trackRef.current
    const measure = () => setTravel(Math.max(0, track.scrollWidth - window.innerWidth))
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(track)
    window.addEventListener('resize', measure)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [pinned])

  // Scroll distance through the section equals `travel`, so progress maps 1:1 onto the slide.
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end end'] })
  const smooth = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.35 })
  const x = useTransform(smooth, [0, 1], [0, -travel])

  const cards = clientCases.map((c, i) => <SiteCard key={c.key} item={c} index={i} onOpen={() => onOpen(i)} />)

  if (!pinned) {
    return (
      <section ref={sectionRef} className="py-[12vh]">
        <div className="px-[4vw]">
          <Intro />
        </div>
        <div className="flex snap-x snap-mandatory gap-5 overflow-x-auto px-[4vw] pt-6 pb-8 [scrollbar-width:none]">
          {cards}
          <Outro />
        </div>
      </section>
    )
  }

  return (
    <section ref={sectionRef} className="relative" style={{ height: `calc(100vh + ${travel}px)` }}>
      <div className="sticky top-0 flex h-screen items-center overflow-hidden">
        <motion.div
          ref={trackRef}
          style={{ x }}
          className="flex w-max items-center gap-[4vw] pr-[6vw] pl-[4vw]"
        >
          <Intro />
          {cards}
          <Outro />
        </motion.div>
      </div>
    </section>
  )
}
