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

/** How far each card peeks out above the one that covers it. */
const PEEK = 14
/** The widest media in the deck. Every frame shares one height, chosen so this one still fits
 *  its column; narrower media just come out narrower. That keeps every card the same height,
 *  so the stack's edges line up, while each frame matches its own media exactly. */
const WIDEST = Math.max(...projects.map((p) => p.mediaRatio))
/**
 * The height a frame may use: the screen, less the sticky frame's padding (84px), the peeks
 * ((N−1)·PEEK), the card's header strip (~38px) and its padding — and, on phones, where the text
 * sits under the media instead of beside it, a reserve for that text (--text-reserve).
 */
const FRAME_ROOM = `calc(100svh - ${84 + (N - 1) * PEEK + 38}px - 2 * clamp(14px, 2vw, 32px) - var(--text-reserve))`

/**
 * One project as a card in its own colors, wrapped tightly around its media: the frame takes the
 * media's exact shape (no letterboxing, nothing cropped) and the card is only as tall as that.
 * Cards share one sticky frame, centered in it and each PEEK px lower than the one before, and
 * the frame height accounts for the peeks — so the whole stack, even the last card, stays on
 * screen.
 */
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
  const scale = useTransform(progress, [arrival(index), 1], [1, 1 - (N - 1 - index) * 0.025])
  const shade = useTransform(scale, (v) => Math.min(0.5, (1 - v) * 5))
  const media = p.video ?? p.screenshots?.[0]
  const video = !!media && media.endsWith('.webm')
  const ground = [p.cardTexture, p.cardBg].filter(Boolean).join(', ')
  const fg = dark ? 'text-paper' : 'text-ink'
  const rule = dark ? 'border-paper/25' : 'border-ink/25'

  const card = (
    <motion.article
      style={
        motionOK
          ? { scale, top: '50%', y: `calc(-50% + ${(index - (N - 1) / 2) * PEEK}px)`, maxHeight: `calc(100% - ${(N - 1) * PEEK}px)` }
          : undefined
      }
      className={`isolate flex origin-top flex-col overflow-hidden border border-ink ${fg} ${motionOK ? 'absolute inset-x-0' : 'relative'}`}
    >
      {/* Card ground: the project's own fill, plus its photo layer where it has one. `isolate`
          keeps these -z layers inside the card, so a covered card's text never shows through. */}
      <div className="absolute inset-0 -z-10" style={{ background: ground }} />
      {p.cardBgImage && (
        <>
          <img src={p.cardBgImage} alt="" loading="lazy" className="absolute inset-0 -z-10 h-full w-full object-cover" />
          <div className="absolute inset-0 -z-10" style={{ background: `rgba(0,0,0,${(p.cardScrim ?? 60) / 100})` }} />
        </>
      )}

      <div className={`flex items-baseline justify-between gap-6 border-b px-[clamp(14px,2vw,32px)] py-2.5 font-mono text-[11px] tracking-[0.1em] uppercase ${rule}`}>
        <span>
          {String(index + 1).padStart(2, '0')} / {String(N).padStart(2, '0')} — {p.tag}
        </span>
        <span className="hidden truncate opacity-70 lg:block">{p.stack}</span>
      </div>

      <div className="flex flex-col gap-[clamp(12px,2vh,24px)] p-[clamp(14px,2vw,32px)] [--text-reserve:270px] md:grid md:grid-cols-12 md:items-center md:gap-[3vw] md:[--text-reserve:0px]">
        {/* Media column is a size container, so the frame can be sized against its width. */}
        <div className="flex justify-center [container-type:inline-size] md:order-2 md:col-span-7 md:justify-end lg:col-span-8">
          <div
            className={`relative max-w-full overflow-hidden border ${rule}`}
            style={{ aspectRatio: p.mediaRatio, height: `min(${FRAME_ROOM}, calc(100cqw / ${WIDEST}))` }}
          >
            {media &&
              (video ? (
                <StackVideo src={media} armed={near && (!motionOK || index <= active + 1)} playing={near && (!motionOK || index === active)} />
              ) : (
                <img src={media} alt={`${p.name} screenshot`} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
              ))}
          </div>
        </div>

        {/* Text: natural height, so it's always fully on the card. Sized off the viewport height
            as well as width, so a short screen gets a smaller title rather than a clipped one. */}
        <div className="shrink-0 md:order-1 md:col-span-5 lg:col-span-4">
          {titleImage(p) ? (
            <img
              src={titleImage(p)}
              alt={p.name}
              className="h-auto max-h-[min(clamp(40px,6vw,110px),11vh)] w-auto max-w-full object-contain object-left"
            />
          ) : (
            <h3 className="display text-[min(clamp(44px,6vw,110px),11vh)]">{p.name}</h3>
          )}
          <p className={`mt-[clamp(8px,1.6vh,18px)] max-w-[36ch] text-[clamp(15px,min(1.4vw,2.2vh),21px)] leading-snug ${dark ? 'text-paper/85' : 'text-ink-dim'}`}>
            {p.pitch}
          </p>
          <div className="mt-[clamp(10px,2vh,22px)] flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onOpen}
              className={`inline-flex items-center gap-2 px-4 py-3 font-mono text-[11px] tracking-[0.1em] uppercase transition-colors sm:px-5 ${dark ? 'bg-paper text-ink hover:bg-white' : 'bg-ink text-paper hover:bg-accent'}`}
            >
              Case study
              <ArrowUpRight />
            </button>
            {p.url && (
              <a
                href={p.url}
                target="_blank"
                rel="noreferrer"
                className={`inline-flex items-center gap-2 border px-4 py-3 font-mono text-[11px] tracking-[0.1em] uppercase transition-colors sm:px-5 ${dark ? 'border-paper/40 hover:border-paper' : 'border-ink/40 hover:border-ink'}`}
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
              className={`flex h-[42px] w-[42px] items-center justify-center border transition-colors ${dark ? 'border-paper/40 hover:border-paper' : 'border-ink/40 hover:border-ink'}`}
            >
              <GitHubIcon size={15} />
            </a>
          </div>
        </div>
      </div>

      {/* Shade that deepens as later cards cover this one. */}
      {motionOK && <motion.div style={{ opacity: shade }} className="pointer-events-none absolute inset-0 bg-black" />}
    </motion.article>
  )

  if (!motionOK) return <div className="px-[4vw] py-3">{card}</div>
  return (
    <div className="sticky top-0 h-[100svh] px-[4vw] pt-[68px] pb-4">
      <div className="relative h-full">{card}</div>
    </div>
  )
}

function Heading({ stageRef }: { stageRef: RefObject<HTMLElement | null> }) {
  return (
    // Centered on the title: the spacing below lives on this row rather than on the heading, so
    // the heading's own bottom margin doesn't count toward the height the mark is centered on.
    <div className="mb-[6vw] flex items-center justify-between gap-10 px-[4vw]">
      <ChapterHeading title="Things I've *built.*" className="" />
      <div className="hidden shrink-0 lg:block">
        <Logo3D variant="code" width={230} height={230 / LOGO_ASPECT.code} interactionRef={stageRef} shadow={false} />
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
