import { api } from './apiClient'

export const referenceDataApi = {
	// Get all HS Codes
	async getHSCodes() {
		const response = await api.get('/hs_codes')
		return response.data
	},

	// Get a specific HS Code by code value
	async getHSCodeByCode(hsCode) {
		const response = await api.get(`/hs_codes/${hsCode}`)
		return response.data
	},

	// Get HS UOM from FBR API
	async getHsUom({ hs_code, annexure_id }) {
		const response = await api.get('/hs_uom', {
			params: { hs_code, annexure_id },
			timeout: 45000,
		})
		return response.data
	},

	// Get all Provinces
	async getProvinces() {
		const response = await api.get('/provinces')
		return response.data
	},

	// Get all Transaction Types
	async getTransactionTypes() {
		const response = await api.get('/transaction_types')
		return response.data
	},

	// Get rate by date and transaction type id
	async getRate({ date, transTypeId }) {
		const response = await api.get('/rate', {
			params: { date, transTypeId },
			timeout: 45000,
		})
		return response.data
	},

	// Get SRO by rate_id and date
	async getSro({ date, rate_id }) {
		const response = await api.get('/sro', {
			params: { date, rate_id },
			timeout: 45000,
		})
		return response.data
	},

	// Get SRO Item(s) by sro_id and date (YYYY-MM-DD)
	async getSroItem({ date, sro_id }) {
		const response = await api.get('/sro_item', {
			params: { date, sro_id },
			timeout: 45000,
		})
		return response.data
	},
}

