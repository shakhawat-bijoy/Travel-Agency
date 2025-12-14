import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Container from '../components/common/Container'
import Breadcrumb from '../components/common/Breadcrumb'
import Button from '../components/common/Buttton'
import { FaStar, FaCheck, FaClock, FaCalendar, FaUsers, FaPlane, FaHotel, FaMapMarkerAlt } from 'react-icons/fa'
import { MdLocationOn } from 'react-icons/md'
import { packagesData } from '../data/packages'

const PackageDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [selectedDate, setSelectedDate] = useState('')
  const [travelers, setTravelers] = useState(1)

  const packageData = packagesData.find(pkg => String(pkg.id) === id) || packagesData[0]
  const [currentImage, setCurrentImage] = useState(0)

  const handleBooking = () => {
    if (!selectedDate || travelers < 1) {
      alert('Please select date and number of travelers')
      return
    }
    
    // Store package selection data
    const packageBookingData = {
      package: packageData,
      date: selectedDate,
      travelers: travelers,
      totalPrice: packageData.price * travelers,
      timestamp: Date.now()
    }
    
    // Store in localStorage for restoration after login if needed
    localStorage.setItem('selectedPackageForBooking', JSON.stringify(packageBookingData))
    
    // Navigate to booking confirmation page with package data
    navigate('/confirm-package-booking', {
      state: packageBookingData
    })
  }

  return (
    <div className="bg-gray-50 min-h-screen py-8 sm:py-12">
      <Container className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <Breadcrumb
          items={[
            { label: 'Home', to: '/' },
            { label: 'Packages', to: '/packages' },
            { label: packageData.title }
          ]}
          className="mb-6"
        />

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 mb-6">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-teal-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                  {packageData.badge}
                </span>
                <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                  {packageData.discount}
                </span>
              </div>
              <h1 className="text-2xl lg:text-4xl font-bold text-gray-900 mb-2 font-montserrat">
                {packageData.title}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-gray-600">
                <div className="flex items-center gap-1">
                  <MdLocationOn className="text-teal-600" />
                  <span>{packageData.location}</span>
                </div>
                <div className="flex items-center gap-1">
                  <FaClock className="text-teal-600" />
                  <span>{packageData.duration}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <FaStar className="text-yellow-400" />
                    <span className="font-bold text-gray-900">{packageData.rating}</span>
                  </div>
                  <span className="text-sm">({packageData.reviews} reviews)</span>
                </div>
              </div>
            </div>
            <div className="text-left lg:text-right">
              <p className="text-sm text-gray-500 line-through mb-1">
                ${packageData.originalPrice}
              </p>
              <p className="lg:text-4xl text-2xl font-bold text-teal-600 mb-1">
                ${packageData.price}
              </p>
              <p className="text-sm text-gray-600">per person</p>
            </div>
          </div>

          {/* Image Gallery */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
            <div className="lg:col-span-2">
              <img
                src={packageData.images[currentImage]}
                alt={packageData.title}
                className="w-full h-64 sm:h-80 lg:h-96 object-cover rounded-xl transition-all duration-500 ease-in-out hover:scale-[1.01]"
              />
            </div>
            <div className="grid grid-cols-3 lg:grid-cols-1 gap-3 sm:gap-4">
              {packageData.images.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`${packageData.title} ${idx + 1}`}
                  className={`w-full h-20 sm:h-24 lg:h-[120px] object-cover rounded-lg cursor-pointer border-2 transition-all duration-300 ease-in-out hover:scale-105 ${
                    currentImage === idx ? 'border-teal-600' : 'border-transparent hover:border-teal-300'
                  }`}
                  onClick={() => setCurrentImage(idx)}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 font-montserrat">Overview</h2>
              <p className="text-gray-700 leading-relaxed">{packageData.description}</p>
            </div>

            {/* Highlights */}
            <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 font-montserrat">Highlights</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {packageData.highlights.map((highlight, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <FaCheck className="text-teal-600 mt-1 flex-shrink-0" />
                    <span className="text-gray-700">{highlight}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Itinerary */}
            <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 font-montserrat">Itinerary</h2>
              <div className="space-y-4">
                {packageData.itinerary.map((day, idx) => (
                  <div key={idx} className="flex gap-4 pb-4 border-b border-gray-100 last:border-0">
                    <div className="flex-shrink-0 w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
                      <span className="text-teal-600 font-bold">D{day.day}</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 mb-1">{day.title}</h3>
                      <p className="text-gray-600 text-sm">{day.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Included/Not Included */}
            <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4 font-montserrat">What's Included</h3>
                  <div className="space-y-2">
                    {packageData.included.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <FaCheck className="text-green-500 mt-1 flex-shrink-0" />
                        <span className="text-gray-700 text-sm">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4 font-montserrat">Not Included</h3>
                  <div className="space-y-2">
                    {packageData.notIncluded.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <span className="text-red-500 mt-1 flex-shrink-0">✕</span>
                        <span className="text-gray-700 text-sm">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Booking Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 lg:sticky lg:top-24 transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-1">
              <h3 className="text-xl font-bold text-gray-900 mb-4 font-montserrat">Book This Package</h3>
              
              <div className="space-y-4 mb-6">
                {/* Date Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FaCalendar className="inline mr-2 text-teal-600" />
                    Select Date
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-transparent"
                  />
                </div>

                {/* Travelers */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FaUsers className="inline mr-2 text-teal-600" />
                    Number of Travelers
                  </label>
                  <input
                    type="number"
                    value={travelers}
                    onChange={(e) => setTravelers(Math.max(1, parseInt(e.target.value) || 1))}
                    min="1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Price Summary */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-2">
                <div className="flex justify-between text-gray-700">
                  <span>Price per person:</span>
                  <span className="font-semibold">${packageData.price}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Travelers:</span>
                  <span className="font-semibold">×{travelers}</span>
                </div>
                <div className="border-t border-gray-300 pt-2 flex justify-between text-lg font-bold text-gray-900">
                  <span>Total:</span>
                  <span className="text-teal-600">${packageData.price * travelers}</span>
                </div>
              </div>

              <Button
                text="Confirm Booking"
                onClick={handleBooking}
                className="w-full bg-teal-600 text-white py-3 rounded-lg hover:bg-teal-700 transition-colors font-semibold text-center shadow-md"
              />

              <div className="mt-4 space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <FaCheck className="text-green-500" />
                  <span>Free cancellation up to 48 hours</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaCheck className="text-green-500" />
                  <span>Instant confirmation</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaCheck className="text-green-500" />
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

export default PackageDetail
