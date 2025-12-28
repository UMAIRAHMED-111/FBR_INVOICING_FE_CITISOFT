import { useEffect, useMemo, useState } from 'react'
import { Plus, Trash2, ChevronDown, ExternalLink, FileText, ArrowLeft } from 'lucide-react'
import { invoicesApi } from '../../api/invoices'
import { productsApi } from '../../api/products'
import { tenantsApi } from '../../api/tenants'
import { referenceDataApi } from '../../api/referenceData'
import toast from 'react-hot-toast'
import SearchableSelect from '../../components/SearchableSelect'
import { useSelector } from 'react-redux'

function computeLine(line) {
	const quantity = Number(line.quantity) || 0
	const rate = Number(line.rate) || 0
	const amount = quantity * rate
	const discountPercent = Number(line.discount) || 0
	const discountAmount = Math.max(0, Math.min(100, discountPercent)) * amount / 100
	const taxPercent = Number(line.taxPercent) || 0
	const taxable = Math.max(0, amount - discountAmount)
	const salesTaxAmount = taxable * taxPercent / 100

	// Extra and further tax are treated as explicit amounts
	const extraTaxAmount = Number(line.extraTax) || 0
	const furtherTaxAmount = Number(line.furtherTax) || 0
	const totalTax = salesTaxAmount + extraTaxAmount + furtherTaxAmount

	const valueAfterTax = taxable + totalTax

	// Sales tax withheld at source is entered as an explicit amount (will be subtracted)
	const stWhAmount = Number(line.salesTaxWithheldAtSource) || 0

	// FED payable is entered as an explicit amount
	const fedPayableAmount = Number(line.fedPayable) || 0

	// Final line total: after tax, minus withheld ST, plus FED payable
	const valueInclSalesTax = valueAfterTax - stWhAmount + fedPayableAmount

	return {
		amount,
		discountAmount,
		taxable,
		salesTaxAmount,
		extraTaxAmount,
		furtherTaxAmount,
		totalTax,
		valueAfterTax,
		stWhAmount,
		fedPayableAmount,
		valueInclSalesTax,
	}
}

function formatAmount(value) {
	const num = Number(value) || 0
	return num.toLocaleString('en-US', {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	})
}

export default function InvoiceForm({ initial = {}, onCancel, onSave, onDelete, deleting = false, mode = 'create' }) {
	const invoiceStatus = initial.status || 'CREATED'
	const isEditable = mode === 'create' || invoiceStatus === 'CREATED' || invoiceStatus === 'VALIDATED'
	// const isEditable = true

	const [header, setHeader] = useState({
		fbrInvNo: initial.fbrInvNo || '',
		usin: initial.usin || '',
		invType: initial.invType || 'Sale Invoice',
		payMode: initial.payMode || 'Cash',
		invDate: initial.invDate || '',
		notes: initial.notes || '',
		cashier: initial.cashier || '',
		branch: initial.branch || '',
		scenarioId: initial.scenarioId || '',
		customerId: initial.customerId || '',
		customer: initial.customer || '',
		cnicNtn: initial.cnicNtn || '',
		city: initial.city || '',
		address: initial.address || '',
		province: initial.province || '',
		description: initial.description || '',
		// Buyer fields
    		buyerId: initial.buyerId || '',
    		buyerDescription: initial.buyerDescription || '',
    		buyerCnicNtn: initial.buyerCnicNtn || '',
    		buyerProvince: initial.buyerProvince || '',
    		buyerAddress: initial.buyerAddress || '',
		isRegisteredBuyer: initial.isRegisteredBuyer || '',
		// Debit invoice reference
		invoiceReferenceNumber: initial.invoiceReferenceNumber || '',
	})
	const [items, setItems] = useState(initial.items?.length ? initial.items : [
		{
			productId: '',
			productCode: '',
			productName: '',
			srNo: '',
			sroSchedule: '',
			uom: '',
			hsCode: '',
			hsDescription: '',
			tranType: '',
			quantity: '',
			isFixedNotifiedRetailPrice: 'no',
			rate: '',
			discount: '',
			taxPercent: '',
			fixedNotifiedValueOrRetailPrice: '',
			salesTaxWithheldAtSource: '',
			extraTax: '',
			furtherTax: '',
			fedPayable: '',
			productNotes: '',
		},
	])

	// Dropdown data
    	const [scenarios, setScenarios] = useState([])
    	const [products, setProducts] = useState([])
    	const [customers, setCustomers] = useState([])
    	const [buyers, setBuyers] = useState([])
    	const [provinces, setProvinces] = useState([])
	const [loading, setLoading] = useState(true)
	const [submitting, setSubmitting] = useState(false)
	const [pdfAccordionOpen, setPdfAccordionOpen] = useState(false)
	const [errors, setErrors] = useState({})

	const me = useSelector((state) => state.user.me)
	const tenantId = useSelector((state) => state.tenant.id)
	const isTenantUser = me?.user_type === 'tenant_user'
	const sellerDisabled = !isEditable || isTenantUser
	
	// PDF URL from initial data
	const invoicePdfUrl = initial.invoiceFileUrl || ''

	// Load dropdown data
	useEffect(() => {
		async function loadData() {
			try {
				if (mode === 'create') {
					// Create: load products so user can select them
    					const [scenariosData, productsData, customersData, provincesData, buyersData] = await Promise.all([
						invoicesApi.listScenarios(),
						productsApi.listProducts(),
						tenantsApi.list(),
						referenceDataApi.getProvinces(),
    						invoicesApi.listBuyers(),
					])
					setScenarios(scenariosData || [])
					setProducts(productsData || [])
					setCustomers(customersData || [])
					setProvinces(Array.isArray(provincesData) ? provincesData : [])
    					setBuyers(Array.isArray(buyersData) ? buyersData : [])
				} else {
					// Edit: load products so user can search when adding new items
    					const [scenariosData, customersData, provincesData, buyersData, productsData] = await Promise.all([
						invoicesApi.listScenarios(),
						tenantsApi.list(),
						referenceDataApi.getProvinces(),
    						invoicesApi.listBuyers(),
						productsApi.listProducts(),
					])
					setScenarios(scenariosData || [])
					setCustomers(customersData || [])
					setProvinces(Array.isArray(provincesData) ? provincesData : [])
    					setBuyers(Array.isArray(buyersData) ? buyersData : [])
					setProducts(productsData || [])
				}
			} catch (err) {
				toast.error('Failed to load form data')
				console.error(err)
			} finally {
				setLoading(false)
			}
		}
		loadData()
	}, [mode])

	// Auto-fill customer details in edit mode when customers are loaded
	useEffect(() => {
		if (mode === 'edit' && customers.length > 0 && header.customerId && !header.cnicNtn) {
			const customer = customers.find(c => c.id === header.customerId)
			if (customer) {
				setHeader(h => ({
					...h,
					customer: customer.name,
					cnicNtn: customer.ntn || '',
					city: customer.city || '',
					address: customer.address_line || '',
					province: customer.province || '',
				}))
			}
		}
	}, [customers, header.customerId, header.cnicNtn, mode])

	useEffect(() => {
		if (!isTenantUser || !tenantId || customers.length === 0) return
		if (header.customerId === tenantId) return

		const tenantCustomer = customers.find(c => c.id === tenantId)
		if (tenantCustomer) {
			setHeader(h => ({
				...h,
				customerId: tenantCustomer.id,
				customer: tenantCustomer.name || '',
				cnicNtn: tenantCustomer.ntn || '',
				city: tenantCustomer.city || '',
				address: tenantCustomer.address_line || '',
				province: tenantCustomer.province || '',
			}))
		}
	}, [isTenantUser, tenantId, customers, header.customerId])

	function updateHeader(name, value) {
		setHeader(h => ({ ...h, [name]: value }))
		if (errors[name]) setErrors(e => ({ ...e, [name]: '' }))
	}

	function handleCustomerSelect(customerId) {
		if (isTenantUser) return
		const customer = customers.find(c => c.id === customerId)
		if (errors.customerId) setErrors(e => ({ ...e, customerId: '' }))
		if (customer) {
			setHeader(h => ({
				...h,
				customerId: customer.id,
				customer: customer.name,
				cnicNtn: customer.ntn || '',
				city: customer.city || '',
				address: customer.address_line || '',
				province: customer.province || '',
			}))
		} else {
			setHeader(h => ({
				...h,
				customerId: '',
				customer: '',
				cnicNtn: '',
				city: '',
				address: '',
				province: '',
			}))
		}
	}

    	function handleBuyerSelect(buyerId) {
    		const buyer = buyers.find(b => b.id === buyerId)
    		if (errors.buyerId) setErrors(e => ({ ...e, buyerId: '' }))
    		if (buyer) {
			const regType = (buyer.registration_type || '').toLowerCase()
			const isRegistered = regType === 'registered'
    			setHeader(h => ({
    				...h,
    				buyerId: buyer.id,
    				buyerDescription: buyer.business_name || '',
    				buyerCnicNtn: buyer.ntn_cnic || '',
    				buyerProvince: buyer.province || '',
    				buyerAddress: buyer.address || '',
				isRegisteredBuyer: isRegistered ? 'yes' : 'no',
    			}))
    		} else {
    			setHeader(h => ({
    				...h,
    				buyerId: '',
    				buyerDescription: '',
    				buyerCnicNtn: '',
    				buyerProvince: '',
    				buyerAddress: '',
				isRegisteredBuyer: '',
    			}))
    		}
    	}

    	// When editing, try to auto-select a Buyer based on the existing buyer description
    	useEffect(() => {
    		if (mode !== 'edit') return
    		if (!header.buyerDescription || header.buyerId) return
    		if (!buyers || buyers.length === 0) return

    		const target = header.buyerDescription.trim().toLowerCase()
    		const match = buyers.find(b => (b.business_name || '').trim().toLowerCase() === target)
    		if (match) {
			const regType = (match.registration_type || '').toLowerCase()
			const isRegistered = regType === 'registered'
    			setHeader(h => ({
    				...h,
    				buyerId: match.id,
    				buyerDescription: match.business_name || h.buyerDescription,
    				buyerCnicNtn: match.ntn_cnic || h.buyerCnicNtn,
    				buyerProvince: match.province || h.buyerProvince,
    				buyerAddress: match.address || h.buyerAddress,
				isRegisteredBuyer: h.isRegisteredBuyer || (isRegistered ? 'yes' : 'no'),
    			}))
    		}
    	}, [mode, buyers, header.buyerId, header.buyerDescription, setHeader])

	function updateItem(idx, name, value) {
		setItems(arr => arr.map((it, i) => i === idx ? { ...it, [name]: value } : it))
		if (errors[`item_${idx}_${name}`]) setErrors(e => ({ ...e, [`item_${idx}_${name}`]: '' }))
	}

	function handleProductSelect(idx, productId) {
		const product = products.find(p => p.id === productId)
		if (errors[`item_${idx}_productId`]) setErrors(e => ({ ...e, [`item_${idx}_productId`]: '' }))
		if (product) {
			setItems(arr => arr.map((it, i) => i === idx ? {
				...it,
				productId: product.id,
				productCode: product.product_code || '',
				productName: product.product_name || '',
				srNo: product.sro_ser_no ? String(product.sro_ser_no) : '',
				sroSchedule: product.sro_description || '',
				uom: product.uom_description || '',
				hsCode: product.hs_code || '',
				hsDescription: product.hs_description || '',
				tranType: product.transaction_type || '',
				// rate left as-is so user always types it manually
				taxPercent: product.rate_value ? String(product.rate_value) : '',
			} : it))
		}
	}

	function addItem() {
		setItems(arr => [
			...arr,
			{
				productId: '',
				productCode: '',
				productName: '',
				srNo: '',
				sroSchedule: '',
				uom: '',
				hsCode: '',
				hsDescription: '',
				tranType: '',
				quantity: '',
			isFixedNotifiedRetailPrice: 'no',
				rate: '',
				discount: '',
				taxPercent: '',
				fixedNotifiedValueOrRetailPrice: '',
				salesTaxWithheldAtSource: '',
				extraTax: '',
				furtherTax: '',
				fedPayable: '',
				productNotes: '',
			},
		])
	}

	function removeItem(idx) {
		setItems(arr => arr.filter((_, i) => i !== idx))
	}

	const totals = useMemo(() => {
		return items.reduce((acc, it) => {
			const c = computeLine(it)
			acc.amount += c.amount
			acc.discount += c.discountAmount
			acc.taxable += c.taxable
			acc.salesTax += c.salesTaxAmount
			acc.extraTax += c.extraTaxAmount
			acc.furtherTax += c.furtherTaxAmount
			acc.totalTax += c.totalTax
			acc.afterTax += c.valueAfterTax
			acc.stWhAmount += c.stWhAmount
			acc.fedPayable += c.fedPayableAmount
			acc.finalTotal += c.valueInclSalesTax
			return acc
		}, {
			amount: 0,
			discount: 0,
			taxable: 0,
			salesTax: 0,
			extraTax: 0,
			furtherTax: 0,
			totalTax: 0,
			afterTax: 0,
			stWhAmount: 0,
			fedPayable: 0,
			finalTotal: 0,
		})
	}, [items])

	async function handleSubmit(e) {
		e.preventDefault()

		// Validation
		const newErrors = {}
		if (!header.invType) {
			newErrors.invType = 'Invoice type is required'
		}
		if (!header.invDate) {
			newErrors.invDate = 'Invoice date is required'
		}
		if (!header.customerId) {
			newErrors.customerId = 'Seller is required'
		}
		if (!header.buyerId) {
			newErrors.buyerId = 'Buyer is required'
		}
		if (header.invType === 'Debit Invoice' && !header.invoiceReferenceNumber) {
			newErrors.invoiceReferenceNumber = 'Invoice reference number is required for Debit Invoices'
		}
		if (items.length === 0 || !items[0].productId) {
			newErrors.items = 'At least one product is required'
		}
		// Validate each item
		items.forEach((item, idx) => {
			if (item.productId) {
				if (!item.quantity || Number(item.quantity) <= 0) {
					newErrors[`item_${idx}_quantity`] = 'Quantity is required'
				}
				if (!item.rate || Number(item.rate) <= 0) {
					newErrors[`item_${idx}_rate`] = 'Price is required'
				}
				if (!item.productNotes || item.productNotes.trim() === '') {
					newErrors[`item_${idx}_productNotes`] = 'Product description is required'
				}
			}
		})

		if (Object.keys(newErrors).length > 0) {
			setErrors(newErrors)
			if (newErrors.items) {
				toast.error(newErrors.items)
			}
			return
		}

		setSubmitting(true)
		try {
			// Map items to API format
			const itemsPayload = items
				.filter(item => item.productId) // Only include items with a product selected
				.map(item => {
					const c = computeLine(item)
					return {
						product: item.productId,
						hs_description: item.hsDescription || null,
						quantity: Number(item.quantity) || 0,
						is_fixed_notifed_retail_price: item.isFixedNotifiedRetailPrice === 'yes',
						rate: Number(item.rate) || 0,
						amount: c.amount,
						discount: Number(item.discount) || 0,
						discount_amount: c.discountAmount,
						tax_percentage: Number(item.taxPercent) || 0,
						sales_tax_amt: c.salesTaxAmount,
						val_incl_sales_tax: c.valueInclSalesTax,
						fixed_notified_value_or_retail_price: Number(item.fixedNotifiedValueOrRetailPrice) || 0,
						sales_tax_withheld_at_source: Number(item.salesTaxWithheldAtSource) || 0,
						extra_tax: Number(item.extraTax) || 0,
						further_tax: Number(item.furtherTax) || 0,
						fed_payable: Number(item.fedPayable) || 0,
						product_notes: item.productNotes || null,
					}
				})

			const payload = {
				...(mode === 'create' && { invoice_status: 'CREATED' }),
				invoice_customer: header.customerId,
				buyer: header.buyerId || null,
				invoice_scenario: header.scenarioId || null,
				fbr_invoice_no: header.fbrInvNo || null,
				inv_type: header.invType || null,
				invoice_reference_number: header.invType === 'Debit Invoice'
					? (header.invoiceReferenceNumber || null)
					: null,
				pay_mode: header.payMode || null,
				cashier_name: header.cashier || null,
				notes: header.notes || null,
				is_registered_buyer: header.isRegisteredBuyer ? header.isRegisteredBuyer === 'yes' : null,
    				cnic_buyer: header.buyerCnicNtn || null,
    				province_buyer: header.buyerProvince || null,
				address_buyer: header.buyerAddress || null,
				description_buyer: header.buyerDescription || null,
				description_seller: header.description || null,
				invoice_filename: null,
				invoice_fileurl: null,
				invoice_date: header.invDate || null,
				items: itemsPayload,
			}

			let result
			if (mode === 'create') {
				result = await invoicesApi.create(payload)
				toast.success('Invoice created successfully')
			} else {
				result = await invoicesApi.update(initial.id, payload)
				toast.success('Invoice updated successfully')
			}

			onSave?.(result)
		} catch (err) {
			const errorMsg = mode === 'create' ? 'Failed to create invoice' : 'Failed to update invoice'
			toast.error(errorMsg)
			console.error(err)
		} finally {
			setSubmitting(false)
		}
	}

	if (loading) {
		return (
			<div className="flex items-center justify-center py-12">
				<div className="text-center">
					<div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-gray-900 border-r-transparent"></div>
					<p className="mt-2 text-sm text-gray-600">Loading form data...</p>
				</div>
			</div>
		)
	}

	return (
		<form onSubmit={handleSubmit} className="space-y-6">
			{/* Back Button */}
			<div className="mb-4">
				<button
					type="button"
					onClick={onCancel}
					className="inline-flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
				>
					<ArrowLeft className="w-4 h-4" />
					Back to Invoices
				</button>
			</div>

			{/* Status Chip */}
			{mode === 'edit' && (
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-3">
						<span className="text-sm font-medium text-gray-700">Invoice Status:</span>
						<span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
							invoiceStatus === 'POSTED' ? 'bg-green-100 text-green-800' :
							invoiceStatus === 'CREATED' ? 'bg-blue-100 text-blue-800' :
							invoiceStatus === 'VALIDATED' ? 'bg-purple-100 text-purple-800' :
							invoiceStatus === 'POSTING' ? 'bg-orange-100 text-orange-800' :
							invoiceStatus === 'POSTING_FAILED' ? 'bg-red-100 text-red-800' :
							'bg-yellow-100 text-yellow-800'
						}`}>
							{invoiceStatus}
						</span>
					</div>
					{!isEditable && (
						<div className="text-xs text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
							⚠️ This invoice cannot be edited
						</div>
					)}
				</div>
			)}

			{/* Header Section */}
			<div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
				<h2 className="text-lg font-semibold text-gray-900 mb-1">Invoice Details</h2>
				<p className="text-sm text-gray-500 mb-6">Basic invoice information</p>

				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1.5">FBR Inv #</label>
						<input
							value={header.fbrInvNo}
							disabled
							readOnly
							className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-gray-100 cursor-not-allowed"
						/>
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1.5">USIN #</label>
						<input
							value={header.usin}
							disabled
							readOnly
							className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-gray-100 cursor-not-allowed"
						/>
					</div>
					<div>
						<SearchableSelect
							label={<>Invoice Type <span className="text-red-500">*</span></>}
							value={header.invType}
							onChange={(value) => updateHeader('invType', value)}
							options={['Sale Invoice', 'Debit Invoice']}
							placeholder="Select type"
							disabled={!isEditable}
						/>
						{errors.invType && <p className="text-red-500 text-sm mt-1">{errors.invType}</p>}
					</div>
					{header.invType === 'Debit Invoice' && (
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1.5">
								Invoice Ref # <span className="text-red-500">*</span>
							</label>
							<input
								value={header.invoiceReferenceNumber}
								onChange={(e) => updateHeader('invoiceReferenceNumber', e.target.value)}
								disabled={!isEditable}
								className={`w-full rounded-lg border px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed ${
									errors.invoiceReferenceNumber ? 'border-red-500' : 'border-gray-300'
								}`}
								placeholder="Enter original invoice reference"
							/>
							{errors.invoiceReferenceNumber && (
								<p className="text-red-500 text-sm mt-1">{errors.invoiceReferenceNumber}</p>
							)}
						</div>
					)}
					<div>
						<SearchableSelect
							label="Payment Mode"
							value={header.payMode}
							onChange={(value) => updateHeader('payMode', value)}
							options={['Cash', 'Card', 'Bank Transfer']}
							placeholder="Select payment mode"
							disabled={!isEditable}
						/>
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1.5">Invoice Date <span className="text-red-500">*</span></label>
						<input
							type="date"
							value={header.invDate}
							onChange={(e) => updateHeader('invDate', e.target.value)}
							disabled={!isEditable}
							className={`w-full rounded-lg border px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed ${errors.invDate ? 'border-red-500' : 'border-gray-300'}`}
						/>
						{errors.invDate && <p className="text-red-500 text-sm mt-1">{errors.invDate}</p>}
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1.5">Cashier</label>
						<input
							value={header.cashier}
							onChange={(e) => updateHeader('cashier', e.target.value)}
							disabled={!isEditable}
							className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
						/>
					</div>
					<div className="sm:col-span-2 lg:col-span-3">
						<label className="block text-sm font-medium text-gray-700 mb-1.5">Notes</label>
						<textarea
							value={header.notes}
							onChange={(e) => updateHeader('notes', e.target.value)}
							disabled={!isEditable}
							className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
							rows={2}
						/>
					</div>
				</div>
			</div>

			{/* Seller & Buyer Details */}
			<div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
				{/* Seller Details Section */}
				<div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
					<h2 className="text-lg font-semibold text-gray-900 mb-1">Seller Details</h2>
					<p className="text-sm text-gray-500 mb-6">Seller information</p>

						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
							<div>
								<SearchableSelect
									label={<>Seller <span className="text-red-500">*</span></>}
									value={header.customerId}
									onChange={handleCustomerSelect}
									options={customers}
									placeholder="Select seller"
									getOptionLabel={(c) => c.name}
									getOptionValue={(c) => c.id}
							disabled={sellerDisabled}
								/>
								{errors.customerId && <p className="text-red-500 text-sm mt-1">{errors.customerId}</p>}
							</div>
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1.5">CNIC / NTN</label>
							<input
								value={header.cnicNtn}
								disabled
								readOnly
								className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-gray-100 cursor-not-allowed"
							/>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1.5">City</label>
							<input
								value={header.city}
								disabled
								readOnly
								className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-gray-100 cursor-not-allowed"
							/>
						</div>
						<div>
							<SearchableSelect
								label="Province"
								value={header.province}
								onChange={(value) => updateHeader('province', value)}
								options={provinces}
								placeholder="Select province"
								getOptionLabel={(p) => p.province_desc}
								getOptionValue={(p) => p.province_desc}
								disabled
							/>
						</div>
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1.5">Address</label>
						<input
							value={header.address}
							disabled
							readOnly
							className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-gray-100 cursor-not-allowed"
						/>
					</div>
				</div>
				</div>

    				{/* Buyer Details Section */}
    				<div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
    					<h2 className="text-lg font-semibold text-gray-900 mb-1">Buyer Details</h2>
    					<p className="text-sm text-gray-500 mb-6">Buyer information</p>

    					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
    						<div className="sm:col-span-2">
    							<SearchableSelect
    								label={<>Buyer <span className="text-red-500">*</span></>}
    								value={header.buyerId}
    								onChange={handleBuyerSelect}
    								options={buyers}
    								placeholder="Select buyer"
    								getOptionLabel={(b) => b.business_name}
    								getOptionValue={(b) => b.id}
    								disabled={!isEditable}
    							/>
    							{errors.buyerId && <p className="text-red-500 text-sm mt-1">{errors.buyerId}</p>}
    						</div>
    						<div>
								<label className="block text-sm font-medium text-gray-700 mb-1.5">Registered Buyer?</label>
								<select
									value={header.isRegisteredBuyer}
									onChange={(e) => updateHeader('isRegisteredBuyer', e.target.value)}
									disabled={!isEditable}
									className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
								>
									<option value="">Select</option>
									<option value="yes">Yes</option>
									<option value="no">No</option>
								</select>
    						</div>
    						<div>
    							<label className="block text-sm font-medium text-gray-700 mb-1.5">Buyer Description</label>
    							<input
    								value={header.buyerDescription}
    								onChange={(e) => updateHeader('buyerDescription', e.target.value)}
    								disabled={!isEditable}
    								className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
    								placeholder="Enter buyer description"
    							/>
    						</div>
    						<div>
    							<label className="block text-sm font-medium text-gray-700 mb-1.5">CNIC / NTN</label>
    							<input
    								value={header.buyerCnicNtn}
    								onChange={(e) => updateHeader('buyerCnicNtn', e.target.value)}
    								disabled={!isEditable}
    								className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
    								placeholder="Enter CNIC or NTN"
    							/>
    						</div>
						<div>
							<SearchableSelect
								label="Province"
								value={header.buyerProvince}
								onChange={(value) => updateHeader('buyerProvince', value)}
								options={provinces}
								placeholder="Select province"
								getOptionLabel={(p) => p.province_desc}
								getOptionValue={(p) => p.province_desc}
								disabled={!isEditable}
							/>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1.5">Address</label>
							<input
								value={header.buyerAddress}
								onChange={(e) => updateHeader('buyerAddress', e.target.value)}
								disabled={!isEditable}
								className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
								placeholder="Enter address"
							/>
						</div>
					</div>
				</div>
			</div>

			{/* Products Section */}
			<div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
				<div className="flex items-center justify-between mb-6">
					<div>
						<h2 className="text-lg font-semibold text-gray-900 mb-1">Products</h2>
						<p className="text-sm text-gray-500">Add items to this invoice</p>
					</div>
					<button
						type="button"
						onClick={addItem}
						disabled={!isEditable}
						className="inline-flex items-center gap-2 rounded-lg bg-gray-900 text-white px-4 py-2 text-sm font-medium hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
					>
						<Plus size={16} /> Add Item
					</button>
				</div>

				{/* Products list - card layout on all screen sizes */}
				<div className="space-y-4">
					{items.map((it, idx) => {
						const c = computeLine(it)
						return (
							<div key={idx} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
								<div className="flex items-center justify-between mb-3">
									<span className="text-sm font-semibold text-gray-900">Item {idx + 1}</span>
									<button
										type="button"
										onClick={() => removeItem(idx)}
										disabled={!isEditable}
										className="p-1.5 rounded hover:bg-red-50 text-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
										title="Remove item"
									>
										<Trash2 size={16} />
									</button>
								</div>
								<div className="grid grid-cols-1 md:grid-cols-3 gap-3">
									<div className="md:col-span-3">
												<SearchableSelect
													label={<>Select Product <span className="text-red-500">*</span></>}
													value={it.productId}
													onChange={(value) => handleProductSelect(idx, value)}
													options={products}
													placeholder="Select product"
													getOptionLabel={(p) => p.product_name}
													getOptionValue={(p) => p.id}
													disabled={!isEditable}
												/>
										{errors[`item_${idx}_productId`] && (
											<p className="text-red-500 text-sm mt-1">{errors[`item_${idx}_productId`]}</p>
										)}
									</div>
									<div className="md:col-span-3">
										<label className="block text-xs font-medium text-gray-600 mb-1">
											Product Description <span className="text-red-500">*</span>
										</label>
										<textarea
											value={it.productNotes}
											onChange={isEditable ? (e) => updateItem(idx, 'productNotes', e.target.value) : undefined}
											disabled={!isEditable}
											rows={2}
											placeholder="Enter product description..."
											className={`w-full rounded border px-2 py-1.5 text-sm bg-white disabled:bg-gray-100 disabled:cursor-not-allowed resize-none ${errors[`item_${idx}_productNotes`] ? 'border-red-500' : 'border-gray-300'}`}
										/>
										{errors[`item_${idx}_productNotes`] && (
											<p className="text-red-500 text-xs mt-1">{errors[`item_${idx}_productNotes`]}</p>
										)}
									</div>
									<div>
										<label className="block text-xs font-medium text-gray-600 mb-1">Product Code</label>
										<input value={it.productCode} disabled readOnly className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm bg-gray-100 cursor-not-allowed" />
									</div>
									{mode === 'create' && (
										<div>
											<label className="block text-xs font-medium text-gray-600 mb-1">Product Name</label>
											<input
												value={it.productName}
												disabled
												readOnly
												className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm bg-gray-100 cursor-not-allowed"
											/>
										</div>
									)}
									<div>
										<label className="block text-xs font-medium text-gray-600 mb-1">SR #</label>
										<input value={it.srNo} disabled readOnly className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm bg-gray-100 cursor-not-allowed" />
									</div>
									<div>
										<label className="block text-xs font-medium text-gray-600 mb-1">SRO Schedule</label>
										<input value={it.sroSchedule} disabled readOnly className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm bg-gray-100 cursor-not-allowed" />
									</div>
									<div>
										<label className="block text-xs font-medium text-gray-600 mb-1">UOM</label>
										<input value={it.uom} disabled readOnly className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm bg-gray-100 cursor-not-allowed" />
									</div>
									<div>
										<label className="block text-xs font-medium text-gray-600 mb-1">HS Code</label>
										<input value={it.hsCode} disabled readOnly className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm bg-gray-100 cursor-not-allowed" />
									</div>
									<div>
										<label className="block text-xs font-medium text-gray-600 mb-1">Transaction Type</label>
										<input value={it.tranType} disabled readOnly className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm bg-gray-100 cursor-not-allowed" />
									</div>
										<div>
											<label className="block text-xs font-medium text-gray-600 mb-1">Quantity <span className="text-red-500">*</span></label>
										<input
											value={it.quantity}
											onChange={(e) => updateItem(idx, 'quantity', e.target.value)}
											disabled={!isEditable}
											className={`w-full rounded border px-2 py-1.5 text-sm bg-white disabled:bg-gray-100 disabled:cursor-not-allowed ${errors[`item_${idx}_quantity`] ? 'border-red-500' : 'border-gray-300'}`}
										/>
											{errors[`item_${idx}_quantity`] && <p className="text-red-500 text-xs mt-1">{errors[`item_${idx}_quantity`]}</p>}
										</div>
									<div>
										<label className="block text-xs font-medium text-gray-600 mb-1">Is Fixed/Notified Retail?</label>
										<select
											value={it.isFixedNotifiedRetailPrice}
											onChange={(e) => updateItem(idx, 'isFixedNotifiedRetailPrice', e.target.value)}
											disabled={!isEditable}
											className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
										>
											<option value="no">No</option>
											<option value="yes">Yes</option>
										</select>
									</div>
										<div>
											<label className="block text-xs font-medium text-gray-600 mb-1">Price <span className="text-red-500">*</span></label>
											<input
												value={it.rate}
												onChange={isEditable ? (e) => updateItem(idx, 'rate', e.target.value) : undefined}
												disabled={!isEditable}
												readOnly={!isEditable}
												className={`w-full rounded border px-2 py-1.5 text-sm ${isEditable ? 'bg-white' : 'bg-gray-100 cursor-not-allowed'} ${errors[`item_${idx}_rate`] ? 'border-red-500' : 'border-gray-300'}`}
											/>
											{errors[`item_${idx}_rate`] && <p className="text-red-500 text-xs mt-1">{errors[`item_${idx}_rate`]}</p>}
										</div>
									<div>
										<label className="block text-xs font-medium text-gray-600 mb-1">Discount (%)</label>
										<input value={it.discount} onChange={(e) => updateItem(idx, 'discount', e.target.value)} disabled={!isEditable} className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm bg-white disabled:bg-gray-100 disabled:cursor-not-allowed" />
									</div>
									<div>
										<label className="block text-xs font-medium text-gray-600 mb-1">Tax (%)</label>
										<input
											value={it.taxPercent}
											disabled
											readOnly
											className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm bg-gray-100 cursor-not-allowed"
										/>
									</div>
								<div>
									<label className="block text-xs font-medium text-gray-600 mb-1">ST W/H at Source (Amount in Rs.)</label>
									<input
										value={it.salesTaxWithheldAtSource}
										onChange={isEditable ? (e) => updateItem(idx, 'salesTaxWithheldAtSource', e.target.value) : undefined}
										disabled={!isEditable}
										className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
									/>
								</div>
									<div>
										<label className="block text-xs font-medium text-gray-600 mb-1">Extra Tax (Amount in Rs.)</label>
										<input
											value={it.extraTax}
											onChange={isEditable ? (e) => updateItem(idx, 'extraTax', e.target.value) : undefined}
											disabled={!isEditable}
											className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
										/>
									</div>
									<div>
										<label className="block text-xs font-medium text-gray-600 mb-1">Further Tax (Amount in Rs.)</label>
										<input
											value={it.furtherTax}
											onChange={isEditable ? (e) => updateItem(idx, 'furtherTax', e.target.value) : undefined}
											disabled={!isEditable}
											className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
										/>
									</div>
									<div>
										<label className="block text-xs font-medium text-gray-600 mb-1">FED Payable (Amount in Rs.)</label>
										<input
											value={it.fedPayable}
											onChange={isEditable ? (e) => updateItem(idx, 'fedPayable', e.target.value) : undefined}
											disabled={!isEditable}
											className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
										/>
									</div>
								</div>
								<div className="mt-3 pt-3 border-t border-gray-300 space-y-1.5 text-xs sm:text-sm">
									<div className="flex justify-between gap-2">
										<div className="flex items-center gap-1">
											<span className="text-gray-400 font-semibold">+</span>
											<span className="text-gray-600">Amount</span>
										</div>
										<span className="font-medium text-gray-900">{formatAmount(c.amount)}</span>
									</div>
									<div className="flex justify-between gap-2">
										<div className="flex items-center gap-1">
											<span className="text-gray-400 font-semibold">−</span>
											<span className="text-gray-600">Discount</span>
										</div>
										<span className="font-medium text-gray-900">{formatAmount(c.discountAmount)}</span>
									</div>
									<div className="flex justify-between gap-2 pb-1 border-b border-dashed border-gray-300">
										<div className="flex items-center gap-1">
											<span className="text-gray-400 font-semibold">=</span>
											<span className="text-gray-700">After discount</span>
										</div>
										<span className="font-medium text-gray-900">{formatAmount(c.taxable)}</span>
									</div>

									<div className="flex justify-between gap-2 pt-1">
										<div className="flex items-center gap-1">
											<span className="text-gray-400 font-semibold">+</span>
											<span className="text-gray-600">Sales tax</span>
										</div>
										<span className="font-medium text-gray-900">{formatAmount(c.salesTaxAmount)}</span>
									</div>
									<div className="flex justify-between gap-2">
										<div className="flex items-center gap-1">
											<span className="text-gray-400 font-semibold">+</span>
											<span className="text-gray-600">Extra tax</span>
										</div>
										<span className="font-medium text-gray-900">{formatAmount(c.extraTaxAmount)}</span>
									</div>
									<div className="flex justify-between gap-2">
										<div className="flex items-center gap-1">
											<span className="text-gray-400 font-semibold">+</span>
											<span className="text-gray-600">Further tax</span>
										</div>
										<span className="font-medium text-gray-900">{formatAmount(c.furtherTaxAmount)}</span>
									</div>
									<div className="flex justify-between gap-2 pb-1 border-b border-dashed border-gray-300">
										<div className="flex items-center gap-1">
											<span className="text-gray-400 font-semibold">=</span>
											<span className="text-gray-700">After tax</span>
										</div>
										<span className="font-medium text-gray-900">{formatAmount(c.valueAfterTax)}</span>
									</div>

								<div className="flex justify-between gap-2 pt-1">
									<div className="flex items-center gap-1">
										<span className="text-gray-400 font-semibold">−</span>
										<span className="text-gray-600">ST W/H at source</span>
									</div>
									<span className="font-medium text-gray-900">{formatAmount(c.stWhAmount)}</span>
								</div>
									<div className="flex justify-between gap-2">
										<div className="flex items-center gap-1">
											<span className="text-gray-400 font-semibold">+</span>
											<span className="text-gray-600">FED payable</span>
										</div>
										<span className="font-medium text-gray-900">{formatAmount(c.fedPayableAmount)}</span>
									</div>
									<div className="flex justify-between gap-2 pt-1 border-t border-dashed border-gray-300 mt-1">
										<div className="flex items-center gap-1">
											<span className="text-gray-400 font-semibold">=</span>
											<span className="font-semibold text-gray-900">Line total</span>
										</div>
										<span className="font-bold text-gray-900">{formatAmount(c.valueInclSalesTax)}</span>
									</div>
								</div>
							</div>
						)
					})}
					{items.length === 0 && (
						<div className="text-center py-12 text-gray-500">
							<p className="text-sm">No items added yet.</p>
							<p className="text-xs mt-1">Click "Add Item" to begin.</p>
						</div>
					)}

					{/* Summary Totals for mobile */}
					{items.length > 0 && (
						<div className="bg-gray-100 rounded-lg p-4 space-y-1.5 text-xs sm:text-sm">
							<h3 className="text-sm font-semibold text-gray-900 mb-3">Invoice Summary</h3>
							<div className="flex justify-between">
								<div className="flex items-center gap-1">
									<span className="text-gray-400 font-semibold">+</span>
									<span className="text-gray-700">Subtotal</span>
								</div>
								<span className="font-medium text-gray-900">{formatAmount(totals.amount)}</span>
							</div>
							<div className="flex justify-between">
								<div className="flex items-center gap-1">
									<span className="text-gray-400 font-semibold">−</span>
									<span className="text-gray-700">Total discount</span>
								</div>
								<span className="font-medium text-gray-900">{formatAmount(totals.discount)}</span>
							</div>
							<div className="flex justify-between pb-1 border-b border-dashed border-gray-300">
								<div className="flex items-center gap-1">
									<span className="text-gray-400 font-semibold">=</span>
									<span className="text-gray-800">After discount</span>
								</div>
								<span className="font-medium text-gray-900">{formatAmount(totals.taxable)}</span>
							</div>
							<div className="flex justify-between pt-1">
								<div className="flex items-center gap-1">
									<span className="text-gray-400 font-semibold">+</span>
									<span className="text-gray-700">Sales tax</span>
								</div>
								<span className="font-medium text-gray-900">{formatAmount(totals.salesTax)}</span>
							</div>
							<div className="flex justify-between">
								<div className="flex items-center gap-1">
									<span className="text-gray-400 font-semibold">+</span>
									<span className="text-gray-700">Extra tax</span>
								</div>
								<span className="font-medium text-gray-900">{formatAmount(totals.extraTax)}</span>
							</div>
							<div className="flex justify-between">
								<div className="flex items-center gap-1">
									<span className="text-gray-400 font-semibold">+</span>
									<span className="text-gray-700">Further tax</span>
								</div>
								<span className="font-medium text-gray-900">{formatAmount(totals.furtherTax)}</span>
							</div>
							<div className="flex justify-between pb-1 border-b border-dashed border-gray-300">
								<div className="flex items-center gap-1">
									<span className="text-gray-400 font-semibold">=</span>
									<span className="text-gray-800">After tax</span>
								</div>
								<span className="font-medium text-gray-900">{formatAmount(totals.afterTax)}</span>
							</div>
							<div className="flex justify-between pt-1">
								<div className="flex items-center gap-1">
									<span className="text-gray-400 font-semibold">−</span>
									<span className="text-gray-700">ST W/H at source</span>
								</div>
								<span className="font-medium text-gray-900">{formatAmount(totals.stWhAmount)}</span>
							</div>
							<div className="flex justify-between">
								<div className="flex items-center gap-1">
									<span className="text-gray-400 font-semibold">+</span>
									<span className="text-gray-700">FED payable</span>
								</div>
								<span className="font-medium text-gray-900">{formatAmount(totals.fedPayable)}</span>
							</div>
							<div className="flex justify-between text-base font-bold pt-2 border-t border-gray-300 mt-1">
								<div className="flex items-center gap-1">
									<span className="text-gray-400 font-semibold">=</span>
									<span className="text-gray-900">Grand total</span>
								</div>
								<span className="text-gray-900">{formatAmount(totals.finalTotal)}</span>
							</div>
						</div>
					)}
				</div>
			</div>

			{/* Invoice PDF Accordion - Only show in edit mode and if PDF exists */}
			{mode === 'edit' && invoicePdfUrl && (
				<div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
					<button
						type="button"
						onClick={() => setPdfAccordionOpen(!pdfAccordionOpen)}
						className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
					>
						<div className="flex items-center gap-2 text-gray-900 font-medium">
							<FileText size={20} className="text-gray-700" />
							<span>Invoice PDF</span>
						</div>
						<ChevronDown 
							size={20} 
							className={`text-gray-700 transition-transform duration-300 ease-in-out ${pdfAccordionOpen ? 'rotate-180' : ''}`}
						/>
					</button>
					
					<div 
						className={`border-t border-gray-200 bg-gray-50 transition-all duration-300 ease-in-out overflow-hidden ${
							pdfAccordionOpen ? 'max-h-[700px] opacity-100' : 'max-h-0 opacity-0'
						}`}
					>
						<div className="p-6">
							{/* Open in new tab link */}
							<div className="mb-4">
								<a
									href={invoicePdfUrl}
									target="_blank"
									rel="noopener noreferrer"
									className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
								>
									<ExternalLink size={16} />
									Open in New Tab
								</a>
							</div>

							{/* Embedded PDF */}
							<div className="rounded-lg border border-gray-300 overflow-hidden bg-white">
								<object
									data={invoicePdfUrl}
									type="application/pdf"
									width="100%"
									height="600px"
									className="w-full"
								>
									<div className="p-6 text-center">
										<p className="text-gray-600 mb-3">
											Your browser doesn't support embedded PDFs.
										</p>
										<a
											href={invoicePdfUrl}
											target="_blank"
											rel="noopener noreferrer"
											className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 font-medium"
										>
											<ExternalLink size={16} />
											Download the PDF
										</a>
									</div>
								</object>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Action Buttons */}
			<div className="flex flex-col-reverse sm:flex-row justify-end gap-3">
				<button
					type="button"
					onClick={onCancel}
					disabled={submitting}
					className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
				>
					Cancel
				</button>
				{mode === 'edit' && onDelete && (
					<button
						type="button"
						onClick={onDelete}
						disabled={submitting || deleting}
						className="px-6 py-2.5 rounded-lg border border-red-600 bg-red-600 text-white font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{deleting ? 'Deleting…' : 'Delete'}
					</button>
				)}
				<button
					type="submit"
					disabled={submitting || !isEditable}
					className="px-6 py-2.5 rounded-lg bg-gray-900 text-white font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
				>
					{submitting && (
						<div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-white border-r-transparent"></div>
					)}
					{submitting ? 'Saving...' : mode === 'edit' ? 'Update Invoice' : 'Create Invoice'}
				</button>
			</div>
		</form>
	)
}
