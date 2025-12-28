import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { invoicesApi } from '../../api/invoices'
import InvoiceForm from './InvoiceForm'
import toast from 'react-hot-toast'

export default function EditInvoicePage() {
	const navigate = useNavigate()
	const { id } = useParams()
	const [invoice, setInvoice] = useState(null)
	const [loading, setLoading] = useState(true)
	const [deleting, setDeleting] = useState(false)

	useEffect(() => {
		async function loadInvoice() {
			try {
				const data = await invoicesApi.get(id)
				setInvoice(data)
			} catch (err) {
				toast.error('Failed to load invoice')
				console.error(err)
				navigate('/invoices')
			} finally {
				setLoading(false)
			}
		}
		loadInvoice()
	}, [id, navigate])

	const handleDelete = async () => {
		const confirmed = window.confirm('Are you sure you want to permanently delete this invoice? This action cannot be undone.')
		if (!confirmed) return

		setDeleting(true)
		try {
			await invoicesApi.delete(id)
			toast.success('Invoice deleted')
			navigate('/invoices')
		} catch (err) {
			console.error('Failed to delete invoice', err)
			if (err.response?.status === 403) {
				toast.error('You are not authorized to delete this invoice')
			} else {
				toast.error(err.response?.data?.detail || 'Failed to delete invoice')
			}
		} finally {
			setDeleting(false)
		}
	}

	if (loading) {
		return (
			<div className="p-4 lg:p-6">
				<div className="text-center py-12">
					<div className="text-gray-500">Loading invoice...</div>
				</div>
			</div>
		)
	}

	if (!invoice) {
		return null
	}

	// Map API response to form initial values
	const initial = {
		id: invoice.id,
		status: invoice.invoice_status || 'CREATED',
		fbrInvNo: invoice.fbr_invoice_no || '',
		usin: invoice.usin_no || '',
		invType: invoice.inv_type || 'Sale Invoice',
		payMode: invoice.pay_mode || 'Cash',
		invDate: invoice.invoice_date || new Date().toISOString().slice(0, 10),
		cashier: invoice.cashier_name || '',
		notes: invoice.notes || '',
		branch: invoice.branch || '',
		invoiceFileUrl: invoice.invoice_fileurl || '',
		invoiceReferenceNumber: invoice.invoice_reference_number || '',
		// Seller/Customer fields (will be auto-filled by form when customer is selected)
		customerId: invoice.invoice_customer || '',
		scenarioId: invoice.invoice_scenario || '',
		description: invoice.description_seller || '',
		// Buyer fields
		buyerId: (invoice.buyer && invoice.buyer.id) || invoice.buyer_id || '',
		buyerDescription:
			(invoice.buyer && invoice.buyer.business_name) ||
			invoice.buyer_name ||
			invoice.description_buyer ||
			'',
		buyerCnicNtn: (invoice.buyer && invoice.buyer.ntn_cnic) || invoice.cnic_buyer || '',
		buyerProvince: (invoice.buyer && invoice.buyer.province) || invoice.province_buyer || '',
		buyerAddress: (invoice.buyer && invoice.buyer.address) || invoice.address_buyer || '',
		isRegisteredBuyer:
			typeof invoice.is_registered_buyer === 'boolean'
				? invoice.is_registered_buyer
					? 'yes'
					: 'no'
				: '',
		items: invoice.items?.map(item => ({
			productId: item.product || '',
			productCode: item.product_code || item.product_detail?.product_code || '',
			productName: item.product_name || '',
			quantity: String(item.quantity ?? ''),
			rate: String(item.rate ?? ''),
			discount: String(item.discount ?? ''),
			taxPercent: String(item.tax_percentage ?? ''),
			hsCode: item.hs_code || item.product_detail?.hs_code || '',
			hsDescription: item.hs_description || '',
			srNo: item.sro_ser_no != null ? String(item.sro_ser_no) : (item.product_detail?.sro_ser_no != null ? String(item.product_detail.sro_ser_no) : ''),
			sroSchedule: item.sro_description || item.product_detail?.sro_description || '',
			uom: item.uom_description || item.product_detail?.uom_description || '',
			tranType: item.transaction_type || item.product_detail?.transaction_type || '',
			isFixedNotifiedRetailPrice: item.is_fixed_notifed_retail_price ? 'yes' : 'no',
			fixedNotifiedValueOrRetailPrice: String(item.fixed_notified_value_or_retail_price ?? ''),
			salesTaxWithheldAtSource: String(item.sales_tax_withheld_at_source ?? ''),
			extraTax: String(item.extra_tax ?? ''),
			furtherTax: String(item.further_tax ?? ''),
			fedPayable: String(item.fed_payable ?? ''),
			productNotes: String(item.product_notes || ''),
		})) || [],
	}

	return (
		<div className="p-4 lg:p-6">
			<h1 className="text-xl font-semibold text-black mb-4">Edit Invoice</h1>
			<InvoiceForm
				mode="edit"
				initial={initial}
				onCancel={() => navigate('/invoices')}
				onSave={() => navigate('/invoices')}
				onDelete={handleDelete}
				deleting={deleting}
			/>
		</div>
	)
}


