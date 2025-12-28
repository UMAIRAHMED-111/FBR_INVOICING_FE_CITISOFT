import { api } from './apiClient'

export const productsApi = {
	// List all products
	async listProducts(params = {}) {
		const { data } = await api.get('/products/all', { params })
		return data
	},

	// Get a single product by ID
	async getProduct(id) {
		const { data } = await api.get(`/products/${id}`)
		return data
	},

	// Create a new product
	async createProduct(payload) {
		const { data } = await api.post('/products', payload)
		return data
	},

	// Update an existing product
	async updateProduct(id, payload) {
		const { data } = await api.put(`/products/${id}`, payload)
		return data
	},

	// Delete a product (soft delete by default)
	async deleteProduct(id, hardDelete = false) {
		const { data } = await api.delete(`/products/${id}`, {
			params: { hard_delete: hardDelete }
		})
		return data
	},
}
