import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { User, Mail, Phone, CreditCard, Calendar, Check, AlertCircle, ArrowLeft, MapPin, Users } from 'lucide-react'
import { savedCardsAPI, authAPI, packageAPI, paymentAPI } from '../utils/api'
import Container from '../components/common/Container'
import { FaStar, FaClock } from 'react-icons/fa'

// Masks passport numbers, keeping last 4 visible
const maskPassport = (passport = '') => {
    if (!passport) return ''
    const visible = passport.slice(-4)
    const masked = '*'.repeat(Math.max(0, passport.length - 4))
    return `${masked}${visible}`
}

const ConfirmPackageBooking = () => {
    const navigate = useNavigate()
    const location = useLocation()

    const [packageData, setPackageData] = useState(location.state?.package || null)
    const [selectedDate, setSelectedDate] = useState(location.state?.date || '')
    const [travelers, setTravelers] = useState(location.state?.travelers || 1)
    const [totalPrice, setTotalPrice] = useState(location.state?.totalPrice || 0)
    const [restoringPackageData, setRestoringPackageData] = useState(false)

    const [bookingLoading, setBookingLoading] = useState(false)
    const [bookingError, setBookingError] = useState(null)
    const [bookingSuccess, setBookingSuccess] = useState(false)

    // Traveler details for each person
    const [travelersData, setTravelersData] = useState([
        {
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            dateOfBirth: '',
            passportNumber: '',
            nationality: ''
        }
    ])

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
    const [userId, setUserId] = useState(null)
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

    // Restore package data if missing (after login redirect)
    useEffect(() => {
        if (!packageData || !selectedDate) {
            console.log('Package data missing, attempting to restore from localStorage...')
            setRestoringPackageData(true)

            try {
                const storedSelection = localStorage.getItem('selectedPackageForBooking')
                if (storedSelection) {
                    const { package: storedPackage, date, travelers: storedTravelers, totalPrice: storedTotal, timestamp } = JSON.parse(storedSelection)
                    // Only restore if data is less than 1 hour old
                    if (Date.now() - timestamp < 60 * 60 * 1000) {
                        console.log('Restoring package data from localStorage')
                        setPackageData(storedPackage)
                        setSelectedDate(date)
                        setTravelers(storedTravelers)
                        setTotalPrice(storedTotal)
                        setRestoringPackageData(false)
                        return
                    } else {
                        console.log('Stored package data expired, clearing...')
                        localStorage.removeItem('selectedPackageForBooking')
                    }
                } else {
                    console.log('No stored package selection found')
                }
            } catch (error) {
                console.error('Error restoring package data:', error)
                localStorage.removeItem('selectedPackageForBooking')
            }

            setRestoringPackageData(false)
        }
    }, [packageData, selectedDate])

    // Check if we have package data, if not redirect
    useEffect(() => {
        if (!packageData && !restoringPackageData) {
            const timer = setTimeout(() => {
                if (!packageData) {
                    console.log('No package data available after restoration, redirecting to home')
                    navigate('/')
                }
            }, 1500)

            return () => clearTimeout(timer)
        }
    }, [packageData, navigate, restoringPackageData])

    // Update travelers data array when count changes
    useEffect(() => {
        if (travelers > travelersData.length) {
            const additionalTravelers = Array(travelers - travelersData.length).fill({
                firstName: '',
                lastName: '',
                email: '',
                phone: '',
                dateOfBirth: '',
                passportNumber: '',
                nationality: ''
            })
            setTravelersData([...travelersData, ...additionalTravelers])
        } else if (travelers < travelersData.length) {
            setTravelersData(travelersData.slice(0, travelers))
        }
    }, [travelers])

    // Keep lead traveler in sync with account passport/DOB when using account values
    useEffect(() => {
        if (useAccountPassport) {
            setTravelersData(prev => {
                const updated = [...prev]
                updated[0] = { ...updated[0], passportNumber: accountPassportNumber }
                return updated
            })
        }
    }, [accountPassportNumber, useAccountPassport])

    useEffect(() => {
        if (useAccountDob) {
            setTravelersData(prev => {
                const updated = [...prev]
                updated[0] = { ...updated[0], dateOfBirth: accountDob }
                return updated
            })
        }
    }, [accountDob, useAccountDob])

    // Load user profile and saved cards on component mount
    useEffect(() => {
        const loadUserDataAndCards = async () => {
            try {
                setLoadingSavedCards(true)
                // Fetch user profile to get userId
                const profileResponse = await authAPI.getProfile()
                if (profileResponse.success) {
                    const fetchedUserId = profileResponse.user._id || profileResponse.user.id
                    setUserId(fetchedUserId)

                    const profileDob = profileResponse.user.dateOfBirth
                        ? new Date(profileResponse.user.dateOfBirth).toISOString().split('T')[0]
                        : ''

                    // Pre-populate first traveler data with user information
                    setTravelersData(prev => {
                        const updated = [...prev]
                        updated[0] = {
                            ...updated[0],
                            firstName: profileResponse.user.firstName || profileResponse.user.name?.split(' ')[0] || '',
                            lastName: profileResponse.user.lastName || profileResponse.user.name?.split(' ').slice(1).join(' ') || '',
                            email: profileResponse.user.email || '',
                            phone: profileResponse.user.phone || '',
                            passportNumber: profileResponse.user.passportNumber || updated[0]?.passportNumber || '',
                            dateOfBirth: profileDob || updated[0]?.dateOfBirth || ''
                        }
                        return updated
                    })

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
                    // If user has saved cards, default to using saved card
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

    const validateForm = () => {
        const errors = {}

        // Package data validation
        if (!packageData) {
            errors.package = 'Package data is missing'
            return false
        }

        if (!selectedDate) {
            errors.date = 'Travel date is required'
        }

        // Travelers validation
        travelersData.forEach((traveler, index) => {
            if (!traveler.firstName.trim()) errors[`traveler${index}_firstName`] = `Traveler ${index + 1} first name is required`
            if (!traveler.lastName.trim()) errors[`traveler${index}_lastName`] = `Traveler ${index + 1} last name is required`
            if (!traveler.email.trim()) errors[`traveler${index}_email`] = `Traveler ${index + 1} email is required`
            else if (!/\S+@\S+\.\S+/.test(traveler.email)) errors[`traveler${index}_email`] = `Traveler ${index + 1} email is invalid`
            if (!traveler.phone.trim()) errors[`traveler${index}_phone`] = `Traveler ${index + 1} phone is required`
            if (!traveler.dateOfBirth) errors[`traveler${index}_dateOfBirth`] = `Traveler ${index + 1} date of birth is required`
            if (!traveler.nationality?.trim()) errors[`traveler${index}_nationality`] = `Traveler ${index + 1} nationality is required`
        })

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

    const handlePassportMode = (useAccount) => {
        setUseAccountPassport(useAccount)
        setTravelersData(prev => {
            const updated = [...prev]
            updated[0] = {
                ...updated[0],
                passportNumber: useAccount ? accountPassportNumber : ''
            }
            return updated
        })
    }

    const handleDobMode = (useAccount) => {
        setUseAccountDob(useAccount)
        setTravelersData(prev => {
            const updated = [...prev]
            updated[0] = {
                ...updated[0],
                dateOfBirth: useAccount ? accountDob : ''
            }
            return updated
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        
        if (!validateForm()) {
            return
        }

        setBookingLoading(true)
        setBookingError(null)

        try {
            let finalPaymentData = paymentData

            // If using saved card, merge saved card data with CVV
            if (!useNewCard && selectedSavedCard) {
                finalPaymentData = {
                    cardNumber: selectedSavedCard.cardNumber,
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
                            isDefault: savedCards.length === 0
                        })
                    }
                } catch (error) {
                    console.error('Error saving card:', error)
                }
            }

            const bookingPayload = {
                packageData,
                travelers: travelersData,
                payment: finalPaymentData,
                selectedDate,
                numberOfTravelers: travelers,
                totalPrice,
                userId
            }

            console.log('Package booking payload:', bookingPayload)

            // Call API to save package booking to database
            const response = await packageAPI.bookPackage(bookingPayload)

            if (response.success) {
                console.log('Package booking saved successfully:', response.data)
                setBookingSuccess(true)
                localStorage.removeItem('selectedPackageForBooking')
            } else {
                throw new Error(response.message || 'Failed to book package')
            }

        } catch (error) {
            console.error('Booking error:', error)
            setBookingError(error.message || 'An error occurred while processing your booking')
        } finally {
            setBookingLoading(false)
        }
    }

    const handleTravelerChange = (index, field, value) => {
        setTravelersData(prev => {
            const updated = [...prev]
            updated[index] = { ...updated[index], [field]: value }
            return updated
        })
    }

    const handleSavedCardSelect = (card) => {
        setSelectedSavedCard(card)
        setPaymentData(prev => ({
            ...prev,
            cvv: ''
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

    // Restoring package data state
    if (restoringPackageData) {
        return (
            <div className="bg-gray-50 min-h-screen py-16">
                <Container>
                    <div className="max-w-2xl mx-auto">
                        <div className="bg-white rounded-2xl p-8 text-center shadow-xl">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4"></div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-2">Restoring Package Information</h2>
                            <p className="text-gray-600">
                                Please wait while we restore your selected package details...
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
                                Your package has been successfully booked. You will receive a confirmation email shortly.
                            </p>
                            <div className="bg-gray-50 rounded-lg p-6 mb-6 text-left">
                                <div className="flex justify-between mb-3">
                                    <span className="text-gray-600">Booking Reference:</span>
                                    <span className="font-bold">PKG{Date.now().toString().slice(-6)}</span>
                                </div>
                                <div className="flex justify-between mb-3">
                                    <span className="text-gray-600">Package:</span>
                                    <span className="font-semibold">{packageData.title}</span>
                                </div>
                                <div className="flex justify-between mb-3">
                                    <span className="text-gray-600">Travel Date:</span>
                                    <span className="font-semibold">
                                        {new Date(selectedDate).toLocaleDateString('en-US', {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </span>
                                </div>
                                <div className="flex justify-between mb-3">
                                    <span className="text-gray-600">Travelers:</span>
                                    <span className="font-semibold">{travelers} {travelers > 1 ? 'people' : 'person'}</span>
                                </div>
                                <div className="flex justify-between pt-3 border-t">
                                    <span className="text-gray-600">Total Amount:</span>
                                    <span className="font-bold text-teal-600 text-xl">${totalPrice}</span>
                                </div>
                            </div>
                            <div className="flex gap-4 justify-center">
                                <button
                                    onClick={() => navigate('/')}
                                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold transition-colors"
                                >
                                    Back to Home
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

    if (!packageData) {
        return null
    }

    return (
        <div className="bg-gray-50 min-h-screen py-8 sm:py-12">
            <Container className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header with Back Button */}
                <div className="mb-6">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-teal-600 hover:text-teal-700 font-medium transition-colors mb-4"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Back to Package Details
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Forms */}
                    <div className="lg:col-span-2 space-y-6">
                        <form onSubmit={handleSubmit}>
                            {/* Package Summary Header */}
                            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                                <div className="bg-gradient-to-r from-teal-500 to-blue-600 text-white p-6">
                                    <h1 className="text-3xl font-bold mb-2 font-montserrat">Confirm Your Booking</h1>
                                    <p className="text-teal-100">Complete your package booking details</p>
                                </div>

                                {/* Travelers Information */}
                                <div className="p-6">
                                    <h2 className="text-xl font-bold text-gray-900 mb-6 font-montserrat flex items-center gap-2">
                                        <Users className="w-6 h-6 text-teal-600" />
                                        Traveler Information
                                    </h2>

                                    {travelersData.map((traveler, index) => (
                                        <div key={index} className="mb-8 pb-6 border-b border-gray-200 last:border-0">
                                            <h3 className="text-lg font-semibold text-gray-800 mb-4">
                                                Traveler {index + 1} {index === 0 && '(Lead Traveler)'}
                                            </h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        <User className="inline w-4 h-4 mr-1" />
                                                        First Name *
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={traveler.firstName}
                                                        onChange={(e) => handleTravelerChange(index, 'firstName', e.target.value)}
                                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 ${
                                                            validationErrors[`traveler${index}_firstName`] ? 'border-red-500' : 'border-gray-300'
                                                        }`}
                                                    />
                                                    {validationErrors[`traveler${index}_firstName`] && (
                                                        <p className="text-red-500 text-sm mt-1">{validationErrors[`traveler${index}_firstName`]}</p>
                                                    )}
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Last Name *
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={traveler.lastName}
                                                        onChange={(e) => handleTravelerChange(index, 'lastName', e.target.value)}
                                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 ${
                                                            validationErrors[`traveler${index}_lastName`] ? 'border-red-500' : 'border-gray-300'
                                                        }`}
                                                    />
                                                    {validationErrors[`traveler${index}_lastName`] && (
                                                        <p className="text-red-500 text-sm mt-1">{validationErrors[`traveler${index}_lastName`]}</p>
                                                    )}
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        <Mail className="inline w-4 h-4 mr-1" />
                                                        Email *
                                                    </label>
                                                    <input
                                                        type="email"
                                                        value={traveler.email}
                                                        onChange={(e) => handleTravelerChange(index, 'email', e.target.value)}
                                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 ${
                                                            validationErrors[`traveler${index}_email`] ? 'border-red-500' : 'border-gray-300'
                                                        }`}
                                                    />
                                                    {validationErrors[`traveler${index}_email`] && (
                                                        <p className="text-red-500 text-sm mt-1">{validationErrors[`traveler${index}_email`]}</p>
                                                    )}
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        <Phone className="inline w-4 h-4 mr-1" />
                                                        Phone *
                                                    </label>
                                                    <input
                                                        type="tel"
                                                        value={traveler.phone}
                                                        onChange={(e) => handleTravelerChange(index, 'phone', e.target.value)}
                                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 ${
                                                            validationErrors[`traveler${index}_phone`] ? 'border-red-500' : 'border-gray-300'
                                                        }`}
                                                    />
                                                    {validationErrors[`traveler${index}_phone`] && (
                                                        <p className="text-red-500 text-sm mt-1">{validationErrors[`traveler${index}_phone`]}</p>
                                                    )}
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        <Calendar className="inline w-4 h-4 mr-1" />
                                                        Date of Birth *
                                                    </label>

                                                    {index === 0 ? (
                                                        <>
                                                            <div className="flex flex-col sm:flex-row gap-2 mb-3">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleDobMode(true)}
                                                                    className={`flex-1 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${useAccountDob
                                                                        ? 'bg-teal-50 border-teal-500 text-teal-700'
                                                                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                                                                    }`}
                                                                >
                                                                    Use account date
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
                                                                            {accountDob || 'Not set in account'}
                                                                        </p>
                                                                    </div>
                                                                    <span className="text-xs text-gray-500">Saved in Account</span>
                                                                </div>
                                                            ) : (
                                                                <div>
                                                                    <input
                                                                        type="date"
                                                                        value={traveler.dateOfBirth}
                                                                        onChange={(e) => handleTravelerChange(index, 'dateOfBirth', e.target.value)}
                                                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 ${
                                                                            validationErrors[`traveler${index}_dateOfBirth`] ? 'border-red-500' : 'border-gray-300'
                                                                        }`}
                                                                    />
                                                                    {validationErrors[`traveler${index}_dateOfBirth`] && (
                                                                        <p className="text-red-500 text-sm mt-1">{validationErrors[`traveler${index}_dateOfBirth`]}</p>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </>
                                                    ) : (
                                                        <div>
                                                            <input
                                                                type="date"
                                                                value={traveler.dateOfBirth}
                                                                onChange={(e) => handleTravelerChange(index, 'dateOfBirth', e.target.value)}
                                                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 ${
                                                                    validationErrors[`traveler${index}_dateOfBirth`] ? 'border-red-500' : 'border-gray-300'
                                                                }`}
                                                            />
                                                            {validationErrors[`traveler${index}_dateOfBirth`] && (
                                                                <p className="text-red-500 text-sm mt-1">{validationErrors[`traveler${index}_dateOfBirth`]}</p>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Passport Number
                                                    </label>

                                                    {index === 0 ? (
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
                                                                        <p className="font-semibold text-gray-900 mt-1">
                                                                            {accountPassportNumber ? maskPassport(accountPassportNumber) : 'Not set in account'}
                                                                        </p>
                                                                    </div>
                                                                    <span className="text-xs text-gray-500">Saved in Account</span>
                                                                </div>
                                                            ) : (
                                                                <div>
                                                                    <input
                                                                        type="text"
                                                                        value={traveler.passportNumber}
                                                                        onChange={(e) => handleTravelerChange(index, 'passportNumber', e.target.value)}
                                                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                                                                        placeholder="A12345678"
                                                                    />
                                                                </div>
                                                            )}
                                                        </>
                                                    ) : (
                                                        <input
                                                            type="text"
                                                            value={traveler.passportNumber}
                                                            onChange={(e) => handleTravelerChange(index, 'passportNumber', e.target.value)}
                                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                                                            placeholder="A12345678"
                                                        />
                                                    )}
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Nationality *
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={traveler.nationality}
                                                        onChange={(e) => handleTravelerChange(index, 'nationality', e.target.value)}
                                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 ${
                                                            validationErrors[`traveler${index}_nationality`] ? 'border-red-500' : 'border-gray-300'
                                                        }`}
                                                        placeholder="Bangladesh"
                                                    />
                                                    {validationErrors[`traveler${index}_nationality`] && (
                                                        <p className="text-red-500 text-sm mt-1">{validationErrors[`traveler${index}_nationality`]}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Payment Information */}
                                <div className="p-6 bg-gray-50">
                                    <h2 className="text-xl font-bold text-gray-900 mb-6 font-montserrat flex items-center gap-2">
                                        <CreditCard className="w-6 h-6 text-teal-600" />
                                        Payment Information
                                    </h2>

                                    {/* Payment Method Selection */}
                                    {savedCards.length > 0 && (
                                        <div className="mb-6">
                                            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4">
                                                <button
                                                    type="button"
                                                    onClick={() => setUseNewCard(false)}
                                                    className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                                                        !useNewCard
                                                            ? 'bg-teal-600 text-white'
                                                            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                                                    }`}
                                                >
                                                    Use Saved Card
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setUseNewCard(true)}
                                                    className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                                                        useNewCard
                                                            ? 'bg-teal-600 text-white'
                                                            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                                                    }`}
                                                >
                                                    Use New Card
                                                </button>
                                            </div>

                                            {!useNewCard && (
                                                <div className="space-y-3 mb-6">
                                                    {savedCards.map((card) => (
                                                        <div
                                                            key={card._id}
                                                            onClick={() => handleSavedCardSelect(card)}
                                                            className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                                                                selectedSavedCard?._id === card._id
                                                                    ? 'border-teal-600 bg-teal-50'
                                                                    : 'border-gray-200 hover:border-teal-300'
                                                            }`}
                                                        >
                                                            <div className="flex items-center justify-between">
                                                                <div>
                                                                    <div className="font-semibold text-gray-900">
                                                                            •••• •••• •••• {(card.cardNumber || '').slice(-4)}
                                                                    </div>
                                                                    <div className="text-sm text-gray-600">{card.cardholderName}</div>
                                                                        {(card.nickname || card.source === 'account') && (
                                                                            <div className="text-xs text-gray-500 mt-1 flex items-center gap-2 flex-wrap">
                                                                                {card.nickname && <span>{card.nickname}</span>}
                                                                                {card.source === 'account' && (
                                                                                    <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-[11px]">
                                                                                        Account
                                                                                    </span>
                                                                                )}
                                                                            </div>
                                                                        )}
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    {card.isDefault && (
                                                                        <span className="bg-teal-100 text-teal-700 text-xs px-2 py-1 rounded">
                                                                            Default
                                                                        </span>
                                                                    )}
                                                                    {selectedSavedCard?._id === card._id && (
                                                                        <Check className="w-5 h-5 text-teal-600" />
                                                                    )}
                                                                </div>
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
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Card Number *
                                                </label>
                                                <input
                                                    type="text"
                                                    value={paymentData.cardNumber}
                                                    onChange={(e) =>
                                                        setPaymentData({ ...paymentData, cardNumber: formatCardNumber(e.target.value) })
                                                    }
                                                    placeholder="1234 5678 9012 3456"
                                                    maxLength="19"
                                                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 ${
                                                        validationErrors.cardNumber ? 'border-red-500' : 'border-gray-300'
                                                    }`}
                                                />
                                                {validationErrors.cardNumber && (
                                                    <p className="text-red-500 text-sm mt-1">{validationErrors.cardNumber}</p>
                                                )}
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
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
                                                                value = value.slice(0, 2) + '/' + value.slice(2, 4)
                                                            }
                                                            setPaymentData({ ...paymentData, expiryDate: value })
                                                        }}
                                                        placeholder="MM/YY"
                                                        maxLength="5"
                                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 ${
                                                            validationErrors.expiryDate ? 'border-red-500' : 'border-gray-300'
                                                        }`}
                                                    />
                                                    {validationErrors.expiryDate && (
                                                        <p className="text-red-500 text-sm mt-1">{validationErrors.expiryDate}</p>
                                                    )}
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">CVV *</label>
                                                    <input
                                                        type="text"
                                                        value={paymentData.cvv}
                                                        onChange={(e) =>
                                                            setPaymentData({ ...paymentData, cvv: e.target.value.replace(/\D/g, '') })
                                                        }
                                                        placeholder="123"
                                                        maxLength="4"
                                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 ${
                                                            validationErrors.cvv ? 'border-red-500' : 'border-gray-300'
                                                        }`}
                                                    />
                                                    {validationErrors.cvv && (
                                                        <p className="text-red-500 text-sm mt-1">{validationErrors.cvv}</p>
                                                    )}
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Cardholder Name *
                                                </label>
                                                <input
                                                    type="text"
                                                    value={paymentData.cardholderName}
                                                    onChange={(e) =>
                                                        setPaymentData({ ...paymentData, cardholderName: e.target.value })
                                                    }
                                                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 ${
                                                        validationErrors.cardholderName ? 'border-red-500' : 'border-gray-300'
                                                    }`}
                                                />
                                                {validationErrors.cardholderName && (
                                                    <p className="text-red-500 text-sm mt-1">{validationErrors.cardholderName}</p>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    id="saveCard"
                                                    checked={saveCard}
                                                    onChange={(e) => setSaveCard(e.target.checked)}
                                                    className="w-4 h-4 text-teal-600 rounded"
                                                />
                                                <label htmlFor="saveCard" className="text-sm text-gray-700">
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
                                                        placeholder="e.g., Personal Card"
                                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {!useNewCard && selectedSavedCard && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">CVV *</label>
                                            <input
                                                type="text"
                                                value={paymentData.cvv}
                                                onChange={(e) => setPaymentData({ ...paymentData, cvv: e.target.value.replace(/\D/g, '') })}
                                                placeholder="123"
                                                maxLength="4"
                                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 ${
                                                    validationErrors.cvv ? 'border-red-500' : 'border-gray-300'
                                                }`}
                                            />
                                            {validationErrors.cvv && <p className="text-red-500 text-sm mt-1">{validationErrors.cvv}</p>}
                                        </div>
                                    )}
                                </div>

                                {/* Error Display */}
                                {bookingError && (
                                    <div className="p-6">
                                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                                            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                                            <div className="text-red-800">{bookingError}</div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </form>
                    </div>

                    {/* Right Column - Booking Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
                            <h3 className="text-xl font-bold text-gray-900 mb-4 font-montserrat">Booking Summary</h3>

                            <div className="mb-4">
                                <img
                                    src={packageData.images[0]}
                                    alt={packageData.title}
                                    className="w-full h-40 object-cover rounded-lg mb-3"
                                />
                                <h4 className="font-bold text-gray-900 mb-1">{packageData.title}</h4>
                                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                                    <MapPin className="w-4 h-4" />
                                    <span>{packageData.location}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                                    <FaClock className="w-4 h-4" />
                                    <span>{packageData.duration}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <FaStar className="text-yellow-400" />
                                    <span className="font-bold text-gray-900">{packageData.rating}</span>
                                    <span className="text-sm text-gray-600">({packageData.reviews} reviews)</span>
                                </div>
                            </div>

                            <div className="border-t border-gray-200 pt-4 mb-4 space-y-3">
                                <div className="flex justify-between text-gray-700">
                                    <span>Travel Date:</span>
                                    <span className="font-semibold">
                                        {new Date(selectedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </span>
                                </div>
                                <div className="flex justify-between text-gray-700">
                                    <span>Price per person:</span>
                                    <span className="font-semibold">${packageData.price}</span>
                                </div>
                                <div className="flex justify-between text-gray-700">
                                    <span>Travelers:</span>
                                    <span className="font-semibold">×{travelers}</span>
                                </div>
                            </div>

                            <div className="border-t border-gray-300 pt-4 mb-6">
                                <div className="flex justify-between text-lg font-bold text-gray-900">
                                    <span>Total:</span>
                                    <span className="text-teal-600">${totalPrice}</span>
                                </div>
                            </div>

                            <button
                                onClick={handleSubmit}
                                disabled={bookingLoading}
                                className="w-full bg-teal-600 text-white py-3 rounded-lg hover:bg-teal-700 transition-colors font-semibold text-center shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                                {bookingLoading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                        Processing...
                                    </span>
                                ) : (
                                    'Complete Booking'
                                )}
                            </button>

                            <div className="mt-4 space-y-2 text-sm text-gray-600">
                                <div className="flex items-center gap-2">
                                    <Check className="text-green-500 w-4 h-4" />
                                    <span>Free cancellation up to 48 hours</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Check className="text-green-500 w-4 h-4" />
                                    <span>Instant confirmation</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Check className="text-green-500 w-4 h-4" />
                                    <span>Secure payment</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Container>
        </div>
    )
}

export default ConfirmPackageBooking
