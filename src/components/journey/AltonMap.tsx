import { useEffect, useState, useRef, type PointerEvent } from 'react'
import { Ascii } from '@/components/Monitor'
import { ALTON_BOUNDS, ALTON_MAP } from '@/data/alton'
import { ALTON_ELEVATION } from '@/data/altonElevation'
import { WAYPOINTS } from '@/data/altonWaypoints'
import { useMotionOK } from '@/lib/motion'
import { terminal } from '@/lib/sound'

const { north, south, west, east } = ALTON_BOUNDS
const clamp = (v: number) => Math.min(1, Math.max(0, v))

/** Where a point on the map (0–1 across, 0–1 down) is on the earth. */
const position = (u: number, v: number) => ({ lat: north - v * (north - south), lon: west + u * (east - west) })

/** Ground elevation in feet at a point on the map, read between the surveyed grid's points. */
function elevation(u: number, v: number) {
  const { rows, cols, grid } = ALTON_ELEVATION
  const x = u * (cols - 1)
  const y = v * (rows - 1)
  const i = Math.min(cols - 2, Math.floor(x))
  const j = Math.min(rows - 2, Math.floor(y))
  const fx = x - i
  const fy = y - j
  const top = grid[j][i] * (1 - fx) + grid[j][i + 1] * fx
  const bottom = grid[j + 1][i] * (1 - fx) + grid[j + 1][i + 1] * fx
  return top * (1 - fy) + bottom * fy
}

/** How long the survey sweep takes to go round, in ms. */
const SWEEP = 6000
/** How near the crosshair has to come to a contact to lock onto it, as a share of the map. */
const SNAP = 0.035

/** Each contact where it sits on the map, and where the sweep finds it (degrees clockwise from north). */
const CONTACTS = WAYPOINTS.map((w) => {
  const u = (w.lon - west) / (east - west)
  const v = (north - w.lat) / (north - south)
  const bearing = ((Math.atan2(u - 0.5, -(v - 0.5)) * 180) / Math.PI + 360) % 360
  return { ...w, u, v, bearing }
})

/**
 * The topo map of Alton Bay in ASCII, as a survey screen. A sweep goes round it, lighting up the
 * contacts on file (with a ping) as it passes. Point anywhere (or drag a finger) and a crosshair
 * follows, reading out the true latitude, longitude and ground elevation of that spot, locking
 * onto a contact when it comes near one and showing what's there. The contacts are also listed to
 * pick from. At rest it reads the map's center.
 */
export default function AltonMap() {
  const motionOK = useMotionOK()
  const ref = useRef<HTMLDivElement>(null)
  const [at, setAt] = useState<{ u: number; v: number } | null>(null)
  /** The contact the crosshair is on: snapped to by pointing, or picked from the list. */
  const [contact, setContact] = useState<number | null>(null)
  const [picked, setPicked] = useState(false)

  const read = (e: PointerEvent) => {
    const r = ref.current!.getBoundingClientRect()
    const u = clamp((e.clientX - r.left) / r.width)
    const v = clamp((e.clientY - r.top) / r.height)
    const near = CONTACTS.findIndex((c) => Math.hypot(c.u - u, c.v - v) < SNAP)
    setPicked(false)
    setContact(near < 0 ? null : near)
    setAt(near < 0 ? { u, v } : { u: CONTACTS[near].u, v: CONTACTS[near].v })
  }

  const pick = (i: number) => {
    terminal.select()
    setPicked(true)
    setContact(i)
    setAt({ u: CONTACTS[i].u, v: CONTACTS[i].v })
  }

  // The sweep pings each contact as it passes over it.
  useEffect(() => {
    if (!motionOK) return
    const t0 = performance.now()
    let last = 0
    const timer = window.setInterval(() => {
      const now = ((performance.now() - t0) % SWEEP) / SWEEP
      const crossed = (b: number) => (last <= now ? b > last && b <= now : b > last || b <= now)
      if (CONTACTS.some((c) => crossed(c.bearing / 360))) terminal.ping()
      last = now
    }, 60)
    return () => clearInterval(timer)
  }, [motionOK])

  const u = at?.u ?? 0.5
  const v = at?.v ?? 0.5
  const { lat, lon } = position(u, v)
  const c = contact === null ? null : CONTACTS[contact]

  return (
    <div className="grid items-start gap-x-8 gap-y-5 lg:grid-cols-[minmax(0,1fr)_22em]">
      <div
        ref={ref}
        onPointerMove={read}
        onPointerDown={read}
        onPointerLeave={() => {
          if (picked) return
          setAt(null)
          setContact(null)
        }}
        className="relative mx-auto w-[min(100%,54svh)] cursor-crosshair touch-none overflow-hidden select-none"
      >
        <Ascii art={ALTON_MAP} />
        {motionOK && <div aria-hidden className="radar-sweep" style={{ animationDuration: `${SWEEP}ms` }} />}
        {CONTACTS.map((p, i) => (
          <span
            key={p.name}
            aria-hidden
            className={`radar-blip ${motionOK ? '' : 'radar-blip-still'} ${i === contact ? 'radar-blip-on' : ''}`}
            style={{ left: `${p.u * 100}%`, top: `${p.v * 100}%`, animationDuration: `${SWEEP}ms`, animationDelay: `${(p.bearing / 360) * SWEEP - SWEEP}ms` }}
          />
        ))}
        {at && (
          <div aria-hidden className="pointer-events-none absolute inset-0">
            <div className="absolute inset-y-0 w-px bg-[rgb(var(--crt)/0.7)] shadow-[0_0_6px_rgb(var(--crt-glow)/0.7)]" style={{ left: `${u * 100}%` }} />
            <div className="absolute inset-x-0 h-px bg-[rgb(var(--crt)/0.7)] shadow-[0_0_6px_rgb(var(--crt-glow)/0.7)]" style={{ top: `${v * 100}%` }} />
            <div
              className="absolute h-5 w-5 -translate-x-1/2 -translate-y-1/2 border border-[rgb(var(--crt))] shadow-[0_0_8px_rgb(var(--crt-glow)/0.7)]"
              style={{ left: `${u * 100}%`, top: `${v * 100}%` }}
            />
          </div>
        )}
      </div>

      <div className="min-w-0 uppercase">
        <div className="crt-dim">{c ? 'contact' : at ? 'reading' : 'map center'}</div>
        <dl className="mt-1 grid grid-cols-[auto_minmax(0,1fr)] gap-x-5 whitespace-nowrap tabular-nums">
          <dt className="crt-dim">lat</dt>
          <dd>{lat.toFixed(5)}° n</dd>
          <dt className="crt-dim">lon</dt>
          <dd>{Math.abs(lon).toFixed(5)}° w</dd>
          <dt className="crt-dim">elev</dt>
          <dd>{Math.round(elevation(u, v))} ft</dd>
        </dl>

        <div className="crt-box mt-4 min-h-[6.5em] p-4">
          {c ? (
            <>
              <div className="crt-inverse inline-block px-1">{c.name}</div>
              <div className="mt-2 normal-case">{c.note}</div>
            </>
          ) : (
            <div className="crt-dim">
              {CONTACTS.length} contacts on file. Point at one, or pick it below.
            </div>
          )}
        </div>

        <div className="mt-4 grid gap-x-4 sm:grid-cols-2 lg:grid-cols-1">
          {CONTACTS.map((p, i) => (
            <button
              key={p.name}
              type="button"
              onClick={() => pick(i)}
              aria-pressed={i === contact}
              className={`crt-link block px-1 text-left uppercase ${i === contact ? 'crt-inverse' : ''}`}
            >
              › {p.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
