import { useEffect, useState } from 'react'
import { Ascii, Readout, ReadoutLabel } from '@/components/Monitor'
import { POSTERS } from '@/data/posters'
import { useSpotifyData, type NowPlayingData, type RecentTrack, type TopItemsData } from '@/hooks/useSpotifyData'
import { useSteamData, type SteamStatusData, type TopGame } from '@/hooks/useSteamData'
import { terminal } from '@/lib/sound'
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

/** What's on now (or last): its picture, then what it is, in large type. */
function Feature({ image, wide, kind, name, sub, url }: { image?: string | null; wide?: boolean; kind: string; name: string; sub?: string | null; url?: string | null }) {
  return (
    <div className={`grid items-center gap-5 ${wide ? 'sm:grid-cols-[minmax(0,15rem)_minmax(0,1fr)]' : 'grid-cols-[auto_minmax(0,1fr)]'}`}>
      {image && (
        <a href={url ?? undefined} target="_blank" rel="noreferrer" className={`crt-tint crt-box block ${wide ? 'w-full' : 'w-fit'}`}>
          <img src={image} alt="" className={`block object-cover ${wide ? 'aspect-[460/215] w-full' : 'h-[clamp(84px,9vw,120px)] w-[clamp(84px,9vw,120px)]'}`} />
        </a>
      )}
      <div className="min-w-0 uppercase">
        <div className="crt-dim">{kind}</div>
        <div className="mt-1 text-[clamp(26px,2.5vw,38px)] leading-[1.05]">{name}</div>
        {sub && <div className="crt-dim mt-1">{sub}</div>}
      </div>
    </div>
  )
}

function Games({ status, top }: { status: SteamStatusData | null; top: TopGame[] | null }) {
  return (
    <div>
      {status?.title && (
        <Feature wide image={status.image} kind={`steam · ${status.isPlaying ? 'now playing' : 'last session'}`} name={status.title} sub={status.subtitle} url={status.url} />
      )}
      {!!top?.length && (
        <>
          <ReadoutLabel>most played · all time</ReadoutLabel>
          <div className="space-y-1">
            {top.map((g, i) => (
              <Readout key={g.appid} n={i + 1} name={g.name} value={g.hoursTotal} href={g.url} />
            ))}
          </div>
        </>
      )}
      <a href={STEAM_PROFILE} target="_blank" rel="noreferrer" className="crt-link mt-7 inline-block px-1 uppercase">
        &gt; open steam profile
      </a>
    </div>
  )
}

function Music({ now, recent, top }: { now: NowPlayingData | null; recent: RecentTrack[] | null; top: TopItemsData | null }) {
  return (
    <div>
      {now?.title && (
        <Feature image={now.albumArt} kind={`spotify · ${now.isPlaying ? 'now playing' : 'last played'}`} name={now.title} sub={now.artist} url={now.url} />
      )}
      {!!recent?.length && (
        <>
          <ReadoutLabel>recently played</ReadoutLabel>
          <div className="space-y-1">
            {recent.map((t, i) => (
              <Readout key={i} n={i + 1} name={t.name} value={t.artist} href={t.url} />
            ))}
          </div>
        </>
      )}
      {!!top?.tracks.length && (
        <>
          <ReadoutLabel>favorite tracks</ReadoutLabel>
          <div className="space-y-1">
            {top.tracks.map((t, i) => (
              <Readout key={i} n={i + 1} name={t.name} value={t.artist} href={t.url} />
            ))}
          </div>
        </>
      )}
      {!!top?.albums.length && (
        <>
          <ReadoutLabel>favorite albums</ReadoutLabel>
          <div className="space-y-1">
            {top.albums.map((a, i) => (
              <Readout key={i} n={i + 1} name={a.name} value={a.artist} href={a.url} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

/** The four favorite films, one poster at a time in ASCII, stepped through like pages. */
function Movies() {
  const [i, setI] = useState(0)
  const show = (n: number) => {
    terminal.page()
    setI((n + FILMS.length) % FILMS.length)
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return
      terminal.page()
      setI((n) => (n + (e.key === 'ArrowRight' ? 1 : -1) + FILMS.length) % FILMS.length)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const f = FILMS[i]
  const count = (n: number) => String(n).padStart(2, '0')
  return (
    <div className="grid items-center gap-6 sm:grid-cols-[auto_minmax(0,1fr)] sm:gap-8">
      <div className="mx-auto w-[min(34svh,100%)] sm:w-[34svh]">
        <Ascii art={POSTERS[f.title]} />
      </div>
      <div className="min-w-0">
        <ReadoutLabel>
          four favorites · {count(i + 1)} / {count(FILMS.length)}
        </ReadoutLabel>
        <div className="text-[clamp(26px,2.5vw,38px)] leading-[1.05] uppercase">{f.title}</div>
        <div className="crt-dim mt-1 uppercase">
          {f.year} · dir. {f.by}
        </div>
        <div className="mt-6 space-y-1">
          {FILMS.map((g, k) => (
            <button
              key={g.title}
              type="button"
              onClick={() => show(k)}
              aria-current={k === i ? 'true' : undefined}
              className={`crt-link block w-full px-1 text-left uppercase ${k === i ? 'bg-[#8dffbf] text-[#03241a] [text-shadow:none]' : ''}`}
            >
              {count(k + 1)} {g.title}
            </button>
          ))}
        </div>
        <div className="mt-6 flex justify-between uppercase">
          <button type="button" onClick={() => show(i - 1)} className="crt-link px-1">
            &lt; prev
          </button>
          <button type="button" onClick={() => show(i + 1)} className="crt-link px-1">
            next &gt;
          </button>
        </div>
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
      <Popup
        open={!!open}
        onClose={() => setOpen(null)}
        title={open ? `recreation log · ${open}` : ''}
        hint={open === 'movies' ? 'left, right: browse | esc: exit' : undefined}
      >
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
