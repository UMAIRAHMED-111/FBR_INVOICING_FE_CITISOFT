import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { invoicesApi } from '../../api/invoices'
import { tenantsApi } from '../../api/tenants'
import { referenceDataApi } from '../../api/referenceData'
import { extractApiError } from '../../api/apiClient'
import toast from 'react-hot-toast'
import SearchableSelect from '../../components/SearchableSelect'

export default function CreateBuyerDialog({ onClose }) {
	const me = useSelector(s => s.user.me)
	const isTenantUser = me?.user_type === 'tenant_user'

	const [form, setForm] = useState({
		tenant: '',
		business_name: '',
		ntn_cnic: '',
		province: '',
		address: '',
		registration_type: '',
	})
	const [tenants, setTenants] = useState([])
	const [loadingTenants, setLoadingTenants] = useState(false)
	const [provinces, setProvinces] = useState([])
	const [saving, setSaving] = useState(false)
	const [errors, setErrors] = useState({})

	useEffect(() => {
		if (isTenantUser) return
		let cancelled = false
		;(async () => {
			setLoadingTenants(true)
			try {
				const data = await tenantsApi.listTenants()
				if (!cancelled) setTenants(Array.isArray(data) ? data : [])
			} catch (err) {
				console.error('Failed to load tenants', err)
			} finally {
				if (!cancelled) setLoadingTenants(false)
			}
		})()
		return () => { cancelled = true }
	}, [isTenantUser])

	useEffect(() => {
		let cancelled = false
		;(async () => {
			try {
				const data = await referenceDataApi.getProvinces()
				if (!cancelled) {
					setProvinces(Array.isArray(data) ? data : [])
				}
			} catch (err) {
				console.error('Failed to load provinces', err)
			}
		})()
		return () => { cancelled = true }
	}, [])

	function field(name) {
		return {
			value: form[name] ?? '',
			onChange: (e) => {
				setForm({ ...form, [name]: e.target.value })
				if (errors[name]) setErrors({ ...errors, [name]: '' })
			},
		}
	}

	async function handleSubmit(e) {
		e.preventDefault()
		
		// Validation
		const newErrors = {}
		if (!form.business_name.trim()) {
			newErrors.business_name = 'Business name is required'
		}
		if (!form.ntn_cnic) {
			newErrors.ntn_cnic = 'NTN/CNIC is required'
		} else if (!/^(\d{7}|\d{13})$/.test(form.ntn_cnic)) {
			newErrors.ntn_cnic = 'NTN must be 7 digits or CNIC must be 13 digits'
		}
		if (!form.province) {
			newErrors.province = 'Province is required'
		}
		if (!form.registration_type) {
			newErrors.registration_type = 'Registration type is required'
		}
		if (!isTenantUser && !form.tenant) {
			newErrors.tenant = 'Tenant is required'
		}
		if (Object.keys(newErrors).length > 0) {
			setErrors(newErrors)
			return
		}
		
		setSaving(true)
		try {
			const payload = {
				business_name: (form.business_name || '').trim(),
				ntn_cnic: form.ntn_cnic || null,
				province: form.province || null,
				address: form.address || null,
				registration_type: form.registration_type || null,
				tenant: isTenantUser ? null : (form.tenant || null),
			}
			await invoicesApi.createBuyer(payload)
			toast.success('Buyer created')
			onClose(true)
		} catch (err) {
			const msg = extractApiError(err)
			toast.error(msg)
			setSaving(false)
		}
	}

	return (
		<div className="fixed inset-0 z-[1000]">
			<div className="absolute inset-0 bg-black/40" onClick={() => onClose(false)} />
			<div className="absolute inset-0 flex items-center justify-center p-4 overflow-y-auto">
				<div className="w-full max-w-xl rounded-2xl border border-gray-200 bg-white shadow-xl my-8">
					<div className="flex items-center justify-between px-6 py-3.5 border-b border-gray-200">
						<h3 className="text-lg font-semibold text-gray-900">Create Buyer</h3>
						<button
							type="button"
							onClick={() => onClose(false)}
							className="h-9 w-9 grid place-items-center rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
						>
							✕
						</button>
					</div>
					<form onSubmit={handleSubmit} className="px-6 py-4 grid gap-3">
						{!isTenantUser && (
							<div>
								<SearchableSelect
									label={<>Tenant <span className="text-red-500">*</span></>}
									value={form.tenant}
									onChange={(value) => {
										setForm({ ...form, tenant: value })
										if (errors.tenant) setErrors({ ...errors, tenant: '' })
									}}
									options={tenants}
									placeholder={loadingTenants ? 'Loading…' : 'Select tenant'}
									getOptionLabel={(t) => t.name}
									getOptionValue={(t) => t.id}
									disabled={loadingTenants}
								/>
								{errors.tenant && <p className="text-red-500 text-sm mt-1">{errors.tenant}</p>}
							</div>
						)}
						<div>
							<label className="block text-sm font-medium text-gray-800">Business Name <span className="text-red-500">*</span></label>
							<input
								{...field('business_name')}
								className={`mt-1 w-full rounded-xl border bg-white py-2.5 px-3 ${errors.business_name ? 'border-red-500' : 'border-gray-300'}`}
								placeholder="Buyer business name"
							/>
							{errors.business_name && <p className="text-red-500 text-sm mt-1">{errors.business_name}</p>}
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-800">NTN / CNIC <span className="text-red-500">*</span></label>
							<input
								{...field('ntn_cnic')}
								className={`mt-1 w-full rounded-xl border bg-white py-2.5 px-3 ${errors.ntn_cnic ? 'border-red-500' : 'border-gray-300'}`}
								placeholder="7 digits (NTN) or 13 digits (CNIC)"
							/>
							{errors.ntn_cnic && <p className="text-red-500 text-sm mt-1">{errors.ntn_cnic}</p>}
						</div>
						<div>
							<SearchableSelect
								label={<>Province <span className="text-red-500">*</span></>}
								value={form.province}
								onChange={(value) => {
									setForm({ ...form, province: value })
									if (errors.province) setErrors({ ...errors, province: '' })
								}}
								options={provinces}
								placeholder="Select province"
								getOptionLabel={(p) => p.province_desc}
								getOptionValue={(p) => p.province_desc}
							/>
							{errors.province && <p className="text-red-500 text-sm mt-1">{errors.province}</p>}
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-800">Address</label>
							<input
								{...field('address')}
								className="mt-1 w-full rounded-xl border border-gray-300 bg-white py-2.5 px-3"
								placeholder="Address"
							/>
						</div>
						<div>
							<SearchableSelect
								label={<>Registration Type <span className="text-red-500">*</span></>}
								value={form.registration_type}
								onChange={(value) => {
									setForm({ ...form, registration_type: value })
									if (errors.registration_type) setErrors({ ...errors, registration_type: '' })
								}}
								options={[
									{ label: 'Registered', value: 'registered' },
									{ label: 'Unregistered', value: 'unregistered' },
								]}
								placeholder="Select type"
							/>
							{errors.registration_type && <p className="text-red-500 text-sm mt-1">{errors.registration_type}</p>}
						</div>

						<div className="mt-2 flex items-center justify-end gap-2">
							<button
								type="button"
								onClick={() => onClose(false)}
								className="rounded-xl border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50"
							>
								Cancel
							</button>
							<button
								type="submit"
								disabled={saving}
								className="rounded-xl bg-black text-white px-3 py-2 text-sm hover:bg-gray-900 disabled:opacity-70"
							>
								{saving ? 'Creating…' : 'Create'}
							</button>
						</div>
					</form>
				</div>
			</div>
		</div>
	)
}


