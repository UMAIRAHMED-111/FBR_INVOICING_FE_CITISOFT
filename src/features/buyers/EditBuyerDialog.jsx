import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { invoicesApi } from '../../api/invoices'
import { tenantsApi } from '../../api/tenants'
import { referenceDataApi } from '../../api/referenceData'
import { extractApiError } from '../../api/apiClient'
import toast from 'react-hot-toast'
import SearchableSelect from '../../components/SearchableSelect'

export default function EditBuyerDialog({ buyerId, onClose }) {
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
	const [provinces, setProvinces] = useState([])
	const [loading, setLoading] = useState(true)
	const [saving, setSaving] = useState(false)
	const [errors, setErrors] = useState({})

	useEffect(() => {
		let cancelled = false
		;(async () => {
			setLoading(true)
			try {
				const [buyer, tenantList, provincesData] = await Promise.all([
					invoicesApi.getBuyer(buyerId),
					isTenantUser ? Promise.resolve([]) : tenantsApi.listTenants(),
					referenceDataApi.getProvinces(),
				])
				if (!cancelled) {
					setForm({
						tenant: buyer.tenant || buyer.tenant_id || '',
						business_name: buyer.business_name || '',
						ntn_cnic: buyer.ntn_cnic || '',
						province: buyer.province || '',
						address: buyer.address || '',
						registration_type: buyer.registration_type || '',
					})
					if (!isTenantUser) setTenants(Array.isArray(tenantList) ? tenantList : [])
					setProvinces(Array.isArray(provincesData) ? provincesData : [])
				}
			} catch (err) {
				if (!cancelled) {
					const msg = extractApiError(err)
					toast.error(msg)
				}
			} finally {
				if (!cancelled) setLoading(false)
			}
		})()
		return () => { cancelled = true }
	}, [buyerId, isTenantUser])

	function field(name) {
		return {
			value: form[name] ?? '',
			onChange: (e) => {
				setForm({ ...form, [name]: e.target.value })
				if (errors[name]) setErrors({ ...errors, [name]: '' })
			},
		}
	}

	async function handleSave(e) {
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
			}
			if (!isTenantUser) {
				payload.tenant = form.tenant || null
			}
			await invoicesApi.updateBuyer(buyerId, payload)
			toast.success('Buyer updated')
			onClose(true)
		} catch (err) {
			const msg = extractApiError(err)
			toast.error(msg)
			setSaving(false)
		}
	}

	async function handleDelete() {
		const ok = window.confirm('Delete this buyer?')
		if (!ok) return
		setSaving(true)
		try {
			await invoicesApi.deleteBuyer(buyerId)
			toast.success('Buyer deleted')
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
						<h3 className="text-lg font-semibold text-gray-900">Buyer Details</h3>
						<button
							type="button"
							onClick={() => onClose(false)}
							className="h-9 w-9 grid place-items-center rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
						>
							✕
						</button>
					</div>
					{loading ? (
						<div className="px-6 py-8 text-sm text-gray-600">Loading…</div>
					) : (
						<form onSubmit={handleSave} className="px-6 py-4 grid gap-3">
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
										placeholder="Select tenant"
										getOptionLabel={(t) => t.name}
										getOptionValue={(t) => t.id}
									/>
									{errors.tenant && <p className="text-red-500 text-sm mt-1">{errors.tenant}</p>}
								</div>
							)}
							<div>
								<label className="block text-sm font-medium text-gray-800">Business Name <span className="text-red-500">*</span></label>
								<input
									{...field('business_name')}
									className={`mt-1 w-full rounded-xl border bg-white py-2.5 px-3 ${errors.business_name ? 'border-red-500' : 'border-gray-300'}`}
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

							<div className="mt-2 flex items-center justify-between gap-2">
								<button
									type="button"
									onClick={handleDelete}
									disabled={saving}
									className="rounded-xl border border-red-300 text-red-700 px-3 py-2 text-sm hover:bg-red-50 disabled:opacity-70"
								>
									Delete
								</button>
								<div className="flex items-center gap-2">
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
										{saving ? 'Saving…' : 'Save'}
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


