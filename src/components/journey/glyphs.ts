/**
 * The title, drawn as strokes in Helvetica Black's proportions (cap height 100): every stem,
 * diagonal, bar and bowl is its own shape, so the title can assemble one stroke at a time the way
 * ALIEN does. Drawn rather than typeset, so it looks the same everywhere and never waits on a font.
 *
 * `kind` sets the order things arrive in: uprights and diagonals first, so for a while the title is
 * a row of disconnected lines; then the bars; the bowls that make it readable come last.
 */
type Kind = 'line' | 'bar' | 'curve'

interface Glyph {
  width: number
  strokes: [d: string, kind: Kind][]
}

const GLYPHS: Record<string, Glyph> = {
  D: {
    width: 88,
    strokes: [
      ['M0 0H27V100H0Z', 'line'],
      ['M25 0H46C72 0 88 18 88 50C88 82 72 100 46 100H25V76H43C56 76 61 67 61 50C61 33 56 24 43 24H25Z', 'curve'],
    ],
  },
  A: {
    width: 100,
    strokes: [
      ['M0 100L34 0H61L28 100Z', 'line'],
      ['M100 100L66 0H39L72 100Z', 'line'],
      ['M39 58H61L68 79H32Z', 'bar'],
    ],
  },
  R: {
    width: 90,
    strokes: [
      ['M0 0H27V100H0Z', 'line'],
      ['M25 0H52C74 0 86 12 86 30C86 48 74 60 52 60H25V38H48C55 38 59 35 59 30C59 25 55 22 48 22H25Z', 'curve'],
      ['M46 52H74L90 100H61Z', 'line'],
    ],
  },
  T: {
    width: 88,
    strokes: [
      ['M0 0H88V24H0Z', 'bar'],
      ['M30.5 22H57.5V100H30.5Z', 'line'],
    ],
  },
}

/** Space between letters, in the same units — wide, the way the film spaces ALIEN. */
const TRACK = 150

export interface PlacedStroke {
  d: string
  x: number
  /** 0–1: when this stroke arrives in the assembly. */
  rank: number
}

/** Small seeded PRNG, so the order is the same on every visit. */
function mulberry32(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// Each kind arrives across its own stretch of the assembly; they overlap so it never reads as
// three separate phases.
const SPANS: Record<Kind, [number, number]> = { line: [0, 0.55], bar: [0.35, 0.85], curve: [0.5, 1] }

/** Lays out a word as positioned strokes, each with the point in the assembly it arrives at. */
export function layoutWord(word: string): { width: number; strokes: PlacedStroke[] } {
  const strokes: PlacedStroke[] = []
  let x = 0
  ;[...word].forEach((ch, i) => {
    const g = GLYPHS[ch]
    const rand = mulberry32((i + 1) * 7919)
    g.strokes.forEach(([d, kind]) => {
      const [a, b] = SPANS[kind]
      strokes.push({ d, x, rank: a + (b - a) * rand() })
    })
    x += g.width + TRACK
  })
  return { width: x - TRACK, strokes }
}
