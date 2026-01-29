import { useLocation, Link, useNavigate } from 'react-router-dom'
import { CheckCircle, Calendar, MapPin, Building, Plane, Package, ArrowRight, Home, User, CreditCard } from 'lucide-react'
import Container from '../common/Container'
import { formatUSD } from '../../utils/currency'

const BookingSuccess = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { type, booking, hotelName, flightDetails, packageName } = location.state || {}

  // If no state, redirect to home
  if (!type) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 text-center max-w-md w-full">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Home className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-gray-900 mb-4">No Booking Found</h1>
          <p className="text-gray-500 font-medium mb-8">It seems you landed here without an active booking session.</p>
          <Link to="/" className="inline-block bg-blue-600 text-white px-8 py-3 rounded-xl font-black uppercase tracking-widest hover:bg-blue-700 transition-all">
            Go to Home
          </Link>
        </div>
      </div>
    )
  }

  const getIcon = () => {
    switch (type) {
      case 'hotel': return <Building className="w-10 h-10" />
      case 'flight': return <Plane className="w-10 h-10" />
      case 'package': return <Package className="w-10 h-10" />
      default: return <CheckCircle className="w-10 h-10" />
    }
  }

  const getTitle = () => {
    switch (type) {
      case 'hotel': return 'Stays Confirmed!'
      case 'flight': return 'Flight Booked!'
      case 'package': return 'Trip Reserved!'
      default: return 'Booking Confirmed!'
    }
  }

  return (
    <div className="bg-[#F8FAFC] min-h-screen py-12 md:py-20">
      <Container>
        <div className="max-w-3xl mx-auto">
          {/* Success Card */}
          <div className="bg-white rounded-[40px] shadow-xl shadow-blue-100/50 border border-blue-50 overflow-hidden mb-8">
            {/* Status Header */}
            <div className="bg-gradient-to-br from-green-500 to-green-600 p-12 text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32" />
              <div className="relative z-10">
                <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl rotate-3">
                  <div className="text-green-600">
                    <CheckCircle className="w-12 h-12" />
                  </div>
                </div>
                <h1 className="text-4xl font-black text-white mb-2">{getTitle()}</h1>
                <p className="text-green-50 font-bold opacity-90">Booking ID: #{booking?._id?.slice(-8) || Math.random().toString(36).substr(2, 8).toUpperCase()}</p>
              </div>
            </div>

            {/* Booking Details */}
            <div className="p-8 md:p-12">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                <div className="space-y-6">
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Reservation Info</label>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                        {getIcon()}
                      </div>
                      <div>
                        <h3 className="font-black text-gray-900">{hotelName || packageName || (type === 'flight' ? 'Flight' : 'Reservation')}</h3>
                        <p className="text-sm text-gray-500 font-bold">{type.charAt(0).toUpperCase() + type.slice(1)} Booking</p>
                      </div>
                    </div>
                  </div>

                  {(type === 'hotel' || type === 'package') && (
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Location</label>
                      <div className="flex items-center gap-2 text-gray-900 font-black">
                        <MapPin className="w-4 h-4 text-red-500" />
                        <span>{booking?.hotel?.cityCode || booking?.package?.location || 'San Francisco, CA'}</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Total Paid</label>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center">
                        <CreditCard className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-black text-gray-900">{formatUSD(booking?.totalAmount || 0)}</h3>
                        <p className="text-xs text-green-600 font-bold uppercase tracking-tight">Payment Confirmed</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Date</label>
                    <div className="flex items-center gap-2 text-gray-900 font-black">
                      <Calendar className="w-4 h-4 text-blue-600" />
                      <span>{booking?.offer?.checkInDate || booking?.date || new Date().toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 border border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                    <User className="w-6 h-6 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-black uppercase tracking-widest">Booking For</p>
                    <p className="font-bold text-gray-900">{booking?.guest?.name || 'Valued Guest'}</p>
                  </div>
                </div>
                <div className="text-center md:text-right">
                  <p className="text-xs text-gray-400 font-black uppercase tracking-widest mb-1">Confirmation Sent To</p>
                  <p className="font-bold text-blue-600">{booking?.guest?.email || 'your-email@example.com'}</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="p-8 border-t border-gray-50 flex flex-col sm:flex-row gap-4">
              <Link
                to="/account"
                className="flex-1 bg-gray-900 text-white text-center py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-gray-800 transition-all flex items-center justify-center gap-3"
              >
                <User className="w-5 h-5" />
                My Bookings
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/"
                className="flex-1 bg-blue-600 text-white text-center py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-blue-700 transition-all flex items-center justify-center gap-3"
              >
                <Home className="w-5 h-5" />
                Back to Home
              </Link>
            </div>
          </div>

          {/* Fun Message */}
          <div className="text-center">
            <p className="text-gray-400 font-bold uppercase tracking-widest mb-4">You're all set for your next adventure!</p>
            <div className="flex items-center justify-center gap-8">
              <span className="text-2xl opacity-50 grayscale hover:grayscale-0 transition-all cursor-default">🏖️</span>
              <span className="text-2xl opacity-50 grayscale hover:grayscale-0 transition-all cursor-default">✈️</span>
              <span className="text-2xl opacity-50 grayscale hover:grayscale-0 transition-all cursor-default">🏙️</span>
              <span className="text-2xl opacity-50 grayscale hover:grayscale-0 transition-all cursor-default">⛰️</span>
            </div>
          </div>
        </div>
      </Container>
    </div>
  )
}

export default BookingSuccess