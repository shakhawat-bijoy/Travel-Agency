import { configureStore } from '@reduxjs/toolkit'
import flightSlice from './slices/flightSlice'

export const store = configureStore({
    reducer: {
        flights: flightSlice,
    },
})

export default store