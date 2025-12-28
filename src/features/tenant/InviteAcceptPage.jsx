import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { tenantsApi } from '../../api/tenants'
import { extractApiError } from '../../api/apiClient'
import AuthShell from '../auth/AuthShell'

export default function InviteAcceptPage() {
	const navigate = useNavigate()
	const [params] = useSearchParams()
	const token = useMemo(() => params.get('token') || '', [params])

	const [fullName, setFullName] = useState('')
	const [password, setPassword] = useState('')
	const [showPassword, setShowPassword] = useState(false)
	const [submitting, setSubmitting] = useState(false)
	const [ok, setOk] = useState(false)
	const [errors, setErrors] = useState({})

  useEffect(() => {
    if (!token) toast.error('Missing invitation token.')
  }, [token])

	async function handleSubmit(e) {
		e.preventDefault()
		if (!token) return
		const newErrors = {}
		if (!fullName.trim()) newErrors.fullName = 'Full name is required'
		if (!password) newErrors.password = 'Password is required'
		setErrors(newErrors)
		if (Object.keys(newErrors).length > 0) return

		setSubmitting(true)
		try {
			await tenantsApi.acceptInvitation({
				token,
				full_name: fullName.trim() || undefined,
				password: password || undefined,
			})
			setOk(true)
			toast.success('Invitation accepted.')
			setTimeout(() => navigate('/login'), 800)
		} catch (err) {
			const msg = extractApiError(err)
			toast.error(msg)
		} finally {
			setSubmitting(false)
		}
	}

	return (
    <AuthShell title="Accept invitation" subtitle="Finish setting up your account to access the portal">
					<form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-slate-700">
            Full name <span className="text-red-500">*</span>
          </label>
							<input 
								value={fullName} 
            onChange={(e) => {
              setFullName(e.target.value)
              setErrors((prev) => ({ ...prev, fullName: '' }))
            }}
								disabled={submitting || !token} 
            className={`w-full rounded-xl border bg-white py-2.5 px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/80 focus:border-transparent ${
              errors.fullName ? 'border-red-500' : 'border-slate-200'
            }`}
							/>
          {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
						</div>
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-slate-700">
            Password <span className="text-red-500">*</span>
          </label>
							<div className="relative">
								<input
									type={showPassword ? 'text' : 'password'}
									value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                setErrors((prev) => ({ ...prev, password: '' }))
              }}
									disabled={submitting || !token}
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
          disabled={submitting || !token}
          type="submit"
          className="mt-1 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-2.5 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(15,23,42,0.35)] hover:bg-black disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {submitting ? 'Accepting…' : 'Accept invitation'}
						</button>
					</form>
      {ok && <p className="text-emerald-600 text-xs mt-3">Invitation accepted. Redirecting…</p>}
    </AuthShell>
	)
}
