import { createSlice } from '@reduxjs/toolkit'

const initialState = {
	id: null,
	details: null,
	status: 'idle',
	error: null,
}

const tenantSlice = createSlice({
	name: 'tenant',
	initialState,
	reducers: {
		setTenantId(state, action) {
			state.id = action.payload || null
			if (state.details?.id !== state.id) state.details = null
		},
		setTenantDetails(state, action) {
			state.details = action.payload
		},
		clearTenant(state) {
			state.id = null
			state.details = null
			state.status = 'idle'
			state.error = null
		},
	},
	extraReducers: (builder) => {
		builder.addCase('auth/loginVerify/fulfilled', (state, action) => {
			state.id = action.payload?.tenantId || null
		})
		builder.addCase('auth/bootstrapSession/fulfilled', (state, action) => {
			state.id = action.payload?.tenantId || null
		})
		builder.addCase('auth/logout/fulfilled', (state) => {
			state.id = null
			state.details = null
			state.status = 'idle'
			state.error = null
		})
	},
})

export const { setTenantId, setTenantDetails, clearTenant } = tenantSlice.actions
export default tenantSlice.reducer


