import { useRef, useState, type ReactNode } from 'react'
import { AnimatePresence, motion, useScroll, useSpring, useTransform, type MotionValue } from 'framer-motion'
import ChapterHeading from './ChapterHeading'
import { ArrowUpRight, ChevronDown } from '@/components/icons'
import {
  useSpotifyData,
  type NowPlayingData,
  type PlaylistData,
  type TopItemsData,
} from '@/hooks/useSpotifyData'
import { useSteamData, type SteamStatusData, type TopGame } from '@/hooks/useSteamData'
import { usePsnData, type PsnStatusData, type PsnTopGame } from '@/hooks/usePsnData'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { EASE, useMotionOK } from '@/lib/motion'

const STEAM_PROFILE = 'https://steamcommunity.com/profiles/76561198132941028'
const PSN_PROFILE = 'https://psnprofiles.com/Get-Birned'

function LiveDot() {
  return (
    <span className="relative flex h-2 w-2">
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
      <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
    </span>
  )
}

const Eyebrow = ({ children }: { children: ReactNode }) => (
  <div className="mb-5 font-mono text-[11px] tracking-[0.18em] text-white/45 uppercase">{children}</div>
)

/* ───────────────────────────── Music ───────────────────────────── */

/**
 * The current (or last) Spotify track as a record: the disc slides out of the album-art sleeve
 * as it scrolls into view, and spins — at 33⅓ when something is actually playing.
 */
function Vinyl() {
  const motionOK = useMotionOK()
  const { data, loading } = useSpotifyData<NowPlayingData>('/api/spotify/now-playing')
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.95', 'center 0.55'] })
  const slide = useTransform(useSpring(scrollYProgress, { stiffness: 120, damping: 26 }), [0, 1], ['4%', '46%'])

  if (!loading && (!data || !data.title)) return null
  const art = data?.albumArt

  return (
    <div ref={ref}>
      {/* Right padding reserves the room the disc slides into. */}
      <div className="relative w-full max-w-[460px] pr-[40%]">
        <div className="relative aspect-square">
          <motion.div style={{ x: motionOK ? slide : '46%' }} className="absolute inset-[4%]">
            <div
              className={`h-full w-full rounded-full shadow-[0_20px_40px_-12px_rgba(0,0,0,0.8)] ${motionOK ? 'vinyl-spin' : ''}`}
              style={{
                animationDuration: data?.isPlaying ? '1.8s' : '9s',
                background:
                  'repeating-radial-gradient(circle at center, #121214 0 1.5px, #1d1d21 2.5px 3.5px), #151517',
              }}
            >
              <div className="absolute inset-[31%] overflow-hidden rounded-full ring-4 ring-black/60">
                {art ? <img src={art} alt="" className="h-full w-full object-cover" /> : <div className="brand-gradient h-full w-full" />}
              </div>
              <div className="absolute inset-[48.5%] rounded-full bg-[#0c0c0e]" />
            </div>
            {/* Static sheen — light on a record stays put while the record turns under it. */}
            <div
              className="pointer-events-none absolute inset-0 rounded-full"
              style={{
                background:
                  'conic-gradient(from 20deg, transparent 0 8%, rgba(255,255,255,0.09) 13%, transparent 20% 50%, rgba(255,255,255,0.07) 63%, transparent 70%)',
              }}
            />
          </motion.div>

          <div className="absolute inset-0 overflow-hidden rounded-xl bg-white/5 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.9)] ring-1 ring-white/10">
            {loading ? (
              <div className="h-full w-full animate-pulse bg-white/5" />
            ) : art ? (
              <img src={art} alt={`${data?.album ?? data?.title} cover`} className="h-full w-full object-cover" />
            ) : (
              <div className="brand-gradient h-full w-full" />
            )}
          </div>
        </div>
      </div>

      {data?.title && (
        <a href={data.url ?? undefined} target="_blank" rel="noreferrer" className="group mt-7 block max-w-[460px]">
          <div className="flex items-center gap-2 font-mono text-[11px] tracking-[0.18em] text-white/50 uppercase">
            {data.isPlaying ? (
              <>
                <LiveDot /> Now playing
              </>
            ) : (
              'Last played'
            )}
          </div>
          <div className="mt-2 truncate font-display text-[28px] leading-tight font-bold text-white group-hover:underline">
            {data.title}
          </div>
          <div className="truncate text-white/60">{data.artist}</div>
        </a>
      )}
    </div>
  )
}

/** Playlist covers that start stacked like a hand of cards and deal out into a row. */
function PlaylistFan() {
  const motionOK = useMotionOK()
  const wide = useMediaQuery('(min-width: 640px)')
  const { data, loading } = useSpotifyData<PlaylistData[]>('/api/spotify/playlists')
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.95', 'start 0.4'] })
  const deal = useSpring(scrollYProgress, { stiffness: 110, damping: 24 })

  if (!loading && (!data || data.length === 0)) return null
  const list = data ?? []
  const cols = wide ? Math.min(4, list.length || 4) : 2

  return (
    <div ref={ref}>
      <Eyebrow>Playlists I've made</Eyebrow>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {loading
          ? [0, 1, 2, 3].map((i) => <div key={i} className="aspect-square animate-pulse rounded-2xl bg-white/5" />)
          : list.map((pl, i) => (
              <FanCard key={pl.id} playlist={pl} index={i} cols={cols} deal={deal} motionOK={motionOK} />
            ))}
      </div>
    </div>
  )
}

function FanCard({
  playlist: pl,
  index,
  cols,
  deal,
  motionOK,
}: {
  playlist: PlaylistData
  index: number
  cols: number
  deal: MotionValue<number>
  motionOK: boolean
}) {
  // Gathered toward the middle of its own row (in units of its own width, plus the gap), fanned
  // by a few degrees either side — then dealt out to its grid slot.
  const col = index % cols
  const center = (cols - 1) / 2
  const x = useTransform(deal, [0, 1], [`${(center - col) * 104}%`, '0%'])
  const rotate = useTransform(deal, [0, 1], [(col - center) * 7, 0])
  const y = useTransform(deal, [0, 1], [Math.abs(col - center) * 14, 0])

  return (
    <motion.a
      href={pl.url ?? undefined}
      target="_blank"
      rel="noreferrer"
      style={motionOK ? { x, rotate, y, zIndex: 10 - Math.abs(col - center) * 2 } : undefined}
      className="group relative block"
    >
      <div className="aspect-square overflow-hidden rounded-2xl bg-white/5 shadow-[0_24px_40px_-20px_rgba(0,0,0,0.9)] ring-1 ring-white/10">
        {pl.image && (
          <img src={pl.image} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
        )}
      </div>
      <div className="mt-3 truncate text-sm font-semibold text-white group-hover:underline">{pl.name}</div>
    </motion.a>
  )
}

function TopFive() {
  const [open, setOpen] = useState(false)
  const { data } = useSpotifyData<TopItemsData>('/api/spotify/top')
  if (!data || (data.tracks.length === 0 && data.albums.length === 0)) return null

  const lists = [
    { label: 'Top songs', items: data.tracks.map((t) => ({ name: t.name, by: t.artist, image: t.albumArt, url: t.url })) },
    { label: 'Top albums', items: data.albums.map((a) => ({ name: a.name, by: a.artist, image: a.image, url: a.url })) },
  ]

  return (
    <div className="mt-10">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 font-mono text-[11px] tracking-[0.14em] text-white/75 uppercase transition-colors hover:border-white hover:text-white"
      >
        My top 5 right now
        <ChevronDown size={14} className={`transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: EASE }}
            className="overflow-hidden"
          >
            <div className="grid gap-10 pt-7 sm:grid-cols-2">
              {lists.map((l) => (
                <div key={l.label}>
                  <Eyebrow>{l.label}</Eyebrow>
                  <ol className="space-y-3">
                    {l.items.map((it, i) => (
                      <li key={i}>
                        <a href={it.url ?? undefined} target="_blank" rel="noreferrer" className="group flex items-center gap-3">
                          <span className="w-4 font-mono text-xs text-white/35">{i + 1}</span>
                          {it.image ? (
                            <img src={it.image} alt="" loading="lazy" className="h-11 w-11 rounded-lg object-cover" />
                          ) : (
                            <span className="h-11 w-11 rounded-lg bg-white/5" />
                          )}
                          <span className="min-w-0">
                            <span className="block truncate text-sm font-semibold text-white group-hover:underline">{it.name}</span>
                            <span className="block truncate font-mono text-[11px] text-white/45">{it.by}</span>
                          </span>
                        </a>
                      </li>
                    ))}
                  </ol>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ───────────────────────────── Games ───────────────────────────── */

function PlatformStatus({
  platform,
  profile,
  status,
  loading,
}: {
  platform: string
  profile: string
  status: (SteamStatusData & { platinum?: boolean }) | PsnStatusData | null
  loading: boolean
}) {
  if (loading) return <div className="h-[132px] animate-pulse rounded-3xl bg-white/5" />
  if (!status?.title) return null
  const sub = 'subtitle' in status ? status.subtitle : null

  return (
    <a
      href={status.url ?? profile}
      target="_blank"
      rel="noreferrer"
      className="group relative flex h-[132px] items-end overflow-hidden rounded-3xl ring-1 ring-white/10"
    >
      {status.image && (
        <img
          src={status.image}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-60 transition-all duration-700 group-hover:scale-105 group-hover:opacity-75"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
      <div className="relative p-5">
        <div className="flex items-center gap-2 font-mono text-[10px] tracking-[0.18em] text-white/60 uppercase">
          {status.isPlaying && <LiveDot />}
          {platform} · {status.isPlaying ? 'Playing now' : 'Last played'}
        </div>
        <div className="mt-1 font-display text-2xl leading-tight font-bold text-white">{status.title}</div>
        {(sub || typeof status.platinum === 'boolean') && (
          <div className="mt-0.5 font-mono text-[11px] text-white/55">
            {sub ?? (status.platinum ? 'Platinum Earned' : 'No Platinum')}
          </div>
        )}
      </div>
    </a>
  )
}

type MosaicTile = { key: string; name: string; image: string | null; url: string | null; meta: string; badge?: string; platform: string }

/** Top games from both platforms as one grid that starts tilted back in 3D and lands flat. */
function GameMosaic({ tiles, loading }: { tiles: MosaicTile[]; loading: boolean }) {
  const motionOK = useMotionOK()
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 1', 'start 0.35'] })
  const p = useSpring(scrollYProgress, { stiffness: 100, damping: 24 })
  const rotateX = useTransform(p, [0, 1], [38, 0])
  const rotateZ = useTransform(p, [0, 1], [-7, 0])
  const scale = useTransform(p, [0, 1], [0.86, 1])

  if (!loading && tiles.length === 0) return null

  return (
    <div ref={ref} style={{ perspective: 1600 }}>
      <motion.div
        style={motionOK ? { rotateX, rotateZ, scale, transformOrigin: '50% 0%' } : undefined}
        className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4"
      >
        {loading
          ? Array.from({ length: 8 }, (_, i) => <div key={i} className="aspect-video animate-pulse rounded-2xl bg-white/5" />)
          : tiles.map((t) => (
              <a
                key={t.key}
                href={t.url ?? undefined}
                target="_blank"
                rel="noreferrer"
                className="group relative block aspect-video overflow-hidden rounded-2xl bg-white/5 ring-1 ring-white/10"
              >
                {t.image && (
                  <img src={t.image} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />
                <span className="absolute top-2 left-2 rounded-full bg-black/55 px-2 py-0.5 font-mono text-[9px] tracking-wide text-white/80 uppercase backdrop-blur-sm">
                  {t.platform}
                </span>
                {t.badge && (
                  <span className="brand-gradient absolute top-2 right-2 rounded-full px-2 py-0.5 font-mono text-[9px] font-semibold tracking-wide text-white uppercase">
                    {t.badge}
                  </span>
                )}
                <div className="absolute inset-x-0 bottom-0 p-3">
                  <div className="truncate text-sm font-semibold text-white">{t.name}</div>
                  <div className="truncate font-mono text-[10px] text-white/55">{t.meta}</div>
                </div>
              </a>
            ))}
      </motion.div>
    </div>
  )
}

function Games() {
  const steam = useSteamData<SteamStatusData>('/api/steam/now-playing')
  const steamTop = useSteamData<TopGame[]>('/api/steam/top')
  const psn = usePsnData<PsnStatusData>('/api/psn/now-playing')
  const psnTop = usePsnData<PsnTopGame[]>('/api/psn/top')

  // Interleave the two platforms so neither one owns a whole row of the mosaic.
  const a: MosaicTile[] = (steamTop.data ?? []).map((g) => ({
    key: `steam-${g.appid}`,
    name: g.name,
    image: g.image,
    url: g.url,
    meta: g.hoursTotal ?? 'Steam',
    platform: 'Steam',
  }))
  const b: MosaicTile[] = (psnTop.data ?? []).map((g) => ({
    key: `psn-${g.id}`,
    name: g.name,
    image: g.image,
    url: g.url,
    meta: `${g.earned} / ${g.total} trophies`,
    badge: g.platinum ? 'Plat' : undefined,
    platform: 'PlayStation',
  }))
  const tiles = Array.from({ length: Math.max(a.length, b.length) }, (_, i) => [a[i], b[i]]).flat().filter(Boolean) as MosaicTile[]

  return (
    <div>
      <Eyebrow>Playing lately</Eyebrow>
      <div className="grid gap-4 sm:grid-cols-2">
        <PlatformStatus platform="Steam" profile={STEAM_PROFILE} status={steam.data} loading={steam.loading} />
        <PlatformStatus platform="PlayStation" profile={PSN_PROFILE} status={psn.data} loading={psn.loading} />
      </div>

      <div className="mt-12">
        <Eyebrow>Most played</Eyebrow>
        <GameMosaic tiles={tiles} loading={steamTop.loading || psnTop.loading} />
      </div>

      <div className="mt-8 flex flex-wrap gap-5 font-mono text-xs tracking-wide text-white/60 uppercase">
        <a href={STEAM_PROFILE} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 hover:text-white">
          Steam profile <ArrowUpRight />
        </a>
        <a href={PSN_PROFILE} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 hover:text-white">
          PlayStation profile <ArrowUpRight />
        </a>
      </div>
    </div>
  )
}

export default function OffTheClock() {
  return (
    <section className="px-6 pt-[16vh] pb-[24vh] sm:px-12">
      <div className="mx-auto max-w-[1120px]">
        <ChapterHeading
          title="What I'm *into.*"
        />

        <div className="grid items-start gap-14 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
          <Vinyl />
          <div>
            <PlaylistFan />
            <TopFive />
          </div>
        </div>

        <div className="mt-[14vh]">
          <Games />
        </div>
      </div>
    </section>
  )
}
