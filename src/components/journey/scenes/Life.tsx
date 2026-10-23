import { useState, type ReactNode } from 'react'
import { ArrowUpRight } from '@/components/icons'
import { useSpotifyData, type NowPlayingData, type RecentTrack, type TopItemsData } from '@/hooks/useSpotifyData'
import { useSteamData, type SteamStatusData, type TopGame } from '@/hooks/useSteamData'
import Credit from '../Credit'
import { pass, type Timeline } from '../motion'
import Popup from '../Popup'

const STEAM_PROFILE = 'https://steamcommunity.com/profiles/76561198132941028'

/** Favorite films, in no particular order. */
const FILMS = [
  { title: 'Alien', year: 1979, by: 'Ridley Scott' },
  { title: 'The Godfather Part II', year: 1974, by: 'Francis Ford Coppola' },
  { title: 'Eraserhead', year: 1977, by: 'David Lynch' },
  { title: 'Over the Hedge', year: 2006, by: 'Tim Johnson & Karey Kirkpatrick' },
]

type Kind = 'games' | 'music' | 'movies'

/** The heading at the top of each card, and a small label over each part of it. */
const Heading = ({ children }: { children: ReactNode }) => <div className="text-[clamp(18px,2vw,32px)] text-ink/75">{children}</div>
const Label = ({ children }: { children: ReactNode }) => (
  <div className="mt-[5vh] mb-4 font-mono text-[10px] tracking-[0.16em] text-ink-faint uppercase [text-shadow:none] sm:text-[11px]">{children}</div>
)

/** One track, game or album as a small row: picture, then the name and a line under it. */
function Row({ image, name, sub, url, wide = false }: { image?: string | null; name: string; sub?: string | null; url?: string | null; wide?: boolean }) {
  return (
    <a href={url ?? undefined} target="_blank" rel="noreferrer" className="group flex min-w-0 items-center gap-3 text-left">
      <span className={`shrink-0 overflow-hidden border border-line bg-bg-soft ${wide ? 'h-10 w-[86px]' : 'h-11 w-11'}`}>
        {image && <img src={image} alt="" loading="lazy" className="h-full w-full object-cover" />}
      </span>
      <span className="min-w-0">
        <span className="block truncate text-[15px] text-ink group-hover:underline">{name}</span>
        {sub && <span className="block truncate font-mono text-[11px] text-ink-faint [text-shadow:none]">{sub}</span>}
      </span>
    </a>
  )
}

/** What's on now (or last), large: the artwork, then what it is. */
function Feature({ image, wide, kind, name, sub, url }: { image?: string | null; wide?: boolean; kind: string; name: string; sub?: string | null; url?: string | null }) {
  return (
    <a href={url ?? undefined} target="_blank" rel="noreferrer" className="group mt-[4vh] block">
      {image && (
        <img src={image} alt="" className={`mx-auto border border-line object-cover ${wide ? 'aspect-[460/215] w-[min(100%,360px)]' : 'h-[clamp(96px,12vw,150px)] w-[clamp(96px,12vw,150px)]'}`} />
      )}
      <div className="mt-4 font-mono text-[10px] tracking-[0.16em] text-ink-faint uppercase [text-shadow:none]">{kind}</div>
      <div className="mt-1 text-[clamp(20px,2.2vw,34px)] group-hover:underline">{name}</div>
      {sub && <div className="text-[15px] text-ink/70">{sub}</div>}
    </a>
  )
}

function Games({ status, top }: { status: SteamStatusData | null; top: TopGame[] | null }) {
  return (
    <div className="credit text-center">
      <Heading>games</Heading>
      {status?.title && (
        <Feature wide image={status.image} kind={status.isPlaying ? 'Steam · playing now' : 'Steam · last played'} name={status.title} sub={status.subtitle} url={status.url} />
      )}
      {!!top?.length && (
        <>
          <Label>Most played, all time</Label>
          <div className="mx-auto grid max-w-[40rem] gap-3 sm:grid-cols-2">
            {top.map((g) => (
              <Row key={g.appid} wide image={g.image} name={g.name} sub={g.hoursTotal} url={g.url} />
            ))}
          </div>
        </>
      )}
      <a
        href={STEAM_PROFILE}
        target="_blank"
        rel="noreferrer"
        className="mt-[5vh] inline-flex items-center gap-1.5 font-mono text-[11px] tracking-[0.14em] text-ink-faint uppercase transition-colors [text-shadow:none] hover:text-ink"
      >
        Steam profile <ArrowUpRight />
      </a>
    </div>
  )
}

function Music({ now, recent, top }: { now: NowPlayingData | null; recent: RecentTrack[] | null; top: TopItemsData | null }) {
  return (
    <div className="credit text-center">
      <Heading>music</Heading>
      {now?.title && <Feature image={now.albumArt} kind={now.isPlaying ? 'Spotify · listening now' : 'Spotify · last played'} name={now.title} sub={now.artist} url={now.url} />}
      <div className="mx-auto grid max-w-[44rem] gap-x-10 sm:grid-cols-2">
        {!!recent?.length && (
          <div className="min-w-0">
            <Label>Recently played</Label>
            <div className="mx-auto grid max-w-[20rem] grid-cols-1 gap-3">
              {recent.map((t, i) => (
                <Row key={i} image={t.albumArt} name={t.name} sub={t.artist} url={t.url} />
              ))}
            </div>
          </div>
        )}
        {!!top?.tracks.length && (
          <div className="min-w-0">
            <Label>Favorite tracks</Label>
            <div className="mx-auto grid max-w-[20rem] grid-cols-1 gap-3">
              {top.tracks.map((t, i) => (
                <Row key={i} image={t.albumArt} name={t.name} sub={t.artist} url={t.url} />
              ))}
            </div>
          </div>
        )}
      </div>
      {!!top?.albums.length && (
        <>
          <Label>Favorite albums</Label>
          <div className="flex flex-wrap justify-center gap-4">
            {top.albums.map((a, i) => (
              <a key={i} href={a.url ?? undefined} target="_blank" rel="noreferrer" title={`${a.name} — ${a.artist}`} className="group w-[clamp(72px,9vw,104px)]">
                {a.image && <img src={a.image} alt="" loading="lazy" className="aspect-square w-full border border-line object-cover" />}
                <span className="mt-2 block truncate text-[13px] text-ink/80 group-hover:underline">{a.name}</span>
              </a>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function Movies() {
  return (
    <div className="credit text-center">
      <Heading>movies</Heading>
      <Label>Four favorites</Label>
      <div className="mx-auto grid max-w-[44rem] gap-[5vh] sm:grid-cols-2">
        {FILMS.map((f) => (
          <div key={f.title}>
            <div className="text-[clamp(20px,2.2vw,34px)] leading-[1.15]">{f.title}</div>
            <div className="mt-1.5 text-[15px] text-ink/65">
              {f.year} · {f.by}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * Off the clock, as one title card — "i like | Games / Music / Movies" — where each name opens its
 * own card: what I play on Steam, what I listen to on Spotify, and my favorite films. The live
 * data is fetched as the page loads, so the cards open already filled; anything that fails to load
 * just isn't shown.
 */
export default function Life({ still = false }: { still?: boolean }) {
  const [open, setOpen] = useState<Kind | null>(null)
  const steam = useSteamData<SteamStatusData>('/api/steam/now-playing').data
  const steamTop = useSteamData<TopGame[]>('/api/steam/top').data
  const now = useSpotifyData<NowPlayingData>('/api/spotify/now-playing').data
  const recent = useSpotifyData<RecentTrack[]>('/api/spotify/recent').data
  const top = useSpotifyData<TopItemsData>('/api/spotify/top').data

  return (
    <div className={`flex items-center justify-center px-[7vw] ${still ? 'py-[10vh]' : 'h-full pt-[12vh]'}`}>
      <div data-in>
        <Credit
          role="i like"
          names={[
            { text: 'Games', onClick: () => setOpen('games') },
            { text: 'Music', onClick: () => setOpen('music') },
            { text: 'Movies', onClick: () => setOpen('movies') },
          ]}
        />
      </div>
      <Popup open={!!open} onClose={() => setOpen(null)} label={open ?? ''}>
        {open === 'games' && <Games status={steam} top={steamTop} />}
        {open === 'music' && <Music now={now} recent={recent} top={top} />}
        {open === 'movies' && <Movies />}
      </Popup>
    </div>
  )
}

export function buildLife(tl: Timeline, root: Element, start: number, len: number) {
  pass(tl, root.querySelector('[data-in]'), start, len, { drift: 0.03, enter: 0.3, exit: 0.24 })
}
