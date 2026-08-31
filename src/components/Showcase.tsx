import { useState, type ReactNode } from 'react'
import { ChevronLeft, ChevronRight, PlayIcon } from './icons'
import Reveal from './Reveal'

export interface ShowcaseBaseItem {
  name: string
  tag: string
  /** Location for a client, tech stack for a project — whatever belongs under the title. */
  meta: string
  tint: string
  desc: string
  vidLabel: string
  logo?: string
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
    <div className="mx-auto max-w-[1120px] px-6 pb-20 sm:px-12 lg:max-w-[1440px] lg:px-16 xl:max-w-[1680px] xl:px-20">
      <div className="mb-6 font-mono text-xs tracking-widest text-ink-faint uppercase">
        {eyebrow} — {idx + 1} / {items.length}
      </div>

      <Reveal
        key={current.name}
        className="grid grid-cols-1 gap-12 rounded-[32px] border border-transparent p-8 shadow-[0_30px_60px_-35px_oklch(0.3_0.05_270_/_0.3)] backdrop-blur-xl transition-[background] duration-500 sm:p-11 md:grid-cols-2 lg:gap-16 lg:rounded-[40px] lg:p-16 xl:gap-20 xl:p-20"
        style={{
          background: `linear-gradient(var(--color-panel), var(--color-panel)) padding-box, linear-gradient(135deg, var(--color-grad-a), ${current.tint}) border-box`,
        }}
      >
        <div>
          <div className="relative flex aspect-16/10 items-center justify-center overflow-hidden rounded-[20px] border border-line bg-bg-soft lg:rounded-3xl">
            <div
              className="flex h-14 w-14 items-center justify-center rounded-full text-white transition-[background] duration-500 lg:h-20 lg:w-20"
              style={{ background: `linear-gradient(135deg, var(--color-grad-a), ${current.tint})` }}
            >
              <PlayIcon />
            </div>
            <div className="absolute bottom-3.5 left-4 font-mono text-[10px] text-ink-faint lg:bottom-5 lg:left-6 lg:text-xs">
              [ {current.vidLabel} ]
            </div>
          </div>
          <div className="mt-2.5 grid grid-cols-3 gap-2.5 lg:mt-4 lg:gap-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="aspect-4/3 rounded-xl border border-line bg-bg-soft lg:rounded-2xl" />
            ))}
          </div>
        </div>

        <div className="flex flex-col justify-center">
          {current.logo && (
            <img src={current.logo} alt="" className="mb-4 h-11 w-auto max-w-[160px] object-contain lg:mb-5 lg:h-14 lg:max-w-[200px]" />
          )}
          <span
            className="mb-3.5 inline-block self-start rounded-full border border-transparent px-3.5 py-1.5 font-mono text-[10px] tracking-wider uppercase transition-[background,color] duration-500 lg:mb-4 lg:px-4 lg:py-2 lg:text-[11px]"
            style={{
              color: current.tint,
              background: `linear-gradient(var(--color-bg), var(--color-bg)) padding-box, linear-gradient(135deg, var(--color-grad-a), ${current.tint}) border-box`,
            }}
          >
            {current.tag}
          </span>
          <h2 className="text-[38px] leading-[1.05] font-bold font-display lg:text-[54px] xl:text-[60px]">{current.name}</h2>
          <div className="my-2.5 font-mono text-xs text-ink-faint lg:my-3.5 lg:text-sm">{current.meta}</div>
          <p className="text-[15px] leading-[1.7] text-ink-dim lg:text-[17px]">{current.desc}</p>
          <div className="mt-5 border-t border-line pt-5 lg:mt-7 lg:pt-7">{renderFooter(current)}</div>
        </div>
      </Reveal>

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
