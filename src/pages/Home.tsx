import { Link } from 'react-router-dom'
import IconHero from '@/components/IconHero'
import Marquee from '@/components/Marquee'
import NowPlaying from '@/components/NowPlaying'
import PlaylistHighlights from '@/components/PlaylistHighlights'
import { clients } from '@/data/clients'
import { projects } from '@/data/projects'

export default function Home() {
  return (
    <>
      <IconHero active="db" showScrollCue />

      <section id="more" className="bg-bg-soft px-6 py-24 sm:px-12">
        <div className="mx-auto max-w-[1120px]">
          <div className="mb-8 font-mono text-xs tracking-widest text-ink-faint uppercase">More</div>

          <div className="rounded-[28px] border border-line bg-panel p-9 shadow-[0_20px_50px_-30px_oklch(0.3_0.05_270_/_0.25)] backdrop-blur-lg">
            <div className="flex flex-wrap items-start justify-between gap-6">
              <div>
                <div className="mb-2 font-mono text-xs text-grad-a">Software Implementation Consultant</div>
                <h2 className="text-[38px] leading-none">Trimble Inc.</h2>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className="rounded-full border border-line px-3.5 py-1.5 font-mono text-[11px] whitespace-nowrap text-ink-dim">
                  Portsmouth, NH · Hybrid
                </span>
                <span className="rounded-full border border-line px-3.5 py-1.5 font-mono text-[11px] whitespace-nowrap text-ink-dim">
                  May 2026 – Present
                </span>
              </div>
            </div>
            <p className="mt-5 max-w-[640px] text-[15px] leading-[1.7] text-ink-dim">
              Leading end-to-end implementations of Trimble's B2W Estimate solutions — discovery through
              deployment, integrations with telematics providers on the AEMP2 standard, and the licensing &amp;
              activation desk I now run.
            </p>
          </div>

          <div className="mt-16">
            <h3 className="mb-6 text-[26px]">People I've Put Online</h3>
            <Marquee items={clients.map((c) => c.name)} />
            <Link to="/dbd" className="mt-5 inline-block font-mono text-xs text-grad-a hover:underline">
              See the full showcase — DBD →
            </Link>
          </div>

          <div className="mt-16">
            <h3 className="mb-6 text-[26px]">Things I've Built</h3>
            <div className="flex flex-wrap gap-4.5">
              {projects.map((p) => (
                <Link
                  key={p.name}
                  to="/fun"
                  className="flex h-26 w-26 flex-col items-center justify-center gap-2 rounded-3xl border border-line bg-panel backdrop-blur-lg transition-transform duration-250 ease-out hover:-translate-y-1 hover:shadow-[0_16px_32px_-14px_oklch(0.5_0.18_290_/_0.45)]"
                >
                  <span className="grad-text font-display text-xl font-extrabold">{p.glyph}</span>
                  <span className="text-center font-mono text-[9px] text-ink-faint">{p.name}</span>
                </Link>
              ))}
            </div>
            <Link to="/fun" className="mt-5 inline-block font-mono text-xs text-grad-a hover:underline">
              See everything — FUN →
            </Link>
          </div>

          <div className="mt-16">
            <h3 className="mb-6 text-[26px]">What I'm Listening To</h3>
            <NowPlaying />
            <div className="mt-4.5">
              <PlaylistHighlights />
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
