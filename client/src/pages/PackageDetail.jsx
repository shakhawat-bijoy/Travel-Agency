import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Container from '../components/common/Container'
import Button from '../components/common/Buttton'
import { FaStar, FaCheck, FaClock, FaCalendar, FaUsers, FaPlane, FaHotel, FaMapMarkerAlt } from 'react-icons/fa'
import { MdLocationOn } from 'react-icons/md'

const PackageDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [selectedDate, setSelectedDate] = useState('')
  const [travelers, setTravelers] = useState(1)

  // Package data (in real app, fetch from API)
  const packages = {
    1: {
      id: 1,
      title: 'Bangkok & Pattaya Adventure',
      location: 'Thailand',
      duration: '7 Days / 6 Nights',
      images: [
        'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=800&q=80',
        'https://images.unsplash.com/photo-1528181304800-259b08848526?w=800&q=80',
        'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=800&q=80'
      ],
      price: 899,
      originalPrice: 1299,
      rating: 4.8,
      reviews: 342,
      discount: '30% OFF',
      badge: 'Best Seller',
      description: 'Experience the perfect blend of culture, adventure, and relaxation in Thailand. Visit Bangkok\'s iconic temples, enjoy the vibrant nightlife of Pattaya, and indulge in authentic Thai cuisine.',
      highlights: [
        'Visit Grand Palace and Wat Pho in Bangkok',
        'Coral Island tour with water sports',
        'Alcazar Cabaret Show in Pattaya',
        'Traditional Thai massage session',
        'Shopping at floating markets',
        'Airport transfers included'
      ],
      included: [
        'Round-trip flights',
        '6 nights hotel accommodation',
        'Daily breakfast',
        'Airport transfers',
        'City tours with guide',
        'Entrance fees to attractions'
      ],
      notIncluded: [
        'Lunch and dinner',
        'Personal expenses',
        'Travel insurance',
        'Optional activities'
      ],
      itinerary: [
        { day: 1, title: 'Arrival in Bangkok', description: 'Arrive at Bangkok Airport, transfer to hotel. Evening free for leisure.' },
        { day: 2, title: 'Bangkok City Tour', description: 'Visit Grand Palace, Wat Pho, and Wat Arun. Evening shopping at Asiatique.' },
        { day: 3, title: 'Bangkok to Pattaya', description: 'Transfer to Pattaya. Check-in hotel. Evening Alcazar Show.' },
        { day: 4, title: 'Coral Island Tour', description: 'Full day Coral Island tour with water sports and lunch.' },
        { day: 5, title: 'Pattaya Free Day', description: 'Free day for shopping or optional activities.' },
        { day: 6, title: 'Pattaya to Bangkok', description: 'Return to Bangkok. Free time for shopping.' },
        { day: 7, title: 'Departure', description: 'Check out and transfer to airport for departure.' }
      ]
    },
    2: {
      id: 2,
      title: 'Dubai Desert Safari',
      location: 'United Arab Emirates',
      duration: '5 Days / 4 Nights',
      images: [
        'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80',
        'https://images.unsplash.com/photo-1518684079-3c830dcef090?w=800&q=80',
        'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&q=80'
      ],
      price: 1199,
      originalPrice: 1599,
      rating: 4.9,
      reviews: 528,
      discount: '25% OFF',
      badge: 'Trending',
      description: 'Discover the glamour of Dubai with thrilling desert adventures, world-class shopping, and architectural marvels. Experience luxury and tradition in one unforgettable journey.',
      highlights: [
        'Burj Khalifa observation deck',
        'Desert safari with BBQ dinner',
        'Dubai Marina dhow cruise',
        'Gold and spice souks visit',
        'Dubai Mall and Dubai Fountain',
        'Palm Jumeirah tour'
      ],
      included: [
        'Round-trip flights',
        '4 nights hotel accommodation',
        'Daily breakfast',
        'Desert safari with dinner',
        'City tour',
        'Airport transfers'
      ],
      notIncluded: [
        'Visa fees',
        'Lunch and dinner (except safari)',
        'Personal expenses',
        'Optional activities'
      ],
      itinerary: [
        { day: 1, title: 'Arrival in Dubai', description: 'Airport pickup and hotel check-in. Evening at leisure.' },
        { day: 2, title: 'Dubai City Tour', description: 'Visit Burj Khalifa, Dubai Mall, Dubai Fountain.' },
        { day: 3, title: 'Desert Safari', description: 'Afternoon desert safari with dune bashing, camel ride, and BBQ dinner.' },
        { day: 4, title: 'Free Day', description: 'Optional activities or shopping at Mall of Emirates.' },
        { day: 5, title: 'Departure', description: 'Check out and airport transfer.' }
      ]
    },
    3: {
      id: 3,
      title: 'Maldives Paradise Escape',
      location: 'Maldives',
      duration: '6 Days / 5 Nights',
      images: [
        'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800&q=80',
        'https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=800&q=80',
        'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&q=80'
      ],
      price: 1899,
      originalPrice: 2499,
      rating: 5.0,
      reviews: 421,
      discount: '24% OFF',
      badge: 'Luxury',
      description: 'Escape to paradise with pristine beaches, crystal-clear waters, and luxurious overwater villas. Enjoy world-class diving, spa treatments, and unforgettable sunsets.',
      highlights: [
        'Overwater villa accommodation',
        'Snorkeling and diving',
        'Spa and wellness treatments',
        'Private beach access',
        'Sunset cruise',
        'All meals included'
      ],
      included: [
        'Round-trip flights',
        '5 nights overwater villa',
        'All meals (breakfast, lunch, dinner)',
        'Water sports equipment',
        'Spa session',
        'Sunset cruise'
      ],
      notIncluded: [
        'Alcoholic beverages',
        'Scuba diving certification courses',
        'Personal expenses',
        'Travel insurance'
      ],
      itinerary: [
        { day: 1, title: 'Arrival', description: 'Airport pickup, speedboat transfer to resort.' },
        { day: 2, title: 'Beach Day', description: 'Relax on private beach, snorkeling.' },
        { day: 3, title: 'Water Sports', description: 'Kayaking, paddleboarding, jet skiing.' },
        { day: 4, title: 'Spa & Wellness', description: 'Full spa treatment and yoga session.' },
        { day: 5, title: 'Sunset Cruise', description: 'Private sunset cruise with champagne.' },
        { day: 6, title: 'Departure', description: 'Check out and transfer to airport.' }
      ]
    },
    4: {
      id: 4,
      title: 'Turkey Heritage Tour',
      location: 'Turkey',
      duration: '8 Days / 7 Nights',
      images: [
        'https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?w=800&q=80',
        'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=800&q=80',
        'https://images.unsplash.com/photo-1570939274717-7eda259b50ed?w=800&q=80'
      ],
      price: 1299,
      originalPrice: 1799,
      rating: 4.7,
      reviews: 289,
      discount: '28% OFF',
      badge: 'Popular',
      description: 'Journey through Turkey\'s rich history and stunning landscapes. From Istanbul\'s grand mosques to Cappadocia\'s fairy chimneys, experience the magic of this ancient land.',
      highlights: [
        'Hagia Sophia and Blue Mosque',
        'Hot air balloon ride in Cappadocia',
        'Pamukkale thermal pools',
        'Ephesus ancient city',
        'Bosphorus cruise',
        'Turkish bath experience'
      ],
      included: [
        'Round-trip flights',
        '7 nights hotel accommodation',
        'Daily breakfast',
        'All transfers',
        'Guided tours',
        'Entrance fees'
      ],
      notIncluded: [
        'Lunch and dinner',
        'Hot air balloon ride',
        'Personal expenses',
        'Travel insurance'
      ],
      itinerary: [
        { day: 1, title: 'Istanbul Arrival', description: 'Airport pickup and hotel check-in.' },
        { day: 2, title: 'Istanbul Tour', description: 'Visit Hagia Sophia, Blue Mosque, Topkapi Palace.' },
        { day: 3, title: 'Cappadocia', description: 'Flight to Cappadocia, explore underground city.' },
        { day: 4, title: 'Hot Air Balloon', description: 'Optional balloon ride, valley tours.' },
        { day: 5, title: 'Pamukkale', description: 'Travel to Pamukkale, visit thermal pools.' },
        { day: 6, title: 'Ephesus', description: 'Explore ancient Ephesus ruins.' },
        { day: 7, title: 'Return to Istanbul', description: 'Bosphorus cruise, Grand Bazaar.' },
        { day: 8, title: 'Departure', description: 'Airport transfer.' }
      ]
    },
    5: {
      id: 5,
      title: 'Singapore City Break',
      location: 'Singapore',
      duration: '4 Days / 3 Nights',
      images: [
        'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800&q=80',
        'https://images.unsplash.com/photo-1565967511849-76a60a516170?w=800&q=80',
        'https://images.unsplash.com/photo-1508964942454-1a56651d54ac?w=800&q=80'
      ],
      price: 799,
      originalPrice: 1099,
      rating: 4.6,
      reviews: 312,
      discount: '27% OFF',
      badge: 'New',
      description: 'Explore the modern metropolis of Singapore with its stunning skyline, diverse cuisine, and world-class attractions. Perfect for a quick getaway.',
      highlights: [
        'Gardens by the Bay',
        'Marina Bay Sands',
        'Universal Studios',
        'Sentosa Island',
        'Night Safari',
        'Hawker center food tour'
      ],
      included: [
        'Round-trip flights',
        '3 nights hotel accommodation',
        'Daily breakfast',
        'City pass',
        'Airport transfers',
        'Night Safari ticket'
      ],
      notIncluded: [
        'Lunch and dinner',
        'Universal Studios ticket',
        'Personal expenses',
        'Travel insurance'
      ],
      itinerary: [
        { day: 1, title: 'Arrival', description: 'Airport pickup, hotel check-in, Marina Bay area.' },
        { day: 2, title: 'City Tour', description: 'Gardens by the Bay, Merlion, Chinatown.' },
        { day: 3, title: 'Sentosa Island', description: 'Beach activities, cable car ride.' },
        { day: 4, title: 'Departure', description: 'Last-minute shopping, airport transfer.' }
      ]
    },
    6: {
      id: 6,
      title: 'Bali Tropical Paradise',
      location: 'Indonesia',
      duration: '7 Days / 6 Nights',
      images: [
        'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80',
        'https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=800&q=80',
        'https://images.unsplash.com/photo-1559628376-f3fe5f782a2e?w=800&q=80'
      ],
      price: 1099,
      originalPrice: 1499,
      rating: 4.8,
      reviews: 456,
      discount: '27% OFF',
      badge: 'Top Rated',
      description: 'Immerse yourself in Bali\'s natural beauty, ancient temples, and vibrant culture. From rice terraces to pristine beaches, experience the island of the gods.',
      highlights: [
        'Ubud rice terraces',
        'Tanah Lot temple',
        'Traditional Balinese spa',
        'White water rafting',
        'Beach clubs in Seminyak',
        'Traditional dance performance'
      ],
      included: [
        'Round-trip flights',
        '6 nights resort accommodation',
        'Daily breakfast',
        'Temple tours',
        'Spa treatment',
        'Airport transfers'
      ],
      notIncluded: [
        'Lunch and dinner',
        'Water rafting',
        'Personal expenses',
        'Travel insurance'
      ],
      itinerary: [
        { day: 1, title: 'Arrival', description: 'Airport pickup, resort check-in.' },
        { day: 2, title: 'Ubud Tour', description: 'Rice terraces, monkey forest, traditional market.' },
        { day: 3, title: 'Temple Tour', description: 'Visit Tanah Lot and Uluwatu temples.' },
        { day: 4, title: 'Spa Day', description: 'Balinese massage and wellness treatments.' },
        { day: 5, title: 'Beach Day', description: 'Relax at Seminyak beach, beach clubs.' },
        { day: 6, title: 'Water Activities', description: 'Optional rafting or snorkeling.' },
        { day: 7, title: 'Departure', description: 'Last shopping, airport transfer.' }
      ]
    }
  }

  const packageData = packages[id] || packages[1]
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
        {/* Breadcrumb */}
        <div className="mb-6 text-sm text-gray-600">
          <span className="cursor-pointer hover:text-teal-600" onClick={() => navigate('/')}>Home</span>
          <span className="mx-2">/</span>
          <span className="cursor-pointer hover:text-teal-600" onClick={() => navigate('/')}>Packages</span>
          <span className="mx-2">/</span>
          <span className="text-gray-900">{packageData.title}</span>
        </div>

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
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2 font-montserrat">
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
              <p className="text-4xl font-bold text-teal-600 mb-1">
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
                className="w-full h-96 object-cover rounded-xl"
              />
            </div>
            <div className="grid grid-cols-3 lg:grid-cols-1 gap-4">
              {packageData.images.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`${packageData.title} ${idx + 1}`}
                  className={`w-full h-28 lg:h-[120px] object-cover rounded-lg cursor-pointer border-2 transition-all ${
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
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
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
