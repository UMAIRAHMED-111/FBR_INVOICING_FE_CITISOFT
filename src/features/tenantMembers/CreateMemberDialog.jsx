import { useState } from 'react'

import { tenantsApi } from '../../api/tenants'
import { extractApiError } from '../../api/apiClient'
import toast from 'react-hot-toast'

export default function CreateMemberDialog({ tenantId, onClose }) {
	const [form, setForm] = useState({ full_name: '', email: '' })
	const [saving, setSaving] = useState(false)
	const [errors, setErrors] = useState({})

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
		if (!(form.full_name || '').trim()) newErrors.full_name = 'Full name is required'
		if (!(form.email || '').trim()) newErrors.email = 'Email is required'
		else if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,}$/.test((form.email || '').trim())) newErrors.email = 'Enter a valid email address'
		setErrors(newErrors)
		if (Object.keys(newErrors).length > 0) return

		setSaving(true)
		try {
			const payload = {
				full_name: (form.full_name || '').trim(),
				email: (form.email || '').trim().toLowerCase(),
				// Role and active status are now fixed defaults; not editable from this form
				role: 'member',
				is_active: true,
			}
			await tenantsApi.createMember(tenantId, payload)
			toast.success('Member created')
			onClose(true)
		} catch (err) {
			const msg = extractApiError(err)
			toast.error(msg)
			setSaving(false)
		}
	}

	return (
		<div className="fixed inset-0 z-[1000]">
			<div className="absolute inset-0 bg-black/40" />
			<div className="absolute inset-0 flex items-center justify-center p-4">
				<div className="w-full max-w-xl rounded-2xl border border-gray-200 bg-white p-4">
					<div className="flex items-center justify-between">
						<h3 className="text-lg font-semibold text-black">Add Member</h3>
						<button onClick={() => onClose(false)} className="h-9 w-9 grid place-items-center rounded-md border border-gray-300 hover:bg-gray-50">✕</button>
					</div>
					<form onSubmit={handleSubmit} className="mt-4 grid gap-3">
						<div>
							<label className="block text-sm font-medium text-gray-800">Full name <span className="text-red-500">*</span></label>
							<input 
								value={form.full_name ?? ''}
								onChange={(e) => { setForm({ ...form, full_name: e.target.value }); setErrors(prev => ({ ...prev, full_name: '' })) }}
								className={`mt-1 w-full rounded-xl border ${errors.full_name ? 'border-red-500' : 'border-gray-300'} bg-white py-2.5 px-3`}
							/>
							{errors.full_name && <p className="text-red-600 text-xs mt-1">{errors.full_name}</p>}
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-800">Email <span className="text-red-500">*</span></label>
							<input 
								value={form.email ?? ''}
								onChange={(e) => { setForm({ ...form, email: e.target.value }); setErrors(prev => ({ ...prev, email: '' })) }}
								className={`mt-1 w-full rounded-xl border ${errors.email ? 'border-red-500' : 'border-gray-300'} bg-white py-2.5 px-3`}
							/>
							{errors.email && <p className="text-red-600 text-xs mt-1">{errors.email}</p>}
						</div>
						
						<div className="mt-2 flex items-center justify-end gap-2">
							<button type="button" onClick={() => onClose(false)} className="rounded-xl border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50">Cancel</button>
							<button type="submit" disabled={saving} className="rounded-xl bg-black text-white px-3 py-2 text-sm hover:bg-gray-900 disabled:opacity-70">
								{saving ? 'Creating…' : 'Create'}
							</button>
						</div>
					</form>
				</div>
			</div>
		</div>
	)
}


