import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import { invoicesApi } from '../../api/invoices'
import { tenantsApi } from '../../api/tenants'
import { extractApiError } from '../../api/apiClient'
import toast from 'react-hot-toast'
import BuyersTable from './BuyersTable'
import BuyersSearchDrawer from './BuyersSearchDrawer'
import CreateBuyerDialog from './CreateBuyerDialog'
import EditBuyerDialog from './EditBuyerDialog'
import { Plus, Search, RefreshCw } from 'lucide-react'

const defaultSort = { key: 'business_name', direction: 'asc' }
const emptyFilters = { query: '', registration_type: '' }

function applyFilters(buyers, filters) {
	const q = (filters.query || '').trim().toLowerCase()
	const regType = (filters.registration_type || '').trim().toLowerCase()

	return buyers.filter(b => {
		const matchesQuery =
			!q ||
			(b.business_name && b.business_name.toLowerCase().includes(q)) ||
			(b.ntn_cnic && b.ntn_cnic.toLowerCase().includes(q)) ||
			(b.province && b.province.toLowerCase().includes(q)) ||
			(b.address && b.address.toLowerCase().includes(q))

		const matchesRegType = !regType || (b.registration_type && b.registration_type.toLowerCase() === regType)

		return matchesQuery && matchesRegType
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

export default function BuyersPage() {
	const me = useSelector(s => s.user.me)
	const tenantId = useSelector(s => s.tenant.id)
	const isTenantUser = me?.user_type === 'tenant_user'

	const [buyers, setBuyers] = useState([])
	const [loading, setLoading] = useState(false)
	const [filters, setFilters] = useState(emptyFilters)
	const [drawerOpen, setDrawerOpen] = useState(false)
	const [sort, setSort] = useState(defaultSort)
	const [editingId, setEditingId] = useState(null)
	const [createOpen, setCreateOpen] = useState(false)

	const fetchList = useCallback(async () => {
		setLoading(true)
		try {
			const params = {}
			// For tenant users, always restrict by their tenant
			if (isTenantUser && tenantId) {
				params.tenant_id = tenantId
			}
			const data = await invoicesApi.listBuyers(params)
			setBuyers(Array.isArray(data) ? data : [])
		} catch (err) {
			toast.error(extractApiError(err))
		} finally {
			setLoading(false)
		}
	}, [isTenantUser, tenantId])

	useEffect(() => { fetchList() }, [fetchList])

	const filtered = useMemo(() => applyFilters(buyers, filters), [buyers, filters])
	const sorted = useMemo(() => sortRows(filtered, sort), [filtered, sort])

	// client-side pagination
	const [page, setPage] = useState(1)
	const [pageSize, setPageSize] = useState(10)
	const total = sorted.length
	const pagedRows = useMemo(() => {
		const start = (page - 1) * pageSize
		return sorted.slice(start, start + pageSize)
	}, [sorted, page, pageSize])
	// keep page in range when list changes
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
	function onOpenCreate() { setCreateOpen(true) }
	function onCloseCreate(changed = false) { setCreateOpen(false); if (changed) fetchList() }
	function onOpenEdit(id) { setEditingId(id) }
	function onCloseEdit(changed = false) { setEditingId(null); if (changed) fetchList() }

	return (
		<div className="p-4 lg:p-6">
			<div className="mb-4 flex items-center justify-between">
				<h1 className="text-xl font-semibold text-black">Buyers</h1>
				<div className="flex gap-2">
					<button
						onClick={onOpenCreate}
						className="rounded-xl border border-gray-300 bg-gray-50 px-3 py-2 text-sm hover:bg-gray-100 flex items-center gap-2"
					>
						<Plus size={16} className="text-gray-800" />
						New Buyer
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
				<BuyersTable
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

			<BuyersSearchDrawer open={drawerOpen} initialFilters={filters} onClose={onCloseDrawer} onApply={onApplyFilters} />
			{editingId && <EditBuyerDialog buyerId={editingId} onClose={onCloseEdit} />}
			{createOpen && <CreateBuyerDialog onClose={onCloseCreate} />}
		</div>
	)
}


