export function getDummyInvoices() {
	// Using a flat 18% as an example tax rate to populate demo data
	const items = [
		{ id: 'INV-2025-0001', date: '2025-01-12', customer: 'ABC Corporation', baseAmount: 207627, status: 'Submitted', taxPercent: 18 },
		{ id: 'INV-2025-0002', date: '2025-01-15', customer: 'XYZ Pvt Ltd', baseAmount: 47458, status: 'Draft', taxPercent: 18 },
		{ id: 'INV-2025-0003', date: '2025-01-20', customer: 'Delta Traders', baseAmount: 150847, status: 'Submitted', taxPercent: 18 },
	]
	return items.map(it => {
		const amount = it.baseAmount
		const discount = 0
		const salesTax = Math.round(amount * it.taxPercent / 100)
		const valueInclTax = amount - discount + salesTax
		return {
			id: it.id,
			date: it.date,
			customer: it.customer,
			amount,
			discount,
			taxPercent: it.taxPercent,
			salesTax,
			valueInclTax,
			total: valueInclTax, // backward compat for older views
			status: it.status,
		}
	})
}

export function getDummyInvoiceById(id) {
	const all = getDummyInvoices()
	return all.find(i => i.id === id) || {
		id,
		date: '2025-01-31',
		customer: 'Sample Co',
		amount: 8475,
		discount: 0,
		taxPercent: 18,
		salesTax: 1526,
		valueInclTax: 10001,
		total: 10001,
		status: 'Draft'
	}
}


