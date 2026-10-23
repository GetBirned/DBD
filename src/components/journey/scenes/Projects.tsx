import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { useInView } from 'framer-motion'
import { ArrowUpRight, GitHubIcon } from '@/components/icons'
import { projects, type ProjectData } from '@/data/projects'
import { beatAt, beats, type Timeline } from '../motion'
import { onPlayhead } from '../store'

/** Scroll, in screens, that each project gets. */
export const PROJECTS_PER = 1.4
/** Lead-in before the first project. */
export const PROJECTS_LEAD = 0.15

/** The project's wordmark where it has one drawn for a dark ground; otherwise its name is set. */
const titleImage = (p: ProjectData) => p.nameLogo ?? p.logoDark

/**
 * Only fetches once its project is next up, and only plays while its project is the one in frame.
 */
function ProjectVideo({ src, armed, playing }: { src: string; armed: boolean; playing: boolean }) {
  const ref = useRef<HTMLVideoElement>(null)
  const [loaded, setLoaded] = useState(armed)
  if (armed && !loaded) setLoaded(true)

  useEffect(() => {
    const v = ref.current
    if (!v) return
    if (playing) v.play().catch(() => {})
    else v.pause()
  }, [playing, loaded])

  return <video ref={ref} src={loaded ? src : undefined} muted loop playsInline preload="metadata" className="absolute inset-0 h-full w-full object-cover" />
}

/**
 * One project, composed for the frame under the title: its media on the left in a thin frame cut
 * to the media's exact shape, and on the right its name, a line about it, what it's built with,
 * and the ways in beneath. Sized off the screen's height as well as its width, so the whole thing
 * is always on screen. On phones the text sits under the media.
 */
function Showcase({ p, i, still, active, onOpen }: { p: ProjectData; i: number; still: boolean; active: number; onOpen: () => void }) {
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, { margin: '-20% 0px' })
  const media = p.video ?? p.screenshots?.[0]
  const video = !!media && media.endsWith('.webm')
  const title = titleImage(p)
  const armed = still ? inView : Math.abs(i - active) <= 1
  const playing = still ? inView : i === active

  return (
    <article
      ref={ref}
      data-beat
      className={`grid w-[88vw] items-center gap-[3vh] sm:grid-cols-12 sm:gap-[4vw] ${still ? 'mx-auto py-[8vh]' : 'absolute top-[60%] left-1/2 -translate-x-1/2 -translate-y-1/2'}`}
    >
      {/* Media column is a size container, so the frame can be sized against its width. */}
      <div className="flex justify-center [container-type:inline-size] sm:col-span-7 sm:justify-end">
        {/* As tall as the column's width allows at the media's shape, capped by what the screen's
            height leaves under the title — less on phones, where the text sits underneath. */}
        <div
          className="relative h-[min(calc(100cqw/var(--r)),28svh)] max-w-full overflow-hidden border border-line bg-bg-soft sm:h-[min(calc(100cqw/var(--r)),calc(100svh-330px))]"
          style={{ aspectRatio: p.mediaRatio, '--r': p.mediaRatio } as CSSProperties}
        >
          {media &&
            (video ? (
              <ProjectVideo src={media} armed={armed} playing={playing} />
            ) : (
              <img src={media} alt={`${p.name} screenshot`} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
            ))}
        </div>
      </div>

      <div className="text-center sm:col-span-5">
        <div className="font-mono text-[10px] tracking-[0.16em] text-ink-faint uppercase sm:text-[11px]">
          {String(i + 1).padStart(2, '0')} / {String(projects.length).padStart(2, '0')} — {p.tag}
        </div>
        <div className="mt-[2vh] flex justify-center">
          {title ? (
            <img src={title} alt={p.name} className="h-auto max-h-[min(clamp(36px,5vw,96px),11vh)] w-auto max-w-full object-contain" />
          ) : (
            <h3 className="display text-[min(clamp(30px,3.6vw,64px),8vh)]">{p.name}</h3>
          )}
        </div>
        <p className="mx-auto mt-[2vh] max-w-[36ch] text-[clamp(15px,min(1.3vw,2.2vh),20px)] leading-snug text-ink-dim">{p.pitch}</p>
        <p className="mt-[1.6vh] font-mono text-[10px] tracking-[0.08em] text-ink-faint sm:text-[11px]">{p.stack}</p>
        <div className="mt-[2.4vh] flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            onClick={onOpen}
            className="inline-flex items-center gap-2 bg-ink px-4 py-3 font-mono text-[11px] tracking-[0.12em] text-paper uppercase transition-colors hover:bg-white"
          >
            Case study <ArrowUpRight />
          </button>
          {p.url && (
            <a
              href={p.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 border border-line px-4 py-3 font-mono text-[11px] tracking-[0.12em] uppercase transition-colors hover:border-ink"
            >
              Live <ArrowUpRight />
            </a>
          )}
          <a
            href={p.repo}
            target="_blank"
            rel="noreferrer"
            aria-label={`${p.name} source on GitHub`}
            className="inline-flex items-center gap-2 border border-line px-4 py-3 font-mono text-[11px] tracking-[0.12em] uppercase transition-colors hover:border-ink"
          >
            <GitHubIcon size={13} /> Source
          </a>
        </div>
      </div>
    </article>
  )
}

/**
 * Selected projects, each composed in its own stretch of the journey: one comes forward while the
 * one before recedes, all of it moving right to left with the planet's far horizon behind.
 */
export default function Projects({ still = false, start = 0, onOpen }: { still?: boolean; start?: number; onOpen: (i: number) => void }) {
  const [active, setActive] = useState(-9)

  // Which project is in frame decides which video plays. Read from the timeline's playhead, and
  // only re-rendered when it actually changes.
  useEffect(() => {
    if (still) return
    const first = start + PROJECTS_LEAD
    const len = projects.length * PROJECTS_PER
    return onPlayhead((t) => {
      const next = t < first - 1 || t > first + len + 0.5 ? -9 : beatAt(t, first, len, projects.length)
      setActive((a) => (a === next ? a : next))
    })
  }, [still, start])

  return (
    <div className={still ? '' : 'h-full'}>
      <h2 className="sr-only">Selected projects</h2>
      {projects.map((p, i) => (
        <Showcase key={p.name} p={p} i={i} still={still} active={active} onOpen={() => onOpen(i)} />
      ))}
    </div>
  )
}

export function buildProjects(tl: Timeline, root: Element, start: number, len: number) {
  beats(tl, [...root.querySelectorAll('[data-beat]')], start + PROJECTS_LEAD, len - PROJECTS_LEAD - 0.05, { drift: 0.22 })
}
