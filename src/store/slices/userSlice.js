import { createSlice } from '@reduxjs/toolkit'

const initialState = {
	me: null,
	userType: 'tenant_user',
}

const userSlice = createSlice({
	name: 'user',
	initialState,
	reducers: {
		setUser(state, action) {
			state.me = action.payload
		},
		mergeUser(state, action) {
			state.me = { ...(state.me || {}), ...(action.payload || {}) }
		},
		clearUser(state) {
			state.me = null
			state.userType = 'tenant_user'
		},
	},
	extraReducers: (builder) => {
		builder.addCase('auth/logout/fulfilled', (state) => {
			state.me = null
			state.userType = 'tenant_user'
		})
	},
})

export const { setUser, mergeUser, clearUser } = userSlice.actions
export default userSlice.reducer


