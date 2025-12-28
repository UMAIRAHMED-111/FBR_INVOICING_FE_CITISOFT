import BrandLogo from '../../components/BrandLogo'
import SiteFooter from '../../components/SiteFooter'

export default function AuthShell({ title, subtitle, children }) {
  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-slate-100 to-slate-50 flex flex-col">
      <div className="mx-auto flex flex-1 max-w-5xl flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col items-center gap-2">
          <BrandLogo size={72} />
          <div className="text-center">
            <div className="text-[11px] uppercase tracking-[0.22em] text-slate-500">
              FBR E-INVOICING PORTAL
            </div>
            {subtitle && <div className="text-xs text-slate-500">{subtitle}</div>}
          </div>
        </div>

        <div className="w-full max-w-lg">
          <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur-sm sm:p-7">
            {title && (
              <div className="mb-5">
                <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
              </div>
            )}
            {children}
          </div>
        </div>
      </div>
      <SiteFooter />
    </div>
  )
}
