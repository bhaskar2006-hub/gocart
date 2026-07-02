import { createSlice } from '@reduxjs/toolkit'

const addressSlice = createSlice({
    name: 'address',
    initialState: {
        list: [],
    },
    reducers: {
        addAddress: (state, action) => {
            state.list.push(action.payload)
        },
        setAddress: (state, action) => {
            state.list = action.payload
        }
    }
})

export const { addAddress, setAddress } = addressSlice.actions

export default addressSlice.reducer