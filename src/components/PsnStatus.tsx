import { usePsnData, type PsnStatusData } from '@/hooks/usePsnData'

export default function PsnStatus() {
  const { data, loading } = usePsnData<PsnStatusData>('/api/psn/now-playing')

  if (loading) {
    return (
      <div className="flex items-center gap-5 rounded-3xl border border-line bg-panel p-5 backdrop-blur-lg">
        <div className="h-20 w-36 flex-none animate-pulse rounded-2xl bg-bg-soft" />
        <div className="flex-1 space-y-2.5">
          <div className="h-3 w-24 animate-pulse rounded bg-bg-soft" />
          <div className="h-4 w-40 animate-pulse rounded bg-bg-soft" />
          <div className="h-3 w-28 animate-pulse rounded bg-bg-soft" />
        </div>
      </div>
    )
  }

  if (!data || !data.title) return null

  return (
    <a
      href={data.url ?? undefined}
      target="_blank"
      rel="noreferrer"
      className="group flex items-center gap-5 rounded-3xl border border-line bg-panel p-5 backdrop-blur-lg transition-transform duration-250 ease-out hover:-translate-y-0.5"
    >
      {data.image ? (
        <img src={data.image} alt="" className="h-20 w-36 flex-none rounded-2xl object-cover" />
      ) : (
        <div className="h-20 w-36 flex-none rounded-2xl bg-bg-soft" />
      )}
      <div className="min-w-0">
        <div className="flex items-center gap-2 font-mono text-[11px] tracking-wide text-ink-faint uppercase">
          {data.isPlaying ? (
            <>
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-grad-a opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-gradient-to-br from-grad-a to-grad-b" />
              </span>
              Playing Now
            </>
          ) : (
            'Last Played'
          )}
        </div>
        <div className="mt-1.5 truncate text-xl font-semibold text-ink group-hover:text-grad-a">{data.title}</div>
        {typeof data.platinum === 'boolean' && (
          <div
            className={`mt-1 font-mono text-[10px] tracking-wide uppercase ${
              data.platinum ? 'text-grad-a' : 'text-ink-faint'
            }`}
          >
            {data.platinum ? 'Platinum Earned' : 'No Platinum'}
          </div>
        )}
      </div>
    </a>
  )
}
