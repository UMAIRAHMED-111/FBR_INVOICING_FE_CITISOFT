import logoImg from '../assets/aa-logo.jpeg'

export default function BrandLogo({ className = "", size = 96, showText = true }) {
  return (
    <div className={`flex flex-col items-center gap-4 ${className}`}>
      <div className="shrink-0 select-none p-1 border border-gray-200 rounded-2xl bg-white shadow-sm">
        <img
          src={logoImg}
          alt="FBR logo"
          style={{ height: size, width: 'auto' }}
          className="block"
        />
      </div>
      {showText && (
        <div className="leading-tight text-left">
          <div className="text-black font-black tracking-tight text-4xl">FBR Invoicing Portal</div>
        </div>
      )}
    </div>
  )
}


