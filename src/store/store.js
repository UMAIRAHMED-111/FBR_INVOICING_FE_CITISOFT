import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import userReducer from './slices/userSlice'
import tenantReducer from './slices/tenantSlice'
import { setUnauthorizedHandler } from '../api/unauthorizedHandler'
import { logoutThunk } from './slices/authSlice'

export const store = configureStore({
	reducer: {
		auth: authReducer,
		user: userReducer,
		tenant: tenantReducer,
	},
})

setUnauthorizedHandler(() => {
	store.dispatch(logoutThunk())
})


