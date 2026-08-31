import { useSteamData, type TopGame } from '@/hooks/useSteamData'

function GameSkeleton() {
  return <div className="aspect-video animate-pulse rounded-3xl border border-line bg-panel backdrop-blur-lg" />
}

export default function TopGames() {
  const { data, loading } = useSteamData<TopGame[]>('/api/steam/top')

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
          key={g.appid}
          href={g.url ?? undefined}
          target="_blank"
          rel="noreferrer"
          className="group overflow-hidden rounded-3xl border border-line bg-panel backdrop-blur-lg transition-transform duration-250 ease-out hover:-translate-y-1 hover:shadow-[0_16px_32px_-14px_oklch(0.5_0.18_290_/_0.45)]"
        >
          <div className="aspect-video overflow-hidden bg-bg-soft">
            {g.image && (
              <img
                src={g.image}
                alt=""
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            )}
          </div>
          <div className="p-4">
            <div className="truncate text-sm font-semibold text-ink group-hover:text-grad-a">{g.name}</div>
          </div>
        </a>
      ))}
    </div>
  )
}
