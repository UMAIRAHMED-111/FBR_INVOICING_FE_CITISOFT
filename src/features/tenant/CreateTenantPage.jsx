import { useState } from 'react'
import { useSelector } from 'react-redux'
import toast from 'react-hot-toast'
import { tenantsApi } from '../../api/tenants'
import { extractApiError } from '../../api/apiClient'

export default function CreateTenantPage() {
	const token = useSelector(s => s.auth.token)
	const [form, setForm] = useState({ name: '', contact_email: '' })
	const [tenant, setTenant] = useState(null)
	const [errors, setErrors] = useState({})

	async function handleSubmit(e) {
		e.preventDefault()
		// Validate fields
		const newErrors = {}
		if (!form.name.trim()) newErrors.name = 'Company name is required'
		if (!form.contact_email.trim()) newErrors.contact_email = 'Contact email is required'
		else if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,}$/.test(form.contact_email.trim())) newErrors.contact_email = 'Enter a valid email address'
		setErrors(newErrors)
		if (Object.keys(newErrors).length > 0) return

		try {
			const res = await tenantsApi.createTenant(form)
			setTenant(res)
		} catch (err) {
			toast.error(extractApiError(err))
		}
	}

	return (
		<div className="max-w-2xl mx-auto p-6">
			<h1 className="text-2xl font-semibold text-black mb-4">Create New Company</h1>
			<form onSubmit={handleSubmit} className="space-y-4">
				<div>
					<input 
						placeholder="Company name" 
						value={form.name} 
						onChange={(e) => { setForm({ ...form, name: e.target.value }); setErrors(prev => ({ ...prev, name: '' })) }} 
						className={`w-full rounded-xl border ${errors.name ? 'border-red-500' : 'border-gray-300'} bg-white py-2.5 px-3`} 
					/>
					{errors.name && <p className="text-red-600 text-xs mt-1">{errors.name}</p>}
				</div>
				<div>
					<input 
						placeholder="Contact email" 
						value={form.contact_email} 
						onChange={(e) => { setForm({ ...form, contact_email: e.target.value }); setErrors(prev => ({ ...prev, contact_email: '' })) }} 
						className={`w-full rounded-xl border ${errors.contact_email ? 'border-red-500' : 'border-gray-300'} bg-white py-2.5 px-3`} 
					/>
					{errors.contact_email && <p className="text-red-600 text-xs mt-1">{errors.contact_email}</p>}
				</div>
				<button className="rounded-xl bg-black text-white py-2.5 px-4">Create</button>
			</form>
			{tenant && <pre className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">{JSON.stringify(tenant, null, 2)}</pre>}
			{!token && <p className="text-sm text-gray-600 mt-2">You must be logged in.</p>}
		</div>
	)
}


