export interface MarqueeItem {
  name: string
  logo?: string
}

export default function Marquee({ items }: { items: MarqueeItem[] }) {
  const doubled = [...items, ...items]
  return (
    <div className="marquee-mask overflow-hidden border-y border-line py-5">
      <div className="marquee-track flex w-max items-center gap-14 whitespace-nowrap">
        {doubled.map((item, i) => (
          <span key={`${item.name}-${i}`} className="flex items-center gap-14">
            {item.logo ? (
              <img
                src={item.logo}
                alt={item.name}
                title={item.name}
                className="h-14 w-auto max-w-[200px] object-contain transition-transform duration-200 hover:scale-110"
              />
            ) : (
              <span className="font-display text-xl font-bold text-ink-faint transition-colors hover:text-grad-a">
                {item.name}
              </span>
            )}
            <span className="h-1.5 w-1.5 rounded-full bg-line" />
          </span>
        ))}
      </div>
    </div>
  )
}
