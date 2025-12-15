import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import Container from '../common/Container'
import Button from '../common/Buttton'
import { FaStar } from 'react-icons/fa6'
import { MdLocationOn } from 'react-icons/md'
import { X, Plus, Minus, Calendar, Users, MapPin, Plane, Hotel, Utensils, Camera, CheckCircle2 } from 'lucide-react'
import { packagesData } from '../../data/packages'

const Packeges = () => {
  const [showCustomModal, setShowCustomModal] = useState(false)
  const [showSuccessPopup, setShowSuccessPopup] = useState(false)
  const [customPackage, setCustomPackage] = useState({
    destination: '',
    duration: 3,
    travelers: 1,
    startDate: '',
    endDate: '',
    budget: 'moderate',
    accommodation: 'standard',
    activities: [],
    meals: 'breakfast',
    transportation: 'flight',
    specialRequests: ''
  })

  const activityOptions = [
    'City Tours',
    'Beach Activities',
    'Adventure Sports',
    'Cultural Experiences',
    'Shopping',
    'Nightlife',
    'Wildlife Safari',
    'Water Sports',
    'Mountain Trekking',
    'Food Tours',
    'Photography',
    'Spa & Wellness'
  ]

  const handleActivityToggle = (activity) => {
    setCustomPackage(prev => ({
      ...prev,
      activities: prev.activities.includes(activity)
        ? prev.activities.filter(a => a !== activity)
        : [...prev.activities, activity]
    }))
  }

  const calculateDuration = (start, end) => {
    if (!start || !end) return
    const startDate = new Date(start)
    const endDate = new Date(end)
    const diffTime = endDate - startDate
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    if (diffDays > 0) {
      setCustomPackage(prev => ({ ...prev, duration: diffDays }))
    }
  }

  const handleDateChange = (field, value) => {
    setCustomPackage(prev => ({ ...prev, [field]: value }))
    
    if (field === 'startDate' && customPackage.endDate) {
      calculateDuration(value, customPackage.endDate)
    } else if (field === 'endDate' && customPackage.startDate) {
      calculateDuration(customPackage.startDate, value)
    }
  }

  const handleSubmitCustomPackage = (e) => {
    e.preventDefault()
    console.log('Custom Package Request:', customPackage)
    // Here you can add API call to save the custom package request
    
    // Close modal and show success popup
    setShowCustomModal(false)
    setShowSuccessPopup(true)
    
    // Reset form
    setCustomPackage({
      destination: '',
      duration: 3,
      travelers: 1,
      startDate: '',
      endDate: '',
      budget: 'moderate',
      accommodation: 'standard',
      activities: [],
      meals: 'breakfast',
      transportation: 'flight',
      specialRequests: ''
    })

    // Auto close success popup after 5 seconds
    setTimeout(() => {
      setShowSuccessPopup(false)
    }, 5000)
  }
  const recommendedPackages = packagesData.slice(0, 6)

  return (
    <div className="py-12 sm:py-16 lg:py-20 bg-white">
      <Container className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-10 sm:mb-14 lg:mb-16 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-3xl">
            <p className="uppercase tracking-[0.2em] text-teal-700 text-xs sm:text-sm font-semibold mb-2">
              Curated packages
            </p>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 font-montserrat leading-tight">
              Handpicked getaways for you
            </h2>
            <p className="text-sm sm:text-base lg:text-lg text-gray-600 font-montserrat">
              Choose from immersive itineraries crafted by our travel experts - flights, stays, and experiences bundled for a stress-free holiday.
            </p>
          </div>
          <div className="flex justify-start sm:justify-end">
            <Link
              to="/packages"
              className="inline-flex items-center rounded-lg border border-teal-600 text-teal-700 px-4 lg:px-6 py-2.5 text-sm lg:text-base hover:text-white hover:bg-teal-700  transition-all duration-300"
            >
              All packages
            </Link>
          </div>
        </div>

        {/* Packages Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {recommendedPackages.map((pkg) => (
            <div
              key={pkg.id}
              className="bg-white rounded-2xl transition-all duration-300 overflow-hidden group cursor-pointer"
            >
              {/* Image Section */}
              <div className="relative h-56 sm:h-60 lg:h-64 overflow-hidden">
                <img
                  src={pkg.images?.[0]}
                  alt={pkg.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                
                {/* Badges */}
                <div className="absolute top-3 left-3 flex gap-2">
                  <span className="bg-teal-600 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-md">
                    {pkg.badge}
                  </span>
                  <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-md">
                    {pkg.discount}
                  </span>
                </div>

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
              </div>

              {/* Content Section */}
              <div className="p-5 sm:p-6">
                {/* Location */}
                <div className="flex items-center gap-1 text-gray-500 mb-2">
                  <MdLocationOn className="text-teal-600 text-base sm:text-lg" />
                  <span className="text-xs sm:text-sm font-medium">{pkg.location}</span>
                </div>

                {/* Title */}
                <Link
                  to={`/packages/${pkg.id}`}
                  className="text-lg sm:text-xl font-bold text-gray-900 mb-2 font-montserrat line-clamp-2 group-hover:text-teal-600 transition-colors block"
                >
                  {pkg.title}
                </Link>

                {/* Duration */}
                <p className="text-sm text-gray-600 mb-3 font-medium">
                  {pkg.duration}
                </p>

                {/* Features */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {pkg.features.map((feature, index) => (
                    <span
                      key={index}
                      className="bg-teal-50 text-teal-700 px-3 py-1 rounded-full text-xs font-medium"
                    >
                      {feature}
                    </span>
                  ))}
                </div>

                {/* Rating */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center gap-1">
                    <FaStar className="text-yellow-400 text-sm" />
                    <span className="text-sm font-bold text-gray-900">{pkg.rating}</span>
                  </div>
                  <span className="text-xs text-gray-500">({pkg.reviews} reviews)</span>
                </div>

                {/* Price Section */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div>
                    <p className="text-xs text-gray-500 line-through mb-1">
                      ${pkg.originalPrice}
                    </p>
                    <p className="text-2xl font-bold text-teal-600">
                      ${pkg.price}
                      <span className="text-sm text-gray-500 font-normal"> /person</span>
                    </p>
                  </div>
                  <Button
                    text="Book Now"
                    className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors text-sm font-medium shadow-md"
                    to={`/packages/${pkg.id}`}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-12 sm:mt-16 lg:mt-20 relative overflow-hidden rounded-2xl text-center shadow-xl">
          {/* Blurred background image */}
          <div className="absolute inset-0">
            <img
              src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&q=80"
              alt="Tropical beach backdrop"
              className="w-full h-full object-cover blur-xs scale-105"
              loading="lazy"
            />
            
          </div>

          <div className="relative p-8 sm:p-10 lg:p-12">
            <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4 font-montserrat">
              Can't find what you're looking for?
            </h3>
            <p className="text-white/90 text-sm sm:text-base lg:text-lg mb-6 max-w-2xl mx-auto">
              Let us create a custom package just for you. Tell us your dream destination and we'll handle the rest.
            </p>
            <Button
              text="Create Custom Package"
              className="bg-white text-teal-600 px-6 sm:px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors text-sm lg:text-base font-semibold shadow-lg"
              onClick={() => setShowCustomModal(true)}
            />
          </div>
        </div>

        {/* Custom Package Modal */}
        {showCustomModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-[95vw] md:max-w-4xl lg:max-w-5xl max-h-[90vh] overflow-y-auto no-scrollbar shadow-2xl">
              {/* Modal Header */}
              <div className="sticky top-0 bg-gradient-to-r from-teal-600 to-teal-500 p-6 flex items-center justify-between z-10">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">Create Your Dream Package</h2>
                  <p className="text-white/90 text-sm">Tell us your preferences and we'll craft the perfect trip</p>
                </div>
                <button
                  onClick={() => setShowCustomModal(false)}
                  className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Modal Content */}
              <form onSubmit={handleSubmitCustomPackage} className="p-5 sm:p-6 space-y-6">
                {/* Destination & Duration */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                      <MapPin className="w-4 h-4 text-teal-600" />
                      Destination
                    </label>
                    <input
                      type="text"
                      required
                      value={customPackage.destination}
                      onChange={(e) => setCustomPackage({ ...customPackage, destination: e.target.value })}
                      placeholder="Where do you want to go?"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                      <Calendar className="w-4 h-4 text-teal-600" />
                      Duration (Days)
                    </label>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setCustomPackage({ ...customPackage, duration: Math.max(1, customPackage.duration - 1) })}
                        className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="text-2xl font-bold text-teal-600 w-16 text-center">
                        {customPackage.duration}
                      </span>
                      <button
                        type="button"
                        onClick={() => setCustomPackage({ ...customPackage, duration: customPackage.duration + 1 })}
                        className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                      <span className="text-gray-600">days</span>
                    </div>
                  </div>
                </div>

                {/* Travel Dates */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-2 block">
                      Start Date
                    </label>
                    <input
                      type="date"
                      required
                      value={customPackage.startDate}
                      onChange={(e) => handleDateChange('startDate', e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-2 block">
                      End Date
                    </label>
                    <input
                      type="date"
                      required
                      value={customPackage.endDate}
                      onChange={(e) => handleDateChange('endDate', e.target.value)}
                      min={customPackage.startDate || new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>

                {/* Number of Travelers */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                    <Users className="w-4 h-4 text-teal-600" />
                    Number of Travelers
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setCustomPackage({ ...customPackage, travelers: Math.max(1, customPackage.travelers - 1) })}
                      className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="text-2xl font-bold text-teal-600 w-16 text-center">
                      {customPackage.travelers}
                    </span>
                    <button
                      type="button"
                      onClick={() => setCustomPackage({ ...customPackage, travelers: customPackage.travelers + 1 })}
                      className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                    <span className="text-gray-600">travelers</span>
                  </div>
                </div>

                {/* Budget Range */}
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-3 block">
                    Budget Range
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {['budget', 'moderate', 'luxury'].map((budget) => (
                      <button
                        key={budget}
                        type="button"
                        onClick={() => setCustomPackage({ ...customPackage, budget })}
                        className={`py-3 px-4 rounded-lg border-2 transition-all font-medium capitalize ${
                          customPackage.budget === budget
                            ? 'border-teal-600 bg-teal-50 text-teal-700'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        {budget}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Accommodation */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                    <Hotel className="w-4 h-4 text-teal-600" />
                    Accommodation Preference
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {['standard', 'deluxe', 'luxury'].map((acc) => (
                      <button
                        key={acc}
                        type="button"
                        onClick={() => setCustomPackage({ ...customPackage, accommodation: acc })}
                        className={`py-3 px-4 rounded-lg border-2 transition-all font-medium capitalize ${
                          customPackage.accommodation === acc
                            ? 'border-teal-600 bg-teal-50 text-teal-700'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        {acc}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Transportation */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                    <Plane className="w-4 h-4 text-teal-600" />
                    Transportation
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {['flight', 'train', 'bus', 'rental-car'].map((transport) => (
                      <button
                        key={transport}
                        type="button"
                        onClick={() => setCustomPackage({ ...customPackage, transportation: transport })}
                        className={`py-3 px-4 rounded-lg border-2 transition-all font-medium capitalize ${
                          customPackage.transportation === transport
                            ? 'border-teal-600 bg-teal-50 text-teal-700'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        {transport.replace('-', ' ')}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Meals */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                    <Utensils className="w-4 h-4 text-teal-600" />
                    Meal Plan
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {['breakfast', 'half-board', 'full-board', 'all-inclusive'].map((meal) => (
                      <button
                        key={meal}
                        type="button"
                        onClick={() => setCustomPackage({ ...customPackage, meals: meal })}
                        className={`py-3 px-4 rounded-lg border-2 transition-all font-medium text-sm ${
                          customPackage.meals === meal
                            ? 'border-teal-600 bg-teal-50 text-teal-700'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        {meal.replace('-', ' ').replace(/\b\w/g, c => c.toUpperCase())}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Activities */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                    <Camera className="w-4 h-4 text-teal-600" />
                    Preferred Activities (Select all that apply)
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {activityOptions.map((activity) => (
                      <button
                        key={activity}
                        type="button"
                        onClick={() => handleActivityToggle(activity)}
                        className={`py-2.5 px-4 rounded-lg border-2 transition-all font-medium text-sm ${
                          customPackage.activities.includes(activity)
                            ? 'border-teal-600 bg-teal-50 text-teal-700'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        {activity}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Special Requests */}
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">
                    Special Requests or Notes
                  </label>
                  <textarea
                    value={customPackage.specialRequests}
                    onChange={(e) => setCustomPackage({ ...customPackage, specialRequests: e.target.value })}
                    placeholder="Any special requirements, dietary restrictions, or preferences?"
                    rows="4"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setShowCustomModal(false)}
                    className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-semibold text-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-teal-600 to-teal-500 text-white rounded-lg hover:from-teal-700 hover:to-teal-600 transition-all font-semibold shadow-lg"
                  >
                    Submit Custom Package Request
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Success Popup */}
        {showSuccessPopup && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl transform animate-bounce-in">
              <div className="p-8 text-center">
                {/* Success Icon */}
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-10 h-10 text-green-600" />
                </div>

                {/* Success Message */}
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Request Submitted!
                </h3>
                <p className="text-gray-600 mb-6">
                  Your custom package request has been successfully submitted. Our travel experts will review your preferences and contact you shortly with a personalized itinerary.
                </p>

                {/* Details */}
                <div className="bg-teal-50 rounded-lg p-4 mb-6">
                  <p className="text-sm text-teal-800">
                    <strong>What's Next?</strong>
                  </p>
                  <ul className="text-sm text-teal-700 mt-2 space-y-1 text-left">
                    <li>• We'll review your requirements within 24 hours</li>
                    <li>• You'll receive a custom itinerary via email</li>
                    <li>• Our team will contact you to discuss details</li>
                  </ul>
                </div>

                {/* Close Button */}
                <button
                  onClick={() => setShowSuccessPopup(false)}
                  className="w-full px-6 py-3 bg-gradient-to-r from-teal-600 to-teal-500 text-white rounded-lg hover:from-teal-700 hover:to-teal-600 transition-all font-semibold shadow-lg"
                >
                  Got it, Thanks!
                </button>
              </div>
            </div>
          </div>
        )}
      </Container>
    </div>
  )
}

export default Packeges
