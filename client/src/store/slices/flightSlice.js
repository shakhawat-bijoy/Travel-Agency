import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { flightAPI } from '../../utils/api'

// Currency conversion rate (USD to BDT)
const USD_TO_BDT_RATE = 110 // You can make this dynamic by fetching from a currency API

// Convert USD price to BDT
const convertToBDT = (usdPrice) => {
    const price = parseFloat(usdPrice)
    return (price * USD_TO_BDT_RATE).toFixed(2)
}

// Convert price object to BDT
const convertPriceToBDT = (priceObj) => {
    if (!priceObj) return priceObj

    return {
        ...priceObj,
        total: convertToBDT(priceObj.total),
        base: priceObj.base ? convertToBDT(priceObj.base) : null,
        grandTotal: priceObj.grandTotal ? convertToBDT(priceObj.grandTotal) : priceObj.grandTotal,
        currency: 'BDT',
        originalCurrency: priceObj.currency,
        originalTotal: priceObj.total,
        conversionRate: USD_TO_BDT_RATE,
        breakdown: priceObj.breakdown ? {
            ...priceObj.breakdown,
            basePrice: convertToBDT(priceObj.breakdown.basePrice),
            taxes: convertToBDT(priceObj.breakdown.taxes),
            supplierFees: convertToBDT(priceObj.breakdown.supplierFees),
            otherFees: convertToBDT(priceObj.breakdown.otherFees),
            totalFees: convertToBDT(priceObj.breakdown.totalFees)
        } : null,
        discount: priceObj.discount ? {
            ...priceObj.discount,
            amount: convertToBDT(priceObj.discount.amount),
            savings: convertToBDT(priceObj.discount.savings),
            originalPrice: priceObj.discount.originalPrice ? convertToBDT(priceObj.discount.originalPrice) : null
        } : null,
        perTraveler: priceObj.perTraveler ? priceObj.perTraveler.map(pt => ({
            ...pt,
            price: {
                ...pt.price,
                total: convertToBDT(pt.price.total),
                base: pt.price.base ? convertToBDT(pt.price.base) : null,
                currency: 'BDT'
            }
        })) : []
    }
}

// Async thunk for searching flights
export const searchFlights = createAsyncThunk(
    'flights/searchFlights',
    async (searchParams, { rejectWithValue }) => {
        try {
            const response = await flightAPI.searchFlightsDirect(searchParams)

            if (response.success && response.data.flights) {
                // Convert all flight prices to BDT
                const flightsWithBDT = response.data.flights.map(flight => ({
                    ...flight,
                    price: convertPriceToBDT(flight.price)
                }))

                return {
                    ...response.data,
                    flights: flightsWithBDT
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
        currency: 'BDT',
        conversionRate: USD_TO_BDT_RATE
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

        // Currency actions
        setCurrency: (state, action) => {
            state.currency = action.payload
        },
        setConversionRate: (state, action) => {
            state.conversionRate = action.payload
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
    setCurrency,
    setConversionRate,
    persistSearchResults,
    restoreSearchResults,
    clearPersistedResults
} = flightSlice.actions

export default flightSlice.reducer