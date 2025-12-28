import { useState, useMemo } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { authApi } from '../../api/auth'
import { extractApiError } from '../../api/apiClient'
import AuthShell from './AuthShell'
import toast from 'react-hot-toast'

export default function PasswordResetConfirmPage() {
	const [params] = useSearchParams()
	const token = useMemo(() => params.get('token') || '', [params])
	const navigate = useNavigate()
	const [password, setPassword] = useState('')
	const [ok, setOk] = useState(false)
	const [submitting, setSubmitting] = useState(false)
	const [showPassword, setShowPassword] = useState(false)
	const [errors, setErrors] = useState({})

	async function handleSubmit(e) {
		e.preventDefault()
		const newErrors = {}
		if (!password) newErrors.password = 'Password is required'
		else if (password.length < 8) newErrors.password = 'Password must be at least 8 characters'
		setErrors(newErrors)
		if (Object.keys(newErrors).length > 0) return

    setOk(false)
    setSubmitting(true)
		try {
			await authApi.confirmPasswordReset({ token, new_password: password })
			setOk(true)
			toast.success('Password updated. Please log in.')
			setTimeout(() => navigate('/'), 800)
		} catch (err) {
			toast.error(extractApiError(err))
		} finally {
			setSubmitting(false)
		}
	}

	return (
    <AuthShell title="Set new password" subtitle="Secure access to your invoicing workspace">
					<form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-slate-700">New password</label>
							<div className="relative">
								<input
									type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
									value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                setErrors((prev) => ({ ...prev, password: '' }))
              }}
              className={`w-full rounded-xl border bg-white py-2.5 pr-10 px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/80 focus:border-transparent ${
                errors.password ? 'border-red-500' : 'border-slate-200'
              }`}
								/>
							<button
								type="button"
								onClick={() => setShowPassword((v) => !v)}
              className="absolute inset-y-0 right-3 grid place-items-center text-slate-400 hover:text-slate-700"
								aria-label={showPassword ? 'Hide password' : 'Show password'}
							>
								{showPassword ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M3 3l18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <path
                    d="M10.6 10.6A2 2 0 0012 14a2 2 0 001.4-3.4M9.88 5.08A10.6 10.6 0 0112 5c6 0 10 7 10 7a12.8 12.8 0 01-4.08 4.57M6.12 7.53A12.72 12.72 0 002 12s4 7 10 7c1.14 0 2.22-.18 3.23-.5"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
								) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
                </svg>
								)}
								</button>
							</div>
          {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
						</div>
        <button
          disabled={submitting}
          className="mt-1 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-2.5 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(15,23,42,0.35)] transition hover:bg-black disabled:opacity-70 disabled:cursor-not-allowed"
        >
							{submitting ? (
								<span className="inline-flex items-center gap-2">
              <svg className="h-4 w-4 animate-spin text-white" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4A4 4 0 004 12z"
                />
              </svg>
              <span>Saving…</span>
								</span>
          ) : (
            'Save'
          )}
						</button>
        <div className="text-center text-xs mt-1">
          <Link to="/" className="text-slate-700 hover:text-slate-900">
            Back to login
          </Link>
						</div>
					</form>
      {ok && <p className="text-emerald-600 text-xs mt-3">Password updated. You can now log in.</p>}
    </AuthShell>
	)
}
