import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { bootstrapSession, clearAuthError, loginPasswordThunk, loginVerifyThunk, clearOtp } from '../../store/slices/authSlice'
import AuthShell from './AuthShell'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'

export default function LoginPage() {
	const dispatch = useDispatch()
	const navigate = useNavigate()
	const { status, error, otpRequired, pendingEmail } = useSelector(s => s.auth)
	const me = useSelector(s => s.user.me)

	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [code, setCode] = useState('')
	const [showPassword, setShowPassword] = useState(false)
	const [showTerms, setShowTerms] = useState(false)
	const [errors, setErrors] = useState({})

	useEffect(() => { dispatch(bootstrapSession()) }, [dispatch])
	useEffect(() => { if (pendingEmail) setEmail(pendingEmail) }, [pendingEmail])
	// Surface API errors via toast
	useEffect(() => {
		if (error) toast.error(error, { id: 'auth-error' })
	}, [error])
	// Welcome toast after successful auth
	useEffect(() => {
		if (me) toast.success(`Welcome, ${me.full_name}`, { id: 'auth-success' })
	}, [me])
	// Navigate to dashboard on successful authentication
	useEffect(() => {
		if (status === 'authenticated') {
			navigate('/dashboard', { replace: true })
		}
	}, [status, navigate])

	async function handlePasswordLogin(e) {
		e.preventDefault()
		// Validate email
		const newErrors = {}
		if (!email.trim()) newErrors.email = 'Email is required'
		else if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,}$/.test(email.trim())) newErrors.email = 'Enter a valid email address'
		setErrors(newErrors)
		if (Object.keys(newErrors).length > 0) return

		dispatch(clearAuthError())
		const res = await dispatch(loginPasswordThunk({ email: email.trim().toLowerCase(), password }))
		// If OTP is required, guide the user
		if (res?.meta?.requestStatus === 'fulfilled') {
			const payload = res.payload || {}
			if (payload.otp_required) {
				toast('Enter the 6-digit code to continue', { id: 'otp-info' })
			}
		}
	}

	async function handleVerify(e) {
		e.preventDefault()
		// Validate OTP code
		const newErrors = {}
		if (!code.trim()) newErrors.code = 'Code is required'
		else if (!/^\d{6}$/.test(code.trim())) newErrors.code = 'Enter a valid 6-digit code'
		setErrors(newErrors)
		if (Object.keys(newErrors).length > 0) return

		dispatch(clearAuthError())
		const res = await dispatch(loginVerifyThunk({ email: (email || pendingEmail).trim().toLowerCase(), code: code.trim() }))
		if (res?.meta?.requestStatus === 'fulfilled') {
			toast.success('Logged in successfully', { id: 'auth-success-verify' })
		}
	}

	function handleBack() {
		dispatch(clearOtp())
		setCode('')
	}

	return (
		<>
			<AuthShell 
				title={!otpRequired ? "Welcome back" : "Verify your code"}
				subtitle="Secure access to your invoicing workspace"
			>
				{!otpRequired && (
					<p className="mb-4 text-xs text-slate-500">
						Sign in with your work email to continue.
					</p>
				)}

				{!otpRequired ? (
					<form onSubmit={handlePasswordLogin} className="space-y-4">
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
								<div className="space-y-1.5">
									<label className="block text-xs font-medium text-slate-700">Password</label>
							<div className="relative">
								<input
									type={showPassword ? 'text' : 'password'}
											placeholder="••••••••"
									value={password}
									onChange={(e) => setPassword(e.target.value)}
											className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pr-10 px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/80 focus:border-transparent"
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
								</div>

								<div className="flex items-center justify-between gap-12 text-xs">
									<span className="text-slate-500">
										By continuing you agree to our{' '}
										<button
											type="button"
											onClick={() => setShowTerms(true)}
											className="text-slate-900 underline underline-offset-2 hover:text-slate-700"
										>
											Terms
										</button>
										.
									</span>
									<Link to="/auth/reset" className="font-medium text-slate-900 hover:text-slate-700 whitespace-nowrap">
										Forgot password?
									</Link>
								</div>

								<button
									disabled={status === 'loading'}
									className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-2.5 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(15,23,42,0.35)] transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-70"
								>
									{status === 'loading' ? (
										<>
											<svg
												className="h-4 w-4 animate-spin text-white"
												viewBox="0 0 24 24"
											>
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
											<span>Signing in…</span>
										</>
									) : (
										'Continue'
									)}
								</button>
						</form>
					) : (
						<form onSubmit={handleVerify} className="space-y-4">
								<div className="space-y-1.5">
									<label className="block text-xs font-medium text-slate-700">Verification code</label>
								<input
									placeholder="6-digit code"
									value={code}
										onChange={(e) => {
											setCode(e.target.value)
											setErrors((prev) => ({ ...prev, code: '' }))
										}}
										className={`w-full rounded-xl border bg-white py-2.5 px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/80 focus:border-transparent ${
											errors.code ? 'border-red-500' : 'border-slate-200'
										}`}
								/>
									{errors.code && <p className="text-red-500 text-xs mt-1">{errors.code}</p>}
							</div>
							<div className="flex gap-2">
									<button
										type="button"
										onClick={handleBack}
										className="w-1/3 rounded-xl border border-slate-200 bg-white py-2.5 text-xs font-medium text-slate-800 hover:bg-slate-50"
									>
									Back
								</button>
									<button
										disabled={status === 'loading'}
										className="flex-1 rounded-xl bg-slate-900 py-2.5 text-xs font-semibold text-white shadow-[0_12px_30px_rgba(15,23,42,0.35)] hover:bg-black disabled:opacity-70 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
									>
									{status === 'loading' ? (
											<>
												<svg
													className="h-4 w-4 animate-spin text-white"
													viewBox="0 0 24 24"
												>
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
												<span>Verifying…</span>
											</>
										) : (
											'Verify'
										)}
								</button>
							</div>
					</form>
				)}
			</AuthShell>

			{showTerms && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
					<div className="w-full max-w-md rounded-2xl bg-white shadow-xl p-5">
						<div className="flex items-start justify-between gap-3 mb-3">
							<div>
								<h2 className="text-sm font-semibold text-slate-900">Terms of use</h2>
								<p className="mt-1 text-xs text-slate-500">
									These are a short, high-level summary of how this portal should be used.
								</p>
							</div>
							<button
								type="button"
								onClick={() => setShowTerms(false)}
								className="text-slate-400 hover:text-slate-700"
								aria-label="Close terms"
							>
								✕
							</button>
						</div>
						<div className="space-y-2.5 text-xs text-slate-600 max-h-64 overflow-y-auto pr-1">
							<p>
								This portal is provided to registered tenants and their users for managing FBR-compliant invoices and related data.
							</p>
							<ul className="list-disc pl-4 space-y-1.5">
								<li>Only authorised users may access and use this system.</li>
								<li>You are responsible for keeping your credentials confidential.</li>
								<li>All activity may be logged for security and audit purposes.</li>
								<li>Do not share or export buyer, seller, or invoice data except as permitted by your organisation&apos;s policy.</li>
								<li>Misuse of this system may result in suspension of access.</li>
							</ul>
							<p>
								By continuing to sign in, you confirm that you understand these terms and are using the portal on behalf of your organisation.
							</p>
						</div>
						<div className="mt-4 flex justify-end">
							<button
								type="button"
								onClick={() => setShowTerms(false)}
								className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-black"
							>
								I understand
							</button>
						</div>
					</div>
				</div>
			)}
		</>
	)
}


