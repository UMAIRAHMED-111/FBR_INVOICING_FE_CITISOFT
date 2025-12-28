import { useState } from 'react'
import { X, CheckCircle2, Trash2 } from 'lucide-react'
import { invoicesApi } from '../../api/invoices'
import toast from 'react-hot-toast'

export default function InvoiceViewDialog({ invoice, onClose, onDeleted, onUpdated, onRefresh }) {
	const [isValidating, setIsValidating] = useState(false)
	const [validationResult, setValidationResult] = useState(null)
	const [validationError, setValidationError] = useState(null)
	const [isDeleting, setIsDeleting] = useState(false)
	const [isPosting, setIsPosting] = useState(false)
	const [postResult, setPostResult] = useState(null)
	const [postError, setPostError] = useState(null)
	
	if (!invoice) return null
	
	const handleValidate = async () => {
		setIsValidating(true)
		setValidationResult(null)
		setValidationError(null)
		
		try {
			const result = await invoicesApi.validateInvoice(invoice.id)
			console.log('=== FBR VALIDATION RESULT ===')
			console.log(JSON.stringify(result, null, 2))
			console.log('============================')
			
			// Print debug info
			if (result.debug) {
				console.log('=== FBR REQUEST DEBUG INFO ===')
				console.log('URL:', result.debug.url)
				console.log('Headers:', result.debug.headers)
				console.log('Bearer Token (first 20 chars):', result.debug.bearer_token_preview)
				console.log('Tenant ID:', result.debug.tenant_id)
				console.log('Tenant Name:', result.debug.tenant_name)
				console.log('==============================')
			}
			
			if (result.ok) {
				// Check if validation response shows valid or invalid
				const validationResponse = result.result?.validationResponse
				const isValid = validationResponse?.statusCode === "00" || validationResponse?.status === "Valid"
				
			if (isValid) {
				setValidationResult(result)
				// Update invoice status to VALIDATED
				try {
					await invoicesApi.update(invoice.id, { invoice_status: 'VALIDATED' })
					invoice.invoice_status = 'VALIDATED'
					// Refresh the invoice list to show updated status
					if (onRefresh) {
						onRefresh()
					}
				} catch (updateError) {
					console.error('Failed to update invoice status:', updateError)
				}
			} else {
					// Extract error messages from invoice or item statuses
					let errorMessages = []
					if (validationResponse?.error) {
						errorMessages.push(validationResponse.error)
					}
					if (validationResponse?.invoiceStatuses && validationResponse.invoiceStatuses.length > 0) {
						validationResponse.invoiceStatuses.forEach(item => {
							if (item.error) {
								errorMessages.push(`Item ${item.itemSNo}: ${item.error}`)
							}
						})
					}
					setValidationError(errorMessages.join(' | ') || 'Invoice validation failed')
				}
			} else {
				setValidationError(result.result?.message || 'Validation failed')
			}
		} catch (error) {
			console.error('Validation error:', error)
			setValidationError(error.response?.data?.detail || error.message || 'Failed to validate invoice')
		} finally {
			setIsValidating(false)
		}
	}

	const handleDelete = async () => {
		const confirmed = window.confirm('Are you sure you want to permanently delete this invoice? This action cannot be undone.')
		if (!confirmed) return

		setIsDeleting(true)
		try {
			await invoicesApi.delete(invoice.id)
			toast.success('Invoice deleted')
			onDeleted?.(invoice.id)
			onClose()
		} catch (error) {
			console.error('Delete error:', error)
			if (error.response?.status === 403) {
				toast.error('You are not authorized to delete this invoice')
			} else {
				toast.error(error.response?.data?.detail || 'Failed to delete invoice')
			}
		} finally {
			setIsDeleting(false)
		}
	}

	const handlePost = async () => {
		setIsPosting(true)
		setPostResult(null)
		setPostError(null)
		
		// Update local invoice status to POSTING immediately (no refresh yet)
		invoice.invoice_status = 'POSTING'
		onUpdated?.(invoice)
		
		try {
			const result = await invoicesApi.postInvoice(invoice.id)
			console.log('=== FBR POST RESULT ===')
			console.log(JSON.stringify(result, null, 2))
			console.log('========================')
			
			// Print debug info
			if (result.debug) {
				console.log('=== FBR POST DEBUG INFO ===')
				console.log('URL:', result.debug.url)
				console.log('Headers:', result.debug.headers)
				console.log('Bearer Token (first 20 chars):', result.debug.bearer_token_preview)
				console.log('Seller Tenant ID:', result.debug.seller_tenant_id)
				console.log('Seller Tenant Name:', result.debug.seller_tenant_name)
				console.log('============================')
			}
			
			if (result.ok && result.fbr_invoice_no) {
				setPostResult(result)
				// Update local invoice with the FBR invoice number and status
				invoice.fbr_invoice_no = result.fbr_invoice_no
				invoice.invoice_status = 'POSTED'
				toast.success(`Invoice posted to FBR successfully! FBR Invoice #: ${result.fbr_invoice_no}`)
			} else {
				// Update local invoice status to POSTING_FAILED
				invoice.invoice_status = 'POSTING_FAILED'
				// Extract error messages
				let errorMessages = []
				if (result.result?.error) {
					errorMessages.push(result.result.error)
				}
				if (result.result?.message) {
					errorMessages.push(result.result.message)
				}
				if (result.result?.detail) {
					errorMessages.push(result.result.detail)
				}
				const errorMsg = errorMessages.join(' | ') || 'Failed to post invoice to FBR'
				setPostError(errorMsg)
				toast.error('Failed to post invoice to FBR')
			}
			
			// Refresh the invoice list to show final status (POSTED or POSTING_FAILED)
			if (onRefresh) {
				onRefresh()
			}
		} catch (error) {
			console.error('Post error:', error)
			// Update local invoice status to POSTING_FAILED
			invoice.invoice_status = 'POSTING_FAILED'
			const errorMsg = error.response?.data?.detail || error.message || 'Failed to post invoice to FBR'
			setPostError(errorMsg)
			toast.error('Failed to post invoice to FBR')
			
			// Refresh the invoice list to show POSTING_FAILED status
			if (onRefresh) {
				onRefresh()
			}
		} finally {
			setIsPosting(false)
		}
	}
	
	return (
		<div className="fixed inset-0 z-1000">
			<div className="absolute inset-0 bg-black/40" onClick={onClose} />
			<div className="absolute inset-0 flex items-center justify-center p-4">
				<div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl border border-gray-200 bg-white shadow-xl">
					{/* Header */}
					<div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
						<div>
							<h3 className="text-xl font-semibold text-black">Invoice Details</h3>
							<p className="text-sm text-gray-500 mt-1">
								{invoice.fbr_invoice_no || 'N/A'} • {invoice.usin_no || 'N/A'}
							</p>
						</div>
						<button 
							onClick={onClose} 
							className="h-9 w-9 grid place-items-center rounded-md border border-gray-300 hover:bg-gray-50"
						>
							<X size={18} />
						</button>
					</div>

					<div className="p-6 space-y-6">
						{/* Status Badge */}
					<div className="flex items-center gap-2">
						<span className="text-sm font-medium text-gray-700">Status:</span>
						<span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${
							invoice.invoice_status === 'POSTED' ? 'bg-green-100 text-green-800' :
							invoice.invoice_status === 'CREATED' ? 'bg-blue-100 text-blue-800' :
							invoice.invoice_status === 'VALIDATED' ? 'bg-purple-100 text-purple-800' :
							invoice.invoice_status === 'POSTING' ? 'bg-orange-100 text-orange-800' :
							invoice.invoice_status === 'POSTING_FAILED' ? 'bg-red-100 text-red-800' :
							'bg-yellow-100 text-yellow-800'
						}`}>
							{invoice.invoice_status || 'CREATED'}
						</span>
					</div>

						{/* Invoice Information Card */}
						<div className="bg-gray-50 rounded-xl border border-gray-200 p-5">
							<h4 className="text-sm font-semibold text-gray-900 mb-4">Invoice Information</h4>
							<div className="grid grid-cols-2 gap-4 text-sm">
								<div>
									<div className="text-gray-500 mb-1">FBR Invoice #</div>
									<div className="font-medium text-black">{invoice.fbr_invoice_no || 'N/A'}</div>
								</div>
								<div>
									<div className="text-gray-500 mb-1">USIN #</div>
									<div className="font-medium text-black">{invoice.usin_no || 'N/A'}</div>
								</div>
								<div>
									<div className="text-gray-500 mb-1">Invoice Type</div>
									<div className="font-medium text-black">{invoice.inv_type || 'N/A'}</div>
								</div>
								<div>
									<div className="text-gray-500 mb-1">Invoice Ref #</div>
									<div className="font-medium text-black">{invoice.invoice_reference_number || 'N/A'}</div>
								</div>
								<div>
									<div className="text-gray-500 mb-1">Invoice Date</div>
									<div className="font-medium text-black">
										{invoice.invoice_date ? new Date(invoice.invoice_date).toLocaleDateString('en-US', { 
											year: 'numeric', 
											month: 'short', 
											day: 'numeric' 
										}) : 'N/A'}
									</div>
								</div>
								<div>
									<div className="text-gray-500 mb-1">Created At</div>
									<div className="font-medium text-black">
										{invoice.created_at ? new Date(invoice.created_at).toLocaleDateString('en-US', { 
											year: 'numeric', 
											month: 'short', 
											day: 'numeric' 
										}) : 'N/A'}
									</div>
								</div>
							</div>
						</div>

						{/* Buyer Information Card */}
						<div className="bg-gray-50 rounded-xl border border-gray-200 p-5">
							<h4 className="text-sm font-semibold text-gray-900 mb-4">Buyer Information</h4>
							<div className="grid grid-cols-1 gap-3 text-sm">
								<div>
									<div className="text-gray-500 mb-1">Buyer Name</div>
									<div className="font-medium text-black">
										{(invoice.buyer && (invoice.buyer.business_name || invoice.buyer.name))
											|| invoice.buyer_name
											|| invoice.description_buyer
											|| invoice.buyer_description
											|| 'N/A'}
									</div>
								</div>
							</div>
						</div>

						{/* Products Card */}
						{invoice.product_names && invoice.product_names.length > 0 && (
							<div className="bg-gray-50 rounded-xl border border-gray-200 p-5">
								<h4 className="text-sm font-semibold text-gray-900 mb-4">Products</h4>
								<div className="space-y-2">
									{invoice.product_names.map((product, idx) => (
										<div key={idx} className="flex items-center gap-2 text-sm">
											<span className="w-6 h-6 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center text-xs font-medium">
												{idx + 1}
											</span>
											<span className="text-black">{product}</span>
										</div>
									))}
								</div>
							</div>
						)}

						{/* Amount Card */}
						<div className="bg-linear-to-br from-gray-900 to-gray-800 rounded-xl p-5 text-white">
							<div className="text-sm opacity-90 mb-2">Total Amount</div>
							<div className="text-3xl font-bold">
								{invoice.final_amount != null 
									? `PKR ${Number(invoice.final_amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
									: 'PKR 0.00'
								}
							</div>
						</div>
					</div>

					{/* Validation Result */}
					{validationResult && (
						<div className="px-6 pb-4">
							<div className="bg-green-50 border border-green-200 rounded-xl p-4">
								<div className="flex items-center gap-2 text-green-800 font-medium mb-2">
									<CheckCircle2 size={20} />
									<span>Validation Successful</span>
								</div>
								<p className="text-sm text-green-700">Invoice data has been validated with FBR successfully.</p>
							</div>
						</div>
					)}
					
					{validationError && (
						<div className="px-6 pb-4">
							<div className="bg-red-50 border border-red-200 rounded-xl p-4">
								<div className="text-red-800 font-medium mb-1">Validation Failed</div>
								<p className="text-sm text-red-700">{validationError}</p>
							</div>
						</div>
					)}

					{/* Post Result */}
					{postResult && (
						<div className="px-6 pb-4">
							<div className="bg-green-50 border border-green-200 rounded-xl p-4">
								<div className="flex items-center gap-2 text-green-800 font-medium mb-2">
									<CheckCircle2 size={20} />
									<span>Posted to FBR Successfully</span>
								</div>
								<p className="text-sm text-green-700">FBR Invoice #: <span className="font-semibold">{postResult.fbr_invoice_no}</span></p>
							</div>
						</div>
					)}
					
					{postError && (
						<div className="px-6 pb-4">
							<div className="bg-red-50 border border-red-200 rounded-xl p-4">
								<div className="text-red-800 font-medium mb-1">Post Failed</div>
								<p className="text-sm text-red-700">{postError}</p>
							</div>
						</div>
					)}

					{/* Footer */}
					<div className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex justify-end items-center gap-2">
						<button 
							onClick={handleValidate}
							disabled={isValidating || isDeleting || isPosting || invoice.invoice_status !== 'CREATED'}
							className="rounded-xl border border-blue-600 bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
						>
							{isValidating ? (
								<>
									<div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
									Validating...
								</>
							) : (
								'Validate'
							)}
						</button>
						{/* POST BUTTON - Uncomment when ready to enable posting to FBR*/}	
						<button 
							onClick={handlePost}
							disabled={isValidating || isDeleting || isPosting || invoice.invoice_status !== 'VALIDATED'}
							className="rounded-xl border border-green-600 bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
						>
							{isPosting ? (
								<>
									<div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
									Posting...
								</>
							) : (
								'Post to FBR'
							)}
						</button>
						
						<button
							onClick={handleDelete}
							disabled={isDeleting}
							className="rounded-xl border border-red-600 bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
						>
							{isDeleting ? (
								<>
									<div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
									Deleting...
								</>
							) : (
								<>
									<Trash2 size={16} />
									Delete
								</>
							)}
						</button>
						<button 
							onClick={onClose} 
							className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium hover:bg-gray-50"
						>
							Close
						</button>
					</div>
				</div>
			</div>
		</div>
	)
}


