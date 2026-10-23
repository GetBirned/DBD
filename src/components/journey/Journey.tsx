import { lazy, Suspense, useRef, type ReactNode } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { Chapter, setChapterJump, useChapter, type ChapterId } from '@/components/chapters'
import { projects } from '@/data/projects'
import { useMotionOK } from '@/lib/motion'
import type { Timeline } from './motion'
import { requestRedraw, setPlayhead, sky } from './store'
import Title, { buildTitle } from './Title'
import Clients, { buildClients, CLIENT_COUNT, CLIENTS_PER } from './scenes/Clients'
import Contact, { buildContact } from './scenes/Contact'
import Hero, { buildHero, OPENING_LEN, TITLE_DONE } from './scenes/Hero'
import Life, { buildLife } from './scenes/Life'
import Projects, { buildProjects, PROJECTS_LEAD, PROJECTS_PER } from './scenes/Projects'
import Skills, { buildSkills } from './scenes/Skills'
import Words, { buildWords } from './scenes/Words'

gsap.registerPlugin(ScrollTrigger, useGSAP)
// Phones resize the viewport as the address bar slides; the journey is sized in svh, so there's
// nothing to re-measure for that.
ScrollTrigger.config({ ignoreMobileResize: true })

// three.js is most of the page's weight, so the sky loads on its own; the type is up before it.
const Sky = lazy(() => import('./Sky'))

interface Scene {
  id: string
  chapter: ChapterId
  /** Screens of scroll the scene gets — set by how much there is to read, not by any clock. */
  len: number
  /** Where the planet is (see `sky.pos`) when the scene ends. Long scenes move it slowly. */
  planet: number
  /** How far into the scene, in screens, the nav lands — once its content has arrived. */
  land: number
  build: (tl: Timeline, root: Element, start: number, len: number) => void
}

/** The planet's position as the page opens: its left limb a quarter of the way in from the right. */
const START = 0.26

/**
 * The whole journey. The left limb crosses the frame through the opening credits; the surface
 * fills it for what people say and the client work; the far horizon arrives with the projects;
 * open space again for skills and contact.
 */
const SCENES: Scene[] = [
  { id: 'hero', chapter: 'top', len: OPENING_LEN, planet: 0.85, land: 0, build: buildHero },
  { id: 'words', chapter: 'words', len: 1.8, planet: 1.2, land: 0.8, build: buildWords },
  { id: 'clients', chapter: 'clients', len: 0.6 + CLIENT_COUNT * CLIENTS_PER, planet: 2.0, land: 0.9, build: buildClients },
  {
    id: 'projects',
    chapter: 'projects',
    len: PROJECTS_LEAD + 0.05 + projects.length * PROJECTS_PER,
    planet: 2.55,
    land: PROJECTS_LEAD + PROJECTS_PER * 0.5,
    build: buildProjects,
  },
  { id: 'skills', chapter: 'skills', len: 2.6, planet: 2.84, land: 1.1, build: buildSkills },
  { id: 'life', chapter: 'life', len: 1.7, planet: 2.93, land: 0.8, build: buildLife },
  { id: 'contact', chapter: 'contact', len: 1.8, planet: 2.985, land: 1.8, build: buildContact },
]

const STARTS = SCENES.map((_, i) => SCENES.slice(0, i).reduce((t, s) => t + s.len, 0))
const TOTAL = SCENES.reduce((t, s) => t + s.len, 0)
const startOf = (id: string) => STARTS[SCENES.findIndex((s) => s.id === id)]

function content(id: string, still: boolean, open: (kind: 'client' | 'project', i: number) => void): ReactNode {
  switch (id) {
    case 'hero':
      return <Hero still={still} />
    case 'words':
      return <Words still={still} />
    case 'clients':
      return <Clients still={still} onOpen={(i) => open('client', i)} />
    case 'projects':
      return <Projects still={still} start={startOf('projects')} onOpen={(i) => open('project', i)} />
    case 'skills':
      return <Skills still={still} />
    case 'life':
      return <Life still={still} />
    case 'contact':
      return <Contact still={still} />
  }
}

/**
 * The portfolio as one continuous shot, after the opening of Alien (1979): a full-screen stage
 * pinned in place while a long run of scroll beneath it drives a single timeline. That timeline
 * moves the planet across the frame and brings every piece of content in and out, so the sky and
 * the type can never drift apart. Scroll down and the film advances; scroll up and it plays back;
 * stop and it holds.
 */
export default function Journey({ onOpen }: { onOpen: (kind: 'client' | 'project', i: number) => void }) {
  const motionOK = useMotionOK()
  return motionOK ? <Cinematic onOpen={onOpen} /> : <Still onOpen={onOpen} />
}

function Cinematic({ onOpen }: { onOpen: (kind: 'client' | 'project', i: number) => void }) {
  const runway = useRef<HTMLDivElement>(null)
  const stage = useRef<HTMLDivElement>(null)
  const { setCurrent } = useChapter()
  const chapter = useRef<ChapterId>('top')

  useGSAP(
    () => {
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: runway.current,
          start: 'top top',
          end: 'bottom bottom',
          // A short catch-up, so a mouse wheel's steps glide instead of jump — it still comes to
          // rest exactly where the scroll stopped.
          scrub: 0.6,
          invalidateOnRefresh: true,
        },
        onUpdate: () => {
          const t = tl.time()
          setPlayhead(t)
          requestRedraw()
          let i = 0
          while (i < SCENES.length - 1 && t >= STARTS[i + 1]) i++
          if (SCENES[i].chapter !== chapter.current) {
            chapter.current = SCENES[i].chapter
            setCurrent(chapter.current)
          }
        },
      })

      let pos = START
      sky.pos = START
      SCENES.forEach((s, i) => {
        const root = stage.current!.querySelector(`[data-scene="${s.id}"]`)!
        tl.addLabel(s.id, STARTS[i])
        tl.fromTo(sky, { pos }, { pos: s.planet, duration: s.len, immediateRender: false }, STARTS[i])
        s.build(tl, root, STARTS[i], s.len)
        pos = s.planet
      })
      // The title fills in across the opening credits, is whole as the last card arrives, and stays.
      buildTitle(tl, stage.current!.querySelector('[data-title-layer]')!, 0.35, TITLE_DONE)
      // Pad to exactly TOTAL screens, so timeline time maps 1:1 onto screens of scroll.
      tl.set({}, {}, TOTAL)

      setChapterJump((id, instant) => {
        const st = tl.scrollTrigger
        if (!st) return false
        const i = SCENES.findIndex((s) => s.chapter === id)
        const time = id === 'top' || i < 0 ? 0 : STARTS[i] + SCENES[i].land
        window.scrollTo({ top: st.start + (time / TOTAL) * (st.end - st.start), behavior: instant ? 'instant' : 'smooth' })
        return true
      })
      // Type metrics change when the web fonts arrive; re-measure anything sized off them.
      document.fonts?.ready.then(() => ScrollTrigger.refresh())
      return () => setChapterJump(null)
    },
    { scope: stage },
  )

  return (
    // The runway is one screen taller than the journey, because the stage stays pinned for the
    // runway's height less its own.
    <div ref={runway} className="relative" style={{ height: `${(TOTAL + 1) * 100}svh` }}>
      <div ref={stage} className="sticky top-0 h-[100svh] overflow-hidden">
        <div className="sky-fade absolute inset-0">
          <Suspense fallback={null}>
            <Sky />
          </Suspense>
        </div>
        {SCENES.map((s) => (
          <div key={s.id} data-scene={s.id} className="absolute inset-0">
            {content(s.id, false, onOpen)}
          </div>
        ))}
        <div data-title-layer>
          <Title />
        </div>
      </div>
    </div>
  )
}

/**
 * Reduced motion: the same content as an ordinary page, over a still frame of the sky, with
 * nothing tied to the scroll.
 */
function Still({ onOpen }: { onOpen: (kind: 'client' | 'project', i: number) => void }) {
  sky.pos = 0.3
  const chapters = [...new Set(SCENES.map((s) => s.chapter))]
  return (
    <div className="relative">
      <div className="fixed inset-0">
        <Suspense fallback={null}>
          <Sky />
        </Suspense>
      </div>
      <div className="relative">
        <Title still />
        {chapters.map((c) => (
          <Chapter key={c} id={c}>
            {SCENES.filter((s) => s.chapter === c).map((s) => (
              <section key={s.id}>
                {content(s.id, true, onOpen)}
              </section>
            ))}
          </Chapter>
        ))}
      </div>
    </div>
  )
}
