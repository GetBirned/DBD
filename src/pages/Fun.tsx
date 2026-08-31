import IconHero from '@/components/IconHero'
import Showcase from '@/components/Showcase'
import PageTransition from '@/components/PageTransition'
import { GitHubIcon } from '@/components/icons'
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

      <Showcase
        items={items}
        eyebrow="Side Projects"
        renderFooter={(item) => (
          <a
            href={item.repo}
            className="inline-flex items-center gap-2.5 font-mono text-xs tracking-wide text-ink uppercase transition-colors hover:text-grad-a"
          >
            <GitHubIcon size={15} />
            View on GitHub
          </a>
        )}
      />
    </PageTransition>
  )
}
