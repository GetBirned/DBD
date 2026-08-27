export default function Marquee({ items }: { items: string[] }) {
  const doubled = [...items, ...items]
  return (
    <div className="marquee-mask overflow-hidden border-y border-line py-5">
      <div className="marquee-track flex w-max items-center gap-9 whitespace-nowrap">
        {doubled.map((item, i) => (
          <span key={`${item}-${i}`} className="flex items-center gap-9">
            <span className="font-display text-xl font-bold text-ink-faint transition-colors hover:text-grad-a">
              {item}
            </span>
            <span className="h-1.5 w-1.5 rounded-full bg-line" />
          </span>
        ))}
      </div>
    </div>
  )
}
