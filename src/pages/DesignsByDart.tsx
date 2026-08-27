import IconHero from '@/components/IconHero'
import Marquee from '@/components/Marquee'
import Showcase from '@/components/Showcase'
import { clients } from '@/data/clients'

const items = clients.map((c) => ({ ...c, meta: c.loc }))

export default function DesignsByDart() {
  return (
    <>
      <IconHero active="dbd" />

      <div className="px-6 pb-10 text-center sm:px-12">
        <div className="font-mono text-[13px] tracking-[0.14em] text-ink-dim uppercase">
          <b className="font-semibold text-ink">Designs By Dart</b> · Est. 2022 · Alton, NH
        </div>
      </div>

      <div className="mx-auto mb-12 max-w-[1120px] px-6 sm:px-12">
        <Marquee items={clients.map((c) => c.name)} />
      </div>

      <Showcase
        items={items}
        eyebrow="Client Work"
        renderFooter={(item) => (
          <>
            <p className="font-body text-[15px] leading-[1.65] text-ink italic">"{item.quote}"</p>
            <div className="mt-3 font-mono text-xs text-ink-faint">{item.attr}</div>
          </>
        )}
      />
    </>
  )
}
