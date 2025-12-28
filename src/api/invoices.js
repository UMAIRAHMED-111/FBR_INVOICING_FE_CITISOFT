import { api } from './apiClient'

export const invoicesApi = {
	// List all invoices
	async list(params = {}) {
		const { data } = await api.get('/invoices', { params })
		return data
	},

	// Get single invoice
	async get(id) {
		const { data } = await api.get(`/invoices/${id}`)
		// Print the raw response
		console.log('=== INVOICE API RESPONSE ===');
		console.log(JSON.stringify(data, null, 2));
		console.log('============================');
		return data
	},

	// Create invoice
	async create(payload) {
		const { data } = await api.post('/invoices', payload)
		return data
	},

	// Update/patch invoice
	async update(id, payload) {
		const { data } = await api.patch(`/invoices/${id}`, payload)
		return data
	},

	// Hard delete invoice
	async delete(id) {
		const { data } = await api.delete(`/invoices/${id}`)
		return data
	},

	// Expanded list for dashboard
	async listExpanded(params = {}, signal) {
		const { data } = await api.get('/invoices/expanded', { params, signal })
		return data
	},

	// Buyers
	async listBuyers(params = {}) {
		const { data } = await api.get('/invoices/buyers', { params })
		return data
	},
	async getBuyer(id) {
		const { data } = await api.get(`/invoices/buyers/${id}`)
		return data
	},
	async createBuyer(payload) {
		const { data } = await api.post('/invoices/buyers', payload)
		return data
	},
	async updateBuyer(id, payload) {
		const { data } = await api.patch(`/invoices/buyers/${id}`, payload)
		return data
	},
	async deleteBuyer(id) {
		const { data } = await api.delete(`/invoices/buyers/${id}`)
		return data
	},

	// List scenarios
	async listScenarios() {
		const { data } = await api.get('/invoices/scenarios')
		return data
	},

	// Validate invoice with FBR
	async validateInvoice(id) {
		const { data } = await api.post(`/invoices/${id}/validate`, {})
		return data
	},

	// Post invoice to FBR (actual submission)
	async postInvoice(id) {
		const { data } = await api.post(`/invoices/${id}/post`, {})
		return data
	},
}

