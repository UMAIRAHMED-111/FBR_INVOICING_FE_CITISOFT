import { useEffect, useMemo, useState, useCallback } from 'react'
import { tenantsApi } from '../../api/tenants'
import TenantsTable from './TenantsTable'
import TenantsSearchDrawer from './TenantsSearchDrawer'
import EditTenantDialog from './EditTenantDialog'
import CreateTenantDialog from './CreateTenantDialog'
import { extractApiError } from '../../api/apiClient'
import { Plus, Search, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'

const defaultSort = { key: 'name', direction: 'asc' }
const emptyFilters = { query: '', is_active: '' }

function applyFilters(tenants, filters) {
	const q = (filters.query || '').trim().toLowerCase()
	const active = (filters.is_active || '').trim().toLowerCase()
	return tenants.filter(t => {
		const matchesQuery = !q ||
			(t.name && t.name.toLowerCase().includes(q)) ||
			(t.contact_email && t.contact_email.toLowerCase().includes(q)) ||
			(t.city && t.city.toLowerCase().includes(q)) ||
			(t.province && t.province.toLowerCase().includes(q))
		const matchesActive = !active || String(t.is_active).toLowerCase() === active
		return matchesQuery && matchesActive
	})
}

function sortRows(rows, sort) {
	const { key, direction } = sort
	const dir = direction === 'desc' ? -1 : 1
	return [...rows].sort((a, b) => {
		const av = a?.[key] ?? ''
		const bv = b?.[key] ?? ''
		if (av < bv) return -1 * dir
		if (av > bv) return 1 * dir
		return 0
	})
}

export default function TenantsPage() {
	const [tenants, setTenants] = useState([])
	const [loading, setLoading] = useState(false)
	const [filters, setFilters] = useState(emptyFilters)
	const [drawerOpen, setDrawerOpen] = useState(false)
	const [sort, setSort] = useState(defaultSort)
	const [editingId, setEditingId] = useState(null)
	const [createOpen, setCreateOpen] = useState(false)

	const fetchList = useCallback(async () => {
		setLoading(true)
		try {
			const data = await tenantsApi.listTenants()
			setTenants(Array.isArray(data) ? data : [])
		} catch (err) {
			toast.error(extractApiError(err))
		} finally {
			setLoading(false)
		}
	}, [])

	useEffect(() => { fetchList() }, [fetchList])

	const filtered = useMemo(() => applyFilters(tenants, filters), [tenants, filters])
	const sorted = useMemo(() => sortRows(filtered, sort), [filtered, sort])
	// client-side pagination
	const [page, setPage] = useState(1)
	const [pageSize, setPageSize] = useState(10)
	const total = sorted.length
	const pagedRows = useMemo(() => {
		const start = (page - 1) * pageSize
		return sorted.slice(start, start + pageSize)
	}, [sorted, page, pageSize])
	// keep page in range when filters/list change
	useEffect(() => {
		const maxPage = Math.max(1, Math.ceil(total / pageSize) || 1)
		if (page > maxPage) setPage(1)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [total, pageSize])

	function onSortChange(nextKey) {
		setSort(prev => {
			if (prev.key === nextKey) return { key: nextKey, direction: prev.direction === 'asc' ? 'desc' : 'asc' }
			return { key: nextKey, direction: 'asc' }
		})
	}
	function onOpenDrawer() { setDrawerOpen(true) }
	function onCloseDrawer() { setDrawerOpen(false) }
	async function onApplyFilters(next) { setFilters(next); setDrawerOpen(false) }
	function onOpenEdit(id) { setEditingId(id) }
	function onCloseEdit(changed = false) { setEditingId(null); if (changed) fetchList() }
	function onOpenCreate() { setCreateOpen(true) }
	function onCloseCreate(changed = false) { setCreateOpen(false); if (changed) fetchList() }

	return (
		<div className="p-4 lg:p-6">
			<div className="mb-4 flex items-center justify-between">
				<h1 className="text-xl font-semibold text-black">Companies</h1>
				<div className="flex gap-2">
					<button
						onClick={onOpenCreate}
						className="rounded-xl border border-gray-300 bg-gray-50 px-3 py-2 text-sm hover:bg-gray-100 flex items-center gap-2"
					>
						<Plus size={16} className="text-gray-800" />
						New Company
					</button>
					<button
						onClick={onOpenDrawer}
						className="rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
					>
						<Search size={16} className="text-gray-800" />
						Search & Filter
					</button>
					<button
						onClick={fetchList}
						disabled={loading}
						className="rounded-xl bg-black text-white px-3 py-2 text-sm hover:bg-gray-900 disabled:opacity-70 flex items-center gap-2"
					>
						<RefreshCw size={16} className="text-white" />
						{loading ? 'Refreshing…' : 'Refresh'}
					</button>
				</div>
			</div>

			{loading ? (
				<div className="rounded-2xl border border-gray-200 bg-white p-6 text-sm text-gray-600">Loading…</div>
			) : (
				<TenantsTable
					rows={pagedRows}
					sort={sort}
					onSortChange={onSortChange}
					onEdit={onOpenEdit}
					// pagination props
					page={page}
					pageSize={pageSize}
					total={total}
					onChangePage={setPage}
					onChangePageSize={(n) => { setPageSize(n); setPage(1) }}
				/>
			)}

			<TenantsSearchDrawer open={drawerOpen} initialFilters={filters} onClose={onCloseDrawer} onApply={onApplyFilters} />
			{editingId && <EditTenantDialog tenantId={editingId} onClose={onCloseEdit} />}
			{createOpen && <CreateTenantDialog onClose={onCloseCreate} />}
		</div>
	)
}


