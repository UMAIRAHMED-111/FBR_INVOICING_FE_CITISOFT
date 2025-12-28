import { useEffect, useMemo, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { invoicesApi } from '../../api/invoices'
import InvoiceViewDialog from './InvoiceViewDialog'
import InvoicesSearchDrawer from './InvoicesSearchDrawer'
import { Plus, Eye, Pencil, Trash2, ChevronLeft, ChevronRight, Search, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'

const emptyFilters = {
	fbr_invoice_no: '',
	usin_no: '',
	customer_name: '',
	invoice_status: '',
	invoice_date_start: '',
	invoice_date_end: '',
	created_at_start: '',
	created_at_end: ''
}

function applyFilters(invoices, filters) {
	const fbrInvoice = (filters.fbr_invoice_no || '').trim()
	const usinNo = (filters.usin_no || '').trim()
	const customer = (filters.customer_name || '').trim()
	const status = (filters.invoice_status || '').trim()
	const invoiceDateStart = filters.invoice_date_start
	const invoiceDateEnd = filters.invoice_date_end
	const createdAtStart = filters.created_at_start
	const createdAtEnd = filters.created_at_end

	return invoices.filter(inv => {
		const matchesFbrInvoice = !fbrInvoice || inv.fbr_invoice_no === fbrInvoice
		const matchesUsinNo = !usinNo || inv.usin_no === usinNo
		const matchesCustomer = !customer || inv.customer_name === customer
		const matchesStatus = !status || inv.invoice_status === status

		// Invoice Date Range Filter
		const matchesInvoiceDateStart = !invoiceDateStart || (inv.invoice_date && inv.invoice_date >= invoiceDateStart)
		const matchesInvoiceDateEnd = !invoiceDateEnd || (inv.invoice_date && inv.invoice_date <= invoiceDateEnd)

		// Created At Range Filter
		const invCreatedDate = inv.created_at ? inv.created_at.split('T')[0] : null
		const matchesCreatedAtStart = !createdAtStart || (invCreatedDate && invCreatedDate >= createdAtStart)
		const matchesCreatedAtEnd = !createdAtEnd || (invCreatedDate && invCreatedDate <= createdAtEnd)

		return matchesFbrInvoice && matchesUsinNo && matchesCustomer && matchesStatus && 
		       matchesInvoiceDateStart && matchesInvoiceDateEnd && matchesCreatedAtStart && matchesCreatedAtEnd
	})
}

export default function InvoicesPage() {
	const navigate = useNavigate()
	const [invoices, setInvoices] = useState([])
	const [loading, setLoading] = useState(false)
	const [viewInvoice, setViewInvoice] = useState(null)
	const [filters, setFilters] = useState(emptyFilters)
	const [drawerOpen, setDrawerOpen] = useState(false)
	const [page, setPage] = useState(1)
	const [pageSize, setPageSize] = useState(10)

	const fetchList = useCallback(async () => {
		setLoading(true)
		try {
			const data = await invoicesApi.list()
			setInvoices(data || [])
		} catch (err) {
			toast.error('Failed to load invoices')
			console.error(err)
		} finally {
			setLoading(false)
		}
	}, [])

	const handleDelete = async (invoice) => {
		const confirmed = window.confirm('Are you sure you want to permanently delete this invoice? This action cannot be undone.')
		if (!confirmed) return

		try {
			await invoicesApi.delete(invoice.id)
			toast.success('Invoice deleted')
			setInvoices(prev => prev.filter(inv => inv.id !== invoice.id))
			if (viewInvoice && viewInvoice.id === invoice.id) {
				setViewInvoice(null)
			}
		} catch (err) {
			console.error('Failed to delete invoice', err)
			if (err.response?.status === 403) {
				toast.error('You are not authorized to delete this invoice')
			} else {
				toast.error(err.response?.data?.detail || 'Failed to delete invoice')
			}
		}
	}

	useEffect(() => { fetchList() }, [fetchList])

	const filtered = useMemo(() => applyFilters(invoices, filters), [invoices, filters])
	const total = filtered.length
	const paged = useMemo(() => {
		const start = (page - 1) * pageSize
		return filtered.slice(start, start + pageSize)
	}, [filtered, page, pageSize])

	// Keep page in range when filters/list change
	useEffect(() => {
		const maxPage = Math.max(1, Math.ceil(total / pageSize) || 1)
		if (page > maxPage) setPage(1)
	}, [total, pageSize, page])

	function onCloseDrawer() {
		setDrawerOpen(false)
	}

	function onApplyFilters(newFilters) {
		setFilters(newFilters)
		setDrawerOpen(false)
		setPage(1)
	}

	return (
		<div className="p-4 lg:p-6">
			<div className="mb-4 flex items-center justify-between">
				<h1 className="text-xl font-semibold text-black">Invoices</h1>
				<div className="flex gap-2">
					<button 
						onClick={() => navigate('/invoices/new')} 
						className="rounded-xl border border-gray-300 bg-gray-50 px-3 py-2 text-sm hover:bg-gray-100 flex items-center gap-2"
					>
						<Plus size={16} className="text-gray-800" />
						New Invoice
					</button>
					<button 
						onClick={() => setDrawerOpen(true)} 
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
				<div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
				{/* Single tabular layout for all screen sizes; scrolls horizontally on small screens */}
				<div className="overflow-x-auto">
					<table className="min-w-full divide-y divide-gray-200">
						<thead className="bg-gray-50">
							<tr>
								<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">FBR Invoice #</th>
								<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">USIN #</th>
								<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice Date</th>
								<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
								<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Buyer</th>
								<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Products</th>
								<th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Final Amount</th>
								<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
								<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-gray-100 text-sm">
							{paged.map(inv => (
								<tr key={inv.id} className="hover:bg-gray-50">
									<td className="px-4 py-3 text-black font-mono text-xs">{inv.fbr_invoice_no || 'N/A'}</td>
									<td className="px-4 py-3 text-black font-mono text-xs">{inv.usin_no || 'N/A'}</td>
									<td className="px-4 py-3 text-gray-700 text-xs">
										{inv.invoice_date ? new Date(inv.invoice_date).toLocaleDateString('en-US', { 
											year: 'numeric', 
											month: 'short', 
											day: 'numeric' 
										}) : 'N/A'}
									</td>
									<td className="px-4 py-3 text-gray-700 text-xs">
										{inv.created_at ? new Date(inv.created_at).toLocaleDateString('en-US', { 
											year: 'numeric', 
											month: 'short', 
											day: 'numeric' 
										}) : 'N/A'}
									</td>
									<td className="px-4 py-3">
										{inv.buyer_name
											|| inv.buyer_description
											|| (inv.buyer && (inv.buyer.business_name || inv.buyer.name))
											|| 'N/A'}
									</td>
									<td className="px-4 py-3">
										<div className="max-w-xs truncate" title={inv.product_names?.join(', ')}>
											{inv.product_names?.length > 0 ? inv.product_names.join(', ') : 'N/A'}
										</div>
									</td>
									<td className="px-4 py-3 text-right font-medium text-black">
										{inv.final_amount != null 
											? `PKR ${Number(inv.final_amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
											: 'PKR 0.00'
										}
									</td>
								<td className="px-4 py-3">
									<span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
										inv.invoice_status === 'POSTED' ? 'bg-green-100 text-green-800' :
										inv.invoice_status === 'CREATED' ? 'bg-blue-100 text-blue-800' :
										inv.invoice_status === 'VALIDATED' ? 'bg-purple-100 text-purple-800' :
										inv.invoice_status === 'POSTING' ? 'bg-orange-100 text-orange-800' :
										inv.invoice_status === 'POSTING_FAILED' ? 'bg-red-100 text-red-800' :
										'bg-yellow-100 text-yellow-800'
									}`}>
										{inv.invoice_status || 'CREATED'}
									</span>
								</td>
									<td className="px-4 py-3">
										<div className="flex items-center gap-2">
											<button
												type="button"
												title="View"
												onClick={() => setViewInvoice(inv)}
												className="h-8 w-8 grid place-items-center rounded-md border border-gray-300 hover:bg-gray-50"
											>
												<Eye size={16} className="text-gray-700" />
											</button>
											<button
												type="button"
												title="Edit"
												onClick={() => navigate(`/invoices/${inv.id}/edit`)}
												className="h-8 w-8 grid place-items-center rounded-md border border-gray-300 hover:bg-gray-50"
											>
												<Pencil size={16} className="text-gray-700" />
											</button>
											<button
												type="button"
												title="Delete"
												onClick={() => handleDelete(inv)}
												className="h-8 w-8 grid place-items-center rounded-md border border-red-300 hover:bg-red-50"
											>
												<Trash2 size={16} className="text-red-600" />
											</button>
										</div>
									</td>
								</tr>
							))}
							{paged.length === 0 && (
								<tr><td colSpan={9} className="px-4 py-6 text-center text-gray-600">No invoices found.</td></tr>
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
							<select className="rounded-md border border-gray-300 bg-white py-1 px-2" value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1) }}>
								<option value={10}>10</option>
								<option value={25}>25</option>
								<option value={50}>50</option>
							</select>
						</label>
						<div className="flex items-center gap-1">
							<button className="h-8 w-8 grid place-items-center rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} aria-label="Previous page">
								<ChevronLeft size={16} />
							</button>
							<button className="h-8 w-8 grid place-items-center rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50" onClick={() => setPage(p => p + 1)} disabled={page * pageSize >= total} aria-label="Next page">
								<ChevronRight size={16} />
							</button>
						</div>
					</div>
				</div>
			</div>
			)}

		{viewInvoice && (
			<InvoiceViewDialog
				invoice={viewInvoice}
				onClose={() => setViewInvoice(null)}
				onDeleted={(deletedId) => {
					setInvoices(prev => prev.filter(inv => inv.id !== deletedId))
					setViewInvoice(null)
				}}
				onRefresh={fetchList}
			/>
		)}
			
			<InvoicesSearchDrawer
				open={drawerOpen}
				initialFilters={filters}
				invoices={invoices}
				onClose={onCloseDrawer}
				onApply={onApplyFilters}
			/>
		</div>
	)
}


