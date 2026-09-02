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
import ProjectStrip from '@/components/ProjectStrip'
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
      <section id="more" className="py-24" style={{ background: 'linear-gradient(to bottom, var(--color-bg), var(--color-bg-soft) 260px)' }}>
        <div className="mx-auto max-w-[1120px] px-6 sm:px-12">
          <div className="mb-8 font-mono text-xs tracking-widest text-ink-faint uppercase">More</div>

          <Experience items={experience} />

          <Reveal className="mt-16">
            <SectionTitle title="People I've Put Online" detail={`${companies.length} Local Businesses`} />
            <Marquee items={companies} />
            <Link to="/dbd" className="mt-5 inline-block font-mono text-xs text-grad-a hover:underline">
              See the full showcase — DBD →
            </Link>
          </Reveal>
        </div>

        {/* Breaks the 1120px column so the tiles run edge to edge. */}
        <Reveal className="mt-16">
          <div className="mx-auto max-w-[1120px] px-6 sm:px-12">
            <SectionTitle title="Things I've Built" detail={`${projects.length} Side Projects`} />
          </div>
          <ProjectStrip />
          <div className="mx-auto max-w-[1120px] px-6 sm:px-12">
            <Link to="/fun" className="mt-5 inline-block font-mono text-xs text-grad-a hover:underline">
              See everything — FUN →
            </Link>
          </div>
        </Reveal>

        <div className="mx-auto max-w-[1120px] px-6 sm:px-12">
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
