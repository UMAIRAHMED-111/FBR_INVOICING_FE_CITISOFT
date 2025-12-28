import { useState } from 'react'
import { useSelector } from 'react-redux'
import toast from 'react-hot-toast'
import { tenantsApi } from '../../api/tenants'
import { extractApiError } from '../../api/apiClient'
import SearchableSelect from '../../components/SearchableSelect'

export default function InviteUserPage() {
	const tenantId = useSelector(s => s.tenant.id)
	const [email, setEmail] = useState('')
	const [role, setRole] = useState('member')
	const [ok, setOk] = useState(false)
	const [errors, setErrors] = useState({})

	async function handleSubmit(e) {
		e.preventDefault()
		// Validate email
		const newErrors = {}
		if (!email.trim()) newErrors.email = 'Email is required'
		else if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,}$/.test(email.trim())) newErrors.email = 'Enter a valid email address'
		setErrors(newErrors)
		if (Object.keys(newErrors).length > 0) return

		try {
			await tenantsApi.inviteUser(tenantId, { email: email.trim().toLowerCase(), role, expires_in_hours: 72 })
			setOk(true)
			toast.success('Invitation sent.')
		} catch (err) {
			const msg = extractApiError(err)
			toast.error(msg)
		}
	}

	return (
		<div className="max-w-2xl mx-auto p-6">
			<h1 className="text-2xl font-semibold text-black mb-4">Invite User</h1>
			<form onSubmit={handleSubmit} className="space-y-4">
				<div>
					<input 
						placeholder="user@example.com" 
						value={email} 
						onChange={(e) => { setEmail(e.target.value); setErrors(prev => ({ ...prev, email: '' })) }} 
						className={`w-full rounded-xl border ${errors.email ? 'border-red-500' : 'border-gray-300'} bg-white py-2.5 px-3`} 
					/>
					{errors.email && <p className="text-red-600 text-xs mt-1">{errors.email}</p>}
				</div>
				<SearchableSelect
					value={role}
					onChange={setRole}
					options={[
						{ label: 'Member', value: 'member' },
						{ label: 'Admin', value: 'admin' },
						{ label: 'Owner', value: 'owner' }
					]}
					placeholder="Select role"
				/>
				<button className="rounded-xl bg-black text-white py-2.5 px-4">Send Invite</button>
			</form>
			{ok && <p className="text-green-700 text-sm mt-3">Invitation sent.</p>}
			{!tenantId && <p className="text-sm text-gray-600 mt-2">No active company detected.</p>}
		</div>
	)
}


