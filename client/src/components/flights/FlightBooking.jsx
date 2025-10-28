import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft, Plane, Clock, MapPin, CreditCard, Check, AlertCircle } from 'lucide-react'
import { bookFlight, clearBookingState } from '../../store/slices/flightSlice'
import Container from '../common/Container'
import BookingModal from './BookingModal'

const FlightBooking = () => {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const location = useLocation()
    const [selectedFlight, setSelectedFlight] = useState(null)
    const [showBookingModal, setShowBookingModal] = useState(false)

    const {
        bookingLoading,
        bookingError,
        bookingSuccess
    } = useSelector(state => state.flights)

    // Get flight data from navigation state
    useEffect(() => {
        if (location.state?.flight) {
            setSelectedFlight(location.state.flight)
        } else {
            // If no flight data, redirect back to search
            navigate('/flights')
        }
    }, [location.state, navigate])

    // Handle flight booking
    const handleBookFlight = async (passengerData) => {
        const bookingData = {
            flight: selectedFlight,
            passengers: passengerData,
            searchParams: location.state?.searchParams || {}
        }

        const result = await dispatch(bookFlight(bookingData))

        if (bookFlight.fulfilled.match(result)) {
            setTimeout(() => {
                dispatch(clearBookingState())
            }, 3000)
        }
    }

    // Handle booking modal
    const handleShowBookingModal = () => {
        setShowBookingModal(true)
    }

    const handleCloseBookingModal = () => {
        setShowBookingModal(false)
        dispatch(clearBookingState())
    }

    // Loading state
    if (!selectedFlight) {
        return (
            <div className="bg-gray-50 min-h-screen py-12">
                <Container>
                    <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4"></div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Flight Details</h2>
                        <p className="text-gray-600">Please wait while we load your selected flight...</p>
                    </div>
                </Container>
            </div>
        )
    }

    // Booking success state
    if (bookingSuccess) {
        return (
            <div className="bg-gray-50 min-h-screen py-12">
                <Container>
                    <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-2xl mx-auto">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Check className="w-10 h-10 text-green-600" />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Booking Confirmed!</h2>
                        <p className="text-gray-600 mb-6 text-lg">
                            Your flight has been successfully booked. You will receive a confirmation email shortly.
                        </p>

                        {/* Booking Summary */}
                        <div className="bg-gray-50 rounded-xl p-6 mb-8">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Summary</h3>
                            <div className="space-y-3 text-left">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Booking Reference:</span>
                                    <span className="font-semibold">BK{Date.now().toString().slice(-6)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Flight:</span>
                                    <span className="font-semibold">{selectedFlight.flightNumber}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Route:</span>
                                    <span className="font-semibold">{selectedFlight.departureAirport} → {selectedFlight.arrivalAirport}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Date:</span>
                                    <span className="font-semibold">
                                        {new Date(selectedFlight.departureTime).toLocaleDateString('en-US', {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Total Amount:</span>
                                    <span className="font-bold text-teal-600 text-lg">৳{selectedFlight.price.total}</span>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button
                                onClick={() => navigate('/flights')}
                                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold transition-colors"
                            >
                                Search More Flights
                            </button>
                            <button
                                onClick={() => navigate('/my-bookings')}
                                className="bg-teal-500 hover:bg-teal-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                            >
                                View My Bookings
                            </button>
                        </div>
                    </div>
                </Container>
            </div>
        )
    }

    return (
        <div className="bg-gray-50 min-h-screen py-12">
            <Container>
                {/* Header with Back Button */}
                <div className="mb-6">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-teal-600 hover:text-teal-700 font-medium transition-colors mb-4"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Back to Results
                    </button>
                </div>

                {/* Flight Booking Card */}
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-teal-500 to-blue-600 text-white p-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold mb-2">Book Your Flight</h1>
                                <p className="text-teal-100">Complete your booking in just a few steps</p>
                            </div>
                            <div className="text-right">
                                <div className="text-3xl font-bold">৳{selectedFlight.price.total}</div>
                                <div className="text-teal-100">{selectedFlight.price.currency}</div>
                            </div>
                        </div>
                    </div>

                    {/* Flight Summary */}
                    <div className="p-8 border-b border-gray-200">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6">Flight Details</h2>

                        {/* Flight Route */}
                        <div className="bg-gray-50 rounded-xl p-6 mb-6">
                            <div className="flex items-center justify-between">
                                <div className="text-center flex-1">
                                    <div className="text-2xl font-bold text-gray-900 mb-2">
                                        {new Date(selectedFlight.departureTime).toLocaleTimeString('en-US', {
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </div>
                                    <div className="text-lg font-semibold text-gray-700 mb-1">
                                        {selectedFlight.departureAirport}
                                    </div>
                                    {selectedFlight.departureLocation && (
                                        <div className="text-sm text-gray-600">
                                            {selectedFlight.departureLocation.fullName || selectedFlight.departureLocation.name}
                                        </div>
                                    )}
                                    {selectedFlight.departureLocation?.cityCountry && (
                                        <div className="text-sm text-gray-500">{selectedFlight.departureLocation.cityCountry}</div>
                                    )}
                                </div>

                                <div className="flex-1 mx-8">
                                    <div className="relative">
                                        <div className="absolute inset-0 flex items-center">
                                            <div className="w-full border-t-2 border-teal-300"></div>
                                        </div>
                                        <div className="relative flex justify-center">
                                            <div className="bg-white px-4">
                                                <Plane className="w-8 h-8 text-teal-500 transform rotate-90" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-center mt-4">
                                        <div className="text-sm font-medium text-gray-700">
                                            {selectedFlight.airlineName || selectedFlight.airline}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {selectedFlight.duration.replace('PT', '').replace('H', 'h ').replace('M', 'm')}
                                        </div>
                                    </div>
                                </div>

                                <div className="text-center flex-1">
                                    <div className="text-2xl font-bold text-gray-900 mb-2">
                                        {new Date(selectedFlight.arrivalTime).toLocaleTimeString('en-US', {
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </div>
                                    <div className="text-lg font-semibold text-gray-700 mb-1">
                                        {selectedFlight.arrivalAirport}
                                    </div>
                                    {selectedFlight.arrivalLocation && (
                                        <div className="text-sm text-gray-600">
                                            {selectedFlight.arrivalLocation.fullName || selectedFlight.arrivalLocation.name}
                                        </div>
                                    )}
                                    {selectedFlight.arrivalLocation?.cityCountry && (
                                        <div className="text-sm text-gray-500">{selectedFlight.arrivalLocation.cityCountry}</div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Flight Info Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="bg-gray-50 p-4 rounded-lg text-center">
                                <div className="text-xs text-gray-500 uppercase tracking-wide mb-2">Flight Number</div>
                                <div className="font-semibold text-gray-900">{selectedFlight.flightNumber}</div>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg text-center">
                                <div className="text-xs text-gray-500 uppercase tracking-wide mb-2">Aircraft</div>
                                <div className="font-semibold text-gray-900">{selectedFlight.aircraftModel}</div>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg text-center">
                                <div className="text-xs text-gray-500 uppercase tracking-wide mb-2">Duration</div>
                                <div className="font-semibold text-gray-900 flex items-center justify-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    {selectedFlight.duration.replace('PT', '').replace('H', 'h ').replace('M', 'm')}
                                </div>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg text-center">
                                <div className="text-xs text-gray-500 uppercase tracking-wide mb-2">Stops</div>
                                <div className="font-semibold text-gray-900 flex items-center justify-center gap-1">
                                    <MapPin className="w-4 h-4" />
                                    {selectedFlight.stops === 0 ? 'Direct' : `${selectedFlight.stops} stop${selectedFlight.stops > 1 ? 's' : ''}`}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Price Breakdown */}
                    {selectedFlight.price.breakdown && (
                        <div className="p-8 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Price Breakdown</h3>
                            <div className="bg-gray-50 rounded-lg p-6">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                    <div className="text-center">
                                        <div className="text-sm text-gray-500 mb-1">Base Price</div>
                                        <div className="text-lg font-semibold text-gray-900">৳{selectedFlight.price.breakdown.basePrice}</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-sm text-gray-500 mb-1">Taxes</div>
                                        <div className="text-lg font-semibold text-gray-900">৳{selectedFlight.price.breakdown.taxes}</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-sm text-gray-500 mb-1">Fees</div>
                                        <div className="text-lg font-semibold text-gray-900">৳{selectedFlight.price.breakdown.supplierFees}</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-sm text-teal-600 mb-1">Total</div>
                                        <div className="text-xl font-bold text-teal-600">৳{selectedFlight.price.total}</div>
                                    </div>
                                </div>

                                {selectedFlight.price.discount?.hasDiscount && (
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="text-green-800 font-semibold">💰 Special Discount Applied!</div>
                                                <div className="text-sm text-green-600">
                                                    You save {selectedFlight.price.discount.percentage}% on this flight
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-sm text-gray-500 line-through">
                                                    ৳{selectedFlight.price.discount.originalPrice}
                                                </div>
                                                <div className="text-lg font-bold text-green-600">
                                                    Save ৳{selectedFlight.price.discount.savings}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Booking Actions */}
                    <div className="p-8">
                        {bookingError && (
                            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
                                <AlertCircle className="w-5 h-5" />
                                {bookingError}
                            </div>
                        )}

                        <div className="flex flex-col sm:flex-row gap-4 justify-end">
                            <button
                                onClick={() => navigate(-1)}
                                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
                            >
                                Back to Results
                            </button>
                            <button
                                onClick={handleShowBookingModal}
                                disabled={bookingLoading}
                                className="bg-teal-500 hover:bg-teal-600 disabled:bg-gray-400 text-white px-8 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2 justify-center"
                            >
                                {bookingLoading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <CreditCard className="w-5 h-5" />
                                        Book Flight - ৳{selectedFlight.price.total}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Booking Modal */}
                {showBookingModal && selectedFlight && (
                    <BookingModal
                        flight={selectedFlight}
                        onClose={handleCloseBookingModal}
                        onBook={handleBookFlight}
                        loading={bookingLoading}
                        error={bookingError}
                        success={bookingSuccess}
                    />
                )}
            </Container>
        </div>
    )
}

export default FlightBooking