import { configureStore } from '@reduxjs/toolkit'
import flightSlice from './slices/flightSlice'
import hotelSlice from './slices/hotelSlice'

export const store = configureStore({
    reducer: {
        flights: flightSlice,
        hotels: hotelSlice
    },
})

export default store