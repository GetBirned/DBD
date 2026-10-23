import { ArrowUpRight } from '@/components/icons'
import { useSpotifyData, type NowPlayingData } from '@/hooks/useSpotifyData'
import { usePsnData, type PsnStatusData } from '@/hooks/usePsnData'
import { useSteamData, type SteamStatusData } from '@/hooks/useSteamData'
import { pass, type Timeline } from '../motion'

const STEAM_PROFILE = 'https://steamcommunity.com/profiles/76561198132941028'
const PSN_PROFILE = 'https://psnprofiles.com/Get-Birned'

interface Item {
  kind: string
  title: string
  sub?: string | null
  image?: string | null
  url?: string | null
  live: boolean
}

function Row({ item }: { item: Item }) {
  return (
    <a href={item.url ?? undefined} target="_blank" rel="noreferrer" className="group flex flex-col items-center text-center">
      <div className="h-[clamp(64px,7vw,104px)] w-[clamp(64px,7vw,104px)] shrink-0 overflow-hidden border border-line bg-bg-soft">
        {item.image && <img src={item.image} alt="" className="h-full w-full object-cover opacity-90 transition-opacity group-hover:opacity-100" />}
      </div>
      <div className="mt-4 max-w-full min-w-0">
        <div className="flex items-center justify-center gap-2 font-mono text-[10px] tracking-[0.16em] text-ink-faint uppercase">
          {item.live && <span className="h-1.5 w-1.5 rounded-full bg-accent" />}
          {item.kind}
        </div>
        <div className="mt-1.5 truncate text-[clamp(18px,1.7vw,28px)] text-ink group-hover:underline">{item.title}</div>
        {item.sub && <div className="truncate text-[13px] text-ink-dim">{item.sub}</div>}
      </div>
    </a>
  )
}

/**
 * What I'm listening to and playing, live from Spotify, Steam and PlayStation. Anything that
 * fails to load just isn't shown.
 */
export default function Life({ still = false }: { still?: boolean }) {
  const music = useSpotifyData<NowPlayingData>('/api/spotify/now-playing').data
  const steam = useSteamData<SteamStatusData>('/api/steam/now-playing').data
  const psn = usePsnData<PsnStatusData>('/api/psn/now-playing').data

  const items: Item[] = []
  if (music?.title)
    items.push({ kind: music.isPlaying ? 'Listening now' : 'Last listened', title: music.title, sub: music.artist, image: music.albumArt, url: music.url, live: music.isPlaying })
  if (steam?.title)
    items.push({ kind: `Steam · ${steam.isPlaying ? 'Playing now' : 'Last played'}`, title: steam.title, sub: steam.subtitle, image: steam.image, url: steam.url ?? STEAM_PROFILE, live: steam.isPlaying })
  if (psn?.title)
    items.push({ kind: `PlayStation · ${psn.isPlaying ? 'Playing now' : 'Last played'}`, title: psn.title, image: psn.image, url: psn.url ?? PSN_PROFILE, live: psn.isPlaying })

  return (
    <div className={`flex flex-col items-center justify-center px-[8vw] text-center ${still ? 'py-[8vh]' : 'h-full pt-[10vh]'}`}>
      <h2 data-in className="scene-heading">Off the clock</h2>
      <p data-in className="mt-3 max-w-[34em] text-[clamp(13px,1vw,16px)] leading-relaxed text-ink-dim">
        What's playing, live from Spotify, Steam and PlayStation.
      </p>
      <div data-in className="mt-[5vh] grid w-full max-w-[900px] gap-[4vh] sm:grid-cols-2 sm:gap-x-[4vw]">
        {items.map((it) => (
          <Row key={it.kind} item={it} />
        ))}
      </div>
      <div data-in className="mt-[5vh] flex flex-wrap justify-center gap-6 font-mono text-[10px] tracking-[0.14em] text-ink-faint uppercase sm:text-[11px]">
        <a href={STEAM_PROFILE} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 transition-colors hover:text-ink">
          Steam <ArrowUpRight />
        </a>
        <a href={PSN_PROFILE} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 transition-colors hover:text-ink">
          PlayStation <ArrowUpRight />
        </a>
      </div>
    </div>
  )
}

export function buildLife(tl: Timeline, root: Element, start: number, len: number) {
  pass(tl, root.querySelectorAll('[data-in]'), start, len, { drift: 0.04, enter: 0.3, stagger: 0.03 })
}
