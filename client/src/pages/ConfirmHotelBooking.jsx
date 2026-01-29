import { useState, useEffect } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import {
    User, Mail, Phone, CreditCard, Calendar,
    Check, AlertCircle, Plus, Trash2, ArrowLeft,
    Shield, Building, MapPin, Star, Zap, Info, Lock,
    ChevronLeft
} from 'lucide-react'
import { bookHotel, clearHotelBookingState } from '../store/slices/hotelSlice'
import { savedCardsAPI, authAPI, paymentAPI } from '../utils/api'
import Container from '../components/common/Container'
import { countries } from '../data/countries'
import { convertAndFormatToUSD, formatUSD } from '../utils/currency'

const ConfirmHotelBooking = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const dispatch = useDispatch()

    const [hotel, setHotel] = useState(location.state?.hotel || null)
    const [offer, setOffer] = useState(location.state?.offer || null)
    const [restoringHotelData, setRestoringHotelData] = useState(false)

    const {
        bookingLoading,
        bookingError,
        bookingSuccess
    } = useSelector(state => state.hotels)

    const [passengerData, setPassengerData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        dateOfBirth: '',
        passportNumber: '',
        nationality: '',
        address: ''
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
    const [accountNationality, setAccountNationality] = useState('')
    const [useAccountNationality, setUseAccountNationality] = useState(true)
    const [accountFirstName, setAccountFirstName] = useState('')
    const [accountLastName, setAccountLastName] = useState('')
    const [useAccountName, setUseAccountName] = useState(true)
    const [accountAddress, setAccountAddress] = useState('')
    const [useAccountAddress, setUseAccountAddress] = useState(true)
    const [userId, setUserId] = useState(null)

    const normalizeAccountCards = (cards = []) => cards.map(card => ({
        _id: card._id,
        cardNumber: card.cardNumber,
        expiryDate: card.expiryDate,
        cardholderName: card.nameOnCard,
        cardType: card.cardType || 'card',
        nickname: card.country ? `${card.country} card` : 'Account card',
        isDefault: card.isDefault,
        source: 'account',
        last4: card.cardNumber?.replace(/\D/g, '').slice(-4)
    }))

    const normalizeSavedCards = (cards = []) => cards.map(card => ({
        ...card,
        cardholderName: card.cardholderName || card.nameOnCard || '',
        cardType: card.cardType || 'card',
        source: card.source || 'saved',
        last4: card.cardNumber?.replace(/\D/g, '').slice(-4)
    }))

    // Restore hotel data if missing
    useEffect(() => {
        if (!hotel || !offer) {
            setRestoringHotelData(true)
            try {
                const storedSelection = localStorage.getItem('selectedHotelForBooking')
                if (storedSelection) {
                    const parsed = JSON.parse(storedSelection)
                    setHotel(parsed.hotel)
                    setOffer(parsed.offer)
                }
            } catch (error) {
                console.error('Error restoring hotel data:', error)
            }
            setRestoringHotelData(false)
        }
    }, [hotel, offer])

    // Load user profile and saved cards
    useEffect(() => {
        const loadUserDataAndCards = async () => {
            try {
                setLoadingSavedCards(true)
                const profileResponse = await authAPI.getProfile()
                if (profileResponse.success) {
                    const fetchedUserId = profileResponse.user._id || profileResponse.user.id
                    setUserId(fetchedUserId)

                    const profileDob = profileResponse.user.dateOfBirth
                        ? new Date(profileResponse.user.dateOfBirth).toISOString().split('T')[0]
                        : ''

                    const fName = profileResponse.user.firstName || profileResponse.user.name?.split(' ')[0] || ''
                    const lName = profileResponse.user.lastName || profileResponse.user.name?.split(' ').slice(1).join(' ') || ''

                    setPassengerData(prev => ({
                        ...prev,
                        firstName: fName,
                        lastName: lName,
                        email: profileResponse.user.email || '',
                        phone: profileResponse.user.phone || '',
                        passportNumber: profileResponse.user.passportNumber || '',
                        dateOfBirth: profileDob,
                        nationality: profileResponse.user.nationality || '',
                        address: profileResponse.user.address || ''
                    }))

                    setAccountFirstName(fName)
                    setAccountLastName(lName)
                    setUseAccountName(!!(fName || lName))

                    setAccountAddress(profileResponse.user.address || '')
                    setUseAccountAddress(!!profileResponse.user.address)

                    setAccountPassportNumber(profileResponse.user.passportNumber || '')
                    setUseAccountPassport(!!profileResponse.user.passportNumber)
                    setAccountDob(profileDob)
                    setUseAccountDob(!!profileDob)
                    setAccountNationality(profileResponse.user.nationality || '')
                    setUseAccountNationality(!!profileResponse.user.nationality)

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
                console.error('Error loading user data:', error)
            } finally {
                setLoadingSavedCards(false)
            }
        }

        loadUserDataAndCards()
    }, [])

    useEffect(() => {
        return () => {
            dispatch(clearHotelBookingState())
        }
    }, [dispatch])

    const validateForm = () => {
        const errors = {}
        if (!passengerData.firstName.trim()) errors.firstName = 'First name is required'
        if (!passengerData.lastName.trim()) errors.lastName = 'Last name is required'
        if (!passengerData.email.trim()) errors.email = 'Email is required'
        if (!passengerData.phone.trim()) errors.phone = 'Phone number is required'

        if (useNewCard) {
            if (!paymentData.cardNumber.trim()) errors.cardNumber = 'Card number is required'
            if (!paymentData.expiryDate.trim()) errors.expiryDate = 'Expiry date is required'
            if (!paymentData.cvv.trim()) errors.cvv = 'CVV is required'
            if (!paymentData.cardholderName.trim()) errors.cardholderName = 'Cardholder name is required'
        } else {
            if (!selectedSavedCard) errors.savedCard = 'Please select a card'
            if (!paymentData.cvv.trim()) errors.cvv = 'CVV is required'
        }

        setValidationErrors(errors)
        return Object.keys(errors).length === 0
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (validateForm()) {
            const bookingPayload = {
                hotel: {
                    hotelId: hotel.hotelId,
                    name: hotel.name,
                    address: hotel.address,
                    cityCode: hotel.cityCode,
                    latitude: hotel.latitude,
                    longitude: hotel.longitude
                },
                offer: {
                    id: offer.id,
                    checkInDate: offer.checkInDate,
                    checkOutDate: offer.checkOutDate,
                    roomQuantity: offer.roomQuantity || 1,
                    adults: offer.adults,
                    room: offer.room,
                    price: {
                        total: offer.price?.total,
                        currency: offer.price?.currency || 'USD'
                    }
                },
                guest: {
                    firstName: passengerData.firstName,
                    lastName: passengerData.lastName,
                    email: passengerData.email,
                    phone: passengerData.phone,
                    dateOfBirth: passengerData.dateOfBirth,
                    passportNumber: passengerData.passportNumber,
                    nationality: passengerData.nationality
                },
                payment: {
                    cardNumber: useNewCard ? paymentData.cardNumber : (selectedSavedCard?.cardNumber || ''),
                    cardholderName: useNewCard ? paymentData.cardholderName : (selectedSavedCard?.cardholderName || ''),
                    expiryDate: useNewCard ? paymentData.expiryDate : (selectedSavedCard?.expiryDate || ''),
                    transactionId: 'TRANS-' + Date.now()
                },
                totalAmount: Number(offer.price?.total),
                currency: offer.price?.currency || 'USD',
                userId: userId
            }

            dispatch(bookHotel(bookingPayload))
        }
    }

    const handleSavedCardSelect = (card) => {
        setSelectedSavedCard(card)
        setPaymentData(prev => ({ ...prev, cvv: '' }))
    }

    const formatCardNumber = (value) => {
        const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
        const matches = v.match(/\d{4,16}/g)
        const match = matches && matches[0] || ''
        const parts = []
        for (let i = 0, len = match.length; i < len; i += 4) {
            parts.push(match.substring(i, i + 4))
        }
        if (parts.length) return parts.join(' ')
        else return v
    }

    const maskPassport = (value = '') => (value ? `****${value.slice(-4)}` : 'Not provided')

    const handlePassportMode = (useAccount) => {
        setUseAccountPassport(useAccount)
        setPassengerData(prev => ({ ...prev, passportNumber: useAccount ? accountPassportNumber : '' }))
    }

    const handleNameMode = (useAccount) => {
        setUseAccountName(useAccount)
        setPassengerData(prev => ({
            ...prev,
            firstName: useAccount ? accountFirstName : '',
            lastName: useAccount ? accountLastName : ''
        }))
    }

    const handleAddressMode = (useAccount) => {
        setUseAccountAddress(useAccount)
        setPassengerData(prev => ({ ...prev, address: useAccount ? accountAddress : '' }))
    }

    if (restoringHotelData) {
        return (
            <div className="bg-gray-50 min-h-screen py-16">
                <Container>
                    <div className="max-w-2xl mx-auto">
                        <div className="bg-white rounded-2xl p-8 text-center shadow-xl">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4"></div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-2">Restoring Hotel Information</h2>
                            <p className="text-gray-600">Please wait while we restore your selection...</p>
                        </div>
                    </div>
                </Container>
            </div>
        )
    }

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
                            <p className="text-gray-600 mb-4">Your stay at {hotel?.name} has been successfully booked.</p>
                            <div className="bg-gray-50 rounded-lg p-4 mb-6">
                                <div className="text-sm text-gray-600">Booking Reference</div>
                                <div className="text-lg font-bold text-gray-900">HOTEL-{Date.now().toString().slice(-6)}</div>
                            </div>
                            <div className="flex gap-4 justify-center">
                                <button
                                    onClick={() => navigate('/hotels')}
                                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold transition-colors"
                                >
                                    Book Another
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

    if (!hotel || !offer) return null

    const nights = Math.max(1, Math.ceil(Math.abs(new Date(offer.checkOutDate) - new Date(offer.checkInDate)) / (1000 * 60 * 60 * 24)))

    return (
        <div className="bg-gray-50 min-h-screen py-16">
            <Container>
                {/* Header with Back Button */}
                <div className="mb-6">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-teal-600 hover:text-teal-700 font-medium transition-colors mb-4"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Back to Hotel Results
                    </button>
                </div>

                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    {/* Header - EXACT REPLICA OF ConfirmBooking.jsx */}
                    <div className="bg-gradient-to-r from-teal-500 to-blue-600 text-white p-4 sm:p-6">
                        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Confirm Your Stay</h1>
                        <p className="text-white opacity-80 text-sm sm:text-base">Complete your hotel booking details</p>
                    </div>

                    {/* Detailed Hotel Information - EXACT REPLICA STYLE */}
                    <div className="p-4 sm:p-6 bg-gray-50 border-b border-gray-200">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-4">
                                <div className="text-xl font-bold text-gray-900">
                                    {hotel.name}
                                </div>
                                <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                                    {hotel.cityCode}
                                </div>
                                <div className="bg-teal-100 text-teal-800 px-3 py-1 rounded-full text-sm font-medium">
                                    {offer.room?.typeEstimated?.category || 'Standard Room'}
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-2xl font-bold text-teal-600 flex items-center gap-1">
                                    <span className="text-2xl">$</span>
                                    {offer.price.total}
                                    <span className="text-lg">{offer.price.currency}</span>
                                </div>
                                <div className="text-sm text-gray-500">
                                    Total for {nights} nights
                                </div>
                            </div>
                        </div>

                        {/* Hotel Details Grid - EXACT REPLICA STYLE */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                            <div className="bg-white p-4 rounded-lg shadow-sm">
                                <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Check-In</div>
                                <div className="font-semibold text-gray-900">{new Date(offer.checkInDate).toLocaleDateString()}</div>
                            </div>
                            <div className="bg-white p-4 rounded-lg shadow-sm">
                                <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Check-Out</div>
                                <div className="font-semibold text-gray-900">{new Date(offer.checkOutDate).toLocaleDateString()}</div>
                            </div>
                            <div className="bg-white p-4 rounded-lg shadow-sm">
                                <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Duration</div>
                                <div className="font-semibold text-gray-900 flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    {nights} Nights
                                </div>
                            </div>
                            <div className="bg-white p-4 rounded-lg shadow-sm">
                                <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Adults</div>
                                <div className="font-semibold text-gray-900">{offer.adults || 1} Person(s)</div>
                            </div>
                        </div>

                        {/* Stay Summary Section - REPLICATING FLIGHT BOX STYLE */}
                        <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="text-lg font-semibold text-blue-800 flex items-center gap-2">
                                    <Building className="w-5 h-5" />
                                    Property & Room Details
                                </h4>
                                <div className="text-sm text-blue-600 font-medium italic">
                                    {offer.boardType || 'Room Only'}
                                </div>
                            </div>

                            <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-0">
                                <div className="text-center flex-1 w-full">
                                    <div className="p-3 bg-white rounded-xl shadow-sm inline-block mb-3">
                                        <MapPin className="w-8 h-8 text-teal-500" />
                                    </div>
                                    <div className="text-xl font-bold text-gray-900">{hotel.name}</div>
                                    <div className="text-sm text-gray-600 font-medium max-w-xs mx-auto mt-1">
                                        {hotel.address?.lines?.join(', ') || hotel.cityCode}
                                    </div>
                                </div>

                                <div className="flex-1 mx-0 md:mx-8 w-full">
                                    <div className="relative">
                                        <div className="absolute inset-0 flex items-center">
                                            <div className="w-full border-t-2 border-blue-400"></div>
                                        </div>
                                        <div className="relative flex justify-center">
                                            <div className="bg-blue-50 px-6 py-3 rounded-full border-2 border-blue-300">
                                                <Star className="w-8 h-8 text-blue-600 fill-blue-600" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-center mt-4">
                                        <div className="text-sm font-semibold text-blue-700 uppercase tracking-widest">
                                            {offer.room?.typeEstimated?.category || 'Luxury Suite'}
                                        </div>
                                        <div className="text-sm text-gray-600 mt-1">
                                            Bed Type: {offer.room?.typeEstimated?.bedType || 'N/A'} ({offer.room?.typeEstimated?.beds || 1} beds)
                                        </div>
                                    </div>
                                </div>

                                <div className="text-center flex-1 w-full">
                                    <div className="p-3 bg-white rounded-xl shadow-sm inline-block mb-3">
                                        <Calendar className="w-8 h-8 text-teal-500" />
                                    </div>
                                    <div className="text-3xl font-bold text-gray-900 mb-1">{nights}</div>
                                    <div className="text-sm font-black text-gray-400 uppercase tracking-widest">Total Nights</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Booking Form - EXACT REPLICA STYLE */}
                    <form onSubmit={handleSubmit} className="p-6">
                        {bookingError && (
                            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
                                <AlertCircle className="w-5 h-5" />
                                <span className="text-sm font-medium">{bookingError}</span>
                            </div>
                        )}

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Guest Information */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <User className="w-5 h-5" />
                                    Guest Information
                                </h3>

                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="col-span-2 sm:col-span-2 mb-2">
                                            {(accountFirstName && accountLastName) && (
                                                <div className="flex gap-2 mb-3">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleNameMode(true)}
                                                        className={`flex-1 px-3 py-1.5 rounded-lg border text-xs font-bold uppercase tracking-widest transition-colors ${useAccountName ? 'bg-teal-50 border-teal-500 text-teal-700' : 'bg-white border-gray-300 text-gray-700'}`}
                                                    >
                                                        Use Saved Name
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleNameMode(false)}
                                                        className={`flex-1 px-3 py-1.5 rounded-lg border text-xs font-bold uppercase tracking-widest transition-colors ${!useAccountName ? 'bg-teal-50 border-teal-500 text-teal-700' : 'bg-white border-gray-300 text-gray-700'}`}
                                                    >
                                                        Use Different
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
                                            <input
                                                type="text"
                                                value={passengerData.firstName}
                                                readOnly={useAccountName && !!accountFirstName}
                                                onChange={(e) => setPassengerData(prev => ({ ...prev, firstName: e.target.value }))}
                                                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${(useAccountName && accountFirstName) ? 'bg-gray-50' : 'bg-white'} ${validationErrors.firstName ? 'border-red-300' : 'border-gray-300'}`}
                                                placeholder="John"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
                                            <input
                                                type="text"
                                                value={passengerData.lastName}
                                                readOnly={useAccountName && !!accountLastName}
                                                onChange={(e) => setPassengerData(prev => ({ ...prev, lastName: e.target.value }))}
                                                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${(useAccountName && accountLastName) ? 'bg-gray-50' : 'bg-white'} ${validationErrors.lastName ? 'border-red-300' : 'border-gray-300'}`}
                                                placeholder="Doe"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Street Address *</label>
                                        {accountAddress ? (
                                            <>
                                                <div className="flex gap-2 mb-3">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleAddressMode(true)}
                                                        className={`flex-1 px-3 py-1.5 rounded-lg border text-xs font-bold uppercase tracking-widest transition-colors ${useAccountAddress ? 'bg-teal-50 border-teal-500 text-teal-700' : 'bg-white border-gray-300 text-gray-700'}`}
                                                    >
                                                        Use Saved Address
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleAddressMode(false)}
                                                        className={`flex-1 px-3 py-1.5 rounded-lg border text-xs font-bold uppercase tracking-widest transition-colors ${!useAccountAddress ? 'bg-teal-50 border-teal-500 text-teal-700' : 'bg-white border-gray-300 text-gray-700'}`}
                                                    >
                                                        New Address
                                                    </button>
                                                </div>
                                                {useAccountAddress ? (
                                                    <div className="px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 flex items-center justify-between">
                                                        <span className="font-semibold text-gray-900 line-clamp-1">{accountAddress}</span>
                                                        <span className="text-xs text-gray-400">Locked</span>
                                                    </div>
                                                ) : (
                                                    <div className="relative">
                                                        <input
                                                            type="text"
                                                            value={passengerData.address}
                                                            onChange={(e) => setPassengerData(prev => ({ ...prev, address: e.target.value }))}
                                                            className={`w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500`}
                                                            placeholder="123 Travel Lane, Apt 4B"
                                                        />
                                                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    value={passengerData.address}
                                                    onChange={(e) => setPassengerData(prev => ({ ...prev, address: e.target.value }))}
                                                    className={`w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500`}
                                                    placeholder="123 Travel Lane, Apt 4B"
                                                />
                                                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                                        <div className="relative">
                                            <input
                                                type="email"
                                                value={passengerData.email}
                                                onChange={(e) => setPassengerData(prev => ({ ...prev, email: e.target.value }))}
                                                className={`w-full px-4 py-3 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${validationErrors.email ? 'border-red-300' : 'border-gray-300'}`}
                                                placeholder="john.doe@example.com"
                                            />
                                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                                        <div className="relative">
                                            <input
                                                type="tel"
                                                value={passengerData.phone}
                                                onChange={(e) => setPassengerData(prev => ({ ...prev, phone: e.target.value }))}
                                                className={`w-full px-4 py-3 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${validationErrors.phone ? 'border-red-300' : 'border-gray-300'}`}
                                                placeholder="+1 (555) 123-4567"
                                            />
                                            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth *</label>
                                        {accountDob ? (
                                            <>
                                                <div className="flex gap-2 mb-3">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDobMode(true)}
                                                        className={`flex-1 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${useAccountDob ? 'bg-teal-50 border-teal-500 text-teal-700' : 'bg-white border-gray-300 text-gray-700'}`}
                                                    >
                                                        Use Saved
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDobMode(false)}
                                                        className={`flex-1 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${!useAccountDob ? 'bg-teal-50 border-teal-500 text-teal-700' : 'bg-white border-gray-300 text-gray-700'}`}
                                                    >
                                                        Use Different
                                                    </button>
                                                </div>
                                                {useAccountDob ? (
                                                    <div className="px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 flex items-center justify-between">
                                                        <span className="font-semibold text-gray-900">{new Date(accountDob).toLocaleDateString()}</span>
                                                        <span className="text-xs text-gray-400">From Account</span>
                                                    </div>
                                                ) : (
                                                    <input
                                                        type="date"
                                                        value={passengerData.dateOfBirth}
                                                        onChange={(e) => setPassengerData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                                                    />
                                                )}
                                            </>
                                        ) : (
                                            <input
                                                type="date"
                                                value={passengerData.dateOfBirth}
                                                onChange={(e) => setPassengerData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                                            />
                                        )}
                                    </div>

                                    {/* Passport & Nationality - EXACT FLIGHT STYLE */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Passport Number *</label>
                                            {accountPassportNumber ? (
                                                <>
                                                    <div className="flex gap-2 mb-3">
                                                        <button
                                                            type="button"
                                                            onClick={() => handlePassportMode(true)}
                                                            className={`flex-1 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${useAccountPassport ? 'bg-teal-50 border-teal-500 text-teal-700' : 'bg-white border-gray-300 text-gray-700'}`}
                                                        >
                                                            Use Saved
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handlePassportMode(false)}
                                                            className={`flex-1 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${!useAccountPassport ? 'bg-teal-50 border-teal-500 text-teal-700' : 'bg-white border-gray-300 text-gray-700'}`}
                                                        >
                                                            Use Different
                                                        </button>
                                                    </div>
                                                    {useAccountPassport ? (
                                                        <div className="px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 flex items-center justify-between">
                                                            <span className="font-semibold text-gray-900">{maskPassport(accountPassportNumber)}</span>
                                                            <span className="text-xs text-gray-400">From Account</span>
                                                        </div>
                                                    ) : (
                                                        <input
                                                            type="text"
                                                            value={passengerData.passportNumber}
                                                            onChange={(e) => setPassengerData(prev => ({ ...prev, passportNumber: e.target.value }))}
                                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                                                            placeholder="A1234567"
                                                        />
                                                    )}
                                                </>
                                            ) : (
                                                <input
                                                    type="text"
                                                    value={passengerData.passportNumber}
                                                    onChange={(e) => setPassengerData(prev => ({ ...prev, passportNumber: e.target.value }))}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                                                    placeholder="A1234567"
                                                />
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Nationality *</label>
                                            {accountNationality ? (
                                                <>
                                                    <div className="flex gap-2 mb-3">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleNationalityMode(true)}
                                                            className={`flex-1 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${useAccountNationality ? 'bg-teal-50 border-teal-500 text-teal-700' : 'bg-white border-gray-300 text-gray-700'}`}
                                                        >
                                                            Use Saved
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleNationalityMode(false)}
                                                            className={`flex-1 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${!useAccountNationality ? 'bg-teal-50 border-teal-500 text-teal-700' : 'bg-white border-gray-300 text-gray-700'}`}
                                                        >
                                                            Select New
                                                        </button>
                                                    </div>
                                                    {useAccountNationality ? (
                                                        <div className="px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 flex items-center justify-between">
                                                            <span className="font-semibold text-gray-900">{accountNationality}</span>
                                                            <span className="text-xs text-gray-400">From Account</span>
                                                        </div>
                                                    ) : (
                                                        <select
                                                            value={passengerData.nationality}
                                                            onChange={(e) => setPassengerData(prev => ({ ...prev, nationality: e.target.value }))}
                                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                                                        >
                                                            <option value="">Select Nationality</option>
                                                            {countries.sort((a, b) => a.name.localeCompare(b.name)).map((country) => (
                                                                <option key={country.code} value={country.name}>{country.name}</option>
                                                            ))}
                                                        </select>
                                                    )}
                                                </>
                                            ) : (
                                                <select
                                                    value={passengerData.nationality}
                                                    onChange={(e) => setPassengerData(prev => ({ ...prev, nationality: e.target.value }))}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                                                >
                                                    <option value="">Select Nationality</option>
                                                    {countries.sort((a, b) => a.name.localeCompare(b.name)).map((country) => (
                                                        <option key={country.code} value={country.name}>{country.name}</option>
                                                    ))}
                                                </select>
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

                                <div className="space-y-4">
                                    {savedCards.length > 0 && (
                                        <div className="mb-4">
                                            <div className="flex gap-4 mb-4">
                                                <button
                                                    type="button"
                                                    onClick={() => setUseNewCard(false)}
                                                    className={`px-4 py-1.5 rounded-lg border text-sm font-medium transition-colors ${!useNewCard ? 'bg-teal-50 border-teal-500 text-teal-700' : 'bg-white border-gray-300 text-gray-700'}`}
                                                >
                                                    Use Saved
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setUseNewCard(true)}
                                                    className={`px-4 py-1.5 rounded-lg border text-sm font-medium transition-colors ${useNewCard ? 'bg-teal-50 border-teal-500 text-teal-700' : 'bg-white border-gray-300 text-gray-700'}`}
                                                >
                                                    Add New
                                                </button>
                                            </div>

                                            {!useNewCard && (
                                                <div className="space-y-2">
                                                    {savedCards.map(card => (
                                                        <div
                                                            key={card._id}
                                                            onClick={() => handleSavedCardSelect(card)}
                                                            className={`p-3 border rounded-lg cursor-pointer transition-colors ${selectedSavedCard?._id === card._id ? 'border-teal-500 bg-teal-50' : 'border-gray-200 hover:border-gray-300'}`}
                                                        >
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-8 h-5 bg-gray-600 rounded text-[10px] text-white flex items-center justify-center font-bold">
                                                                        {card.cardType.toUpperCase()}
                                                                    </div>
                                                                    <span className="font-medium text-sm">•••• •••• •••• {card.last4}</span>
                                                                </div>
                                                                <Check className={`w-4 h-4 text-teal-500 ${selectedSavedCard?._id === card._id ? 'opacity-100' : 'opacity-0'}`} />
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {useNewCard && (
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Card Number *</label>
                                                <input
                                                    type="text"
                                                    value={paymentData.cardNumber}
                                                    onChange={(e) => setPaymentData(prev => ({ ...prev, cardNumber: formatCardNumber(e.target.value) }))}
                                                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${validationErrors.cardNumber ? 'border-red-300' : 'border-gray-300'}`}
                                                    placeholder="1234 5678 9012 3456"
                                                    maxLength="19"
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">Expiry *</label>
                                                    <input
                                                        type="text"
                                                        value={paymentData.expiryDate}
                                                        onChange={(e) => {
                                                            let v = e.target.value.replace(/\D/g, '')
                                                            if (v.length >= 2) v = v.substring(0, 2) + '/' + v.substring(2, 4)
                                                            setPaymentData(prev => ({ ...prev, expiryDate: v }))
                                                        }}
                                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                                                        placeholder="MM/YY"
                                                        maxLength="5"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">CVV *</label>
                                                    <input
                                                        type="text"
                                                        value={paymentData.cvv}
                                                        onChange={(e) => setPaymentData(prev => ({ ...prev, cvv: e.target.value.replace(/\D/g, '') }))}
                                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                                                        placeholder="123"
                                                        maxLength="4"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Cardholder Name *</label>
                                                <input
                                                    type="text"
                                                    value={paymentData.cardholderName}
                                                    onChange={(e) => setPaymentData(prev => ({ ...prev, cardholderName: e.target.value }))}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                                                    placeholder="John Doe"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {!useNewCard && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">CVV *</label>
                                            <input
                                                type="text"
                                                value={paymentData.cvv}
                                                onChange={(e) => setPaymentData(prev => ({ ...prev, cvv: e.target.value.replace(/\D/g, '') }))}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                                                placeholder="123"
                                                maxLength="4"
                                            />
                                        </div>
                                    )}

                                    {/* Price Summary Box - REPLICATING ConfirmBooking.jsx */}
                                    <div className="bg-gray-50 rounded-lg p-4 mt-6">
                                        <h4 className="font-semibold text-gray-900 mb-3 italic">Price Breakdown</h4>
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600">Base Rate ({nights} nights)</span>
                                                <span className="font-medium">${offer.price.total}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600">Service Fee</span>
                                                <span className="font-medium text-green-600">FREE</span>
                                            </div>
                                            <div className="border-t pt-2 flex justify-between font-bold text-lg">
                                                <span className="text-gray-900">Total</span>
                                                <span className="text-teal-600">${offer.price.total}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons - EXACT REPLICA STYLE */}
                        <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-gray-200">
                            <button
                                type="button"
                                onClick={() => navigate(-1)}
                                className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                            >
                                Back to Results
                            </button>
                            <button
                                type="submit"
                                disabled={bookingLoading}
                                className="bg-teal-500 hover:bg-teal-600 disabled:bg-gray-400 text-white px-8 py-2.5 rounded-lg font-bold transition-all shadow-lg flex items-center gap-2"
                            >
                                {bookingLoading ? 'Processing...' : 'Confirm & Book Now'}
                                {!bookingLoading && <ChevronLeft className="w-4 h-4 rotate-180" />}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Trust Footer - REPLICATING FLIGHT STYLE */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="flex items-center gap-4 text-gray-500 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                        <Shield className="w-8 h-8 text-teal-500" />
                        <div className="text-sm">
                            <p className="font-bold text-gray-900">Secure Payment</p>
                            <p>256-bit SSL encryption</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 text-gray-500 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                        <Check className="w-8 h-8 text-teal-500" />
                        <div className="text-sm">
                            <p className="font-bold text-gray-900">Instant Confirmation</p>
                            <p>Voucher sent to your email</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 text-gray-500 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                        <Info className="w-8 h-8 text-teal-500" />
                        <div className="text-sm">
                            <p className="font-bold text-gray-900">24/7 Support</p>
                            <p>Help with your reservation</p>
                        </div>
                    </div>
                </div>
            </Container>
        </div>
    )
}

export default ConfirmHotelBooking
