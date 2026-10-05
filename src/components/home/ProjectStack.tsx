import { useEffect, useRef, useState, type RefObject } from 'react'
import { motion, useInView, useMotionValueEvent, useScroll, useTransform, type MotionValue } from 'framer-motion'
import ChapterHeading from './ChapterHeading'
import Logo3D, { LOGO_ASPECT } from '@/components/Logo3D'
import { ArrowUpRight, GitHubIcon } from '@/components/icons'
import { projects, type ProjectData } from '@/data/projects'
import { useMotionOK } from '@/lib/motion'

const N = projects.length
/** Extra scroll (in screens) after the last card lands, so the finished stack holds a beat. */
const HOLD = 0.35
/** Scroll progress at which card `i` has fully slid into place. */
const arrival = (i: number) => i / (N - 1 + HOLD)
/** How far each card peeks out above the one that covers it. */
const PEEK = 18

/** Wordmark when the brand has one; otherwise the logo variant that reads on this card's ground. */
const titleImage = (p: ProjectData) => p.nameLogo ?? (p.cardDark ? (p.logoDark ?? p.logo) : p.logo)

/**
 * Only fetches once its card is next up, and only plays while its card is the one on top — the
 * covered cards stay on screen underneath, so viewport visibility alone would leave every video
 * in the stack playing at once.
 */
function StackVideo({ src, armed, playing }: { src: string; armed: boolean; playing: boolean }) {
  const ref = useRef<HTMLVideoElement>(null)
  const [loaded, setLoaded] = useState(armed)
  if (armed && !loaded) setLoaded(true)

  useEffect(() => {
    const v = ref.current
    if (!v) return
    if (playing) v.play().catch(() => {})
    else v.pause()
  }, [playing, loaded])

  return (
    <video
      ref={ref}
      src={loaded ? src : undefined}
      muted
      loop
      playsInline
      preload="metadata"
      className="absolute inset-0 h-full w-full object-cover"
    />
  )
}

function StackCard({
  project: p,
  index,
  progress,
  active,
  near,
  onOpen,
}: {
  project: ProjectData
  index: number
  progress: MotionValue<number>
  active: number
  /** The deck is within a screen of the viewport — nothing loads before that. */
  near: boolean
  onOpen: () => void
}) {
  const motionOK = useMotionOK()
  const dark = !!p.cardDark
  // Each card recedes as the ones after it pile on — the earliest shrinks most.
  const finalScale = 1 - (N - 1 - index) * 0.045
  const scale = useTransform(progress, [arrival(index), 1], [1, finalScale])
  const shade = useTransform(scale, (s) => Math.min(0.6, (1 - s) * 3.2))
  const media = p.video ?? p.screenshots?.[0]
  const video = !!media && media.endsWith('.webm')
  const ground = [p.cardTexture, p.cardBg].filter(Boolean).join(', ')

  return (
    <div
      className={
        motionOK
          ? 'sticky top-0 flex h-[100svh] items-center justify-center px-4 pt-14 sm:px-8'
          : 'flex justify-center px-4 py-6 sm:px-8'
      }
    >
      <motion.article
        style={motionOK ? { scale, y: index * PEEK } : undefined}
        className="relative grid h-[calc(100svh-8rem)] max-h-[700px] w-full max-w-[1180px] origin-top grid-rows-[minmax(0,1fr)_auto] overflow-hidden rounded-[30px] shadow-[0_50px_100px_-40px_rgba(0,0,0,0.95)] lg:h-[min(76svh,640px)] lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:grid-rows-1"
      >
        {/* Card ground: the project's own fill, plus its photo layer where it has one. */}
        <div className="absolute inset-0" style={{ background: ground }} />
        {p.cardBgImage && (
          <>
            <img src={p.cardBgImage} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0" style={{ background: `rgba(0,0,0,${(p.cardScrim ?? 60) / 100})` }} />
          </>
        )}

        {/* Media runs to the card's edge; a fade in the card's own color melts it into the text side. */}
        <div className="relative min-h-0 overflow-hidden">
          {media &&
            (video ? (
              <StackVideo src={media} armed={near && (!motionOK || index <= active + 1)} playing={near && (!motionOK || index === active)} />
            ) : (
              <img src={media} alt={`${p.name} screenshot`} loading="lazy" className="absolute inset-0 h-full w-full object-contain p-6" />
            ))}
          <div
            className="absolute inset-0 hidden lg:block"
            style={{ background: `linear-gradient(90deg, transparent 72%, ${p.cardBgImage ? 'rgba(0,0,0,0.55)' : p.cardBg})` }}
          />
          <div
            className="absolute inset-0 lg:hidden"
            style={{ background: `linear-gradient(180deg, transparent 70%, ${p.cardBgImage ? 'rgba(0,0,0,0.55)' : p.cardBg})` }}
          />
        </div>

        <div className={`relative flex flex-col justify-center p-6 sm:p-8 lg:p-10 ${dark ? 'text-white' : 'text-[oklch(0.2_0.02_80)]'}`}>
          <div className={`font-mono text-[11px] tracking-[0.18em] uppercase ${dark ? 'text-white/50' : 'opacity-60'}`}>
            {String(index + 1).padStart(2, '0')} / {String(N).padStart(2, '0')} · {p.tag}
          </div>
          {titleImage(p) ? (
            <img src={titleImage(p)} alt={p.name} className="mt-4 h-auto max-h-11 w-auto max-w-full object-contain object-left sm:max-h-16" />
          ) : (
            <h3 className="mt-4 text-4xl">{p.name}</h3>
          )}
          <p className={`mt-4 text-[16px] leading-relaxed sm:mt-5 sm:text-[19px] ${dark ? 'text-white/85' : ''}`}>{p.pitch}</p>
          <div className="mt-4 hidden flex-wrap gap-2 sm:mt-5 sm:flex">
            {p.stack.split(' · ').map((t) => (
              <span
                key={t}
                className={`rounded-full px-3 py-1 font-mono text-[11px] ring-1 ${dark ? 'text-white/70 ring-white/15' : 'ring-black/15'}`}
              >
                {t}
              </span>
            ))}
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-2.5 sm:mt-7 sm:gap-3">
            <button
              type="button"
              onClick={onOpen}
              className={`inline-flex items-center gap-2 rounded-full px-5 py-3 font-mono text-xs tracking-wide uppercase transition-transform hover:-translate-y-0.5 ${dark ? 'bg-white text-black' : 'bg-[oklch(0.2_0.02_80)] text-white'}`}
            >
              Case study
              <ArrowUpRight />
            </button>
            {p.url && (
              <a
                href={p.url}
                target="_blank"
                rel="noreferrer"
                className={`inline-flex items-center gap-2 rounded-full px-5 py-3 font-mono text-xs tracking-wide uppercase ring-1 transition-colors ${dark ? 'ring-white/25 hover:bg-white/10' : 'ring-black/20 hover:bg-black/5'}`}
              >
                Visit
                <ArrowUpRight />
              </a>
            )}
            <a
              href={p.repo}
              target="_blank"
              rel="noreferrer"
              aria-label={`${p.name} on GitHub`}
              className={`flex h-11 w-11 items-center justify-center rounded-full ring-1 transition-colors ${dark ? 'ring-white/25 hover:bg-white/10' : 'ring-black/20 hover:bg-black/5'}`}
            >
              <GitHubIcon size={16} />
            </a>
          </div>
        </div>

        {/* Shade that deepens as later cards cover this one. */}
        {motionOK && <motion.div style={{ opacity: shade }} className="pointer-events-none absolute inset-0 bg-black" />}
      </motion.article>
    </div>
  )
}

function Heading({ stageRef }: { stageRef: RefObject<HTMLElement | null> }) {
  return (
    <div className="mx-auto flex max-w-[1120px] items-end justify-between gap-10 px-6 sm:px-12">
      <ChapterHeading
        title="Things I've *built.*"
      />
      <div className="mb-16 hidden shrink-0 lg:block">
        <Logo3D variant="code" width={190} height={190 / LOGO_ASPECT.code} interactionRef={stageRef} />
      </div>
    </div>
  )
}

/**
 * The projects as a deck: each card pins to the screen and the next slides up over it, while the
 * ones beneath shrink back and dim, their edges still peeking out above.
 */
export default function ProjectStack({ onOpen }: { onOpen: (i: number) => void }) {
  const sectionRef = useRef<HTMLElement>(null)
  const deckRef = useRef<HTMLDivElement>(null)
  const motionOK = useMotionOK()
  const { scrollYProgress } = useScroll({ target: deckRef, offset: ['start start', 'end end'] })
  const [active, setActive] = useState(0)
  // Without this, the first two cards' videos would download on page load: "top card and the
  // next one" is true for cards 0 and 1 long before anyone scrolls down to the deck.
  const near = useInView(deckRef, { margin: '100% 0px' })

  // The top card is the last one whose arrival point has been passed — drives video playback.
  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    let i = 0
    while (i < N - 1 && v >= arrival(i + 1) - 0.02) i++
    setActive(i)
  })

  return (
    <section ref={sectionRef} className="pt-[14vh]">
      <Heading stageRef={sectionRef} />
      <div ref={deckRef} className="relative">
        {projects.map((p, i) => (
          <StackCard key={p.name} project={p} index={i} progress={scrollYProgress} active={active} near={near} onOpen={() => onOpen(i)} />
        ))}
        {motionOK && <div style={{ height: `${HOLD * 100}svh` }} />}
      </div>
    </section>
  )
}
