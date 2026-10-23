import { useRef, useState, type PointerEvent } from 'react'
import { Ascii } from '@/components/Monitor'
import { ALTON_BOUNDS, ALTON_MAP } from '@/data/alton'

const { north, south, west, east } = ALTON_BOUNDS
const clamp = (v: number) => Math.min(1, Math.max(0, v))

/** Where a point on the map (0–1 across, 0–1 down) is on the earth. */
const position = (u: number, v: number) => ({ lat: north - v * (north - south), lon: west + u * (east - west) })

/**
 * The topo map of Alton Bay in ASCII, as a survey screen: point anywhere (or drag a finger) and a
 * crosshair follows, reading out the true latitude and longitude of that spot. At rest it reads the
 * map's center.
 */
export default function AltonMap() {
  const ref = useRef<HTMLDivElement>(null)
  const [at, setAt] = useState<{ u: number; v: number } | null>(null)

  const read = (e: PointerEvent) => {
    const r = ref.current!.getBoundingClientRect()
    setAt({ u: clamp((e.clientX - r.left) / r.width), v: clamp((e.clientY - r.top) / r.height) })
  }

  const { lat, lon } = position(at?.u ?? 0.5, at?.v ?? 0.5)

  return (
    <div>
      <div
        ref={ref}
        onPointerMove={read}
        onPointerDown={read}
        onPointerLeave={() => setAt(null)}
        className="relative mx-auto w-[min(100%,54svh)] cursor-crosshair touch-none select-none"
      >
        <Ascii art={ALTON_MAP} />
        {at && (
          <div aria-hidden className="pointer-events-none absolute inset-0">
            <div className="absolute inset-y-0 w-px bg-[#8dffbf]/70 shadow-[0_0_6px_rgb(90_255_170/0.7)]" style={{ left: `${at.u * 100}%` }} />
            <div className="absolute inset-x-0 h-px bg-[#8dffbf]/70 shadow-[0_0_6px_rgb(90_255_170/0.7)]" style={{ top: `${at.v * 100}%` }} />
            <div
              className="absolute h-5 w-5 -translate-x-1/2 -translate-y-1/2 border border-[#8dffbf] shadow-[0_0_8px_rgb(90_255_170/0.7)]"
              style={{ left: `${at.u * 100}%`, top: `${at.v * 100}%` }}
            />
          </div>
        )}
      </div>
      <div className="mx-auto mt-4 flex w-[min(100%,54svh)] flex-wrap justify-between gap-x-6 uppercase tabular-nums">
        <span className="crt-dim">{at ? 'reading' : 'map center'}</span>
        <span>
          lat {lat.toFixed(5)}° n · lon {Math.abs(lon).toFixed(5)}° w
        </span>
      </div>
    </div>
  )
}
