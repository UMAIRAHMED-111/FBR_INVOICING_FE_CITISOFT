import { useState } from 'react'
import { authApi } from '../../api/auth'
import { extractApiError } from '../../api/apiClient'
import AuthShell from './AuthShell'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'

export default function PasswordResetRequestPage() {
	const [email, setEmail] = useState('')
	const [ok, setOk] = useState(false)
	const [submitting, setSubmitting] = useState(false)
	const [errors, setErrors] = useState({})

	async function handleSubmit(e) {
		e.preventDefault()
		const newErrors = {}
		if (!email.trim()) newErrors.email = 'Email is required'
		else if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,}$/.test(email.trim())) newErrors.email = 'Enter a valid email address'
		setErrors(newErrors)
		if (Object.keys(newErrors).length > 0) return

    setOk(false)
    setSubmitting(true)
		try {
			await authApi.requestPasswordReset({ email: email.trim().toLowerCase() })
			setOk(true)
			toast.success('If the email exists, a reset link has been sent.')
		} catch (err) {
			toast.error(extractApiError(err))
		} finally {
			setSubmitting(false)
		}
	}

	return (
    <AuthShell title="Reset password" subtitle="Secure access to your invoicing workspace">
					<form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-slate-700">Email</label>
							<input
            placeholder="you@company.com"
								value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              setErrors((prev) => ({ ...prev, email: '' }))
            }}
            className={`w-full rounded-xl border bg-white py-2.5 px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/80 focus:border-transparent ${
              errors.email ? 'border-red-500' : 'border-slate-200'
            }`}
							/>
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
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
              <span>Sending…</span>
								</span>
          ) : (
            'Send reset link'
          )}
						</button>
        <div className="text-center text-xs mt-1">
          <Link to="/" className="text-slate-700 hover:text-slate-900">
            Back to login
          </Link>
						</div>
					</form>
      {ok && <p className="text-emerald-600 text-xs mt-3">Check your email for reset instructions.</p>}
    </AuthShell>
	)
}
