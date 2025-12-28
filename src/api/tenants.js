import { api } from './apiClient'

export const tenantsApi = {
	createTenant: (body) => api.post('/tenants', body).then(r => r.data),
	inviteUser: (tenantId, body) => api.post(`/tenants/${tenantId}/invites`, body).then(r => r.data),
	acceptInvitation: (body) => api.post('/tenants/invitations/accept', body).then(r => r.data),
	list: () => api.get('/tenants').then(r => r.data),
	listTenants: () => api.get('/tenants').then(r => r.data),
	getTenant: (tenantId) => api.get(`/tenants/${tenantId}`).then(r => r.data),
	updateTenant: (tenantId, body) => api.put(`/tenants/${tenantId}`, body).then(r => r.data),
	deleteTenant: (tenantId) => api.delete(`/tenants/${tenantId}`).then(r => r.data),
	// Members (users) under a tenant - endpoints to be confirmed server-side
	listMembers: (tenantId) => api.get(`/tenants/${tenantId}/users`).then(r => r.data),
	getMember: (tenantId, userId) => api.get(`/tenants/${tenantId}/users/${userId}`).then(r => r.data),
	createMember: (tenantId, body) => api.post(`/tenants/${tenantId}/users`, body).then(r => r.data),
	updateMember: (tenantId, userId, body) => api.put(`/tenants/${tenantId}/users/${userId}`, body).then(r => r.data),
	deleteMember: (tenantId, userId) => api.delete(`/tenants/${tenantId}/users/${userId}`).then(r => r.data),
}


