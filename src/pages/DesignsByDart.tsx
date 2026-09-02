import IconHero from '@/components/IconHero'
import Marquee from '@/components/Marquee'
import Showcase from '@/components/Showcase'
import SectionTitle from '@/components/SectionTitle'
import Platforms from '@/components/Platforms'
import Reveal from '@/components/Reveal'
import PageTransition from '@/components/PageTransition'
import { ArrowUpRight } from '@/components/icons'
import { clients } from '@/data/clients'
import { companies } from '@/data/companies'

const items = clients.map((c) => ({ ...c, meta: c.loc }))

export default function DesignsByDart() {
  return (
    <PageTransition>
      <IconHero active="dbd" />

      <div className="px-6 pb-10 text-center sm:px-12">
        <div className="font-mono text-[13px] tracking-[0.14em] text-ink-dim uppercase">
          <b className="font-semibold text-ink">Designs By Dart</b> · Est. 2022 · Alton, NH
        </div>
      </div>

      <Reveal className="mx-auto mb-12 max-w-[1120px] px-6 sm:px-12">
        <Marquee items={companies} />
      </Reveal>

      <Showcase
        items={items}
        eyebrow="Client Work"
        renderFooter={(item) => (
          <>
            {item.url && (
              <a
                href={item.url}
                target="_blank"
                rel="noreferrer"
                className="mb-4 inline-flex items-center gap-2 font-mono text-xs tracking-wide text-ink uppercase transition-colors hover:text-grad-a"
              >
                Visit Site
                <ArrowUpRight />
              </a>
            )}
            {item.quote && (
              <>
                <p className="font-body text-[15px] leading-[1.65] text-ink italic">"{item.quote}"</p>
                <div className="mt-3 font-mono text-xs text-ink-faint">{item.attr}</div>
              </>
            )}
          </>
        )}
      />

      <Reveal className="mx-auto mt-4 mb-24 max-w-[1120px] px-6 sm:px-12">
        <SectionTitle title="Platforms I Build On" detail="Whatever Fits the Project" />
        <Platforms />
      </Reveal>
    </PageTransition>
  )
}
