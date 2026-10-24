import { useEffect, useState, type ReactNode } from 'react'
import { onCrtBurst } from '@/lib/crt'
import { useMotionOK } from '@/lib/motion'
import { terminal } from '@/lib/sound'

/**
 * Now and then, at random (every 20–45 seconds), the screen glitches for a moment — true while it
 * does. Off with reduced motion.
 */
function useGlitch() {
  const motionOK = useMotionOK()
  const [glitching, setGlitching] = useState(false)
  useEffect(() => {
    if (!motionOK) return
    let timer = 0
    const next = () => {
      timer = window.setTimeout(
        () => {
          setGlitching(true)
          timer = window.setTimeout(() => {
            setGlitching(false)
            next()
          }, 260)
        },
        20000 + Math.random() * 25000,
      )
    }
    next()
    return () => clearTimeout(timer)
  }, [motionOK])
  return glitching
}

/** How long a screen shows data noise as it comes on, in ms. */
const ON_NOISE = 420

/**
 * Whether the screen is flooded with data noise: as it comes on, whenever a burst is called for (a
 * page turning, a search), and now and then by itself, the way the film's computers flash with
 * work. Off with reduced motion.
 */
function useNoise() {
  const motionOK = useMotionOK()
  const [noisy, setNoisy] = useState(false)
  useEffect(() => {
    if (!motionOK) return
    let end = 0
    let timer = 0
    let idle = 0
    const burst = (ms: number) => {
      end = Math.max(end, performance.now() + ms)
      setNoisy(true)
      clearTimeout(timer)
      timer = window.setTimeout(() => setNoisy(false), end - performance.now())
    }
    const unprompted = () => {
      idle = window.setTimeout(
        () => {
          burst(220 + Math.random() * 260)
          unprompted()
        },
        14000 + Math.random() * 22000,
      )
    }
    burst(ON_NOISE)
    unprompted()
    const off = onCrtBurst(burst)
    return () => {
      off()
      clearTimeout(timer)
      clearTimeout(idle)
    }
  }, [motionOK])
  return noisy
}

const LETTERS = 'ABDEGHIKLNOPRSTUVWYZ'
const DIGITS = '0123456789'
const NOISE_ROWS = 12
const rand = (n: number) => Math.floor(Math.random() * n)
const pick = (s: string) => s[rand(s.length)]

/** A scrap of the computer's working: a run of one letter or digit, a SYS code, a short code, an
 *  alert, or a lone character. */
function scrap() {
  const r = Math.random()
  if (r < 0.2) return pick(LETTERS).repeat(3 + rand(8))
  if (r < 0.32) return pick(DIGITS).repeat(2 + rand(4))
  if (r < 0.44) return `SYS ${rand(2) ? '0' : ''}${rand(10)}${rand(2) ? rand(10) : ''}`
  if (r < 0.66) return Array.from({ length: 2 + rand(3) }, () => pick(LETTERS + DIGITS)).join('')
  if (r < 0.7) return `ALERT N${1 + rand(9)}`
  return pick(LETTERS + DIGITS)
}

interface NoiseRow {
  scraps: { x: number; text: string }[]
  rule?: { x: number; w: number; white: boolean }
}

const noiseRow = (): NoiseRow => ({
  scraps: Array.from({ length: rand(5) }, () => ({ x: rand(88), text: scrap() })),
  rule: Math.random() < 0.38 ? { x: rand(40), w: 20 + rand(70), white: Math.random() < 0.3 } : undefined,
})
const noiseBoxes = () => Array.from({ length: rand(7) }, () => ({ x: rand(96), y: rand(96), white: Math.random() < 0.45 }))

/**
 * The screen full of the computer's working, as in the film while MU/TH/UR searches: rows of stray
 * letters, numbers and codes, rules in green and white, and solid blocks, a few rows changing
 * every frame.
 */
function DataNoise() {
  const [frame, setFrame] = useState(() => ({ rows: Array.from({ length: NOISE_ROWS }, noiseRow), boxes: noiseBoxes() }))
  useEffect(() => {
    const t = window.setInterval(() => setFrame((f) => ({ rows: f.rows.map((r) => (Math.random() < 0.45 ? noiseRow() : r)), boxes: noiseBoxes() })), 70)
    return () => clearInterval(t)
  }, [])
  return (
    <div aria-hidden className="crt-noise pointer-events-none absolute inset-0 z-[1] overflow-hidden px-[clamp(14px,3vw,40px)] py-[clamp(14px,3vh,30px)] text-[clamp(13px,1.05vw,16px)] leading-none uppercase">
      <div className="relative grid h-full" style={{ gridTemplateRows: `repeat(${NOISE_ROWS}, 1fr)` }}>
        {frame.rows.map((r, i) => (
          <div key={i} className="relative">
            {r.scraps.map((s, j) => (
              <span key={j} className="absolute top-0 whitespace-pre" style={{ left: `${s.x}%` }}>
                {s.text}
              </span>
            ))}
            {r.rule && <span className={`absolute bottom-[14%] h-[3px] ${r.rule.white ? 'crt-noise-white' : 'crt-noise-green'}`} style={{ left: `${r.rule.x}%`, width: `${r.rule.w}%` }} />}
          </div>
        ))}
        {frame.boxes.map((b, i) => (
          <span key={i} className={`absolute h-[0.85em] w-[1.1em] ${b.white ? 'crt-noise-white' : 'crt-noise-green'}`} style={{ left: `${b.x}%`, top: `${b.y}%` }} />
        ))}
      </div>
    </div>
  )
}

/**
 * One of the ship's screens from Alien: a curved phosphor-green CRT in a plastic bezel, with a
 * green title bar across the top (`controls` sit at its right end), the content in the middle, and
 * a line of key hints at the bottom. The content scrolls inside the screen if it runs long. It
 * floods with data noise as it comes on and while it works, and once in a while the picture
 * glitches.
 */
export default function Monitor({
  title,
  controls,
  hint,
  className = '',
  children,
}: {
  title: ReactNode
  controls?: ReactNode
  hint?: ReactNode
  className?: string
  children: ReactNode
}) {
  const glitching = useGlitch()
  const noisy = useNoise()
  return (
    // Following a link on the screen blips; buttons make their own sounds.
    <div
      className={`crt-bezel film flex flex-col ${glitching ? 'crt-glitching' : ''} ${className}`}
      onClickCapture={(e) => (e.target as Element).closest('a') && terminal.select()}
    >
      <div className="crt-screen flex min-h-0 flex-1 flex-col">
        <div aria-hidden className="crt-band" />
        <div className="crt-content flex min-h-0 flex-1 flex-col">
          <div className="crt-bar relative z-[1] mx-[clamp(10px,2vw,28px)] mt-[clamp(10px,2vw,24px)] flex items-center justify-between gap-4 px-3 text-[clamp(13px,1.12vw,17px)] leading-[1.8] uppercase">
            <span className="min-w-0 truncate">{title}</span>
            {controls && <span className="flex shrink-0 items-center gap-1">{controls}</span>}
          </div>
          <div className="relative flex min-h-0 flex-1 flex-col">
            <div className="relative z-[1] min-h-0 flex-1 overflow-x-hidden overflow-y-auto px-[clamp(14px,3vw,40px)] py-[clamp(14px,3vh,30px)] text-[clamp(13px,1.05vw,16px)] leading-[1.75]">
              {children}
            </div>
            {hint && (
              <div className="crt-dim relative z-[1] px-[clamp(14px,3vw,40px)] pb-[clamp(10px,2vh,20px)] text-[clamp(10px,0.82vw,12px)] uppercase">{hint}</div>
            )}
            {noisy && <DataNoise />}
          </div>
        </div>
      </div>
    </div>
  )
}

/** A key in the title bar — a terminal "button", inverse of the bar when pointed at. */
export function BarButton({ label, onClick, children }: { label: string; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="px-1.5 leading-[1.5] transition-colors hover:bg-[rgb(var(--crt-ink))] hover:text-[rgb(var(--crt))] hover:[text-shadow:none]"
    >
      {children}
    </button>
  )
}

/**
 * A logo traced in ASCII, drawn in the screen's phosphor type and sized so its widest line spans
 * its container: VT323's characters are 0.4em wide (with a hair to spare for rounding). `pre`
 * would otherwise take the browser's own monospace, which is far wider.
 */
export function Ascii({ art }: { art: string }) {
  const widest = Math.max(...art.split('\n').map((l) => l.length))
  return (
    <div className="[container-type:inline-size]">
      <pre aria-hidden className="overflow-hidden leading-[0.8] tracking-normal whitespace-pre [font-family:'VT323',monospace]" style={{ fontSize: `calc(100cqw / ${0.41 * widest})` }}>
        {art}
      </pre>
    </div>
  )
}

/** A small heading over part of a screen. */
export function ReadoutLabel({ children }: { children: ReactNode }) {
  return <div className="crt-dim mt-7 mb-2 uppercase first:mt-0">{children}</div>
}

/**
 * One line of a readout: an index, a name, dotted leaders, and a figure, in capitals the way the
 * ship's screens set everything. A link if `href` — it flips to inverse video when pointed at.
 */
export function Readout({ n, name, value, href }: { n?: number; name: ReactNode; value?: ReactNode; href?: string | null }) {
  const body = (
    <>
      {n !== undefined && <span className="crt-dim shrink-0">{String(n).padStart(2, '0')}</span>}
      <span className="min-w-0 truncate">{name}</span>
      {value !== undefined && (
        <>
          <span className="crt-leader flex-1" />
          <span className="max-w-[48%] shrink-0 truncate text-right">{value}</span>
        </>
      )}
    </>
  )
  const cls = 'flex items-baseline gap-3 px-1 uppercase'
  return href ? (
    <a href={href} target="_blank" rel="noreferrer" className={`crt-link ${cls}`}>
      {body}
    </a>
  ) : (
    <div className={cls}>{body}</div>
  )
}
