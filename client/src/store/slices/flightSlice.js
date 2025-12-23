import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { flightAPI } from '../../utils/api'

// This app displays prices in USD. Keep API values as-is, but ensure a currency exists.
const normalizePrice = (priceObj) => {
    if (!priceObj) return priceObj
    const currency = String(priceObj.currency || 'USD').toUpperCase()
    return { ...priceObj, currency }
}

// Async thunk for searching flights
export const searchFlights = createAsyncThunk(
    'flights/searchFlights',
    async (searchParams, { rejectWithValue }) => {
        try {
            const response = await flightAPI.searchFlightsDirect(searchParams)

            if (response.success && response.data.flights) {
                const flightsNormalized = response.data.flights.map(flight => ({
                    ...flight,
                    price: normalizePrice(flight.price)
                }))

                return {
                    ...response.data,
                    flights: flightsNormalized
                }
            } else {
                return rejectWithValue(response.message || 'No flights found')
            }
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to search flights')
        }
    }
)

// Async thunk for booking flights
export const bookFlight = createAsyncThunk(
    'flights/bookFlight',
    async (bookingData, { rejectWithValue }) => {
        try {
            const response = await flightAPI.bookFlight(bookingData)

            if (response.success) {
                return response.data
            } else {
                return rejectWithValue(response.message || 'Booking failed')
            }
        } catch (error) {
            return rejectWithValue(error.message || 'Booking failed')
        }
    }
)

const flightSlice = createSlice({
    name: 'flights',
    initialState: {
        // Search state
        searchParams: null,
        searchResults: null,
        searchLoading: false,
        searchError: null,

        // Booking state
        selectedFlight: null,
        bookingLoading: false,
        bookingError: null,
        bookingSuccess: false,
        bookingData: null,

        // UI state
        showBookingModal: false,

        // Currency
        currency: 'USD'
    },
    reducers: {
        // Search actions
        clearSearchResults: (state) => {
            state.searchResults = null
            state.searchError = null
        },
        setSearchParams: (state, action) => {
            state.searchParams = action.payload
        },

        // Flight selection
        selectFlight: (state, action) => {
            state.selectedFlight = action.payload
        },
        clearSelectedFlight: (state) => {
            state.selectedFlight = null
        },

        // Booking modal
        showBookingModal: (state) => {
            state.showBookingModal = true
        },
        hideBookingModal: (state) => {
            state.showBookingModal = false
            state.bookingError = null
            state.bookingSuccess = false
        },

        // Booking actions
        clearBookingState: (state) => {
            state.bookingError = null
            state.bookingSuccess = false
            state.bookingData = null
        },

        // Persistence actions
        persistSearchResults: (state) => {
            if (state.searchResults && state.searchParams) {
                localStorage.setItem('flightSearchResults', JSON.stringify({
                    searchResults: state.searchResults,
                    searchParams: state.searchParams,
                    timestamp: Date.now()
                }))
            }
        },
        restoreSearchResults: (state) => {
            try {
                const stored = localStorage.getItem('flightSearchResults')
                if (stored) {
                    const { searchResults, searchParams, timestamp } = JSON.parse(stored)
                    // Only restore if data is less than 1 hour old (increased from 30 minutes)
                    if (Date.now() - timestamp < 60 * 60 * 1000) {
                        console.log('Restoring flight search results from localStorage')
                        state.searchResults = searchResults
                        state.searchParams = searchParams
                    } else {
                        // Clear expired data
                        console.log('Flight search results expired, clearing...')
                        localStorage.removeItem('flightSearchResults')
                    }
                } else {
                    console.log('No stored flight search results found')
                }
            } catch (error) {
                console.error('Error restoring search results:', error)
                localStorage.removeItem('flightSearchResults')
            }
        },
        clearPersistedResults: () => {
            localStorage.removeItem('flightSearchResults')
        }
    },
    extraReducers: (builder) => {
        builder
            // Search flights
            .addCase(searchFlights.pending, (state) => {
                state.searchLoading = true
                state.searchError = null
            })
            .addCase(searchFlights.fulfilled, (state, action) => {
                state.searchLoading = false
                state.searchResults = action.payload
                state.searchError = null
                // Auto-persist search results
                if (state.searchResults && state.searchParams) {
                    localStorage.setItem('flightSearchResults', JSON.stringify({
                        searchResults: state.searchResults,
                        searchParams: state.searchParams,
                        timestamp: Date.now()
                    }))
                }
            })
            .addCase(searchFlights.rejected, (state, action) => {
                state.searchLoading = false
                state.searchError = action.payload
                state.searchResults = null
            })

            // Book flight
            .addCase(bookFlight.pending, (state) => {
                state.bookingLoading = true
                state.bookingError = null
                state.bookingSuccess = false
            })
            .addCase(bookFlight.fulfilled, (state, action) => {
                state.bookingLoading = false
                state.bookingData = action.payload
                state.bookingSuccess = true
                state.bookingError = null
            })
            .addCase(bookFlight.rejected, (state, action) => {
                state.bookingLoading = false
                state.bookingError = action.payload
                state.bookingSuccess = false
            })
    }
})

export const {
    clearSearchResults,
    setSearchParams,
    selectFlight,
    clearSelectedFlight,
    showBookingModal,
    hideBookingModal,
    clearBookingState,
    persistSearchResults,
    restoreSearchResults,
    clearPersistedResults
} = flightSlice.actions

export default flightSlice.reducer