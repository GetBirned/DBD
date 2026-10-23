import type { ReactNode } from 'react'
import { terminal } from '@/lib/sound'

/**
 * One of the ship's screens from Alien: a curved green-phosphor CRT in a plastic bezel, with a
 * cyan title bar across the top (`controls` sit at its right end), the content in the middle, and
 * a line of key hints at the bottom. The content scrolls inside the screen if it runs long.
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
  return (
    // Following a link on the screen blips; buttons make their own sounds.
    <div className={`crt-bezel film flex flex-col ${className}`} onClickCapture={(e) => (e.target as Element).closest('a') && terminal.select()}>
      <div className="crt-screen flex min-h-0 flex-1 flex-col">
        <div className="crt-bar relative z-[1] mx-[clamp(10px,2vw,28px)] mt-[clamp(10px,2vw,24px)] flex items-center justify-between gap-4 px-3 text-[clamp(18px,1.6vw,24px)] leading-[1.5] uppercase">
          <span className="min-w-0 truncate">{title}</span>
          {controls && <span className="flex shrink-0 items-center gap-1">{controls}</span>}
        </div>
        <div className="relative z-[1] min-h-0 flex-1 overflow-y-auto px-[clamp(14px,3vw,40px)] py-[clamp(14px,3vh,30px)] text-[clamp(18px,1.45vw,22px)] leading-[1.35]">
          {children}
        </div>
        {hint && (
          <div className="crt-dim relative z-[1] px-[clamp(14px,3vw,40px)] pb-[clamp(10px,2vh,20px)] text-[clamp(15px,1.25vw,19px)] uppercase">{hint}</div>
        )}
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
      className="px-1.5 leading-[1.5] transition-colors hover:bg-[#03241a] hover:text-[#8dffbf] hover:[text-shadow:none]"
    >
      {children}
    </button>
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
