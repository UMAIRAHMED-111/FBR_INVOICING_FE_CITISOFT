import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { jwtDecode } from 'jwt-decode'
import { authToken, extractApiError } from '../../api/apiClient'
import { authApi } from '../../api/auth'
import { accountsApi } from '../../api/accounts'
import { setUser, clearUser } from './userSlice'
import { setTenantId, clearTenant } from './tenantSlice'

function saveToken(token) {
    authToken.set(token)
    if (token) {
        sessionStorage.setItem('authToken', token)
        // localStorage.setItem('fbr_token', "cc6a2537-8cfa-300a-a1d8-4cf84310cdb4")
    }
    else {
        sessionStorage.removeItem('authToken')
        // localStorage.removeItem('fbr_token')
    }
}

const initialState = {
	token: null,
	tenantId: null,
	status: 'idle',
	error: null,
	otpRequired: false,
	pendingEmail: null,
}

let logoutTimer = null

function clearLogoutTimer() {
	if (logoutTimer) {
		clearTimeout(logoutTimer)
		logoutTimer = null
	}
}

export const bootstrapSession = createAsyncThunk('auth/bootstrapSession', async (_, { dispatch, rejectWithValue }) => {
	const persisted = sessionStorage.getItem('authToken')
	if (!persisted) return null
	try {
		authToken.set(persisted)
		const claims = jwtDecode(persisted)
		const me = await accountsApi.me()
		dispatch(setUser(me))
		dispatch(setTenantId(claims?.tid || null))
		scheduleTokenExpiry(dispatch, claims?.exp || null)
		return { token: persisted, tenantId: claims?.tid || null }
	} catch {
		saveToken(null)
		dispatch(clearUser())
		dispatch(clearTenant())
		clearLogoutTimer()
		return rejectWithValue('Session expired')
	}
})

export const loginPasswordThunk = createAsyncThunk(
	'auth/loginPassword',
	async ({ email, password }, { dispatch, rejectWithValue }) => {
	try {
		const res = await authApi.login({ email, password })
		if (!res.otp_required && res.token) {
			const claims = jwtDecode(res.token)
			saveToken(res.token)
			const me = await accountsApi.me()
			dispatch(setUser(me))
			dispatch(setTenantId(claims?.tid || null))
			scheduleTokenExpiry(dispatch, claims?.exp || null)
		}
		return { ...res, email }
		} catch (error) {
			// Surface backend-provided authentication/payment errors
			// e.g. membership inactive, tenant inactive, payment overdue, etc.
			const message = extractApiError(error)
			return rejectWithValue(message || 'Invalid email or password')
	}
	},
)

export const loginVerifyThunk = createAsyncThunk(
	'auth/loginVerify',
	async ({ email, code }, { dispatch, rejectWithValue }) => {
	try {
		const { token } = await authApi.loginVerify({ email, code })
		const claims = jwtDecode(token)
		saveToken(token)
		const me = await accountsApi.me()
		dispatch(setUser(me))
		dispatch(setTenantId(claims?.tid || null))
			scheduleTokenExpiry(dispatch, claims?.exp || null)
		return { token, tenantId: claims?.tid || null }
		} catch (error) {
			// Surface same backend payment/membership/tenant errors during OTP verification
			const message = extractApiError(error)
			return rejectWithValue(message || 'Invalid code')
	}
	},
)

export const logoutThunk = createAsyncThunk('auth/logout', async (_, { dispatch }) => {
	clearLogoutTimer()
	saveToken(null)
	dispatch(clearUser())
	dispatch(clearTenant())
	return true
})

function scheduleTokenExpiry(dispatch, exp) {
	clearLogoutTimer()
	if (!exp) return
	const delay = exp * 1000 - Date.now()
	if (delay <= 0) {
		dispatch(logoutThunk())
		return
	}
	logoutTimer = setTimeout(() => {
		dispatch(logoutThunk())
	}, delay)
}

const authSlice = createSlice({
	name: 'auth',
	initialState,
	reducers: {
		clearAuthError(state) { state.error = null },
		clearOtp(state) { state.otpRequired = false; state.pendingEmail = null },
	},
	extraReducers: (builder) => {
		builder
			.addCase(bootstrapSession.fulfilled, (state, action) => {
				if (!action.payload) return
				state.token = action.payload.token
				state.tenantId = action.payload.tenantId
				state.status = 'authenticated'
			})
			.addCase(bootstrapSession.rejected, (state) => {
				state.token = null
				state.tenantId = null
				state.status = 'idle'
			})
			.addCase(loginPasswordThunk.pending, (state) => { state.status = 'loading'; state.error = null; state.otpRequired = false; state.pendingEmail = null })
			.addCase(loginPasswordThunk.fulfilled, (state, action) => {
				state.status = 'idle'
				const res = action.payload || {}
				state.otpRequired = !!res.otp_required
				state.pendingEmail = res.email || null
				if (!state.otpRequired && res.token) {
					state.token = res.token
					const claims = jwtDecode(res.token)
					state.tenantId = claims?.tid || null
					state.status = 'authenticated'
				}
			})
			.addCase(loginPasswordThunk.rejected, (state, action) => {
				state.status = 'idle'
				state.error = action.payload || 'Login failed'
			})
			.addCase(loginVerifyThunk.pending, (state) => { state.status = 'loading'; state.error = null })
			.addCase(loginVerifyThunk.fulfilled, (state, action) => {
				state.status = 'authenticated'
				state.token = action.payload.token
				state.tenantId = action.payload.tenantId
				state.otpRequired = false
				state.pendingEmail = null
			})
			.addCase(loginVerifyThunk.rejected, (state, action) => {
				state.status = 'idle'
				state.error = action.payload || 'Verification failed'
			})
			.addCase(logoutThunk.fulfilled, (state) => {
				state.token = null
				state.tenantId = null
				state.status = 'idle'
				state.otpRequired = false
				state.pendingEmail = null
				state.error = null
			})
	},
})

export const { clearAuthError, clearOtp } = authSlice.actions
export default authSlice.reducer


