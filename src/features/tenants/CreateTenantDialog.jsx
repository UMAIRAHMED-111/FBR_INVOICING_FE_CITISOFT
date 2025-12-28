import { useEffect, useState } from 'react'
import { tenantsApi } from '../../api/tenants'
import { extractApiError } from '../../api/apiClient'
import { referenceDataApi } from '../../api/referenceData'
import toast from 'react-hot-toast'
import SearchableSelect from '../../components/SearchableSelect'

const initial = {
	name: '',
	contact_email: '',
	ntn: '',
	address_line: '',
	city: '',
	province: '',
	fbr_client_secret: '',
	fbr_client_secret_sandbox: '',
}

export default function CreateTenantDialog({ onClose }) {
	const [form, setForm] = useState(initial)
	const [provinces, setProvinces] = useState([])
	const [saving, setSaving] = useState(false)
	const [showSecret, setShowSecret] = useState(false)
	const [showSandboxSecret, setShowSandboxSecret] = useState(false)
	const [errors, setErrors] = useState({})

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

	async function handleSubmit(e) {
		e.preventDefault()
		// Validate fields
		const newErrors = {}
		if (!(form.name || '').trim()) newErrors.name = 'Company name is required'
		if (!(form.contact_email || '').trim()) newErrors.contact_email = 'Contact email is required'
		else if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,}$/.test((form.contact_email || '').trim())) newErrors.contact_email = 'Enter a valid email address'
		if (!(form.ntn || '').trim()) newErrors.ntn = 'NTN/CNIC is required'
		else if (!/^(\d{7}|\d{13})$/.test((form.ntn || '').trim())) newErrors.ntn = 'Enter a valid 7-digit NTN or 13-digit CNIC'
		if (!(form.city || '').trim()) newErrors.city = 'City is required'
		if (!(form.province || '').trim()) newErrors.province = 'Province is required'
		if (!(form.fbr_client_secret || '').trim()) newErrors.fbr_client_secret = 'FBR Client Secret is required'
		setErrors(newErrors)
		if (Object.keys(newErrors).length > 0) return

		setSaving(true)
		try {
			const payload = {
				name: (form.name || '').trim(),
				contact_email: (form.contact_email || '').trim().toLowerCase(),
				ntn: form.ntn || undefined,
				address_line: form.address_line || undefined,
				city: form.city || undefined,
				province: form.province || undefined,
				fbr_client_secret: form.fbr_client_secret || undefined,
				fbr_client_secret_sandbox: form.fbr_client_secret_sandbox || undefined,
			}
			await tenantsApi.createTenant(payload)
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
						<h3 className="text-xl font-semibold text-gray-900">Create Company</h3>
						<button 
							type="button"
							onClick={() => onClose(false)} 
							className="h-9 w-9 grid place-items-center rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
						>
							✕
						</button>
					</div>
					<form onSubmit={handleSubmit} className="px-6 py-4">
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
						</div>
						<div className="mt-4 flex items-center justify-end gap-3 pt-3 border-t border-gray-200">
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
								{saving ? 'Creating…' : 'Create Company'}
							</button>
						</div>
					</form>
				</div>
			</div>
		</div>
	)
}


