import QuoteReel from './QuoteReel'
import { clients } from '@/data/clients'
import { companies } from '@/data/companies'

// Only clients who actually gave a testimonial — nothing placeholder.
const QUOTES = clients.filter((c) => c.quote).map((c) => ({ quote: c.quote!, caption: c.attr ?? c.name }))

/**
 * After the gallery: the client testimonials, then everyone I've built for as a credit roll —
 * the names in columns, the way a film's end credits list a crew.
 */
export default function ClientsProof() {
  return (
    <section className="px-[6vw] pt-[12vh] pb-[16vh]">
      <QuoteReel label="in my clients' words" items={QUOTES} noun="Testimonial" interval={7} />

      <div className="credit mx-auto mt-[22vh] max-w-[1200px] text-center">
        <div className="text-[clamp(19px,2.7vw,48px)] text-ink/75">websites for</div>
        <ul className="mt-[5vh] grid grid-cols-1 gap-x-[4vw] gap-y-[0.55em] text-[clamp(17px,1.8vw,30px)] sm:grid-cols-2 lg:grid-cols-3">
          {companies.map((c) => (
            <li key={c.name}>{c.name}</li>
          ))}
        </ul>
      </div>
    </section>
  )
}
