import { createSlice } from '@reduxjs/toolkit'

const userSlice = createSlice({
    name: 'user',
    initialState: {
        isAuthenticated: false,
        userInfo: null,
    },
    reducers: {
        setUser: (state, action) => {
            state.isAuthenticated = true
            state.userInfo = action.payload
        },
        clearUser: (state) => {
            state.isAuthenticated = false
            state.userInfo = null
        }
    }
})

export const { setUser, clearUser } = userSlice.actions
export default userSlice.reducer
