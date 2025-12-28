export default function SiteFooter() {
  const year = new Date().getFullYear()
  return (
    <footer className="w-full border-t border-slate-200 bg-white/70 py-2 text-[11px] text-slate-500 backdrop-blur-sm">
      <div className="mx-auto flex max-w-5xl items-center justify-center px-4">
        <span>
          © {year} Citisoft Solutions. Developed by{' '}
          <a
            href="https://www.citisoftsolutions.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-700 hover:text-slate-900 underline underline-offset-2"
          >
            Citisoft Solutions
          </a>
          .
        </span>
      </div>
    </footer>
  )
}
