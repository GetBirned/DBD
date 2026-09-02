export default function Footer() {
  // Base pill shared by all three actions — these are the primary conversion point of the
  // whole site, so they're sized as the focal element rather than as trailing links.
  const action =
    'inline-flex items-center gap-2 rounded-full px-7 py-4 font-mono text-[12px] tracking-wide uppercase transition-transform hover:-translate-y-0.5'

  return (
    <footer className="border-t border-line bg-bg px-6 py-16 sm:px-12">
      <div className="mx-auto max-w-[1120px]">
        <div className="flex flex-wrap gap-4">
          <a
            href="mailto:dartbirnie@gmail.com"
            className={`${action} bg-gradient-to-br from-grad-a to-grad-b text-white shadow-[0_10px_30px_-8px_oklch(0.5_0.17_290_/_0.55)]`}
          >
            Send Email
          </a>
          <a
            href="tel:+16038331781"
            className={`${action} border border-line text-ink hover:border-grad-b`}
          >
            Call Me
          </a>
          <a
            href="/resume.pdf"
            download="Dartagnan_Birnie_Resume.pdf"
            className={`${action} border border-line text-ink hover:border-grad-b`}
          >
            Download Résumé
          </a>
        </div>
        <div className="mt-14 border-t border-line pt-7 font-mono text-xs tracking-wide text-ink-faint">
          © Dartagnan Birnie — Alton, NH
        </div>
      </div>
    </footer>
  )
}
