import { useSpotifyData, type PlaylistData } from '@/hooks/useSpotifyData'

function PlaylistSkeleton() {
  return (
    <div className="aspect-square animate-pulse rounded-3xl border border-line bg-panel backdrop-blur-lg" />
  )
}

export default function PlaylistHighlights() {
  const { data, loading } = useSpotifyData<PlaylistData[]>('/api/spotify/playlists')

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4.5 sm:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <PlaylistSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (!data || data.length === 0) return null

  return (
    <div className="grid grid-cols-2 gap-4.5 sm:grid-cols-4">
      {data.map((p) => (
        <a
          key={p.id}
          href={p.url ?? undefined}
          target="_blank"
          rel="noreferrer"
          className="group overflow-hidden rounded-3xl border border-line bg-panel backdrop-blur-lg transition-transform duration-250 ease-out hover:-translate-y-1 hover:shadow-[0_16px_32px_-14px_oklch(0.5_0.18_290_/_0.45)]"
        >
          <div className="aspect-square overflow-hidden bg-bg-soft">
            {p.image && (
              <img
                src={p.image}
                alt=""
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            )}
          </div>
          <div className="p-4">
            <div className="truncate text-sm font-semibold text-ink group-hover:text-grad-a">{p.name}</div>
            <div className="mt-0.5 font-mono text-[10px] text-ink-faint">{p.trackCount} tracks</div>
          </div>
        </a>
      ))}
    </div>
  )
}
