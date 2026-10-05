import { useChapter, type ChapterId } from './chapters'

/** Two glows per chapter — the backdrop crossfades to the current chapter's pair. */
const PALETTES: Record<ChapterId, [string, string]> = {
  top: ['oklch(0.58 0.17 258 / 0.34)', 'oklch(0.52 0.21 300 / 0.3)'],
  career: ['oklch(0.55 0.15 245 / 0.36)', 'oklch(0.6 0.12 205 / 0.24)'],
  clients: ['oklch(0.6 0.12 188 / 0.26)', 'oklch(0.52 0.17 272 / 0.3)'],
  projects: ['oklch(0.52 0.21 300 / 0.32)', 'oklch(0.58 0.21 345 / 0.26)'],
  toolkit: ['oklch(0.6 0.13 165 / 0.22)', 'oklch(0.55 0.15 240 / 0.3)'],
  life: ['oklch(0.58 0.21 345 / 0.3)', 'oklch(0.66 0.16 48 / 0.22)'],
}

/**
 * The page's living background: a near-black ground with two slow-drifting glows that change
 * color chapter by chapter. Only opacity changes between palettes, so the crossfade stays on the
 * compositor; inactive palettes pause their drift.
 */
export default function Backdrop() {
  const { current } = useChapter()

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-bg">
      {(Object.entries(PALETTES) as [ChapterId, [string, string]][]).map(([id, [a, b]]) => {
        const on = id === current
        const play = { animationPlayState: on ? 'running' : 'paused' } as const
        return (
          <div
            key={id}
            className="absolute inset-0 transition-opacity duration-[1600ms] ease-out"
            style={{ opacity: on ? 1 : 0 }}
          >
            <div
              className="drift-a absolute -top-[25%] -left-[20%] h-[85vh] w-[75vw]"
              style={{ ...play, background: `radial-gradient(closest-side, ${a}, transparent)` }}
            />
            <div
              className="drift-b absolute -right-[20%] -bottom-[30%] h-[90vh] w-[75vw]"
              style={{ ...play, background: `radial-gradient(closest-side, ${b}, transparent)` }}
            />
          </div>
        )
      })}
    </div>
  )
}
