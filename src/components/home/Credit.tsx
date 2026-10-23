export interface CreditName {
  text: string
  href?: string
  /** Filename, when the link should download rather than navigate (the résumé). */
  download?: string
}

/**
 * One title card, set like the credits in Alien (1979): a lowercase role, then the names stacked
 * beside it — "produced by | Gordon Carroll / David Giler / and / Walter Hill" — the whole block
 * centered. An "and" between names sits on its own line, lowercase, as the film sets it. With no
 * role it's just the names, like the film's cast cards. On phones the role sits above the names.
 * `note` is a small line of detail under the names.
 */
export default function Credit({
  role,
  names,
  note,
  size = 'text-[clamp(19px,2.7vw,48px)]',
  className = '',
}: {
  role?: string
  names: (string | CreditName)[]
  note?: string
  /** Type size class — every credit shares one unless it's a long list (the toolkit). */
  size?: string
  className?: string
}) {
  return (
    <div
      className={`credit grid grid-cols-1 justify-items-center gap-y-1 text-center ${size} leading-[1.18] sm:justify-center sm:gap-x-[0.36em] ${role ? 'sm:grid-cols-[auto_auto] sm:justify-items-start sm:text-left' : ''} ${className}`}
    >
      {role && <div className="text-ink/75">{role}</div>}
      <div>
        {names.map((n, i) => {
          const name = typeof n === 'string' ? { text: n } : n
          return (
            <div key={i}>
              {name.href ? (
                <a
                  href={name.href}
                  download={name.download}
                  target={name.download || name.href.startsWith('mailto:') || name.href.startsWith('tel:') ? undefined : '_blank'}
                  rel="noreferrer"
                  className="underline decoration-ink/25 decoration-1 underline-offset-[0.18em] transition-colors hover:text-accent hover:decoration-accent"
                >
                  {name.text}
                </a>
              ) : (
                name.text
              )}
            </div>
          )
        })}
        {note && (
          <div className="mt-3 font-mono text-[10px] tracking-[0.16em] text-ink-faint uppercase [text-shadow:none] sm:text-[11px]">
            {note}
          </div>
        )}
      </div>
    </div>
  )
}
