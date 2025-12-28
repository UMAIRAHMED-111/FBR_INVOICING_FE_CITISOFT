import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import BrandLogo from '../components/BrandLogo'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(true)
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState({ email: '', password: '' })

  function handleSubmit(e) {
    e.preventDefault()
    const nextErrors = { email: '', password: '' }
    if (!/^[\\w-.]+@([\\w-]+\\.)+[\\w-]{2,}$/.test(email)) nextErrors.email = 'Enter a valid email address'
    if (password.length < 6) nextErrors.password = 'Password must be at least 6 characters'
    setErrors(nextErrors)
    if (nextErrors.email || nextErrors.password) return
    setIsSubmitting(true)
    setTimeout(() => {
      navigate('/dashboard')
    }, 400)
  }

  return (
    <div className="min-h-screen bg-white grid lg:grid-cols-2">
      <div className="relative hidden lg:flex items-center p-12 border-r border-gray-200">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(80% 60% at 0% 0%, rgba(0,0,0,0.04), transparent 60%)' }}
        />
        <div className="relative z-10 w-full max-w-md mx-auto">
          <BrandLogo className="mb-6 -ml-2" size={128} />
          <h1 className="text-3xl font-black text-black tracking-tight">FBR E‑Invoicing Portal</h1>
          <p className="mt-2 text-gray-600">Fast, compliant and modern e‑invoicing for your business.</p>
          <div className="mt-8 grid grid-cols-3 gap-3">
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <div className="text-xs text-gray-500">Total Sales</div>
              <div className="mt-1 text-xl font-semibold text-black">PKR 2.4M</div>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <div className="text-xs text-gray-500">Total Tax</div>
              <div className="mt-1 text-xl font-semibold text-black">PKR 360K</div>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <div className="text-xs text-gray-500">Invoices</div>
              <div className="mt-1 text-xl font-semibold text-black">156</div>
            </div>
          </div>
          <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="text-sm text-gray-700 mb-2">Preview</div>
            <div className="h-28 rounded-lg bg-gray-50 border border-dashed border-gray-200" />
          </div>
        </div>
      </div>
      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="flex flex-col items-center">
            <BrandLogo className="mb-4 -ml-2" size={112} />
          </div>
          <div className="bg-white shadow-xl rounded-2xl border border-gray-200 p-8">
            <h2 className="text-2xl font-semibold text-black">Welcome back</h2>
            <p className="mt-1 text-sm text-gray-600">Sign in to continue to FBR Invoicing Portal</p>

            <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-800">Email</label>
              <div className="relative mt-2">
                <span className="pointer-events-none absolute inset-y-0 left-3 grid place-items-center text-gray-500">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M4 6h16M4 6l8 7 8-7M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </span>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  aria-invalid={!!errors.email}
                  className={`w-full rounded-xl border bg-white py-2.5 pl-10 pr-4 text-black placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-gray-200 ${errors.email ? 'border-black' : 'border-gray-300 focus:border-black'}`}
                  placeholder="you@company.com"
                  autoComplete="email"
                />
              </div>
              {errors.email && <p className="mt-1 text-xs text-red-600" aria-live="polite">{errors.email}</p>}
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-medium text-gray-800">Password</label>
              </div>
              <div className="relative mt-2">
                <span className="pointer-events-none absolute inset-y-0 left-3 grid place-items-center text-gray-500">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 17a2 2 0 100-4 2 2 0 000 4z"/><path d="M6 10V7a6 6 0 1112 0v3M5 10h14v10H5V10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </span>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  aria-invalid={!!errors.password}
                  className={`w-full rounded-xl border bg-white py-2.5 pl-10 pr-10 text-black placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-gray-200 ${errors.password ? 'border-black' : 'border-gray-300 focus:border-black'}`}
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-3 grid place-items-center text-gray-600 hover:text-black"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M3 3l18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M10.6 10.6A2 2 0 0012 14a2 2 0 001.4-3.4M9.88 5.08A10.6 10.6 0 0112 5c6 0 10 7 10 7a12.8 12.8 0 01-4.08 4.57M6.12 7.53A12.72 12.72 0 002 12s4 7 10 7c1.14 0 2.22-.18 3.23-.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/></svg>
                  )}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-xs text-red-600" aria-live="polite">{errors.password}</p>}
            </div>

            <div className="flex items-center justify-between">
              <label className="inline-flex items-center gap-2 select-none">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black"
                />
                <span className="text-sm text-gray-600">Remember me</span>
              </label>
              <a href="#" className="text-sm font-medium text-gray-800 hover:text-black">Forgot password?</a>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl bg-black text-white font-medium py-2.5 shadow-sm hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 transition disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span className="inline-flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4A4 4 0 004 12z"></path></svg>
                  Signing in…
                </span>
              ) : 'Sign in'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Having trouble? <a href="#" className="font-medium text-gray-800 hover:text-black">Contact support</a>
          </p>
        </div>

        <p className="mt-6 text-center text-xs text-gray-500">
          © {new Date().getFullYear()} FBR Invoicing Portal. All rights reserved.
        </p>
      </div>
    </div>
    </div>
  )
}


