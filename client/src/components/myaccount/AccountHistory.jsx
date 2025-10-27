import { useState } from 'react'
import { Calendar, MapPin, Users, Clock, Download, Eye } from 'lucide-react'

const AccountHistory = () => {
    const [activeTab, setActiveTab] = useState('tickets')

    const bookingHistory = [
        {
            id: 1,
            destination: 'Santorini',
            location: 'Santorini, Greece',
            date: '12 Jan 2024',
            time: '10:30 AM',
            guests: 2,
            price: '$1,200',
            status: 'Completed',
            image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
            bookingRef: 'BK001234'
        },
        {
            id: 2,
            destination: 'Santorini',
            location: 'Santorini, Greece',
            date: '15 Feb 2024',
            time: '2:15 PM',
            guests: 4,
            price: '$2,400',
            status: 'Completed',
            image: 'https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
            bookingRef: 'BK001235'
        },
        {
            id: 3,
            destination: 'Santorini',
            location: 'Santorini, Greece',
            date: '20 Mar 2024',
            time: '9:00 AM',
            guests: 3,
            price: '$1,800',
            status: 'Upcoming',
            image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
            bookingRef: 'BK001236'
        }
    ]

    const getStatusColor = (status) => {
        switch (status) {
            case 'Completed':
                return 'bg-green-100 text-green-800'
            case 'Upcoming':
                return 'bg-blue-100 text-blue-800'
            case 'Cancelled':
                return 'bg-red-100 text-red-800'
            default:
                return 'bg-gray-100 text-gray-800'
        }
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header Banner */}
            <div className="relative h-64 bg-gradient-to-r from-teal-600 via-orange-400 to-yellow-400 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-teal-600/90 via-orange-400/90 to-yellow-400/90"></div>

                {/* Profile Section */}
                <div className="relative z-10 flex flex-col items-center justify-center h-full text-white">
                    <div className="w-24 h-24 rounded-full bg-white p-1 mb-4">
                        <img
                            src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
                            alt="Profile"
                            className="w-full h-full rounded-full object-cover"
                        />
                    </div>

                    <h2 className="text-2xl font-bold mb-1">John Doe</h2>
                    <p className="text-white/80">john.doe@gmail.com</p>

                    <button className="mt-4 px-6 py-2 bg-teal-500 hover:bg-teal-600 rounded-lg font-medium transition-colors">
                        Upload new picture
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    {/* Tabs */}
                    <div className="border-b border-gray-200">
                        <nav className="flex space-x-8 px-8 pt-6">
                            <button
                                onClick={() => setActiveTab('account')}
                                className={`pb-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'account'
                                        ? 'border-teal-500 text-teal-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                Account
                            </button>
                            <button
                                onClick={() => setActiveTab('history')}
                                className={`pb-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'history'
                                        ? 'border-teal-500 text-teal-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                History
                            </button>
                            <button
                                onClick={() => setActiveTab('tickets')}
                                className={`pb-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'tickets'
                                        ? 'border-teal-500 text-teal-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                Tickets/Bookings
                            </button>
                            <button
                                onClick={() => setActiveTab('payment')}
                                className={`pb-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'payment'
                                        ? 'border-teal-500 text-teal-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                Payment methods
                            </button>
                        </nav>
                    </div>

                    {/* Content Area */}
                    <div className="p-8">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-2xl font-bold text-gray-900">Tickets/Bookings</h3>
                            <div className="flex items-center space-x-4">
                                <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500">
                                    <option>All Status</option>
                                    <option>Completed</option>
                                    <option>Upcoming</option>
                                    <option>Cancelled</option>
                                </select>
                                <button className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors font-medium">
                                    Export
                                </button>
                            </div>
                        </div>

                        {/* Booking Cards */}
                        <div className="space-y-6">
                            {bookingHistory.map((booking) => (
                                <div key={booking.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-6">
                                            {/* Destination Image */}
                                            <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                                                <img
                                                    src={booking.image}
                                                    alt={booking.destination}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>

                                            {/* Booking Details */}
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-4 mb-2">
                                                    <h4 className="text-lg font-semibold text-gray-900">{booking.destination}</h4>
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                                                        {booking.status}
                                                    </span>
                                                </div>

                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                                                    <div className="flex items-center space-x-2">
                                                        <MapPin className="w-4 h-4" />
                                                        <span>{booking.location}</span>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <Calendar className="w-4 h-4" />
                                                        <span>{booking.date}</span>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <Clock className="w-4 h-4" />
                                                        <span>{booking.time}</span>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <Users className="w-4 h-4" />
                                                        <span>{booking.guests} Guests</span>
                                                    </div>
                                                </div>

                                                <div className="mt-2 text-sm text-gray-500">
                                                    Booking Ref: {booking.bookingRef}
                                                </div>
                                            </div>

                                            {/* Price */}
                                            <div className="text-right">
                                                <div className="text-2xl font-bold text-gray-900 mb-2">{booking.price}</div>
                                                <div className="flex space-x-2">
                                                    <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                    <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                                                        <Download className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Button */}
                                    <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end">
                                        <button className="px-6 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors font-medium">
                                            Download
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        <div className="mt-8 flex items-center justify-between">
                            <div className="text-sm text-gray-500">
                                Showing 1 to 3 of 3 results
                            </div>
                            <div className="flex items-center space-x-2">
                                <button className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors">
                                    Previous
                                </button>
                                <button className="px-3 py-2 bg-teal-500 text-white rounded-lg text-sm font-medium">
                                    1
                                </button>
                                <button className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors">
                                    Next
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AccountHistory