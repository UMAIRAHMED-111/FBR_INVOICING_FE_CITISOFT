import { useCallback, useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { tenantsApi } from '../../api/tenants'
import { extractApiError } from '../../api/apiClient'
import MembersTable from './MembersTable'
import MembersSearchDrawer from './MembersSearchDrawer'
import EditMemberDialog from './EditMemberDialog'
import CreateMemberDialog from './CreateMemberDialog'
import { Plus, Search, RefreshCw } from 'lucide-react'

const defaultSort = { key: 'full_name', direction: 'asc' }
const emptyFilters = { query: '' }

function applyFilters(members, filters) {
	const q = (filters.query || '').trim().toLowerCase()
	return members.filter(m => {
		const matchesQuery = !q ||
			(m.full_name && m.full_name.toLowerCase().includes(q)) ||
			(m.email && m.email.toLowerCase().includes(q))
		return matchesQuery
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

export default function TenantMembersPage() {
	const { tenantId } = useParams()
	const [tenant, setTenant] = useState(null)

	// Members client-only placeholder; wire to API later
	const [members, setMembers] = useState([])
	const [loading, setLoading] = useState(false)
	const [filters, setFilters] = useState(emptyFilters)
	const [drawerOpen, setDrawerOpen] = useState(false)
	const [sort, setSort] = useState(defaultSort)
	const [editingId, setEditingId] = useState(null)
	const [createOpen, setCreateOpen] = useState(false)

	useEffect(() => {
		let cancelled = false
		;(async () => {
			try {
				const t = await tenantsApi.getTenant(tenantId)
				if (!cancelled) setTenant(t)
			} catch (err) {
				if (!cancelled) toast.error(extractApiError(err))
			}
		})()
		return () => { cancelled = true }
	}, [tenantId])

	const fetchList = useCallback(async () => {
		setLoading(true)
		try {
			const data = await tenantsApi.listMembers(tenantId)
			setMembers(Array.isArray(data) ? data : [])
		} catch (err) {
			toast.error(extractApiError(err))
		} finally {
			setLoading(false)
		}
	}, [])

	useEffect(() => { fetchList() }, [fetchList])

	const filtered = useMemo(() => applyFilters(members, filters), [members, filters])
	const sorted = useMemo(() => sortRows(filtered, sort), [filtered, sort])

	const [page, setPage] = useState(1)
	const [pageSize, setPageSize] = useState(10)
	const total = sorted.length
	const pagedRows = useMemo(() => {
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
	async function onApplyFilters(next) { setFilters(next); setDrawerOpen(false) }
	function onOpenEdit(id) { setEditingId(id) }
	function onCloseEdit(changed = false) { setEditingId(null); if (changed) fetchList() }
	function onOpenCreate() { setCreateOpen(true) }
	function onCloseCreate(changed = false) { setCreateOpen(false); if (changed) fetchList() }

	return (
		<div className="p-4 lg:p-6">
			<div className="mb-1 text-sm text-gray-600">Company ID: {tenantId}</div>
			<div className="mb-4 flex items-center justify-between">
				<h1 className="text-xl font-semibold text-black">
					Users {tenant?.name ? `- ${tenant.name}` : '…'}
				</h1>
				<div className="flex gap-2">
					<button onClick={onOpenCreate} className="rounded-xl border border-gray-300 bg-gray-50 px-3 py-2 text-sm hover:bg-gray-100 flex items-center gap-2">
						<Plus size={16} className="text-gray-800" /> New Member
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
				<MembersTable
					rows={pagedRows}
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

			<MembersSearchDrawer open={drawerOpen} initialFilters={filters} onClose={onCloseDrawer} onApply={onApplyFilters} />
			{editingId && <EditMemberDialog tenantId={tenantId} memberId={editingId} onClose={onCloseEdit} />}
			{createOpen && <CreateMemberDialog tenantId={tenantId} onClose={onCloseCreate} />}
		</div>
	)
}


