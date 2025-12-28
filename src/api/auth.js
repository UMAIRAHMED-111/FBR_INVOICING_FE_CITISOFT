import { api } from './apiClient'

export const authApi = {
	login: (body) => api.post('/authn/login', body).then(r => r.data),
	loginVerify: (body) => api.post('/authn/login/verify', body).then(r => r.data),
	requestPasswordReset: (body) => api.post('/authn/password/reset/request', body).then(r => r.data),
	confirmPasswordReset: (body) => api.post('/authn/password/reset/confirm', body).then(r => r.data),
}


