import { useState, type ReactNode } from 'react'
import { ChevronLeft, ChevronRight, PlayIcon } from './icons'

export interface ShowcaseBaseItem {
  name: string
  tag: string
  /** Location for a client, tech stack for a project — whatever belongs under the title. */
  meta: string
  tint: string
  desc: string
  vidLabel: string
}

export default function Showcase<T extends ShowcaseBaseItem>({
  items,
  eyebrow,
  renderFooter,
}: {
  items: T[]
  eyebrow: string
  renderFooter: (item: T) => ReactNode
}) {
  const [idx, setIdx] = useState(0)
  const current = items[idx]

  const next = () => setIdx((i) => (i + 1) % items.length)
  const prev = () => setIdx((i) => (i - 1 + items.length) % items.length)

  return (
    <div className="mx-auto max-w-[1120px] px-6 pb-20 sm:px-12">
      <div className="mb-6 font-mono text-xs tracking-widest text-ink-faint uppercase">
        {eyebrow} — {idx + 1} / {items.length}
      </div>

      <div
        className="grid grid-cols-1 gap-12 rounded-[32px] border border-transparent p-8 shadow-[0_30px_60px_-35px_oklch(0.3_0.05_270_/_0.3)] backdrop-blur-xl transition-[background] duration-500 sm:p-11 md:grid-cols-2"
        style={{
          background: `linear-gradient(var(--color-panel), var(--color-panel)) padding-box, linear-gradient(135deg, var(--color-grad-a), ${current.tint}) border-box`,
        }}
      >
        <div>
          <div className="relative flex aspect-16/10 items-center justify-center overflow-hidden rounded-[20px] border border-line bg-bg-soft">
            <div
              className="flex h-14 w-14 items-center justify-center rounded-full text-white transition-[background] duration-500"
              style={{ background: `linear-gradient(135deg, var(--color-grad-a), ${current.tint})` }}
            >
              <PlayIcon />
            </div>
            <div className="absolute bottom-3.5 left-4 font-mono text-[10px] text-ink-faint">
              [ {current.vidLabel} ]
            </div>
          </div>
          <div className="mt-2.5 grid grid-cols-3 gap-2.5">
            {[0, 1, 2].map((i) => (
              <div key={i} className="aspect-4/3 rounded-xl border border-line bg-bg-soft" />
            ))}
          </div>
        </div>

        <div className="flex flex-col justify-center">
          <span
            className="mb-3.5 inline-block self-start rounded-full border border-transparent px-3.5 py-1.5 font-mono text-[10px] tracking-wider uppercase transition-[background,color] duration-500"
            style={{
              color: current.tint,
              background: `linear-gradient(var(--color-bg), var(--color-bg)) padding-box, linear-gradient(135deg, var(--color-grad-a), ${current.tint}) border-box`,
            }}
          >
            {current.tag}
          </span>
          <h2 className="text-[38px] leading-[1.05] font-bold font-display">{current.name}</h2>
          <div className="my-2.5 font-mono text-xs text-ink-faint">{current.meta}</div>
          <p className="text-[15px] leading-[1.7] text-ink-dim">{current.desc}</p>
          <div className="mt-5 border-t border-line pt-5">{renderFooter(current)}</div>
        </div>
      </div>

      <div className="mt-7 flex items-center justify-center gap-5">
        <button
          onClick={prev}
          aria-label="Previous"
          className="flex h-10.5 w-10.5 items-center justify-center rounded-full border border-line text-ink-dim transition-colors hover:border-grad-b hover:text-ink"
        >
          <ChevronLeft />
        </button>
        <div className="flex items-center gap-2.5">
          {items.map((item, i) => (
            <button
              key={item.name}
              onClick={() => setIdx(i)}
              aria-label={item.name}
              className={`h-2.5 rounded-full transition-all duration-250 ${
                i === idx ? 'w-5.5 bg-gradient-to-br from-grad-a to-grad-b' : 'w-2.5 bg-line'
              }`}
            />
          ))}
        </div>
        <button
          onClick={next}
          aria-label="Next"
          className="flex h-10.5 w-10.5 items-center justify-center rounded-full border border-line text-ink-dim transition-colors hover:border-grad-b hover:text-ink"
        >
          <ChevronRight />
        </button>
        <div className="min-w-11 text-right font-mono text-xs text-ink-faint">
          {idx + 1} / {items.length}
        </div>
      </div>
    </div>
  )
}
