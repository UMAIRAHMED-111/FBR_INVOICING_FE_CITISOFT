import { useCallback, useEffect, useMemo, useState } from 'react'
import { Plus, Search, RefreshCw, Eye, ChevronLeft, ChevronRight } from 'lucide-react'
import toast from 'react-hot-toast'
import { accountsApi } from '../api/accounts'
import { extractApiError } from '../api/apiClient'
import SearchableSelect from '../components/SearchableSelect'

export default function Users() {
	// Admins list state
	const [admins, setAdmins] = useState([])
	const [loading, setLoading] = useState(false)
	const [drawerOpen, setDrawerOpen] = useState(false)
	const [createOpen, setCreateOpen] = useState(false)
	const [editingId, setEditingId] = useState(null)

	// Sorting, filtering, pagination
	const [sort, setSort] = useState({ key: 'full_name', direction: 'asc' })
	const [filters, setFilters] = useState({ query: '', is_active: '' })
	const [page, setPage] = useState(1)
	const [pageSize, setPageSize] = useState(10)

	const fetchList = useCallback(async () => {
		setLoading(true)
		try {
			const data = await accountsApi.listAdmins()
			setAdmins(Array.isArray(data) ? data : [])
		} catch (err) {
			toast.error(extractApiError(err))
		} finally {
			setLoading(false)
		}
	}, [])

	useEffect(() => { fetchList() }, [fetchList])

	function applyFilters(list, f) {
		const q = (f.query || '').trim().toLowerCase()
		const active = (f.is_active || '').trim().toLowerCase()
		return list.filter(a => {
			const matchesQuery = !q ||
				(a.full_name && a.full_name.toLowerCase().includes(q)) ||
				(a.email && a.email.toLowerCase().includes(q))
			const matchesActive = !active || String(a.is_active).toLowerCase() === active
			return matchesQuery && matchesActive
		})
	}
	function sortRows(rows, s) {
		const dir = s.direction === 'desc' ? -1 : 1
		return [...rows].sort((a, b) => {
			const av = a?.[s.key] ?? ''
			const bv = b?.[s.key] ?? ''
			if (av < bv) return -1 * dir
			if (av > bv) return 1 * dir
			return 0
		})
	}
	const filtered = useMemo(() => applyFilters(admins, filters), [admins, filters])
	const sorted = useMemo(() => sortRows(filtered, sort), [filtered, sort])
	const total = sorted.length
	const paged = useMemo(() => {
		const start = (page - 1) * pageSize
		return sorted.slice(start, start + pageSize)
	}, [sorted, page, pageSize])
	useEffect(() => {
		const maxPage = Math.max(1, Math.ceil(total / pageSize) || 1)
		if (page > maxPage) setPage(1)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [total, pageSize])

	function onSortChange(nextKey) {
		setSort(prev => prev.key === nextKey ? { key: nextKey, direction: prev.direction === 'asc' ? 'desc' : 'asc' } : { key: nextKey, direction: 'asc' })
	}

	function onOpenDrawer() { setDrawerOpen(true) }
	function onCloseDrawer() { setDrawerOpen(false) }
	function onApplyFilters(next) { setFilters(next); setDrawerOpen(false) }
	function onOpenCreate() { setCreateOpen(true) }
	function onCloseCreate(changed = false) { setCreateOpen(false); if (changed) fetchList() }
	function onOpenEdit(id) { setEditingId(id) }
	function onCloseEdit(changed = false) { setEditingId(null); if (changed) fetchList() }

	return (
		<div className="p-4 lg:p-6">
			<div className="mb-4 flex items-center justify-between">
				<h1 className="text-xl font-semibold text-black">Platform Admins</h1>
				<div className="flex gap-2">
					<button onClick={onOpenCreate} className="rounded-xl border border-gray-300 bg-gray-50 px-3 py-2 text-sm hover:bg-gray-100 flex items-center gap-2">
						<Plus size={16} className="text-gray-800" /> New Admin
					</button>
					<button onClick={onOpenDrawer} className="rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2">
						<Search size={16} className="text-gray-800" /> Search & Filter
					</button>
					<button onClick={fetchList} disabled={loading} className="rounded-xl bg-black text-white px-3 py-2 text-sm hover:bg-gray-900 disabled:opacity-70 flex items-center gap-2">
						<RefreshCw size={16} className="text-white" /> {loading ? 'Refreshing…' : 'Refresh'}
					</button>
				</div>
			</div>

			{loading ? (
				<div className="rounded-2xl border border-gray-200 bg-white p-6 text-sm text-gray-600">Loading…</div>
			) : (
				<AdminsTable
					rows={paged}
					sort={sort}
					onSortChange={onSortChange}
					onEdit={onOpenEdit}
					page={page}
					pageSize={pageSize}
					total={total}
					onChangePage={setPage}
					onChangePageSize={(n) => { setPageSize(n); setPage(1) }}
				/>
			)}

			{drawerOpen && <AdminsSearchDrawer initialFilters={filters} onClose={onCloseDrawer} onApply={onApplyFilters} />}
			{createOpen && <CreateAdminDialog onClose={onCloseCreate} />}
			{editingId && <EditAdminDialog adminId={editingId} onClose={onCloseEdit} />}
		</div>
	)
}

function AdminsTable({
	rows,
	sort,
	onSortChange,
	onEdit,
	page,
	pageSize,
	total,
	onChangePage,
	onChangePageSize,
}) {
	const cols = [
		{ key: 'full_name', label: 'Name' },
		{ key: 'email', label: 'Email' },
		{ key: 'is_active', label: 'Active' },
		{ key: 'updated_at', label: 'Updated' },
		{ key: 'actions', label: 'Actions' },
	]
	function header(label, key) {
		if (key === 'actions') return <th key={key} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</th>
		const isActive = sort.key === key
		const arrow = isActive ? (sort.direction === 'asc' ? '▲' : '▼') : ''
		return (
			<th key={key} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none" onClick={() => onSortChange(key)}>
				{label} <span className="text-gray-400">{arrow}</span>
			</th>
		)
	}
	return (
		<div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
			<div className="overflow-x-auto">
				<table className="min-w-full divide-y divide-gray-200">
					<thead className="bg-gray-50">
						<tr>{cols.map(c => header(c.label, c.key))}</tr>
					</thead>
					<tbody className="divide-y divide-gray-100 text-sm">
						{rows.map(row => (
							<tr key={row.id} className="hover:bg-gray-50">
								<td className="px-4 py-3 text-black">{row.full_name}</td>
								<td className="px-4 py-3">{row.email}</td>
								<td className="px-4 py-3">{row.is_active ? 'Yes' : 'No'}</td>
								<td className="px-4 py-3">{row.updated_at ? new Date(row.updated_at).toLocaleString() : '—'}</td>
								<td className="px-4 py-3">
									<button type="button" title="View/Edit" onClick={() => onEdit(row.id)} className="h-8 w-8 grid place-items-center rounded-md border border-gray-300 hover:bg-gray-50">
										<Eye size={16} className="text-gray-700" />
									</button>
								</td>
							</tr>
						))}
						{rows.length === 0 && (
							<tr><td colSpan={cols.length} className="px-4 py-6 text-center text-gray-600">No admins found.</td></tr>
						)}
					</tbody>
				</table>
			</div>
			<div className="flex items-center justify-between p-3 border-t border-gray-200 text-sm">
				<div className="text-gray-600">
					{total === 0 ? '0' : `${(page - 1) * pageSize + 1}`}–{Math.min(page * pageSize, total)} of {total}
				</div>
				<div className="flex items-center gap-3">
					<label className="flex items-center gap-2">
						<span className="text-gray-600">Rows per page</span>
						<select className="rounded-md border border-gray-300 bg-white py-1 px-2" value={pageSize} onChange={(e) => onChangePageSize(Number(e.target.value))}>
							<option value={10}>10</option>
							<option value={25}>25</option>
							<option value={50}>50</option>
						</select>
					</label>
					<div className="flex items-center gap-1">
						<button className="h-8 w-8 grid place-items-center rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50" onClick={() => onChangePage(Math.max(1, page - 1))} disabled={page <= 1} aria-label="Previous page">
							<ChevronLeft size={16} />
						</button>
						<button className="h-8 w-8 grid place-items-center rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50" onClick={() => { const maxPage = Math.max(1, Math.ceil(total / pageSize) || 1); onChangePage(Math.min(maxPage, page + 1)) }} disabled={page >= Math.max(1, Math.ceil(total / pageSize) || 1)} aria-label="Next page">
							<ChevronRight size={16} />
						</button>
					</div>
				</div>
			</div>
		</div>
	)
}

function AdminsSearchDrawer({ initialFilters, onClose, onApply }) {
	const [query, setQuery] = useState('')
	const [isActive, setIsActive] = useState('')
	useEffect(() => {
		setQuery(initialFilters.query || '')
		setIsActive(initialFilters.is_active || '')
	}, [initialFilters])
	return (
		<div className="fixed inset-0 z-[1000]">
			<div className="absolute inset-0 bg-black/30" onClick={onClose} />
			<aside className="absolute right-0 top-0 h-full w-96 max-w-[90%] bg-white border-l border-gray-200 shadow-xl p-4">
				<div className="flex items-center justify-between">
					<h3 className="text-lg font-semibold text-black">Search & Filter Admins</h3>
					<button onClick={onClose} className="h-9 w-9 grid place-items-center rounded-md border border-gray-300 hover:bg-gray-50">✕</button>
				</div>
				<div className="mt-4 grid gap-3 text-sm">
					<div>
						<label className="block text-sm font-medium text-gray-800">Search</label>
						<input className="mt-1 w-full rounded-xl border border-gray-300 bg-white py-2.5 px-3" placeholder="Name or email..." value={query} onChange={(e) => setQuery(e.target.value)} />
					</div>
					<div>
						<SearchableSelect
							label="Active"
							value={isActive}
							onChange={setIsActive}
							options={[
								{ label: 'Any', value: '' },
								{ label: 'Active', value: 'true' },
								{ label: 'Inactive', value: 'false' }
							]}
							placeholder="Any"
						/>
					</div>
					<div className="flex gap-2 pt-2">
						<button onClick={() => onApply({ query, is_active: isActive })} className="rounded-xl bg-black text-white px-3 py-2 text-sm">Apply</button>
						<button onClick={() => onApply({ query: '', is_active: '' })} className="rounded-xl border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50">Reset</button>
					</div>
				</div>
			</aside>
		</div>
	)
}

function CreateAdminDialog({ onClose }) {
	const [form, setForm] = useState({ full_name: '', email: '', password: '' })
	const [saving, setSaving] = useState(false)
	const [showPassword, setShowPassword] = useState(false)
	const [errors, setErrors] = useState({})
	function field(name) {
		return { value: form[name] ?? '', onChange: (e) => setForm({ ...form, [name]: e.target.value }) }
	}
	async function handleSubmit(e) {
		e.preventDefault()
		// Validate fields
		const newErrors = {}
		if (!(form.full_name || '').trim()) newErrors.full_name = 'Full name is required'
		if (!(form.email || '').trim()) newErrors.email = 'Email is required'
		else if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,}$/.test((form.email || '').trim())) newErrors.email = 'Enter a valid email address'
		if (!(form.password || '')) newErrors.password = 'Password is required'
		setErrors(newErrors)
		if (Object.keys(newErrors).length > 0) return

		setSaving(true)
		try {
			const payload = {
				full_name: (form.full_name || '').trim(),
				email: (form.email || '').trim().toLowerCase(),
				password: form.password || undefined,
				// Scope is fixed to 'platform' for all admins; no longer editable in the UI
				scope: 'platform',
			}
			await accountsApi.createAdmin(payload)
			toast.success('Admin created.')
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
						<h3 className="text-lg font-semibold text-black">Create Admin</h3>
						<button onClick={() => onClose(false)} className="h-9 w-9 grid place-items-center rounded-md border border-gray-300 hover:bg-gray-50">✕</button>
					</div>
					<form onSubmit={handleSubmit} className="mt-4 grid gap-3">
						<div>
							<label className="block text-sm font-medium text-gray-800">Full name <span className="text-red-500">*</span></label>
							<input 
								value={form.full_name?? ''}
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
						<div>
							<label className="block text-sm font-medium text-gray-800">Password <span className="text-red-500">*</span></label>
							<div className="relative">
								<input 
									type={showPassword ? "text" : "password"} 
									value={form.password ?? ''}
									onChange={(e) => { setForm({ ...form, password: e.target.value }); setErrors(prev => ({ ...prev, password: '' })) }}
									className={`mt-1 w-full rounded-xl border ${errors.password ? 'border-red-500' : 'border-gray-300'} bg-white py-2.5 px-3 pr-10`}
								/>
								<button
									type="button"
									onClick={() => setShowPassword(!showPassword)}
									className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-500 hover:text-gray-700 transition-colors"
									title={showPassword ? "Hide password" : "Show password"}
								>
									{showPassword ? (
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
							{errors.password && <p className="text-red-600 text-xs mt-1">{errors.password}</p>}
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

function EditAdminDialog({ adminId, onClose }) {
	const [form, setForm] = useState({ full_name: '', email: '', is_active: true })
	const [saving, setSaving] = useState(false)
	const [loading, setLoading] = useState(true)
	const [errors, setErrors] = useState({})
	function field(name) {
		return { value: form[name] ?? '', onChange: (e) => setForm({ ...form, [name]: e.target.value }) }
	}
	useEffect(() => {
		let cancelled = false
		;(async () => {
			setLoading(true)
			try {
				const data = await accountsApi.getAdmin(adminId)
				if (!cancelled) setForm({
					full_name: data.full_name || '',
					email: data.email || '',
					is_active: !!data.is_active,
				})
			} catch (err) {
				if (!cancelled) toast.error(extractApiError(err))
			} finally {
				if (!cancelled) setLoading(false)
			}
		})()
		return () => { cancelled = true }
	}, [adminId])
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
				is_active: !!form.is_active,
				// Scope is fixed server-side; not editable from this dialog
			}
			await accountsApi.updateAdmin(adminId, payload)
			toast.success('Admin updated.')
			onClose(true)
		} catch (err) {
			const msg = extractApiError(err)
			toast.error(msg)
			setSaving(false)
		}
	}
	async function handleDelete() {
		const ok = window.confirm('Demote this admin?')
		if (!ok) return
		setSaving(true)
		try {
			await accountsApi.deleteAdmin(adminId)
			toast.success('Admin demoted.')
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
						<h3 className="text-lg font-semibold text-black">Edit Admin</h3>
						<button onClick={() => onClose(false)} className="h-9 w-9 grid place-items-center rounded-md border border-gray-300 hover:bg-gray-50">✕</button>
					</div>
					{loading ? (
						<div className="p-6 text-sm text-gray-600">Loading…</div>
					) : (
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
						<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
						<div />
						<label className="flex items-center gap-2 text-sm text-gray-800 mt-6">
								<input type="checkbox" checked={!!form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black" />
								Active
							</label>
						</div>
						<div className="mt-2 flex items-center justify-end gap-2">
							<button type="submit" disabled={saving} className="rounded-xl bg-black text-white px-3 py-2 text-sm hover:bg-gray-900 disabled:opacity-70">
								{saving ? 'Saving…' : 'Save'}
							</button>
						</div>
					</form>
					)}
				</div>
			</div>
		</div>
	)
}


