import type { ReactNode } from 'react'

export interface CreditName {
  text: ReactNode
  /** A link… */
  href?: string
  /** …with the filename, when it should download rather than navigate (the résumé). */
  download?: string
  /** …or something that opens in place (a role's details, the testimonials). */
  onClick?: () => void
}

/**
 * One title card, set like the credits in Alien (1979): a lowercase role, then the names stacked
 * beside it — "produced by | Gordon Carroll / David Giler / and / Walter Hill" — the whole block
 * centered on the screen. With no role it's just the name, like the film's cast cards. On phones
 * the role sits above the names. `note` is a smaller line in the same type, just underneath.
 *
 * A name you can click or follow glows a little when you point at it.
 */
export default function Credit({
  role,
  names,
  note,
  size = 'text-[clamp(20px,2.6vw,46px)]',
}: {
  role?: string
  names: (string | CreditName)[]
  note?: string
  size?: string
}) {
  return (
    <div className={`credit text-center leading-[1.18] ${size}`}>
      <div className={`grid justify-center gap-y-1 ${role ? 'sm:grid-cols-[auto_auto] sm:gap-x-[0.34em]' : ''}`}>
        {role && <div className="text-ink/75 sm:text-right">{role}</div>}
        <div className={role ? 'sm:text-left' : ''}>
          {names.map((n, i) => {
            const name: CreditName = typeof n === 'string' ? { text: n } : n
            const external = name.href && !name.download && !/^(mailto|tel):/.test(name.href)
            return (
              <div key={i}>
                {name.onClick ? (
                  <button type="button" onClick={name.onClick} aria-haspopup="dialog" className="credit-link">
                    {name.text}
                  </button>
                ) : name.href ? (
                  <a
                    href={name.href}
                    download={name.download}
                    target={external ? '_blank' : undefined}
                    rel={external ? 'noreferrer' : undefined}
                    className="credit-link"
                  >
                    {name.text}
                  </a>
                ) : (
                  name.text
                )}
              </div>
            )
          })}
        </div>
      </div>
      {note && <div className="mt-[0.35em] text-[0.58em] text-ink/70">{note}</div>}
    </div>
  )
}
