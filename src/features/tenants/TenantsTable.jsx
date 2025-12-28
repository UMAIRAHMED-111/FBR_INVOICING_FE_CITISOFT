import { Eye, ChevronLeft, ChevronRight, User as UserIcon } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

// Format datetime in 24-hour format: "12/5/2025, 16:00"
function format24Hour(dateString) {
	if (!dateString) return '—'
	try {
		const date = new Date(dateString)
		if (isNaN(date.getTime())) return '—'
		
		const day = date.getDate()
		const month = date.getMonth() + 1
		const year = date.getFullYear()
		const hours = String(date.getHours()).padStart(2, '0')
		const minutes = String(date.getMinutes()).padStart(2, '0')
		
		return `${month}/${day}/${year}, ${hours}:${minutes}`
	} catch {
		return '—'
	}
}

export default function TenantsTable({
	rows,
	sort,
	onSortChange,
	onEdit,
	// optional pagination props
	page = 1,
	pageSize = 10,
	total = rows.length,
	onChangePage,
	onChangePageSize,
}) {
	const navigate = useNavigate()
	const cols = [
		{ key: 'name', label: 'Name' },
		{ key: 'contact_email', label: 'Contact Email' },
		{ key: 'is_active', label: 'Active' },
		{ key: 'last_payment_at', label: 'Last Payment' },
		{ key: 'updated_at', label: 'Updated' },
		{ key: 'actions', label: 'Actions' },
	]

	function header(label, key) {
		if (key === 'actions') return <th key={key} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</th>
		const isActive = sort.key === key
		const arrow = isActive ? (sort.direction === 'asc' ? '▲' : '▼') : ''
		return (
			<th
				key={key}
				className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none"
				onClick={() => onSortChange(key)}
			>
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
								<td className="px-4 py-3 text-black">{row.name}</td>
								<td className="px-4 py-3">{row.contact_email}</td>
								<td className="px-4 py-3">{row.is_active ? 'Yes' : 'No'}</td>
								<td className="px-4 py-3">{format24Hour(row.last_payment_at)}</td>
								<td className="px-4 py-3">{format24Hour(row.updated_at)}</td>
								<td className="px-4 py-3">
								<div className="flex items-center gap-2">
									<button
										type="button"
										title="View/Edit"
										onClick={() => onEdit(row.id)}
										className="h-8 w-8 grid place-items-center rounded-md border border-gray-300 hover:bg-gray-50"
									>
										<Eye size={16} className="text-gray-700" />
									</button>
									<button
										type="button"
										title="Members"
										onClick={() => navigate(`/company/${row.id}/members`)}
										className="h-8 w-8 grid place-items-center rounded-md border border-gray-300 hover:bg-gray-50"
									>
										<UserIcon size={16} className="text-gray-700" />
									</button>
								</div>
								</td>
							</tr>
						))}
						{rows.length === 0 && (
							<tr>
								<td colSpan={cols.length} className="px-4 py-6 text-center text-gray-600">No tenants found.</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>
			{/* Pagination footer (client-side) */}
			<div className="flex items-center justify-between p-3 border-t border-gray-200 text-sm">
				<div className="text-gray-600">
					{total === 0 ? '0' : `${(page - 1) * pageSize + 1}`}–{Math.min(page * pageSize, total)} of {total}
				</div>
				<div className="flex items-center gap-3">
					<label className="flex items-center gap-2">
						<span className="text-gray-600">Rows per page</span>
						<select
							className="rounded-md border border-gray-300 bg-white py-1 px-2"
							value={pageSize}
							onChange={(e) => onChangePageSize && onChangePageSize(Number(e.target.value))}
						>
							<option value={10}>10</option>
							<option value={25}>25</option>
							<option value={50}>50</option>
						</select>
					</label>
					<div className="flex items-center gap-1">
						<button
							className="h-8 w-8 grid place-items-center rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
							onClick={() => onChangePage && onChangePage(Math.max(1, page - 1))}
							disabled={page <= 1}
							aria-label="Previous page"
						>
							<ChevronLeft size={16} />
						</button>
						<button
							className="h-8 w-8 grid place-items-center rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
							onClick={() => {
								const maxPage = Math.max(1, Math.ceil(total / pageSize) || 1)
								onChangePage && onChangePage(Math.min(maxPage, page + 1))
							}}
							disabled={page >= Math.max(1, Math.ceil(total / pageSize) || 1)}
							aria-label="Next page"
						>
							<ChevronRight size={16} />
						</button>
					</div>
				</div>
			</div>
		</div>
	)
}


