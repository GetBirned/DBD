import { platforms } from '@/data/platforms'

export default function Platforms() {
  return (
    <div className="flex flex-wrap items-center gap-x-10 gap-y-5">
      {platforms.map((p) => (
        <img
          key={p.name}
          src={p.logo}
          alt={p.name}
          title={p.name}
          className="h-9 w-auto object-contain opacity-75 transition-opacity duration-250 hover:opacity-100"
        />
      ))}
    </div>
  )
}
