import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { User, Mail, Phone, CreditCard, Calendar, Plane, PlaneTakeoff, PlaneLanding, Check, AlertCircle, Plus, Trash2, ArrowLeft, Shield } from 'lucide-react'
import { bookFlight, clearBookingState } from '../store/slices/flightSlice'
import { savedCardsAPI, authAPI, paymentAPI } from '../utils/api'
import Container from '../components/common/Container'

const ConfirmBooking = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const dispatch = useDispatch()

    const [flight, setFlight] = useState(location.state?.flight || null)
    const [searchParams, setSearchParams] = useState(location.state?.searchParams || null)
    const [restoringFlightData, setRestoringFlightData] = useState(false)

    const {
        bookingLoading,
        bookingError,
        bookingSuccess
    } = useSelector(state => state.flights)

    const [passengerData, setPassengerData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        dateOfBirth: '',
        passportNumber: '',
        nationality: ''
    })

    const [paymentData, setPaymentData] = useState({
        cardNumber: '',
        expiryDate: '',
        cvv: '',
        cardholderName: ''
    })

    const [validationErrors, setValidationErrors] = useState({})
    const [savedCards, setSavedCards] = useState([])
    const [selectedSavedCard, setSelectedSavedCard] = useState(null)
    const [useNewCard, setUseNewCard] = useState(true)
    const [saveCard, setSaveCard] = useState(false)
    const [cardNickname, setCardNickname] = useState('')
    const [loadingSavedCards, setLoadingSavedCards] = useState(false)
    const [accountPassportNumber, setAccountPassportNumber] = useState('')
    const [useAccountPassport, setUseAccountPassport] = useState(true)
    const [accountDob, setAccountDob] = useState('')
    const [useAccountDob, setUseAccountDob] = useState(true)

    const normalizeAccountCards = (cards = []) => cards.map(card => ({
        _id: card._id,
        cardNumber: card.cardNumber,
        expiryDate: card.expiryDate,
        cardholderName: card.nameOnCard,
        cardType: card.cardType || 'card',
        nickname: card.country ? `${card.country} card` : 'Account card',
        isDefault: card.isDefault,
        source: 'account'
    }))

    const normalizeSavedCards = (cards = []) => cards.map(card => ({
        ...card,
        cardholderName: card.cardholderName || card.nameOnCard || '',
        cardType: card.cardType || 'card',
        source: card.source || 'saved'
    }))

    // Restore flight data if missing (after login redirect)
    useEffect(() => {
        if (!flight || !searchParams) {
            console.log('Flight data missing, attempting to restore from localStorage...')
            setRestoringFlightData(true)

            try {
                const storedSelection = localStorage.getItem('selectedFlightForBooking')
                if (storedSelection) {
                    const { flight: storedFlight, searchParams: storedSearchParams, timestamp } = JSON.parse(storedSelection)
                    // Only restore if data is less than 1 hour old (increased from 30 minutes)
                    if (Date.now() - timestamp < 60 * 60 * 1000) {
                        console.log('Restoring flight data from localStorage')
                        setFlight(storedFlight)
                        setSearchParams(storedSearchParams)
                        setRestoringFlightData(false)
                        return
                    } else {
                        console.log('Stored flight data expired, clearing...')
                        localStorage.removeItem('selectedFlightForBooking')
                    }
                } else {
                    console.log('No stored flight selection found')
                }
            } catch (error) {
                console.error('Error restoring flight data:', error)
                localStorage.removeItem('selectedFlightForBooking')
            }

            setRestoringFlightData(false)
        }
    }, [flight, searchParams])

    // Check if we have flight data, if not redirect (with delay for restoration)
    useEffect(() => {
        if (!flight && !restoringFlightData) {
            const timer = setTimeout(() => {
                if (!flight) {
                    console.log('No flight data available after restoration, redirecting to flights page')
                    navigate('/flights')
                }
            }, 1500) // Give time for restoration to complete

            return () => clearTimeout(timer)
        } else if (flight) {
            // Log all flight data for debugging
            console.log('=== COMPLETE FLIGHT DATA RECEIVED ===')
            console.log('Flight ID:', flight.id)
            console.log('Flight Number:', flight.flightNumber)
            console.log('Airline:', flight.airline, '/', flight.airlineName)
            console.log('Aircraft:', flight.aircraftModel, '/', flight.aircraftCode)
            console.log('Route:', flight.departureAirport, '→', flight.arrivalAirport)
            console.log('Departure Location:', flight.departureLocation)
            console.log('Arrival Location:', flight.arrivalLocation)
            console.log('Stop Locations:', flight.stopLocations)
            console.log('Price Details:', flight.price)
            console.log('Itineraries:', flight.itineraries)
            console.log('Traveler Pricings:', flight.travelerPricings)
            console.log('Validating Airlines:', flight.validatingAirlineCodes)
            console.log('Fare Details by Segment:', flight.fareDetailsBySegment)
            console.log('Additional Metadata:', {
                lastTicketingDate: flight.lastTicketingDate,
                numberOfBookableSeats: flight.numberOfBookableSeats,
                instantTicketingRequired: flight.instantTicketingRequired,
                nonHomogeneous: flight.nonHomogeneous,
                paymentCardRequired: flight.paymentCardRequired,
                oneWay: flight.oneWay
            })
            console.log('Search params received:', searchParams)
            console.log('=== END FLIGHT DATA ===')
        }
    }, [flight, navigate, searchParams, restoringFlightData])

    // State for user ID
    const [userId, setUserId] = useState(null)

    // Load user profile and saved cards on component mount
    useEffect(() => {
        const loadUserDataAndCards = async () => {
            try {
                setLoadingSavedCards(true)
                // Fetch user profile to get userId (same as Account component)
                const profileResponse = await authAPI.getProfile()
                if (profileResponse.success) {
                    const fetchedUserId = profileResponse.user._id || profileResponse.user.id
                    setUserId(fetchedUserId)

                    const profileDob = profileResponse.user.dateOfBirth
                        ? new Date(profileResponse.user.dateOfBirth).toISOString().split('T')[0]
                        : ''

                    // Pre-populate passenger data with user information
                    setPassengerData(prev => ({
                        ...prev,
                        firstName: profileResponse.user.firstName || profileResponse.user.name?.split(' ')[0] || '',
                        lastName: profileResponse.user.lastName || profileResponse.user.name?.split(' ').slice(1).join(' ') || '',
                        email: profileResponse.user.email || '',
                        phone: profileResponse.user.phone || '',
                        passportNumber: profileResponse.user.passportNumber || '',
                        dateOfBirth: profileDob
                    }))

                    const passportValue = profileResponse.user.passportNumber || ''
                    setAccountPassportNumber(passportValue)
                    setUseAccountPassport(!!passportValue)
                    setAccountDob(profileDob)
                    setUseAccountDob(!!profileDob)

                    const [savedCardsResponse, paymentMethodsResponse] = await Promise.allSettled([
                        savedCardsAPI.getSavedCards(fetchedUserId),
                        paymentAPI.getPaymentMethods()
                    ])

                    const savedCardsFromApi = savedCardsResponse.status === 'fulfilled' && savedCardsResponse.value?.success
                        ? savedCardsResponse.value.data
                        : []

                    const accountCards = paymentMethodsResponse.status === 'fulfilled' && paymentMethodsResponse.value?.success
                        ? paymentMethodsResponse.value.payments || []
                        : []

                    const mergedCards = [
                        ...normalizeAccountCards(accountCards),
                        ...normalizeSavedCards(savedCardsFromApi)
                    ]

                    setSavedCards(mergedCards)

                    if (mergedCards.length > 0) {
                        setUseNewCard(false)
                        const defaultCard = mergedCards.find(card => card.isDefault) || mergedCards[0]
                        setSelectedSavedCard(defaultCard)
                    }
                }
            } catch (error) {
                console.error('Error loading user data and cards:', error)
            } finally {
                setLoadingSavedCards(false)
            }
        }

        loadUserDataAndCards()
    }, [])

    // Clear booking state on unmount and cleanup stored flight data
    useEffect(() => {
        return () => {
            dispatch(clearBookingState())
            // Clean up stored flight selection data
            localStorage.removeItem('selectedFlightForBooking')
        }
    }, [dispatch])

    // Clean up stored flight data on successful booking
    useEffect(() => {
        if (bookingSuccess) {
            localStorage.removeItem('selectedFlightForBooking')
        }
    }, [bookingSuccess])

    const validateForm = () => {
        const errors = {}

        // Flight data validation
        if (!flight) {
            errors.flight = 'Flight data is missing'
            return false
        }

        // Check required flight fields
        const requiredFlightFields = ['flightNumber', 'airline', 'departureAirport', 'arrivalAirport', 'departureTime', 'arrivalTime', 'price']
        for (const field of requiredFlightFields) {
            if (!flight[field]) {
                errors.flight = `Missing flight ${field}`
                break
            }
        }

        // Passenger validation
        if (!passengerData.firstName.trim()) errors.firstName = 'First name is required'
        if (!passengerData.lastName.trim()) errors.lastName = 'Last name is required'
        if (!passengerData.email.trim()) errors.email = 'Email is required'
        else if (!/\S+@\S+\.\S+/.test(passengerData.email)) errors.email = 'Email is invalid'
        if (!passengerData.phone.trim()) errors.phone = 'Phone number is required'
        if (!passengerData.dateOfBirth) errors.dateOfBirth = 'Date of birth is required'
        if (!passengerData.passportNumber?.trim()) {
            errors.passportNumber = 'Passport number is required'
        }
        if (!passengerData.nationality?.trim()) {
            errors.nationality = 'Nationality is required'
        }

        // Payment validation
        if (useNewCard) {
            if (!paymentData.cardNumber.trim()) errors.cardNumber = 'Card number is required'
            else if (!/^\d{16}$/.test(paymentData.cardNumber.replace(/\s/g, ''))) errors.cardNumber = 'Card number must be 16 digits'
            if (!paymentData.expiryDate.trim()) errors.expiryDate = 'Expiry date is required'
            else if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(paymentData.expiryDate)) errors.expiryDate = 'Expiry date format: MM/YY'
            if (!paymentData.cvv.trim()) errors.cvv = 'CVV is required'
            else if (!/^\d{3,4}$/.test(paymentData.cvv)) errors.cvv = 'CVV must be 3-4 digits'
            if (!paymentData.cardholderName.trim()) errors.cardholderName = 'Cardholder name is required'
        } else {
            if (!selectedSavedCard) errors.savedCard = 'Please select a saved card'
            if (!paymentData.cvv.trim()) errors.cvv = 'CVV is required for security'
            else if (!/^\d{3,4}$/.test(paymentData.cvv)) errors.cvv = 'CVV must be 3-4 digits'
        }

        setValidationErrors(errors)
        return Object.keys(errors).length === 0
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (validateForm()) {
            let finalPaymentData = paymentData

            // If using saved card, merge saved card data with CVV
            if (!useNewCard && selectedSavedCard) {
                const last4 = selectedSavedCard.cardNumber?.replace(/\D/g, '').slice(-4) || ''
                const paddedCardNumber = `${'0'.repeat(12)}${last4.padStart(4, '0')}`

                finalPaymentData = {
                    cardNumber: paddedCardNumber,
                    expiryDate: selectedSavedCard.expiryDate,
                    cardholderName: selectedSavedCard.cardholderName,
                    cvv: paymentData.cvv,
                    savedCardId: selectedSavedCard._id
                }

                // Update last used timestamp
                try {
                    await savedCardsAPI.updateLastUsed(selectedSavedCard._id)
                } catch (error) {
                    console.error('Error updating last used:', error)
                }
            } else if (useNewCard && saveCard) {
                // Save new card if requested
                try {
                    if (userId) {
                        await savedCardsAPI.saveCard({
                            userId: userId,
                            cardholderName: paymentData.cardholderName,
                            cardNumber: paymentData.cardNumber,
                            expiryDate: paymentData.expiryDate,
                            nickname: cardNickname || null,
                            isDefault: savedCards.length === 0 // Make first card default
                        })
                    }
                } catch (error) {
                    console.error('Error saving card:', error)
                    // Don't block booking if card saving fails
                }
            }

            const bookingPayload = {
                flight,
                passengers: {
                    passenger: passengerData,
                    payment: finalPaymentData
                },
                searchParams,
                userId: userId // Include userId from state (fetched from profile API)
            }

            // Comprehensive flight data validation before sending
            if (!flight) {
                console.error('No flight data provided')
                return
            }

            // Validate essential flight fields
            const requiredFlightFields = ['flightNumber', 'airline', 'departureAirport', 'arrivalAirport', 'departureTime', 'arrivalTime', 'price']
            const missingFields = requiredFlightFields.filter(field => !flight[field])

            if (missingFields.length > 0) {
                console.error('Missing required flight fields:', missingFields)
                console.error('Flight data:', flight)
                return
            }

            if (!flight.price || !flight.price.total) {
                console.error('Invalid flight price data:', flight.price)
                return
            }

            // Validate passenger data
            if (!passengerData.firstName || !passengerData.lastName || !passengerData.email) {
                console.error('Missing required passenger data:', passengerData)
                return
            }

            // Validate search params
            if (!searchParams) {
                console.error('No search parameters provided')
                return
            }

            console.log('=== BOOKING PAYLOAD BEING SENT ===')
            console.log('Complete booking payload:', bookingPayload)
            console.log('Flight data keys:', Object.keys(flight))
            console.log('Flight price structure:', flight.price)
            console.log('Flight itineraries:', flight.itineraries)
            console.log('SearchParams structure:', searchParams)
            console.log('Passenger data:', passengerData)
            console.log('Payment data keys:', Object.keys(finalPaymentData))
            console.log('=== END BOOKING PAYLOAD ===')

            // Verify all critical data is present
            const criticalFields = {
                'flight.id': flight.id,
                'flight.flightNumber': flight.flightNumber,
                'flight.price.total': flight.price?.total,
                'flight.departureAirport': flight.departureAirport,
                'flight.arrivalAirport': flight.arrivalAirport,
                'flight.itineraries': flight.itineraries?.length,
                'searchParams.departure_id': searchParams?.departure_id,
                'passenger.email': passengerData.email
            }

            console.log('Critical fields verification:', criticalFields)
            dispatch(bookFlight(bookingPayload))
        }
    }

    const handleSavedCardSelect = (card) => {
        setSelectedSavedCard(card)
        setPaymentData(prev => ({
            ...prev,
            cvv: '' // Reset CVV when switching cards
        }))
    }

    const handleDeleteSavedCard = async (card, e) => {
        e.stopPropagation()
        try {
            if (card.source === 'account') {
                await paymentAPI.deletePaymentMethod(card._id)
            } else {
                await savedCardsAPI.deleteCard(card._id)
            }

            setSavedCards(prev => {
                const updated = prev.filter(item => item._id !== card._id)
                if (selectedSavedCard?._id === card._id) {
                    setSelectedSavedCard(updated[0] || null)
                    if (updated.length === 0) {
                        setUseNewCard(true)
                    }
                }
                return updated
            })
        } catch (error) {
            console.error('Error deleting card:', error)
        }
    }

    const formatCardNumber = (value) => {
        const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
        const matches = v.match(/\d{4,16}/g)
        const match = matches && matches[0] || ''
        const parts = []
        for (let i = 0, len = match.length; i < len; i += 4) {
            parts.push(match.substring(i, i + 4))
        }
        if (parts.length) {
            return parts.join(' ')
        } else {
            return v
        }
    }

    const maskPassport = (value = '') => (value ? `****${value.slice(-4)}` : 'Not provided')

    const handlePassportMode = (useAccount) => {
        setUseAccountPassport(useAccount)
        setPassengerData(prev => ({
            ...prev,
            passportNumber: useAccount ? accountPassportNumber : ''
        }))
        setValidationErrors(prev => {
            const next = { ...prev }
            delete next.passportNumber
            return next
        })
    }

    const handleDobMode = (useAccount) => {
        setUseAccountDob(useAccount)
        setPassengerData(prev => ({
            ...prev,
            dateOfBirth: useAccount ? accountDob : ''
        }))
        setValidationErrors(prev => {
            const next = { ...prev }
            delete next.dateOfBirth
            return next
        })
    }

    // Restoring flight data state
    if (restoringFlightData) {
        return (
            <div className="bg-gray-50 min-h-screen py-16">
                <Container>
                    <div className="max-w-2xl mx-auto">
                        <div className="bg-white rounded-2xl p-8 text-center shadow-xl">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4"></div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-2">Restoring Flight Information</h2>
                            <p className="text-gray-600">
                                Please wait while we restore your selected flight details...
                            </p>
                        </div>
                    </div>
                </Container>
            </div>
        )
    }

    // Success state
    if (bookingSuccess) {
        return (
            <div className="bg-gray-50 min-h-screen py-16">
                <Container>
                    <div className="max-w-2xl mx-auto">
                        <div className="bg-white rounded-2xl p-8 text-center shadow-xl">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Check className="w-8 h-8 text-green-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Confirmed!</h2>
                            <p className="text-gray-600 mb-4">
                                Your flight has been successfully booked. You will receive a confirmation email shortly.
                            </p>
                            <div className="bg-gray-50 rounded-lg p-4 mb-6">
                                <div className="text-sm text-gray-600">Booking Reference</div>
                                <div className="text-lg font-bold text-gray-900">BK{Date.now().toString().slice(-6)}</div>
                            </div>
                            <div className="flex gap-4 justify-center">
                                <button
                                    onClick={() => navigate('/flights')}
                                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold transition-colors"
                                >
                                    Book Another Flight
                                </button>
                                <button
                                    onClick={() => navigate('/account')}
                                    className="bg-teal-500 hover:bg-teal-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                                >
                                    View My Bookings
                                </button>
                            </div>
                        </div>
                    </div>
                </Container>
            </div>
        )
    }

    if (!flight) {
        return null
    }

    const isRoundTrip = searchParams?.return_date && searchParams?.type === 'round_trip'

    return (
        <div className="bg-gray-50 min-h-screen py-16">
            <Container>
                {/* Header with Back Button */}
                <div className="mb-6">
                    <button
                        onClick={() => navigate('/flight-results')}
                        className="flex items-center gap-2 text-teal-600 hover:text-teal-700 font-medium transition-colors mb-4"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Back to Flight Results
                    </button>
                </div>

                <div className="">
                        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                        {/* Header */}
                        <div className="bg-gradient-to-red from-teal-500 to-blue-600 text-white p-4 sm:p-6">
                               <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-black">Confirm Your Booking</h1>
                               <p className="text-teal-700 text-sm sm:text-base">Complete your flight booking details</p>
                        </div>

                        {/* Detailed Flight Information */}
                        <div className="p-4 sm:p-6 bg-gray-50 border-b border-gray-200">
                            {/* Flight Header */}
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-4">
                                    <div className="text-xl font-bold text-gray-900">
                                        {flight.departureAirport} → {flight.arrivalAirport}
                                        {isRoundTrip && (
                                            <span className="text-gray-500 ml-2">
                                                → {flight.departureAirport}
                                            </span>
                                        )}
                                    </div>
                                    <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                                        {flight.flightNumber}
                                    </div>
                                    {isRoundTrip && (
                                        <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                                            Round Trip
                                        </div>
                                    )}
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-bold text-teal-600 flex items-center gap-1">
                                        <span className="text-2xl">৳</span>
                                        {flight.price.total}
                                        <span className="text-lg">{flight.price.currency}</span>
                                    </div>
                                    {flight.price.originalCurrency && flight.price.originalCurrency !== flight.price.currency && (
                                        <div className="text-sm text-gray-500">
                                            (${flight.price.originalTotal} {flight.price.originalCurrency})
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Flight Details Grid */}
                            <div className={`grid grid-cols-1 md:grid-cols-2 ${isRoundTrip ? 'lg:grid-cols-5' : 'lg:grid-cols-4'} gap-4 mb-6`}>
                                <div className="bg-white p-4 rounded-lg shadow-sm">
                                    <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Aircraft</div>
                                    <div className="font-semibold text-gray-900">{flight.aircraftModel}</div>
                                    {flight.aircraftCode && flight.aircraftCode !== flight.aircraftModel && (
                                        <div className="text-xs text-gray-400">({flight.aircraftCode})</div>
                                    )}
                                </div>
                                <div className="bg-white p-4 rounded-lg shadow-sm">
                                    <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Airline</div>
                                    <div className="font-semibold text-gray-900">{flight.airlineName || flight.airline}</div>
                                    {flight.airlineName && flight.airlineName !== flight.airline && (
                                        <div className="text-xs text-gray-400">({flight.airline})</div>
                                    )}
                                </div>
                                <div className="bg-white p-4 rounded-lg shadow-sm">
                                    <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Duration</div>
                                    <div className="font-semibold text-gray-900 flex items-center gap-1">
                                        <Calendar className="w-4 h-4" />
                                        {flight.duration.replace('PT', '').replace('H', 'h ').replace('M', 'm')}
                                    </div>
                                </div>
                                <div className="bg-white p-4 rounded-lg shadow-sm">
                                    <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Stops</div>
                                    <div className="font-semibold text-gray-900">
                                        {flight.stops === 0 ? 'Direct' : `${flight.stops} stop${flight.stops > 1 ? 's' : ''}`}
                                    </div>
                                    {flight.stopLocations && flight.stopLocations.length > 0 && (
                                        <div className="text-xs text-gray-400 mt-1">
                                            via: {flight.stopLocations.map(stop => stop.cityCountry || stop.iataCode).join(', ')}
                                        </div>
                                    )}
                                </div>
                                {isRoundTrip && (
                                    <div className="bg-gradient-to-blue from-green-50 to-blue-50 p-4 rounded-lg border border-green-200">
                                        <div className="text-xs text-green-700 uppercase tracking-wide mb-1">Trip Type</div>
                                        <div className="font-semibold text-green-800 flex items-center gap-1">
                                            <Plane className="w-4 h-4 transform rotate-45" />
                                            Round Trip
                                        </div>
                                        <div className="text-xs text-green-600 mt-1">
                                            {Math.ceil((new Date(searchParams.return_date) - new Date(searchParams.outbound_date)) / (1000 * 60 * 60 * 24))} days
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Detailed Flight Journey */}
                            <div className="space-y-6">
                                {/* Outbound Flight */}
                                <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                                    <div className="flex items-center justify-between mb-4">
                                        <h4 className="text-lg font-semibold text-blue-800 flex items-center gap-2">
                                            <PlaneTakeoff className="w-5 h-5" />
                                            {isRoundTrip ? 'Outbound Flight' : 'Flight Details'}
                                        </h4>
                                        <div className="text-sm text-blue-600 font-medium">
                                            {new Date(flight.departureTime).toLocaleDateString('en-US', {
                                                weekday: 'long',
                                                month: 'long',
                                                day: 'numeric',
                                                year: 'numeric'
                                            })}
                                        </div>
                                    </div>

                                    <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-0">
                                        <div className="text-center flex-1 w-full">
                                            <div className="text-3xl font-bold text-gray-900 mb-2">
                                                {new Date(flight.departureTime).toLocaleTimeString('en-US', {
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </div>
                                            <div className="text-xl font-semibold text-gray-700 mb-2">
                                                {flight.departureAirport}
                                            </div>
                                            {flight.departureLocation && (
                                                <div className="text-sm text-gray-600 font-medium">
                                                    {flight.departureLocation.fullName || flight.departureLocation.name}
                                                </div>
                                            )}
                                            {flight.departureLocation?.cityCountry && (
                                                <div className="text-sm text-gray-500">{flight.departureLocation.cityCountry}</div>
                                            )}
                                            <div className="mt-3 text-xs text-blue-600 bg-blue-100 px-3 py-1 rounded-full inline-block">
                                                Departure
                                            </div>
                                        </div>

                                        <div className="flex-1 mx-0 md:mx-8 w-full">
                                            <div className="relative">
                                                <div className="absolute inset-0 flex items-center">
                                                    <div className="w-full border-t-2 border-blue-400"></div>
                                                </div>
                                                <div className="relative flex justify-center">
                                                    <div className="bg-blue-50 px-6 py-3 rounded-full border-2 border-blue-300">
                                                        <PlaneTakeoff className="w-8 h-8 text-blue-600" />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-center mt-4">
                                                <div className="text-sm font-semibold text-blue-700">
                                                    {flight.airlineName || flight.airline}
                                                </div>
                                                <div className="text-sm text-blue-600 font-medium">
                                                    {flight.flightNumber}
                                                </div>
                                                <div className="text-sm text-gray-600 mt-1">
                                                    {flight.duration.replace('PT', '').replace('H', 'h ').replace('M', 'm')}
                                                </div>
                                                <div className="text-xs text-gray-500 mt-1">
                                                    {flight.aircraftModel}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="text-center flex-1 w-full">
                                            <div className="text-3xl font-bold text-gray-900 mb-2">
                                                {new Date(flight.arrivalTime).toLocaleTimeString('en-US', {
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </div>
                                            <div className="text-xl font-semibold text-gray-700 mb-2">
                                                {flight.arrivalAirport}
                                            </div>
                                            {flight.arrivalLocation && (
                                                <div className="text-sm text-gray-600 font-medium">
                                                    {flight.arrivalLocation.fullName || flight.arrivalLocation.name}
                                                </div>
                                            )}
                                            {flight.arrivalLocation?.cityCountry && (
                                                <div className="text-sm text-gray-500">{flight.arrivalLocation.cityCountry}</div>
                                            )}
                                            <div className="mt-3 text-xs text-blue-600 bg-blue-100 px-3 py-1 rounded-full inline-block">
                                                Arrival
                                            </div>
                                        </div>
                                    </div>

                                    {/* Flight Stats */}
                                    <div className="mt-6 pt-4 border-t border-blue-200">
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                                            <div>
                                                <div className="text-xs text-blue-600 mb-1">Distance</div>
                                                <div className="font-semibold text-gray-900">~{Math.round(Math.random() * 2000 + 500)} km</div>
                                            </div>
                                            <div>
                                                <div className="text-xs text-blue-600 mb-1">Stops</div>
                                                <div className="font-semibold text-gray-900">
                                                    {flight.stops === 0 ? 'Direct' : `${flight.stops} stop${flight.stops > 1 ? 's' : ''}`}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-xs text-blue-600 mb-1">Aircraft</div>
                                                <div className="font-semibold text-gray-900">{flight.aircraftModel}</div>
                                            </div>
                                            <div>
                                                <div className="text-xs text-blue-600 mb-1">Class</div>
                                                <div className="font-semibold text-gray-900">{searchParams?.travel_class || 'Economy'}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Return Flight (for round trip) */}
                                {isRoundTrip && searchParams?.return_date && (
                                    <div className="bg-green-50 rounded-lg p-6 border border-green-200">
                                        <div className="flex items-center justify-between mb-4">
                                            <h4 className="text-lg font-semibold text-green-800 flex items-center gap-2">
                                                <PlaneLanding className="w-5 h-5 [transform:rotateY(180deg)]" />
                                                Return Flight
                                            </h4>
                                            <div className="text-sm text-green-600 font-medium">
                                                {new Date(searchParams.return_date).toLocaleDateString('en-US', {
                                                    weekday: 'long',
                                                    month: 'long',
                                                    day: 'numeric',
                                                    year: 'numeric'
                                                })}
                                            </div>
                                        </div>

                                        <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-0">
                                            <div className="text-center flex-1 w-full">
                                                <div className="text-3xl font-bold text-gray-900 mb-2">
                                                    {new Date(new Date(searchParams.return_date).setHours(10, 30)).toLocaleTimeString('en-US', {
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </div>
                                                <div className="text-xl font-semibold text-gray-700 mb-2">
                                                    {flight.arrivalAirport}
                                                </div>
                                                {flight.arrivalLocation && (
                                                    <div className="text-sm text-gray-600 font-medium">
                                                        {flight.arrivalLocation.fullName || flight.arrivalLocation.name}
                                                    </div>
                                                )}
                                                {flight.arrivalLocation?.cityCountry && (
                                                    <div className="text-sm text-gray-500">{flight.arrivalLocation.cityCountry}</div>
                                                )}
                                                <div className="mt-3 text-xs text-green-600 bg-green-100 px-3 py-1 rounded-full inline-block">
                                                    Departure
                                                </div>
                                            </div>

                                            <div className="flex-1 mx-0 md:mx-8 w-full">
                                                <div className="relative">
                                                    <div className="absolute inset-0 flex items-center">
                                                        <div className="w-full border-t-2 border-green-400"></div>
                                                    </div>
                                                    <div className="relative flex justify-center">
                                                        <div className="bg-green-50 px-6 py-3 rounded-full border-2 border-green-300">
                                                            <PlaneLanding className="w-8 h-8 text-green-600 [transform:rotateY(180deg)]" />
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-center mt-4">
                                                    <div className="text-sm font-semibold text-green-700">
                                                        {flight.airlineName || flight.airline}
                                                    </div>
                                                    <div className="text-sm text-green-600 font-medium">
                                                        {flight.flightNumber.replace(/\d+$/, (match) => String(parseInt(match) + 1))}
                                                    </div>
                                                    <div className="text-sm text-gray-600 mt-1">
                                                        {flight.duration.replace('PT', '').replace('H', 'h ').replace('M', 'm')}
                                                    </div>
                                                    <div className="text-xs text-gray-500 mt-1">
                                                        {flight.aircraftModel}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="text-center flex-1 w-full">
                                                <div className="text-3xl font-bold text-gray-900 mb-2">
                                                    {new Date(new Date(searchParams.return_date).setHours(18, 45)).toLocaleTimeString('en-US', {
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </div>
                                                <div className="text-xl font-semibold text-gray-700 mb-2">
                                                    {flight.departureAirport}
                                                </div>
                                                {flight.departureLocation && (
                                                    <div className="text-sm text-gray-600 font-medium">
                                                        {flight.departureLocation.fullName || flight.departureLocation.name}
                                                    </div>
                                                )}
                                                {flight.departureLocation?.cityCountry && (
                                                    <div className="text-sm text-gray-500">{flight.departureLocation.cityCountry}</div>
                                                )}
                                                <div className="mt-3 text-xs text-green-600 bg-green-100 px-3 py-1 rounded-full inline-block">
                                                    Arrival
                                                </div>
                                            </div>
                                        </div>

                                        {/* Return Flight Stats */}
                                        <div className="mt-6 pt-4 border-t border-green-200">
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                                                <div>
                                                    <div className="text-xs text-green-600 mb-1">Distance</div>
                                                    <div className="font-semibold text-gray-900">~{Math.round(Math.random() * 2000 + 500)} km</div>
                                                </div>
                                                <div>
                                                    <div className="text-xs text-green-600 mb-1">Stops</div>
                                                    <div className="font-semibold text-gray-900">
                                                        {flight.stops === 0 ? 'Direct' : `${flight.stops} stop${flight.stops > 1 ? 's' : ''}`}
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="text-xs text-green-600 mb-1">Aircraft</div>
                                                    <div className="font-semibold text-gray-900">{flight.aircraftModel}</div>
                                                </div>
                                                <div>
                                                    <div className="text-xs text-green-600 mb-1">Class</div>
                                                    <div className="font-semibold text-gray-900">{searchParams?.travel_class || 'Economy'}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Trip Summary for Round Trip */}
                                {isRoundTrip && (
                                    <div className="bg-gradient-to-red from-purple-50 to-indigo-50 rounded-lg p-6 border border-purple-200">
                                        <h4 className="text-lg font-semibold text-purple-800 mb-4 flex items-center gap-2">
                                            <Calendar className="w-5 h-5" />
                                            Complete Journey Summary
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                                            <div>
                                                <div className="text-sm text-purple-600 mb-2">Total Trip Duration</div>
                                                <div className="text-2xl font-bold text-purple-800">
                                                    {Math.ceil((new Date(searchParams.return_date) - new Date(searchParams.outbound_date)) / (1000 * 60 * 60 * 24))} days
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-sm text-purple-600 mb-2">Total Flight Time</div>
                                                <div className="text-2xl font-bold text-purple-800">
                                                    {(parseInt(flight.duration.replace('PT', '').replace('H', '').replace('M', '')) * 2 / 60).toFixed(1)}h
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-sm text-purple-600 mb-2">Total Distance</div>
                                                <div className="text-2xl font-bold text-purple-800">
                                                    ~{Math.round(Math.random() * 4000 + 1000)} km
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Enhanced Price Breakdown */}
                                {flight.price.breakdown && (
                                    <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                                        <h4 className="text-lg font-semibold text-gray-900 mb-4">Detailed Price Breakdown</h4>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                            <div className="text-center">
                                                <div className="text-sm text-gray-500 mb-1">Base Price</div>
                                                <div className="text-lg font-semibold text-gray-900">৳{flight.price.breakdown.basePrice}</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-sm text-gray-500 mb-1">Taxes</div>
                                                <div className="text-lg font-semibold text-gray-900">৳{flight.price.breakdown.taxes}</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-sm text-gray-500 mb-1">Fees</div>
                                                <div className="text-lg font-semibold text-gray-900">৳{flight.price.breakdown.supplierFees}</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-sm text-teal-600 mb-1">Total</div>
                                                <div className="text-xl font-bold text-teal-600">৳{flight.price.total}</div>
                                            </div>
                                        </div>

                                        {flight.price.discount?.hasDiscount && (
                                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <div className="text-green-800 font-semibold text-sm">💰 Special Discount Applied!</div>
                                                        <div className="text-xs text-green-600">
                                                            You save {flight.price.discount.percentage}% on this flight
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-xs text-gray-500 line-through">
                                                            ৳{flight.price.discount.originalPrice}
                                                        </div>
                                                        <div className="text-sm font-bold text-green-600">
                                                            Save ৳{flight.price.discount.savings}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Comprehensive Flight Data Summary */}
                        <div className="p-6 bg-gray-50 border-t border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <Plane className="w-5 h-5 text-teal-500" />
                                Complete Flight Information
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                                {/* Basic Flight Info */}
                                <div className="bg-white p-4 rounded-lg shadow-sm">
                                    <h4 className="font-semibold text-gray-900 mb-2">Flight Details</h4>
                                    <div className="space-y-1 text-sm">
                                        <div><span className="text-gray-600">ID:</span> {flight.id}</div>
                                        <div><span className="text-gray-600">Flight:</span> {flight.flightNumber}</div>
                                        <div><span className="text-gray-600">Airline:</span> {flight.airlineName || flight.airline}</div>
                                        <div><span className="text-gray-600">Aircraft:</span> {flight.aircraftModel}</div>
                                        <div><span className="text-gray-600">Stops:</span> {flight.stops === 0 ? 'Direct' : `${flight.stops} stop(s)`}</div>
                                    </div>
                                </div>

                                {/* Route Information */}
                                <div className="bg-white p-4 rounded-lg shadow-sm">
                                    <h4 className="font-semibold text-gray-900 mb-2">Route Information</h4>
                                    <div className="space-y-1 text-sm">
                                        <div><span className="text-gray-600">From:</span> {flight.departureAirport}</div>
                                        <div><span className="text-gray-600">To:</span> {flight.arrivalAirport}</div>
                                        <div><span className="text-gray-600">Duration:</span> {flight.duration?.replace('PT', '').replace('H', 'h ').replace('M', 'm')}</div>
                                        <div><span className="text-gray-600">Type:</span> {flight.oneWay ? 'One Way' : 'Round Trip'}</div>
                                    </div>
                                </div>

                                {/* Price Information */}
                                <div className="bg-white p-4 rounded-lg shadow-sm">
                                    <h4 className="font-semibold text-gray-900 mb-2">Price Details</h4>
                                    <div className="space-y-1 text-sm">
                                        <div><span className="text-gray-600">Total:</span> ৳{flight.price?.total} {flight.price?.currency}</div>
                                        {flight.price?.originalCurrency && (
                                            <div><span className="text-gray-600">Original:</span> ${flight.price?.originalTotal} {flight.price?.originalCurrency}</div>
                                        )}
                                        {flight.price?.discount?.hasDiscount && (
                                            <div><span className="text-gray-600">Discount:</span> {flight.price.discount.percentage}% (৳{flight.price.discount.savings})</div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Additional Details */}
                            {(flight.stopLocations?.length > 0 || flight.validatingAirlineCodes?.length > 0 || flight.numberOfBookableSeats) && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    {/* Stop Locations */}
                                    {flight.stopLocations?.length > 0 && (
                                        <div className="bg-white p-4 rounded-lg shadow-sm">
                                            <h4 className="font-semibold text-gray-900 mb-2">Layover Locations</h4>
                                            <div className="space-y-1 text-sm">
                                                {flight.stopLocations.map((stop, index) => (
                                                    <div key={index}>
                                                        <span className="text-gray-600">Stop {index + 1}:</span> {stop.name} ({stop.iataCode})
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Additional Metadata */}
                                    <div className="bg-white p-4 rounded-lg shadow-sm">
                                        <h4 className="font-semibold text-gray-900 mb-2">Additional Information</h4>
                                        <div className="space-y-1 text-sm">
                                            {flight.numberOfBookableSeats && (
                                                <div><span className="text-gray-600">Available Seats:</span> {flight.numberOfBookableSeats}</div>
                                            )}
                                            {flight.validatingAirlineCodes?.length > 0 && (
                                                <div><span className="text-gray-600">Validating Airlines:</span> {flight.validatingAirlineCodes.join(', ')}</div>
                                            )}
                                            {flight.lastTicketingDate && (
                                                <div><span className="text-gray-600">Last Ticketing:</span> {new Date(flight.lastTicketingDate).toLocaleDateString()}</div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Itinerary Details */}
                            {flight.itineraries?.length > 0 && (
                                <div className="bg-white p-4 rounded-lg shadow-sm">
                                    <h4 className="font-semibold text-gray-900 mb-2">Itinerary Details</h4>
                                    <div className="text-sm">
                                        <div><span className="text-gray-600">Segments:</span> {flight.itineraries[0]?.segments?.length || 0}</div>
                                        <div><span className="text-gray-600">Total Duration:</span> {flight.itineraries[0]?.duration?.replace('PT', '').replace('H', 'h ').replace('M', 'm')}</div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <form onSubmit={handleSubmit} className="p-6">
                            {/* Error Messages */}
                            {bookingError && (
                                <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                                    <div className="flex items-center gap-2 mb-2">
                                        <AlertCircle className="w-5 h-5" />
                                        <span className="font-semibold">Booking Error</span>
                                    </div>
                                    <div className="text-sm">
                                        {typeof bookingError === 'string' ? bookingError : JSON.stringify(bookingError)}
                                    </div>
                                </div>
                            )}

                            {validationErrors.flight && (
                                <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
                                    <AlertCircle className="w-5 h-5" />
                                    {validationErrors.flight}
                                </div>
                            )}

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Passenger Information */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                        <User className="w-5 h-5" />
                                        Passenger Information
                                    </h3>

                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    First Name *
                                                </label>
                                                <input
                                                    type="text"
                                                    value={passengerData.firstName}
                                                    onChange={(e) => setPassengerData(prev => ({ ...prev, firstName: e.target.value }))}
                                                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${validationErrors.firstName ? 'border-red-300' : 'border-gray-300'
                                                        }`}
                                                    placeholder="John"
                                                />
                                                {validationErrors.firstName && (
                                                    <p className="text-red-500 text-sm mt-1">{validationErrors.firstName}</p>
                                                )}
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Last Name *
                                                </label>
                                                <input
                                                    type="text"
                                                    value={passengerData.lastName}
                                                    onChange={(e) => setPassengerData(prev => ({ ...prev, lastName: e.target.value }))}
                                                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${validationErrors.lastName ? 'border-red-300' : 'border-gray-300'
                                                        }`}
                                                    placeholder="Doe"
                                                />
                                                {validationErrors.lastName && (
                                                    <p className="text-red-500 text-sm mt-1">{validationErrors.lastName}</p>
                                                )}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Email Address *
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="email"
                                                    value={passengerData.email}
                                                    onChange={(e) => setPassengerData(prev => ({ ...prev, email: e.target.value }))}
                                                    className={`w-full px-4 py-3 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${validationErrors.email ? 'border-red-300' : 'border-gray-300'
                                                        }`}
                                                    placeholder="john.doe@example.com"
                                                />
                                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            </div>
                                            {validationErrors.email && (
                                                <p className="text-red-500 text-sm mt-1">{validationErrors.email}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Phone Number *
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="tel"
                                                    value={passengerData.phone}
                                                    onChange={(e) => setPassengerData(prev => ({ ...prev, phone: e.target.value }))}
                                                    className={`w-full px-4 py-3 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${validationErrors.phone ? 'border-red-300' : 'border-gray-300'
                                                        }`}
                                                    placeholder="+1 (555) 123-4567"
                                                />
                                                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            </div>
                                            {validationErrors.phone && (
                                                <p className="text-red-500 text-sm mt-1">{validationErrors.phone}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Date of Birth *
                                            </label>

                                            {accountDob ? (
                                                <>
                                                    <div className="flex gap-2 mb-3">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDobMode(true)}
                                                            className={`flex-1 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${useAccountDob
                                                                ? 'bg-teal-50 border-teal-500 text-teal-700'
                                                                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                                                                }`}
                                                        >
                                                            Use account DOB
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDobMode(false)}
                                                            className={`flex-1 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${!useAccountDob
                                                                ? 'bg-teal-50 border-teal-500 text-teal-700'
                                                                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                                                                }`}
                                                        >
                                                            Use different
                                                        </button>
                                                    </div>

                                                    {useAccountDob ? (
                                                        <div className="px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 flex items-center justify-between">
                                                            <div>
                                                                <p className="text-sm text-gray-600">Using account date of birth</p>
                                                                <p className="font-semibold text-gray-900 mt-1">
                                                                    {new Date(accountDob).toLocaleDateString('en-US', {
                                                                        year: 'numeric', month: 'long', day: 'numeric'
                                                                    })}
                                                                </p>
                                                            </div>
                                                            <span className="text-xs text-gray-500">Saved in Account</span>
                                                        </div>
                                                    ) : (
                                                        <div>
                                                            <input
                                                                type="date"
                                                                value={passengerData.dateOfBirth}
                                                                onChange={(e) => setPassengerData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                                                                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${validationErrors.dateOfBirth ? 'border-red-300' : 'border-gray-300'
                                                                    }`}
                                                            />
                                                            {validationErrors.dateOfBirth && (
                                                                <p className="text-red-500 text-sm mt-1">{validationErrors.dateOfBirth}</p>
                                                            )}
                                                        </div>
                                                    )}
                                                </>
                                            ) : (
                                                <div>
                                                    <input
                                                        type="date"
                                                        value={passengerData.dateOfBirth}
                                                        onChange={(e) => setPassengerData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                                                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${validationErrors.dateOfBirth ? 'border-red-300' : 'border-gray-300'
                                                            }`}
                                                    />
                                                    {validationErrors.dateOfBirth && (
                                                        <p className="text-red-500 text-sm mt-1">{validationErrors.dateOfBirth}</p>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="space-y-3">
                                                <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                                                    <Shield className="w-4 h-4 text-gray-500" />
                                                    Passport Number *
                                                </label>

                                                {accountPassportNumber ? (
                                                    <>
                                                        <div className="flex flex-col sm:flex-row gap-2 mb-3">
                                                            <button
                                                                type="button"
                                                                onClick={() => handlePassportMode(true)}
                                                                className={`flex-1 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${useAccountPassport
                                                                    ? 'bg-teal-50 border-teal-500 text-teal-700'
                                                                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                                                                    }`}
                                                            >
                                                                Use account passport
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => handlePassportMode(false)}
                                                                className={`flex-1 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${!useAccountPassport
                                                                    ? 'bg-teal-50 border-teal-500 text-teal-700'
                                                                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                                                                    }`}
                                                            >
                                                                Use different
                                                            </button>
                                                        </div>

                                                        {useAccountPassport ? (
                                                            <div className="px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 flex items-center justify-between">
                                                                <div>
                                                                    <p className="text-sm text-gray-600">Using account passport</p>
                                                                    <p className="font-semibold text-gray-900 flex items-center gap-2 mt-1">
                                                                        <Shield className="w-4 h-4 text-teal-600" />
                                                                        <span>{maskPassport(accountPassportNumber)}</span>
                                                                    </p>
                                                                </div>
                                                                <span className="text-xs text-gray-500">Saved in Account</span>
                                                            </div>
                                                        ) : (
                                                            <div>
                                                                <input
                                                                    type="text"
                                                                    value={passengerData.passportNumber}
                                                                    onChange={(e) => setPassengerData(prev => ({ ...prev, passportNumber: e.target.value }))}
                                                                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${validationErrors.passportNumber ? 'border-red-300' : 'border-gray-300'
                                                                        }`}
                                                                    placeholder="A12345678"
                                                                />
                                                                {validationErrors.passportNumber && (
                                                                    <p className="text-red-500 text-sm mt-1">{validationErrors.passportNumber}</p>
                                                                )}
                                                            </div>
                                                        )}
                                                    </>
                                                ) : (
                                                    <div>
                                                        <input
                                                            type="text"
                                                            value={passengerData.passportNumber}
                                                            onChange={(e) => setPassengerData(prev => ({ ...prev, passportNumber: e.target.value }))}
                                                            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${validationErrors.passportNumber ? 'border-red-300' : 'border-gray-300'
                                                                }`}
                                                            placeholder="A12345678"
                                                        />
                                                        {validationErrors.passportNumber && (
                                                            <p className="text-red-500 text-sm mt-1">{validationErrors.passportNumber}</p>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Nationality *
                                                </label>
                                                <input
                                                    type="text"
                                                    value={passengerData.nationality}
                                                    onChange={(e) => setPassengerData(prev => ({ ...prev, nationality: e.target.value }))}
                                                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${validationErrors.nationality ? 'border-red-300' : 'border-gray-300'}`}
                                                    placeholder="Bangladesh"
                                                />
                                                {validationErrors.nationality && (
                                                    <p className="text-red-500 text-sm mt-1">{validationErrors.nationality}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Payment Information */}
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                        <CreditCard className="w-5 h-5" />
                                        Payment Information
                                    </h3>

                                    {/* Payment Method Selection */}
                                    {savedCards.length > 0 && (
                                        <div className="mb-6">
                                            <div className="flex gap-4 mb-4">
                                                <button
                                                    type="button"
                                                    onClick={() => setUseNewCard(false)}
                                                    className={`px-4 py-2 rounded-lg border transition-colors ${!useNewCard
                                                        ? 'bg-teal-50 border-teal-500 text-teal-700'
                                                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                                                        }`}
                                                >
                                                    Use Saved Card
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setUseNewCard(true)}
                                                    className={`px-4 py-2 rounded-lg border transition-colors ${useNewCard
                                                        ? 'bg-teal-50 border-teal-500 text-teal-700'
                                                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                                                        }`}
                                                >
                                                    <Plus className="w-4 h-4 inline mr-1" />
                                                    Add New Card
                                                </button>
                                            </div>

                                            {/* Saved Cards List */}
                                            {!useNewCard && (
                                                <div className="space-y-3 mb-4">
                                                    <label className="block text-sm font-medium text-gray-700">
                                                        Select a saved card:
                                                    </label>
                                                    {loadingSavedCards ? (
                                                        <div className="text-center py-4">
                                                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-500 mx-auto"></div>
                                                        </div>
                                                    ) : (
                                                        <div className="space-y-2">
                                                            {savedCards.map((card) => (
                                                                <div
                                                                    key={card._id}
                                                                    onClick={() => handleSavedCardSelect(card)}
                                                                    className={`p-4 border rounded-lg cursor-pointer transition-colors relative ${selectedSavedCard?._id === card._id
                                                                        ? 'border-teal-500 bg-teal-50'
                                                                        : 'border-gray-200 hover:border-gray-300'
                                                                        }`}
                                                                >
                                                                    <div className="flex items-center justify-between">
                                                                        <div className="flex items-center gap-3">
                                                                            <div className={`w-8 h-6 rounded flex items-center justify-center text-xs font-bold text-white ${card.cardType === 'visa' ? 'bg-blue-600' :
                                                                                card.cardType === 'mastercard' ? 'bg-red-600' :
                                                                                    card.cardType === 'amex' ? 'bg-green-600' :
                                                                                        card.cardType === 'discover' ? 'bg-orange-600' :
                                                                                            'bg-gray-600'
                                                                                }`}>
                                                                                {(card.cardType || 'CARD').toUpperCase().slice(0, 4)}
                                                                            </div>
                                                                            <div>
                                                                                <div className="font-medium text-gray-900">
                                                                                    {card.nickname || `${(card.cardType || 'card').toUpperCase()} Card`}
                                                                                </div>
                                                                                <div className="text-sm text-gray-500">
                                                                                    {card.cardNumber} • {card.cardholderName}
                                                                                </div>
                                                                                <div className="text-xs text-gray-400 flex items-center gap-2 flex-wrap">
                                                                                    <span>Expires {card.expiryDate}</span>
                                                                                    {card.isDefault && (
                                                                                        <span className="bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full text-[11px]">
                                                                                            Default
                                                                                        </span>
                                                                                    )}
                                                                                    {card.source === 'account' && (
                                                                                        <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-[11px]">
                                                                                            Account
                                                                                        </span>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                        <button
                                                                            type="button"
                                                                            onClick={(e) => handleDeleteSavedCard(card, e)}
                                                                            className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                                                                            title="Delete card"
                                                                        >
                                                                            <Trash2 className="w-4 h-4" />
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                    {validationErrors.savedCard && (
                                                        <p className="text-red-500 text-sm">{validationErrors.savedCard}</p>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <div className="space-y-4">
                                        {useNewCard && (
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Card Number *
                                                </label>
                                                <input
                                                    type="text"
                                                    value={paymentData.cardNumber}
                                                    onChange={(e) => setPaymentData(prev => ({ ...prev, cardNumber: formatCardNumber(e.target.value) }))}
                                                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${validationErrors.cardNumber ? 'border-red-300' : 'border-gray-300'
                                                        }`}
                                                    placeholder="1234 5678 9012 3456"
                                                    maxLength="19"
                                                />
                                                {validationErrors.cardNumber && (
                                                    <p className="text-red-500 text-sm mt-1">{validationErrors.cardNumber}</p>
                                                )}
                                            </div>
                                        )}

                                        <div className="grid grid-cols-2 gap-4">
                                            {useNewCard && (
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Expiry Date *
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={paymentData.expiryDate}
                                                        onChange={(e) => {
                                                            let value = e.target.value.replace(/\D/g, '')
                                                            if (value.length >= 2) {
                                                                value = value.substring(0, 2) + '/' + value.substring(2, 4)
                                                            }
                                                            setPaymentData(prev => ({ ...prev, expiryDate: value }))
                                                        }}
                                                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${validationErrors.expiryDate ? 'border-red-300' : 'border-gray-300'
                                                            }`}
                                                        placeholder="MM/YY"
                                                        maxLength="5"
                                                    />
                                                    {validationErrors.expiryDate && (
                                                        <p className="text-red-500 text-sm mt-1">{validationErrors.expiryDate}</p>
                                                    )}
                                                </div>
                                            )}
                                            <div className={useNewCard ? '' : 'col-span-2'}>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    CVV *
                                                </label>
                                                <input
                                                    type="text"
                                                    value={paymentData.cvv}
                                                    onChange={(e) => setPaymentData(prev => ({ ...prev, cvv: e.target.value.replace(/\D/g, '') }))}
                                                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${validationErrors.cvv ? 'border-red-300' : 'border-gray-300'
                                                        }`}
                                                    placeholder="123"
                                                    maxLength="4"
                                                />
                                                {validationErrors.cvv && (
                                                    <p className="text-red-500 text-sm mt-1">{validationErrors.cvv}</p>
                                                )}
                                                {!useNewCard && (
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        Enter CVV for security verification
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {useNewCard && (
                                            <>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Cardholder Name *
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={paymentData.cardholderName}
                                                        onChange={(e) => setPaymentData(prev => ({ ...prev, cardholderName: e.target.value }))}
                                                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${validationErrors.cardholderName ? 'border-red-300' : 'border-gray-300'
                                                            }`}
                                                        placeholder="John Doe"
                                                    />
                                                    {validationErrors.cardholderName && (
                                                        <p className="text-red-500 text-sm mt-1">{validationErrors.cardholderName}</p>
                                                    )}
                                                </div>

                                                {/* Save Card Option */}
                                                <div className="bg-gray-50 rounded-lg p-4">
                                                    <div className="flex items-center gap-3 mb-3">
                                                        <input
                                                            type="checkbox"
                                                            id="saveCard"
                                                            checked={saveCard}
                                                            onChange={(e) => setSaveCard(e.target.checked)}
                                                            className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                                                        />
                                                        <label htmlFor="saveCard" className="text-sm font-medium text-gray-700">
                                                            Save this card for future bookings
                                                        </label>
                                                    </div>
                                                    {saveCard && (
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                                Card Nickname (Optional)
                                                            </label>
                                                            <input
                                                                type="text"
                                                                value={cardNickname}
                                                                onChange={(e) => setCardNickname(e.target.value)}
                                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                                                                placeholder="e.g., Personal Card, Work Card"
                                                                maxLength="50"
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            </>
                                        )}

                                        {/* Price Breakdown */}
                                        <div className="bg-gray-50 rounded-lg p-4 mt-6">
                                            <h4 className="font-semibold text-gray-900 mb-3">Price Breakdown</h4>
                                            <div className="space-y-2">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Flight Price</span>
                                                    <span className="font-medium">৳{flight.price.total}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Taxes & Fees</span>
                                                    <span className="font-medium">৳45.00</span>
                                                </div>
                                                <div className="border-t pt-2 flex justify-between font-bold text-lg">
                                                    <span>Total</span>
                                                    <span className="text-teal-600">৳{(parseFloat(flight.price.total) + 45).toFixed(2)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-gray-200">
                                <button
                                    type="button"
                                    onClick={() => navigate('/flight-results')}
                                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Back to Results
                                </button>
                                <button
                                    type="submit"
                                    disabled={bookingLoading}
                                    className="bg-teal-500 hover:bg-teal-600 disabled:bg-gray-400 text-white px-8 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2"
                                >
                                    {bookingLoading ? (
                                        <>
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            <CreditCard className="w-5 h-5" />
                                            Confirm Booking - ৳{(parseFloat(flight.price.total) + 45).toFixed(2)}
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </Container>
        </div>
    )
}

export default ConfirmBooking