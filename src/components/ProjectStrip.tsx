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
 * Full-bleed row of project tiles, each carrying that project's own card colors so the strip
 * previews the showcase it links into. Clicking one opens the Fun page scrolled to that exact card.
 */
export default function ProjectStrip() {
  return (
    <div className="grid grid-cols-2 gap-3 px-3 md:grid-cols-5">
      {projects.map((p, i) => {
        const src = titleImage(p)
        // An odd count leaves a lone half-width tile on the 2-column layout; let the last one
        // span the row instead.
        const orphan = projects.length % 2 === 1 && i === projects.length - 1
        return (
          <Link
            key={p.name}
            to={`/fun?p=${projectSlug(p.name)}`}
            title={p.name}
            className={`group relative flex h-32 items-center justify-center overflow-hidden rounded-2xl border transition-transform duration-250 ease-out hover:-translate-y-1 md:h-44 ${
              p.cardDark ? 'border-white/10' : 'border-line'
            } ${orphan ? 'col-span-2 md:col-span-1' : ''}`}
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
