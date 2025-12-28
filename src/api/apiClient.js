import axios from 'axios'
import { handleUnauthorized } from './unauthorizedHandler'

const isProd = true;
const API_BASE_URL = isProd ? 'https://backend.aaconsultant.com.pk/api' : 'http://localhost:8000/api'

let inMemoryToken = null

export const authToken = {
	get: () => inMemoryToken,
	set: (token) => { inMemoryToken = token },
}

export const api = axios.create({
	baseURL: API_BASE_URL,
	timeout: 45000,
})

api.interceptors.request.use((config) => {
	const token = authToken.get()
	if (token) {
		config.headers = config.headers || {}
		config.headers.Authorization = `Bearer ${token}`
	}
	return config
})

api.interceptors.response.use(
	(response) => response,
	(error) => {
		const status = error.response?.status
		const detail = error.response?.data?.detail
		if (status === 401 && detail === 'Unauthorized') {
			handleUnauthorized()
		}
		return Promise.reject(error)
	},
)

function normalizeErrorMessage(raw) {
	if (!raw) return null

	// Plain string
	if (typeof raw === 'string') return raw

	// Array of messages, e.g. ["msg1", "msg2"]
	if (Array.isArray(raw)) {
		const first = raw.find(Boolean)
		if (!first) return null
		return typeof first === 'string' ? first : normalizeErrorMessage(first)
	}

	// Object of field errors, e.g. {email: ["msg"]}
	if (typeof raw === 'object') {
		const values = Object.values(raw)
		if (values.length === 0) return null
		return normalizeErrorMessage(values[0])
	}

	return null
}

export function extractApiError(error) {
	if (axios.isAxiosError(error)) {
		const status = error.response?.status
		if (status >= 500) {
			return 'Something went wrong'
		}
		const data = error.response?.data

		const fromDetail = normalizeErrorMessage(data?.detail)
		if (fromDetail) return fromDetail

		const fromMessage = normalizeErrorMessage(data?.message)
		if (fromMessage) return fromMessage

		const fromData = normalizeErrorMessage(data)
		if (fromData) return fromData
	}
	return 'Something went wrong'
}


