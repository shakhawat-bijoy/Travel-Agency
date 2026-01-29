import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { hotelAPI } from '../../utils/api'

// Async thunk for booking hotels
export const bookHotel = createAsyncThunk(
    'hotels/bookHotel',
    async (bookingData, { rejectWithValue }) => {
        try {
            const response = await hotelAPI.bookHotel(bookingData)
            if (response.success) {
                return response.data
            } else {
                return rejectWithValue(response.message || 'Hotel booking failed')
            }
        } catch (error) {
            return rejectWithValue(error.message || 'Hotel booking failed')
        }
    }
)

const initialState = {
    bookingLoading: false,
    bookingError: null,
    bookingSuccess: false,
    bookingData: null
}

const hotelSlice = createSlice({
    name: 'hotels',
    initialState,
    reducers: {
        clearHotelBookingState: (state) => {
            state.bookingLoading = false
            state.bookingError = null
            state.bookingSuccess = false
            state.bookingData = null
        }
    },
    extraReducers: (builder) => {
        builder
            // Book Hotel
            .addCase(bookHotel.pending, (state) => {
                state.bookingLoading = true
                state.bookingError = null
                state.bookingSuccess = false
            })
            .addCase(bookHotel.fulfilled, (state, action) => {
                state.bookingLoading = false
                state.bookingSuccess = true
                state.bookingData = action.payload
            })
            .addCase(bookHotel.rejected, (state, action) => {
                state.bookingLoading = false
                state.bookingError = action.payload
            })
    }
})

export const { clearHotelBookingState } = hotelSlice.actions
export default hotelSlice.reducer
