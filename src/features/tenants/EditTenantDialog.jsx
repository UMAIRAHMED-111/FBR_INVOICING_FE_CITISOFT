import { useEffect, useState } from 'react'
import { tenantsApi } from '../../api/tenants'
import { extractApiError } from '../../api/apiClient'
import { referenceDataApi } from '../../api/referenceData'
import toast from 'react-hot-toast'
import SearchableSelect from '../../components/SearchableSelect'

const blank = {
	name: '', contact_email: '', ntn: '', address_line: '',
	city: '', province: '', fbr_client_secret: '', fbr_client_secret_sandbox: '', is_active: true,
	last_payment_at: '',
}

// Convert UTC datetime string to local datetime-local format (YYYY-MM-DDTHH:mm)
function toLocalDatetimeString(utcString) {
	if (!utcString) return ''
	try {
		const date = new Date(utcString)
		if (isNaN(date.getTime())) return ''
		// Get local time components
		const year = date.getFullYear()
		const month = String(date.getMonth() + 1).padStart(2, '0')
		const day = String(date.getDate()).padStart(2, '0')
		const hours = String(date.getHours()).padStart(2, '0')
		const minutes = String(date.getMinutes()).padStart(2, '0')
		return `${year}-${month}-${day}T${hours}:${minutes}`
	} catch {
		return ''
	}
}

// Convert local datetime-local format to UTC ISO string for backend
function toUTCString(localDatetimeString) {
	if (!localDatetimeString) return null
	try {
		// datetime-local gives us "YYYY-MM-DDTHH:mm" in LOCAL time
		// Create a Date object which interprets it as local time
		const date = new Date(localDatetimeString)
		if (isNaN(date.getTime())) return null
		// Convert to UTC ISO string
		return date.toISOString()
	} catch {
		return null
	}
}

export default function EditTenantDialog({ tenantId, onClose }) {
	const [form, setForm] = useState(blank)
	const [provinces, setProvinces] = useState([])
	const [loading, setLoading] = useState(true)
	const [saving, setSaving] = useState(false)
	const [showSecret, setShowSecret] = useState(false)
	const [showSandboxSecret, setShowSandboxSecret] = useState(false)
	const [errors, setErrors] = useState({})

	useEffect(() => {
		let cancelled = false
		;(async () => {
			setLoading(true)
			try {
				const data = await tenantsApi.getTenant(tenantId)
				if (!cancelled)
					setForm({
					name: data.name || '',
					contact_email: data.contact_email || '',
					ntn: data.ntn || '',
					address_line: data.address_line || '',
					city: data.city || '',
					province: data.province || '',
					fbr_client_secret: data.fbr_client_secret || '',
					fbr_client_secret_sandbox: data.fbr_client_secret_sandbox || '',
					is_active: !!data.is_active,
					last_payment_at: toLocalDatetimeString(data.last_payment_at),
				})
			} catch (err) {
				if (!cancelled) toast.error(extractApiError(err))
			} finally {
				if (!cancelled) setLoading(false)
			}
		})()
		return () => {
			cancelled = true
		}
	}, [tenantId])

	useEffect(() => {
		let cancelled = false
		;(async () => {
			try {
				const data = await referenceDataApi.getProvinces()
				if (!cancelled) setProvinces(Array.isArray(data) ? data : [])
			} catch (err) {
				console.error('Failed to load provinces', err)
			}
		})()
		return () => { cancelled = true }
	}, [])

	function field(name) {
		return {
			value: form[name] ?? '',
			onChange: (e) => setForm({ ...form, [name]: e.target.value }),
		}
	}

	async function handleSave(e) {
		e.preventDefault()
		// Validate fields
		const newErrors = {}
		if (!form.name.trim()) newErrors.name = 'Company name is required'
		if (!form.contact_email.trim()) newErrors.contact_email = 'Contact email is required'
		else if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,}$/.test(form.contact_email.trim())) newErrors.contact_email = 'Enter a valid email address'
		if (!form.ntn.trim()) newErrors.ntn = 'NTN/CNIC is required'
		else if (!/^(\d{7}|\d{13})$/.test(form.ntn.trim())) newErrors.ntn = 'Enter a valid 7-digit NTN or 13-digit CNIC'
		if (!form.city.trim()) newErrors.city = 'City is required'
		if (!form.province.trim()) newErrors.province = 'Province is required'
		if (!form.fbr_client_secret.trim()) newErrors.fbr_client_secret = 'FBR Client Secret is required'
		setErrors(newErrors)
		if (Object.keys(newErrors).length > 0) return

		setSaving(true)
		try {
			const payload = { ...form }
			payload.name = payload.name.trim()
			payload.contact_email = payload.contact_email.trim().toLowerCase()
			// Convert local datetime to UTC ISO string for backend
			payload.last_payment_at = toUTCString(form.last_payment_at)
			await tenantsApi.updateTenant(tenantId, payload)
			onClose(true)
		} catch (err) {
			toast.error(extractApiError(err))
		} finally {
			setSaving(false)
		}
	}

	async function handleDelete() {
		const ok = window.confirm('Are you sure you want to delete (soft) this tenant?')
		if (!ok) return
		setSaving(true)
		try {
			await tenantsApi.deleteTenant(tenantId)
			onClose(true)
		} catch (err) {
			toast.error(extractApiError(err))
			setSaving(false)
		}
	}

	return (
		<div className="fixed inset-0 z-[1000]">
			<div className="absolute inset-0 bg-black/40" onClick={() => onClose(false)} />
			<div className="absolute inset-0 flex items-center justify-center p-4 overflow-y-auto">
				<div className="w-full max-w-5xl rounded-2xl border border-gray-200 bg-white shadow-xl my-8">
					<div className="flex items-center justify-between px-6 py-3.5 border-b border-gray-200">
						<h3 className="text-xl font-semibold text-gray-900">Company Details</h3>
						<button 
							type="button"
							onClick={() => onClose(false)} 
							className="h-9 w-9 grid place-items-center rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
						>
							✕
						</button>
					</div>
					{loading ? (
						<div className="px-6 py-12 text-center">
							<div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-gray-900 border-r-transparent"></div>
							<p className="mt-3 text-sm text-gray-600">Loading company details…</p>
						</div>
					) : (
						<form onSubmit={handleSave} className="px-6 py-4">
							<div className="grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-3">
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">Name <span className="text-red-500">*</span></label>
									<input 
										value={form.name ?? ''}
										onChange={(e) => { setForm({ ...form, name: e.target.value }); setErrors(prev => ({ ...prev, name: '' })) }}
										className={`w-full rounded-lg border ${errors.name ? 'border-red-500' : 'border-gray-300'} bg-white py-2 px-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-shadow`}
										placeholder="Enter company name"
									/>
									{errors.name && <p className="text-red-600 text-xs mt-1">{errors.name}</p>}
								</div>
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">Contact Email <span className="text-red-500">*</span></label>
									<input 
										value={form.contact_email ?? ''}
										onChange={(e) => { setForm({ ...form, contact_email: e.target.value }); setErrors(prev => ({ ...prev, contact_email: '' })) }}
										type="email"
										className={`w-full rounded-lg border ${errors.contact_email ? 'border-red-500' : 'border-gray-300'} bg-white py-2 px-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-shadow`}
										placeholder="contact@company.com"
									/>
									{errors.contact_email && <p className="text-red-600 text-xs mt-1">{errors.contact_email}</p>}
								</div>
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">NTN/CNIC <span className="text-red-500">*</span></label>
									<input 
										{...field('ntn')}
										onChange={(e) => { setForm({ ...form, ntn: e.target.value }); setErrors(prev => ({ ...prev, ntn: '' })) }}
										className={`w-full rounded-lg border ${errors.ntn ? 'border-red-500' : 'border-gray-300'} bg-white py-2 px-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-shadow`}
										placeholder="7-digit NTN or 13-digit CNIC"
									/>
									{errors.ntn && <p className="text-red-600 text-xs mt-1">{errors.ntn}</p>}
								</div>
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">City <span className="text-red-500">*</span></label>
									<input 
										value={form.city ?? ''}
										onChange={(e) => { setForm({ ...form, city: e.target.value }); setErrors(prev => ({ ...prev, city: '' })) }}
										className={`w-full rounded-lg border ${errors.city ? 'border-red-500' : 'border-gray-300'} bg-white py-2 px-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-shadow`}
										placeholder="Enter city"
									/>
									{errors.city && <p className="text-red-600 text-xs mt-1">{errors.city}</p>}
								</div>
								<div>
									<SearchableSelect
										label={<>Province <span className="text-red-500">*</span></>}
										value={form.province}
										onChange={(value) => { setForm({ ...form, province: value }); setErrors(prev => ({ ...prev, province: '' })) }}
										options={provinces}
										placeholder="Select province"
										getOptionLabel={(p) => p.province_desc}
										getOptionValue={(p) => p.province_desc}
										error={errors.province}
									/>
									{errors.province && <p className="text-red-600 text-xs mt-1">{errors.province}</p>}
								</div>
								<div className="md:col-span-3">
									<label className="block text-sm font-medium text-gray-700 mb-1">Address Line</label>
									<input 
										{...field('address_line')} 
										className="w-full rounded-lg border border-gray-300 bg-white py-2 px-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-shadow" 
										placeholder="Street address"
									/>
								</div>
								
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">FBR Client Secret <span className="text-red-500">*</span></label>
									<div className="relative">
										<input 
											value={form.fbr_client_secret ?? ''}
											onChange={(e) => { setForm({ ...form, fbr_client_secret: e.target.value }); setErrors(prev => ({ ...prev, fbr_client_secret: '' })) }}
											type={showSecret ? "text" : "password"}
											className={`w-full rounded-lg border ${errors.fbr_client_secret ? 'border-red-500' : 'border-gray-300'} bg-white py-2 px-3 pr-10 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-shadow`}
											placeholder="Enter FBR client secret"
										/>
										<button
											type="button"
											onClick={() => setShowSecret(!showSecret)}
											className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-500 hover:text-gray-700 transition-colors"
											title={showSecret ? "Hide secret" : "Show secret"}
										>
											{showSecret ? (
												<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
												</svg>
											) : (
												<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
												</svg>
											)}
										</button>
									</div>
									{errors.fbr_client_secret && <p className="text-red-600 text-xs mt-1">{errors.fbr_client_secret}</p>}
								</div>
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">Sandbox FBR Client Secret</label>
									<div className="relative">
										<input 
											{...field('fbr_client_secret_sandbox')} 
											type={showSandboxSecret ? "text" : "password"}
											className="w-full rounded-lg border border-gray-300 bg-white py-2 px-3 pr-10 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-shadow" 
											placeholder="Enter sandbox FBR client secret"
										/>
										<button
											type="button"
											onClick={() => setShowSandboxSecret(!showSandboxSecret)}
											className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-500 hover:text-gray-700 transition-colors"
											title={showSandboxSecret ? "Hide secret" : "Show secret"}
										>
											{showSandboxSecret ? (
												<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
												</svg>
											) : (
												<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
												</svg>
											)}
										</button>
									</div>
								</div>
								<div className="md:col-span-3">
									<label className="flex items-center gap-2.5 text-sm font-medium text-gray-700 cursor-pointer px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors w-fit">
										<input 
											type="checkbox" 
											checked={!!form.is_active} 
											onChange={(e) => setForm({ ...form, is_active: e.target.checked })} 
											className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black focus:ring-2" 
										/>
										<span>Active</span>
									</label>
								</div>
								<div className="md:col-span-3">
									<label className="block text-sm font-medium text-gray-700 mb-1">
										Last Payment At
									</label>
									<input
										type="datetime-local"
										value={form.last_payment_at ? form.last_payment_at.slice(0, 16) : ''}
										onChange={(e) => setForm({ ...form, last_payment_at: e.target.value })}
										className="w-full rounded-lg border border-gray-300 bg-white py-2 px-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-shadow"
									/>
									<p className="text-xs text-gray-500 mt-1">
										Optional. Set when the most recent payment was received.
									</p>
								</div>
							</div>
							<div className="mt-4 flex items-center justify-between gap-3 pt-3 border-t border-gray-200">
								<button 
									type="button" 
									onClick={handleDelete} 
									disabled={saving} 
									className="rounded-lg border border-red-300 bg-white text-red-700 px-4 py-2 text-sm font-medium hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
								>
									Delete Company
								</button>
								<div className="flex items-center gap-3">
									<button 
										type="button" 
										onClick={() => onClose(false)} 
										className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
									>
										Cancel
									</button>
									<button 
										type="submit" 
										disabled={saving} 
										className="rounded-lg bg-black text-white px-5 py-2 text-sm font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
									>
										{saving ? 'Saving…' : 'Save Changes'}
									</button>
								</div>
							</div>
						</form>
					)}
				</div>
			</div>
		</div>
	)
}


