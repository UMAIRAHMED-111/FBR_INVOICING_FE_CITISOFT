import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { accountsApi } from '../../api/accounts'
import { extractApiError } from '../../api/apiClient'
import { mergeUser } from '../../store/slices/userSlice'
import { fetchMeThunk } from '../../store/slices/userThunks'
import toast from 'react-hot-toast'

export default function ProfilePage() {
	const dispatch = useDispatch()
	const me = useSelector(s => s.user.me)

	const [email, setEmail] = useState('')
	const [fullName, setFullName] = useState('')
	const [saving, setSaving] = useState(false)
	const [ok, setOk] = useState(false)
	const [errors, setErrors] = useState({})

	useEffect(() => {
		if (!me) dispatch(fetchMeThunk())
	}, [dispatch, me])

	useEffect(() => {
		if (me) {
			setEmail(me.email || '')
			setFullName(me.full_name || '')
		}
	}, [me])

	async function handleSave(e) {
		e.preventDefault()
		// Validate fields
		const newErrors = {}
		if (!email.trim()) newErrors.email = 'Email is required'
		else if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,}$/.test(email.trim())) newErrors.email = 'Enter a valid email address'
		if (!fullName.trim()) newErrors.fullName = 'Full name is required'
		setErrors(newErrors)
		if (Object.keys(newErrors).length > 0) return

		setSaving(true); setOk(false)
		try {
			const updated = await accountsApi.updateMe({
				email: email.trim().toLowerCase(),
				full_name: fullName.trim(),
			})
			if (updated && updated.detail) {
				toast.error(updated.detail)
				setSaving(false)
				return
			}
			dispatch(mergeUser(updated))
			setOk(true)
			toast.success('Profile updated')
		} catch (err) {
			const msg = extractApiError(err)
			toast.error(msg)
		} finally {
			setSaving(false)
		}
	}

	if (!me) {
		return (
			<div className="max-w-2xl mx-auto p-6">
				<div className="rounded-xl border border-gray-200 bg-white p-6">Loading…</div>
			</div>
		)
	}

	return (
		<div className="max-w-2xl mx-auto p-6">
			<div className="rounded-xl border border-gray-200 bg-white p-6">
				<h1 className="text-xl font-semibold text-black mb-4">My Profile</h1>
				<form onSubmit={handleSave} className="space-y-4">
					<div>
						<label className="block text-sm font-medium text-gray-800">Email</label>
						<input
							value={email}
							onChange={(e) => { setEmail(e.target.value); setErrors(prev => ({ ...prev, email: '' })) }}
							className={`mt-1 w-full rounded-xl border ${errors.email ? 'border-red-500' : 'border-gray-300'} bg-white py-2.5 px-3`}
						/>
						{errors.email && <p className="text-red-600 text-xs mt-1">{errors.email}</p>}
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-800">Full name</label>
						<input
							value={fullName}
							onChange={(e) => { setFullName(e.target.value); setErrors(prev => ({ ...prev, fullName: '' })) }}
							className={`mt-1 w-full rounded-xl border ${errors.fullName ? 'border-red-500' : 'border-gray-300'} bg-white py-2.5 px-3`}
						/>
						{errors.fullName && <p className="text-red-600 text-xs mt-1">{errors.fullName}</p>}
					</div>
					<button
						disabled={saving}
						className="rounded-xl bg-black text-white py-2.5 px-4 disabled:opacity-70 disabled:cursor-not-allowed"
					>
						{saving ? 'Saving…' : 'Save changes'}
					</button>
				</form>
				{ok && <p className="text-green-700 text-sm mt-3">Profile updated.</p>}
			</div>

			<div className="mt-6 rounded-xl border border-gray-200 bg-white p-6 text-sm text-gray-700">
				<div>Account ID: {me.id}</div>
				<div>Active: {me.is_active ? 'Yes' : 'No'}</div>
				<div>Email verified: {me.email_verified_at ? new Date(me.email_verified_at).toLocaleString() : 'No'}</div>
				<div>Last login: {me.last_login_at ? new Date(me.last_login_at).toLocaleString() : '—'}</div>
			</div>
		</div>
	)
}


