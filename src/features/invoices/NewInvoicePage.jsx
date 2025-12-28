import { useNavigate } from 'react-router-dom'
import InvoiceForm from './InvoiceForm'

export default function NewInvoicePage() {
	const navigate = useNavigate()
	
	function handleSave(result) {
		// Navigate to edit page after successful creation
		if (result && result.id) {
			navigate(`/invoices/${result.id}/edit`)
		} else {
		navigate('/invoices')
	}
	}
	
	return (
		<div className="p-4 lg:p-6">
			<h1 className="text-xl font-semibold text-black mb-4">Create Invoice</h1>
			<InvoiceForm
				mode="create"
				onCancel={() => navigate('/invoices')}
				onSave={handleSave}
			/>
		</div>
	)
}


