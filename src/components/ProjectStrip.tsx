import { Link } from 'react-router-dom'
import { projects, type ProjectData } from '@/data/projects'
import { projectSlug } from '@/lib/slug'

/**
 * Each project's title image, picked to stay legible against its own card ground: the
 * wordmark when the brand has one, otherwise the light logo variant on dark cards and the
 * standard one on light cards. PiRail's mark is dark red on near-black without this.
 */
const titleImage = (p: ProjectData) => p.nameLogo ?? (p.cardDark ? (p.logoDark ?? p.logo) : p.logo)

/**
 * Desktop puts these two on a wide top row and the rest on a row of three beneath. Matched by
 * name rather than index so reordering `projects` can't silently reshuffle the grid.
 */
const WIDE = ['DartERP', 'DeadLotto']

/**
 * Grid of project tiles, each carrying that project's own card colors so it previews the
 * showcase it links into. Clicking one opens the Fun page scrolled to that exact card.
 *
 * Mobile stays a plain two-up in source order; the two-then-three split is applied with
 * `order`/`col-span` at md so it's a desktop-only regrouping.
 */
export default function ProjectStrip() {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-6 md:gap-4">
      {projects.map((p, i) => {
        const src = titleImage(p)
        const wide = WIDE.includes(p.name)
        // An odd count leaves a lone half-width tile on the two-column layout; let the last
        // one span the row instead.
        const orphan = projects.length % 2 === 1 && i === projects.length - 1
        return (
          <Link
            key={p.name}
            to={`/fun?p=${projectSlug(p.name)}`}
            title={p.name}
            className={`group relative flex h-32 items-center justify-center overflow-hidden rounded-2xl border transition-transform duration-250 ease-out hover:-translate-y-1 ${
              p.cardDark ? 'border-white/10' : 'border-line'
            } ${orphan ? 'col-span-2' : ''} ${
              wide ? 'md:order-1 md:col-span-3 md:h-48' : 'md:order-2 md:col-span-2 md:h-36'
            }`}
            style={{ background: p.cardBg }}
          >
            {src ? (
              <img
                src={src}
                alt={p.name}
                loading="lazy"
                decoding="async"
                className="max-h-[46%] max-w-[74%] object-contain transition-transform duration-250 ease-out group-hover:scale-105"
              />
            ) : (
              <span className="font-display text-3xl font-extrabold text-white">{p.glyph}</span>
            )}
            {/* Brand-tinted wash on hover, so the tile reacts in the project's own color. */}
            <span
              className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-250 group-hover:opacity-100"
              style={{ background: `linear-gradient(to top, ${p.tint}, transparent 60%)`, mixBlendMode: 'overlay' }}
            />
          </Link>
        )
      })}
    </div>
  )
}
