import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useSpotifyData, type TopItemsData } from '@/hooks/useSpotifyData'
import { ChevronDown } from './icons'

function RankedList({ items }: { items: { name: string; artist: string; image: string | null; url: string | null }[] }) {
  return (
    <ol className="space-y-3">
      {items.map((item, i) => (
        <li key={i}>
          <a
            href={item.url ?? undefined}
            target="_blank"
            rel="noreferrer"
            className="group flex items-center gap-3"
          >
            <span className="w-4 flex-none font-mono text-xs text-ink-faint">{i + 1}</span>
            {item.image ? (
              <img src={item.image} alt="" className="h-10 w-10 flex-none rounded-lg object-cover" />
            ) : (
              <div className="h-10 w-10 flex-none rounded-lg bg-bg-soft" />
            )}
            <div className="min-w-0">
              <div className="truncate text-sm font-medium text-ink group-hover:text-grad-a">{item.name}</div>
              <div className="truncate font-mono text-[11px] text-ink-faint">{item.artist}</div>
            </div>
          </a>
        </li>
      ))}
    </ol>
  )
}

export default function TopItems() {
  const [open, setOpen] = useState(false)
  const { data, loading } = useSpotifyData<TopItemsData>('/api/spotify/top')

  const hasData = data && (data.tracks.length > 0 || data.albums.length > 0)
  if (!loading && !hasData) return null

  return (
    <div className="mt-4.5">
      <div className="flex justify-center">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          disabled={!hasData}
          aria-label={open ? 'Hide top 5' : 'Show top 5'}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-line text-ink-dim transition-all duration-250 disabled:opacity-40 hover:border-grad-b hover:text-ink"
        >
          <ChevronDown size={16} className={`transition-transform duration-250 ${open ? 'rotate-180' : ''}`} />
        </button>
      </div>

      <AnimatePresence initial={false}>
        {open && hasData && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="mt-6 grid gap-8 sm:grid-cols-2">
              <div>
                <div className="mb-3 font-mono text-[11px] tracking-wide text-ink-faint uppercase">Top Songs</div>
                <RankedList
                  items={data!.tracks.map((t) => ({ name: t.name, artist: t.artist, image: t.albumArt, url: t.url }))}
                />
              </div>
              <div>
                <div className="mb-3 font-mono text-[11px] tracking-wide text-ink-faint uppercase">Top Albums</div>
                <RankedList
                  items={data!.albums.map((a) => ({ name: a.name, artist: a.artist, image: a.image, url: a.url }))}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
