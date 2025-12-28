import { createAsyncThunk } from '@reduxjs/toolkit'
import { accountsApi } from '../../api/accounts'
import { setUser } from './userSlice'

export const fetchMeThunk = createAsyncThunk('user/fetchMe', async (_, { dispatch, rejectWithValue }) => {
	try {
		const me = await accountsApi.me()
		dispatch(setUser(me))
		return me
	} catch {
		return rejectWithValue('Failed to load profile')
	}
})


