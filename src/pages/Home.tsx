import { Link } from 'react-router-dom'
import IconHero from '@/components/IconHero'
import Marquee from '@/components/Marquee'
import NowPlaying from '@/components/NowPlaying'
import PlaylistHighlights from '@/components/PlaylistHighlights'
import TopItems from '@/components/TopItems'
import SteamStatus from '@/components/SteamStatus'
import TopGames from '@/components/TopGames'
import PsnStatus from '@/components/PsnStatus'
import PsnTopGames from '@/components/PsnTopGames'
import SectionTitle from '@/components/SectionTitle'
import Reveal from '@/components/Reveal'
import Experience from '@/components/Experience'
import PageTransition from '@/components/PageTransition'
import { companies } from '@/data/companies'
import { projects } from '@/data/projects'
import { experience } from '@/data/experience'

export default function Home() {
  return (
    <PageTransition>
      <IconHero active="db" showScrollCue />

      {/*
        A flat bg-soft fill here butted straight against the hero above made a hard,
        visible seam right where the hero's ambient glow was still fading out —
        especially once that glow got bigger. Fading in via gradient over the first
        stretch removes the hard line while the rest of the section stays flat bg-soft
        (a CSS gradient holds at its last stop's color past that point).
      */}
      <section id="more" className="px-6 py-24 sm:px-12" style={{ background: 'linear-gradient(to bottom, var(--color-bg), var(--color-bg-soft) 260px)' }}>
        <div className="mx-auto max-w-[1120px]">
          <div className="mb-8 font-mono text-xs tracking-widest text-ink-faint uppercase">More</div>

          <Experience items={experience} />

          <Reveal className="mt-16">
            <SectionTitle title="People I've Put Online" detail={`${companies.length} Local Businesses`} />
            <Marquee items={companies} />
            <Link to="/dbd" className="mt-5 inline-block font-mono text-xs text-grad-a hover:underline">
              See the full showcase — DBD →
            </Link>
          </Reveal>

          <Reveal className="mt-16">
            <SectionTitle title="Things I've Built" detail={`${projects.length} Side Projects`} />
            <div className="flex flex-wrap gap-4.5">
              {projects.map((p) => (
                <Link
                  key={p.name}
                  to="/fun"
                  className="flex h-26 w-26 flex-col items-center justify-center gap-2 rounded-3xl border border-line bg-panel backdrop-blur-lg transition-transform duration-250 ease-out hover:-translate-y-1 hover:shadow-[0_16px_32px_-14px_oklch(0.5_0.18_290_/_0.45)]"
                >
                  {p.logo ? (
                    <img src={p.logo} alt="" className="h-9 w-9 object-contain" />
                  ) : (
                    <span className="grad-text font-display text-xl font-extrabold">{p.glyph}</span>
                  )}
                  <span className="text-center font-mono text-[9px] text-ink-faint">{p.name}</span>
                </Link>
              ))}
            </div>
            <Link to="/fun" className="mt-5 inline-block font-mono text-xs text-grad-a hover:underline">
              See everything — FUN →
            </Link>
          </Reveal>

          <Reveal className="mt-16">
            <SectionTitle title="What I'm Listening To" detail="Live from Spotify API" />
            <NowPlaying />
            <div className="mt-4.5">
              <PlaylistHighlights />
            </div>
            <TopItems />
          </Reveal>

          <Reveal className="mt-16">
            <SectionTitle title="What I'm Playing" detail="Live from Steam & PSN" />

            <div className="mb-2.5 flex items-center justify-between">
              <span className="font-mono text-[11px] tracking-wide text-ink-faint uppercase">Steam</span>
              <a
                href="https://steamcommunity.com/profiles/76561198132941028"
                target="_blank"
                rel="noreferrer"
                className="font-mono text-[11px] text-grad-a hover:underline"
              >
                View Profile →
              </a>
            </div>
            <SteamStatus />
            <div className="mt-4.5">
              <TopGames />
            </div>

            <div className="mt-8 mb-2.5 flex items-center justify-between">
              <span className="font-mono text-[11px] tracking-wide text-ink-faint uppercase">PlayStation</span>
              <a
                href="https://psnprofiles.com/Get-Birned"
                target="_blank"
                rel="noreferrer"
                className="font-mono text-[11px] text-grad-a hover:underline"
              >
                View Profile →
              </a>
            </div>
            <PsnStatus />
            <div className="mt-4.5">
              <PsnTopGames />
            </div>
          </Reveal>
        </div>
      </section>
    </PageTransition>
  )
}
