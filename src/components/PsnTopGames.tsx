import { usePsnData, type PsnTopGame } from '@/hooks/usePsnData'

function GameSkeleton() {
  return <div className="aspect-video animate-pulse rounded-3xl border border-line bg-panel backdrop-blur-lg" />
}

export default function PsnTopGames() {
  const { data, loading } = usePsnData<PsnTopGame[]>('/api/psn/top')

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4.5 sm:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <GameSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (!data || data.length === 0) return null

  return (
    <div className="grid grid-cols-2 gap-4.5 sm:grid-cols-4">
      {data.map((g) => (
        <a
          key={g.id}
          href={g.url ?? undefined}
          target="_blank"
          rel="noreferrer"
          className="group overflow-hidden rounded-3xl border border-line bg-panel backdrop-blur-lg transition-transform duration-250 ease-out hover:-translate-y-1 hover:shadow-[0_16px_32px_-14px_oklch(0.5_0.18_290_/_0.45)]"
        >
          <div className="relative aspect-video overflow-hidden bg-bg-soft">
            {g.image && (
              <img
                src={g.image}
                alt=""
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            )}
            {g.platinum && (
              <span className="absolute top-2 right-2 rounded-full bg-gradient-to-br from-grad-a to-grad-b px-2 py-0.5 font-mono text-[9px] font-semibold tracking-wide text-white uppercase shadow-[0_4px_10px_-4px_oklch(0.3_0.05_270_/_0.5)]">
                Plat
              </span>
            )}
          </div>
          <div className="p-4">
            <div className="truncate text-sm font-semibold text-ink group-hover:text-grad-a">{g.name}</div>
            <div className="mt-0.5 truncate font-mono text-[10px] text-ink-faint">
              {g.earned} / {g.total} Trophies
            </div>
            <div
              className={`mt-1 font-mono text-[9px] tracking-wide uppercase ${
                g.platinum ? 'text-grad-a' : 'text-ink-faint/60'
              }`}
            >
              {g.platinum ? 'Platinum Earned' : 'No Platinum'}
            </div>
          </div>
        </a>
      ))}
    </div>
  )
}
