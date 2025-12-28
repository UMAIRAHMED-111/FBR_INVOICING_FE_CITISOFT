import { Eye, ChevronLeft, ChevronRight } from 'lucide-react'

export default function MembersTable({
	rows,
	sort,
	onSortChange,
	onEdit,
	page = 1,
	pageSize = 10,
	total = rows.length,
	onChangePage,
	onChangePageSize,
}) {
	const cols = [
		{ key: 'full_name', label: 'Name' },
		{ key: 'email', label: 'Email' },
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
						{rows.map(row => {
							const memberId = row.id ?? row.user_id ?? row.userId
							return (
							<tr key={memberId} className="hover:bg-gray-50">
								<td className="px-4 py-3 text-black">{row.full_name || row.name}</td>
								<td className="px-4 py-3">{row.email}</td>
								<td className="px-4 py-3">{row.updated_at ? new Date(row.updated_at).toLocaleString() : '—'}</td>
								<td className="px-4 py-3">
									<button type="button" title="View/Edit" onClick={() => onEdit(memberId)} className="h-8 w-8 grid place-items-center rounded-md border border-gray-300 hover:bg-gray-50">
										<Eye size={16} className="text-gray-700" />
									</button>
								</td>
							</tr>
						)})}
						{rows.length === 0 && (
							<tr><td colSpan={cols.length} className="px-4 py-6 text-center text-gray-600">No members found.</td></tr>
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
						<select className="rounded-md border border-gray-300 bg-white py-1 px-2" value={pageSize} onChange={(e) => onChangePageSize && onChangePageSize(Number(e.target.value))}>
							<option value={10}>10</option>
							<option value={25}>25</option>
							<option value={50}>50</option>
						</select>
					</label>
					<div className="flex items-center gap-1">
						<button className="h-8 w-8 grid place-items-center rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50" onClick={() => onChangePage && onChangePage(Math.max(1, page - 1))} disabled={page <= 1} aria-label="Previous page">
							<ChevronLeft size={16} />
						</button>
						<button className="h-8 w-8 grid place-items-center rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50" onClick={() => { const maxPage = Math.max(1, Math.ceil(total / pageSize) || 1); onChangePage && onChangePage(Math.min(maxPage, page + 1)) }} disabled={page >= Math.max(1, Math.ceil(total / pageSize) || 1)} aria-label="Next page">
							<ChevronRight size={16} />
						</button>
					</div>
				</div>
			</div>
		</div>
	)
}


