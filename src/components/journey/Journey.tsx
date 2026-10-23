import { lazy, Suspense, useRef, type ReactNode } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { Chapter, setChapterJump, useChapter, type ChapterId } from '@/components/chapters'
import { useMotionOK } from '@/lib/motion'
import type { Timeline } from './motion'
import { requestRedraw, sky } from './store'
import Title, { buildTitle } from './Title'
import Clients, { buildClients } from './scenes/Clients'
import Contact, { buildContact } from './scenes/Contact'
import Hero, { buildHero, OPENING_LEN } from './scenes/Hero'
import Life, { buildLife } from './scenes/Life'
import Projects, { buildProjects } from './scenes/Projects'
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
  /** Where the planet is (see `sky.pos`) when the scene ends. */
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
  { id: 'hero', chapter: 'top', len: OPENING_LEN, planet: 0.95, land: 0, build: buildHero },
  { id: 'words', chapter: 'words', len: 1.8, planet: 1.3, land: 0.8, build: buildWords },
  { id: 'clients', chapter: 'clients', len: 1.8, planet: 1.75, land: 0.8, build: buildClients },
  { id: 'projects', chapter: 'projects', len: 1.8, planet: 2.25, land: 0.8, build: buildProjects },
  { id: 'skills', chapter: 'skills', len: 2.6, planet: 2.65, land: 1.1, build: buildSkills },
  { id: 'life', chapter: 'life', len: 1.7, planet: 2.9, land: 0.8, build: buildLife },
  { id: 'contact', chapter: 'contact', len: 1.8, planet: 2.985, land: 1.8, build: buildContact },
]

const STARTS = SCENES.map((_, i) => SCENES.slice(0, i).reduce((t, s) => t + s.len, 0))
const TOTAL = SCENES.reduce((t, s) => t + s.len, 0)

/** The planet's position at each scene boundary: where it starts, then where each scene leaves it. */
const KEYS_T = [0, ...SCENES.map((s, i) => STARTS[i] + s.len)]
const KEYS_P = [START, ...SCENES.map((s) => s.planet)]

/**
 * Tangents for a monotone cubic through the keys (Fritsch–Carlson): the curve passes through every
 * key, never runs backwards, and never overshoots one.
 */
const TANGENTS = (() => {
  const n = KEYS_T.length
  const d = KEYS_T.slice(1).map((t, k) => (KEYS_P[k + 1] - KEYS_P[k]) / (t - KEYS_T[k]))
  const m = KEYS_T.map((_, k) => (k === 0 ? d[0] : k === n - 1 ? d[n - 2] : d[k - 1] * d[k] <= 0 ? 0 : (d[k - 1] + d[k]) / 2))
  d.forEach((dk, k) => {
    if (dk === 0) {
      m[k] = m[k + 1] = 0
      return
    }
    const a = m[k] / dk
    const b = m[k + 1] / dk
    const h = Math.hypot(a, b)
    if (h > 3) {
      m[k] = (3 / h) * a * dk
      m[k + 1] = (3 / h) * b * dk
    }
  })
  return m
})()

/**
 * Where the planet is `t` screens into the journey. A smooth curve through the scene boundaries
 * rather than a straight line between each pair, so its speed eases from one scene's pace to the
 * next instead of jumping at every boundary.
 */
function planetAt(t: number) {
  if (t <= 0) return KEYS_P[0]
  if (t >= TOTAL) return KEYS_P[KEYS_P.length - 1]
  let k = 0
  while (k < KEYS_T.length - 2 && t > KEYS_T[k + 1]) k++
  const h = KEYS_T[k + 1] - KEYS_T[k]
  const u = (t - KEYS_T[k]) / h
  const u2 = u * u
  const u3 = u2 * u
  return (
    (2 * u3 - 3 * u2 + 1) * KEYS_P[k] +
    (u3 - 2 * u2 + u) * h * TANGENTS[k] +
    (-2 * u3 + 3 * u2) * KEYS_P[k + 1] +
    (u3 - u2) * h * TANGENTS[k + 1]
  )
}

/** The point in the journey (in screens) at which the planet reaches `pos`, found by halving. */
function timeAtPlanet(pos: number) {
  let lo = 0
  let hi = TOTAL
  for (let i = 0; i < 40; i++) {
    const mid = (lo + hi) / 2
    if (planetAt(mid) < pos) lo = mid
    else hi = mid
  }
  return hi
}

/**
 * The title is whole once the planet's far edge has nearly left the frame — a tenth of the way in
 * from the left, where ALIEN completes over the last of the planet in the film.
 */
const TITLE_DONE = timeAtPlanet(2.9)

function content(id: string, still: boolean, open: (kind: 'client' | 'project', i: number) => void): ReactNode {
  switch (id) {
    case 'hero':
      return <Hero still={still} />
    case 'words':
      return <Words still={still} />
    case 'clients':
      return <Clients still={still} onOpen={(i) => open('client', i)} />
    case 'projects':
      return <Projects still={still} onOpen={(i) => open('project', i)} />
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
          // The planet follows the playhead along its curve; the sky repaints to match.
          sky.pos = planetAt(t)
          requestRedraw()
          let i = 0
          while (i < SCENES.length - 1 && t >= STARTS[i + 1]) i++
          if (SCENES[i].chapter !== chapter.current) {
            chapter.current = SCENES[i].chapter
            setCurrent(chapter.current)
          }
        },
      })

      sky.pos = START
      SCENES.forEach((s, i) => {
        const root = stage.current!.querySelector(`[data-scene="${s.id}"]`)!
        tl.addLabel(s.id, STARTS[i])
        s.build(tl, root, STARTS[i], s.len)
      })
      // The title fills in across the journey and is whole as the planet's far edge leaves the frame.
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
        {/* Everything in front of the sky, under one soft-focus filter, like an old print. */}
        <div className="film absolute inset-0">
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
      <div className="film relative">
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
