import { api } from './apiClient'

export const accountsApi = {
	me: () => api.get('/accounts/me').then(r => r.data),
	updateMe: (body) => api.put('/accounts/me', body).then(r => r.data),
	// Platform admins
	listAdmins: () => api.get('/accounts/admins').then(r => r.data),
	getAdmin: (adminId) => api.get(`/accounts/admins/${adminId}`).then(r => r.data),
	createAdmin: (body) => api.post('/accounts/admins', body).then(r => r.data),
	updateAdmin: (adminId, body) => api.put(`/accounts/admins/${adminId}`, body).then(r => r.data),
	deleteAdmin: (adminId) => api.delete(`/accounts/admins/${adminId}`).then(r => r.data),
}


