import IconHero from '@/components/IconHero'
import Showcase from '@/components/Showcase'
import Skills from '@/components/Skills'
import SectionTitle from '@/components/SectionTitle'
import Reveal from '@/components/Reveal'
import PageTransition from '@/components/PageTransition'
import { GitHubIcon, ArrowUpRight } from '@/components/icons'
import { projects } from '@/data/projects'

const items = projects.map((p) => ({ ...p, meta: p.stack }))

export default function Fun() {
  return (
    <PageTransition>
      <IconHero active="code" />

      <div className="px-6 pb-12 text-center sm:px-12">
        <div className="font-mono text-[13px] tracking-[0.14em] text-ink-dim uppercase">
          <b className="font-semibold text-ink">Fun</b> · Personal Projects · Built for the Fun of It
        </div>
      </div>

      <Reveal className="mx-auto mb-16 max-w-[1120px] px-6 sm:px-12">
        <SectionTitle title="Skills & Tech" detail="What I Build With" />
        <Skills />
      </Reveal>

      <Showcase
        items={items}
        eyebrow="Side Projects"
        renderFooter={(item) => (
          <div className="flex flex-col items-start gap-3">
            {item.url && (
              <a
                href={item.url}
                target="_blank"
                rel="noreferrer"
                className={`inline-flex items-center gap-2 font-mono text-xs tracking-wide uppercase transition-colors hover:text-grad-a ${item.cardDark ? 'text-white' : 'text-ink'}`}
              >
                Visit Site
                <ArrowUpRight />
              </a>
            )}
            <a
              href={item.repo}
              className={`inline-flex items-center gap-2.5 font-mono text-xs tracking-wide uppercase transition-colors hover:text-grad-a ${item.cardDark ? 'text-white' : 'text-ink'}`}
            >
              <GitHubIcon size={15} />
              View on GitHub
            </a>
          </div>
        )}
      />
    </PageTransition>
  )
}
