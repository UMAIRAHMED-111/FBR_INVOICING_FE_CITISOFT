import { useState, useEffect, useMemo } from 'react'
import { X } from 'lucide-react'
import Autocomplete from '../../components/Autocomplete'

export default function InvoicesSearchDrawer({ open, initialFilters, onClose, onApply, invoices }) {
	const [filters, setFilters] = useState(initialFilters)

	useEffect(() => {
		if (open) setFilters(initialFilters)
	}, [open, initialFilters])

	// Extract distinct values from invoices data
	const distinctOptions = useMemo(() => {
		const statuses = new Set()
		const customers = new Set()
		const fbrInvoices = new Set()
		const usinNumbers = new Set()
		
		invoices.forEach(inv => {
			if (inv.invoice_status) statuses.add(inv.invoice_status)
			if (inv.customer_name) customers.add(inv.customer_name)
			if (inv.fbr_invoice_no) fbrInvoices.add(inv.fbr_invoice_no)
			if (inv.usin_no) usinNumbers.add(inv.usin_no)
		})

		return {
			statuses: Array.from(statuses).sort().map(s => ({ label: s, value: s })),
			customers: Array.from(customers).sort().map(c => ({ label: c, value: c })),
			fbrInvoices: Array.from(fbrInvoices).sort().map(f => ({ label: f, value: f })),
			usinNumbers: Array.from(usinNumbers).sort().map(u => ({ label: u, value: u }))
		}
	}, [invoices])

	function handleSelectChange(name, value) {
		setFilters(prev => ({ ...prev, [name]: value }))
	}

	function handleApply() {
		onApply(filters)
	}

	function handleChange(e) {
		const { name, value } = e.target
		setFilters(prev => ({ ...prev, [name]: value }))
	}

	function handleReset() {
		const empty = { 
			fbr_invoice_no: '',
			usin_no: '',
			customer_name: '',
			invoice_status: '',
			invoice_date_start: '',
			invoice_date_end: '',
			created_at_start: '',
			created_at_end: ''
		}
		setFilters(empty)
		onApply(empty)
	}

	if (!open) return null

	return (
		<div className="fixed inset-0 z-[1000]">
			<div className="absolute inset-0 bg-black/30" onClick={onClose} />
			<aside className="absolute right-0 top-0 h-full w-[480px] max-w-[90%] bg-white border-l border-gray-200 shadow-xl p-6 flex flex-col">
				<div className="flex items-center justify-between">
					<h3 className="text-lg font-semibold text-black">Search & Filter</h3>
					<button
						onClick={onClose}
						className="h-9 w-9 grid place-items-center rounded-md border border-gray-300 hover:bg-gray-50"
					>
						<X size={18} />
					</button>
				</div>
				<div className="mt-4 grid gap-3 text-sm flex-1 overflow-y-auto content-start auto-rows-min px-1">
					<div>
						<Autocomplete
							label="FBR Invoice #"
							value={filters.fbr_invoice_no}
							onChange={(value) => handleSelectChange('fbr_invoice_no', value)}
							options={distinctOptions.fbrInvoices}
							placeholder="Type to search FBR Invoice..."
							minChars={1}
						/>
					</div>
					<div>
						<Autocomplete
							label="USIN #"
							value={filters.usin_no}
							onChange={(value) => handleSelectChange('usin_no', value)}
							options={distinctOptions.usinNumbers}
							placeholder="Type to search USIN..."
							minChars={1}
						/>
					</div>
					<div>
						<Autocomplete
							label="Customer"
							value={filters.customer_name}
							onChange={(value) => handleSelectChange('customer_name', value)}
							options={distinctOptions.customers}
							placeholder="Type to search customer..."
							minChars={1}
						/>
					</div>
					<div>
						<Autocomplete
							label="Invoice Status"
							value={filters.invoice_status}
							onChange={(value) => handleSelectChange('invoice_status', value)}
							options={distinctOptions.statuses}
							placeholder="Type to search status..."
							minChars={1}
						/>
					</div>
					
					{/* Invoice Date Range */}
					<div className="pt-2 border-t border-gray-200">
						<label className="block text-sm font-medium text-gray-800 mb-2">Invoice Date Range</label>
						<div className="grid grid-cols-2 gap-2">
							<div>
								<label className="block text-xs text-gray-600 mb-1">From</label>
								<input
									type="date"
									name="invoice_date_start"
									value={filters.invoice_date_start}
									onChange={handleChange}
									className="w-full rounded-lg border border-gray-300 px-2 py-1.5 text-sm"
								/>
							</div>
							<div>
								<label className="block text-xs text-gray-600 mb-1">To</label>
								<input
									type="date"
									name="invoice_date_end"
									value={filters.invoice_date_end}
									onChange={handleChange}
									className="w-full rounded-lg border border-gray-300 px-2 py-1.5 text-sm"
								/>
							</div>
						</div>
					</div>

					{/* Created At Range */}
					<div className="pt-2 border-t border-gray-200">
						<label className="block text-sm font-medium text-gray-800 mb-2">Created Date Range</label>
						<div className="grid grid-cols-2 gap-2">
							<div>
								<label className="block text-xs text-gray-600 mb-1">From</label>
								<input
									type="date"
									name="created_at_start"
									value={filters.created_at_start}
									onChange={handleChange}
									className="w-full rounded-lg border border-gray-300 px-2 py-1.5 text-sm"
								/>
							</div>
							<div>
								<label className="block text-xs text-gray-600 mb-1">To</label>
								<input
									type="date"
									name="created_at_end"
									value={filters.created_at_end}
									onChange={handleChange}
									className="w-full rounded-lg border border-gray-300 px-2 py-1.5 text-sm"
								/>
							</div>
						</div>
					</div>
				</div>
				<div className="flex gap-2 pt-2">
					<button
						onClick={handleApply}
						className="rounded-xl bg-black text-white px-3 py-2 text-sm"
					>
						Apply
					</button>
					<button
						onClick={handleReset}
						className="rounded-xl border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50"
					>
						Reset
					</button>
				</div>
			</aside>
		</div>
	)
}

