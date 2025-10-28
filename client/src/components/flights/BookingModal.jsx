import { useState, useEffect } from 'react'
import { X, User, Mail, Phone, CreditCard, Calendar, MapPin, Plane, DollarSign, Check, AlertCircle, Plus, Trash2 } from 'lucide-react'
import { savedCardsAPI, auth } from '../../utils/api'

const BookingModal = ({ flight, onClose, onBook, loading, error, success }) => {
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

    // Load saved cards on component mount
    useEffect(() => {
        const loadSavedCards = async () => {
            try {
                const userData = auth.getUserData()
                if (userData.user?.id) {
                    setLoadingSavedCards(true)
                    const response = await savedCardsAPI.getSavedCards(userData.user.id)
                    if (response.success) {
                        setSavedCards(response.data)
                        // If user has saved cards, default to using saved card
                        if (response.data.length > 0) {
                            setUseNewCard(false)
                            // Select default card or first card
                            const defaultCard = response.data.find(card => card.isDefault) || response.data[0]
                            setSelectedSavedCard(defaultCard)
                        }
                    }
                }
            } catch (error) {
                console.error('Error loading saved cards:', error)
            } finally {
                setLoadingSavedCards(false)
            }
        }

        loadSavedCards()
    }, [])

    const validateForm = () => {
        const errors = {}

        // Passenger validation
        if (!passengerData.firstName.trim()) errors.firstName = 'First name is required'
        if (!passengerData.lastName.trim()) errors.lastName = 'Last name is required'
        if (!passengerData.email.trim()) errors.email = 'Email is required'
        else if (!/\S+@\S+\.\S+/.test(passengerData.email)) errors.email = 'Email is invalid'
        if (!passengerData.phone.trim()) errors.phone = 'Phone number is required'
        if (!passengerData.dateOfBirth) errors.dateOfBirth = 'Date of birth is required'

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
                    const userData = auth.getUserData()
                    if (userData.user?.id) {
                        await savedCardsAPI.saveCard({
                            userId: userData.user.id,
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

            onBook({ passenger: passengerData, payment: finalPaymentData })
        }
    }

    const handleSavedCardSelect = (card) => {
        setSelectedSavedCard(card)
        setPaymentData(prev => ({
            ...prev,
            cvv: '' // Reset CVV when switching cards
        }))
    }

    const handleDeleteSavedCard = async (cardId, e) => {
        e.stopPropagation()
        try {
            await savedCardsAPI.deleteCard(cardId)
            setSavedCards(prev => prev.filter(card => card._id !== cardId))
            if (selectedSavedCard?._id === cardId) {
                setSelectedSavedCard(null)
                if (savedCards.length <= 1) {
                    setUseNewCard(true)
                }
            }
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

    if (success) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center">
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
                </div>
            </div>
        )
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-900">Book Your Flight</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X className="w-6 h-6 text-gray-500" />
                    </button>
                </div>

                {/* Flight Summary */}
                <div className="p-6 bg-gray-50 border-b border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                            <div className="text-xl font-bold text-gray-900">
                                {flight.departureAirport} → {flight.arrivalAirport}
                            </div>
                            <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                                {flight.flightNumber}
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-2xl font-bold text-teal-600 flex items-center gap-1">
                                <DollarSign className="w-5 h-5" />
                                {flight.price.total}
                            </div>
                            <div className="text-sm text-gray-500">{flight.price.currency}</div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-gray-600">
                                {new Date(flight.departureTime).toLocaleDateString()}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Plane className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-gray-600">{flight.aircraftModel}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-gray-600">{flight.airline}</span>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
                            <AlertCircle className="w-5 h-5" />
                            {error}
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

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Passport Number
                                        </label>
                                        <input
                                            type="text"
                                            value={passengerData.passportNumber}
                                            onChange={(e) => setPassengerData(prev => ({ ...prev, passportNumber: e.target.value }))}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                                            placeholder="A12345678"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Nationality
                                        </label>
                                        <input
                                            type="text"
                                            value={passengerData.nationality}
                                            onChange={(e) => setPassengerData(prev => ({ ...prev, nationality: e.target.value }))}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                                            placeholder="United States"
                                        />
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
                                                                                'bg-gray-600'
                                                                        }`}>
                                                                        {card.cardType.toUpperCase().slice(0, 4)}
                                                                    </div>
                                                                    <div>
                                                                        <div className="font-medium text-gray-900">
                                                                            {card.nickname || `${card.cardType.toUpperCase()} Card`}
                                                                        </div>
                                                                        <div className="text-sm text-gray-500">
                                                                            {card.cardNumber} • {card.cardholderName}
                                                                        </div>
                                                                        <div className="text-xs text-gray-400">
                                                                            Expires {card.expiryDate}
                                                                            {card.isDefault && (
                                                                                <span className="ml-2 bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full text-xs">
                                                                                    Default
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <button
                                                                    type="button"
                                                                    onClick={(e) => handleDeleteSavedCard(card._id, e)}
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
                                            <span className="font-medium">${flight.price.total}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Taxes & Fees</span>
                                            <span className="font-medium">$45.00</span>
                                        </div>
                                        <div className="border-t pt-2 flex justify-between font-bold text-lg">
                                            <span>Total</span>
                                            <span className="text-teal-600">${(parseFloat(flight.price.total) + 45).toFixed(2)}</span>
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
                            onClick={onClose}
                            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-teal-500 hover:bg-teal-600 disabled:bg-gray-400 text-white px-8 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <CreditCard className="w-5 h-5" />
                                    Book Flight - ${(parseFloat(flight.price.total) + 45).toFixed(2)}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default BookingModal