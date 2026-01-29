import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import Container from '../components/common/Container'
import { hotelAPI } from '../utils/api'
import GoogleMap from '../components/GoogleMap'
import { convertAndFormatToUSD, convertToUSD, formatUSD } from '../utils/currency'

const HotelSearchResults = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()

  const offerId = (searchParams.get('offerId') || '').trim()

  const query = useMemo(() => {
    const cityCode = (searchParams.get('cityCode') || '').trim().toUpperCase()
    const checkInDate = searchParams.get('checkInDate') || ''
    const checkOutDate = searchParams.get('checkOutDate') || ''
    const adults = Number(searchParams.get('adults') || 2)
    const roomQuantity = Number(searchParams.get('roomQuantity') || 1)
    const currency = 'USD'
    const limit = Number(searchParams.get('limit') || 60)
    const radiusKm = Number(searchParams.get('radiusKm') || 5)

    return { cityCode, checkInDate, checkOutDate, adults, roomQuantity, currency, limit, radiusKm }
  }, [searchParams])

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [results, setResults] = useState([])
  const [sortBy, setSortBy] = useState('price') // price, rating, distance, name
  const [viewMode, setViewMode] = useState('list') // list, map
  const [filterBy, setFilterBy] = useState({
    minPrice: '',
    maxPrice: '',
    minRating: '',
    amenities: []
  })

  // Enhanced hotel data state
  const [hotelDetails, setHotelDetails] = useState({})
  const [hotelReviews, setHotelReviews] = useState({})
  const [loadingDetails, setLoadingDetails] = useState(new Set())

  const searchKey = useMemo(() => {
    return [
      query.cityCode,
      query.checkInDate,
      query.checkOutDate,
      String(query.adults),
      String(query.roomQuantity),
      query.currency,
      String(query.limit),
      String(query.radiusKm)
    ].join('-')
  }, [query])

  // Redirect if we have a specific hotelId or offerId in the search URL
  useEffect(() => {
    const hotelIdParam = searchParams.get('hotelId')
    const offerIdParam = searchParams.get('offerId')

    if (hotelIdParam || offerIdParam) {
      navigate(`/PropertyDetails?${searchParams.toString()}`, { replace: true })
    }
  }, [searchParams, navigate])

  // Load enhanced hotel details
  const loadHotelDetails = async (hotelId) => {
    if (!hotelId || hotelDetails[hotelId] || loadingDetails.has(hotelId)) return

    setLoadingDetails(prev => new Set([...prev, hotelId]))

    try {
      const [hotelRes, reviewsRes] = await Promise.all([
        hotelAPI.getAmadeusHotel(hotelId),
        hotelAPI.getHotelReviews(hotelId)
      ])

      if (hotelRes?.success) {
        setHotelDetails(prev => ({
          ...prev,
          [hotelId]: hotelRes.data
        }))
      }

      if (reviewsRes?.success) {
        setHotelReviews(prev => ({
          ...prev,
          [hotelId]: reviewsRes.data
        }))
      }
    } catch (error) {
      console.error('Failed to load hotel details:', error)
    } finally {
      setLoadingDetails(prev => {
        const next = new Set(prev)
        next.delete(hotelId)
        return next
      })
    }
  }

  // Calculate nights between dates
  const calculateNights = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return 0
    const start = new Date(checkIn)
    const end = new Date(checkOut)
    const diffTime = Math.abs(end - start)
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  const nights = calculateNights(query.checkInDate, query.checkOutDate)

  const getHotelTotalPriceUSD = (hotel) => {
    const total = hotel?.offer?.price?.total
    const currency = hotel?.offer?.price?.currency
    if (total == null || total === '') return null
    const converted = convertToUSD(total, currency)
    return Number.isFinite(converted) && converted > 0 ? converted : null
  }

  const parseAmount = (value) => {
    if (value == null || value === '') return null
    const num = Number(value)
    return Number.isFinite(num) ? num : null
  }

  // Filter and sort results
  const filteredAndSortedResults = useMemo(() => {
    let filtered = [...results]

    let minAmount = parseAmount(filterBy.minPrice)
    let maxAmount = parseAmount(filterBy.maxPrice)

    // If user enters min > max, auto-swap to keep the range usable.
    if (minAmount != null && maxAmount != null && minAmount > maxAmount) {
      const tmp = minAmount
      minAmount = maxAmount
      maxAmount = tmp
    }

    const priceFilterActive = minAmount != null || maxAmount != null

    // Apply filters
    if (priceFilterActive) {
      filtered = filtered.filter((h) => {
        const price = getHotelTotalPriceUSD(h)
        // If filtering by price, exclude hotels without a price.
        if (price == null) return false
        if (minAmount != null && price < minAmount) return false
        if (maxAmount != null && price > maxAmount) return false
        return true
      })
    }

    if (filterBy.minRating) {
      filtered = filtered.filter(h => {
        const rating = parseFloat(h.rating || hotelReviews[h.hotelId]?.averageRating || 0)
        return rating >= parseFloat(filterBy.minRating)
      })
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price': {
          const priceA = getHotelTotalPriceUSD(a)
          const priceB = getHotelTotalPriceUSD(b)
          // Push missing prices to the end.
          if (priceA == null && priceB == null) return 0
          if (priceA == null) return 1
          if (priceB == null) return -1
          return priceA - priceB
        }
        case 'rating': {
          const ratingA = parseFloat(a.rating || hotelReviews[a.hotelId]?.averageRating || 0)
          const ratingB = parseFloat(b.rating || hotelReviews[b.hotelId]?.averageRating || 0)
          return ratingB - ratingA
        }
        case 'name':
          return (a.name || '').localeCompare(b.name || '')
        default:
          return 0
      }
    })

    return filtered
  }, [results, sortBy, filterBy, hotelReviews])

  // Get price range for filters
  const priceRange = useMemo(() => {
    const prices = results
      .map(getHotelTotalPriceUSD)
      .filter((p) => p != null)

    if (prices.length === 0) return { min: 0, max: 50000 }

    return {
      min: Math.floor(Math.min(...prices)),
      max: Math.ceil(Math.max(...prices))
    }
  }, [results])

  useEffect(() => {
    const run = async () => {
      setError(null)
      setResults([])

      if (!query.cityCode || query.cityCode.length !== 3) {
        setError('Missing or invalid cityCode. Go back and run a search again.')
        return
      }
      if (!query.checkInDate || !query.checkOutDate) {
        setError('Missing check-in/check-out dates. Go back and run a search again.')
        return
      }

      try {
        setLoading(true)
        const response = await hotelAPI.searchHotelOffers({
          cityCode: query.cityCode,
          checkInDate: query.checkInDate,
          checkOutDate: query.checkOutDate,
          adults: query.adults,
          roomQuantity: query.roomQuantity,
          currency: query.currency,
          limit: query.limit,
          radiusKm: query.radiusKm,
          includeOffers: 1,
          maxOffers: 6
        })

        if (response.success) {
          const hotels = (response.data || []).filter(h => h.hotelId)
          setResults(hotels)

          // Load enhanced details for first few hotels
          hotels.slice(0, 10).forEach(hotel => {
            if (hotel.hotelId) {
              loadHotelDetails(hotel.hotelId)
            }
          })
        } else {
          setError(response.message || 'Hotel search failed')
        }
      } catch (e) {
        setError(e.message || 'Hotel search failed')
      } finally {
        setLoading(false)
      }
    }

    run()
    // searchKey intentionally captures the query inputs; avoid re-running on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchKey])

  // Enhanced Hotel Card Component
  const HotelCard = ({ hotel }) => {
    const hotelDetail = hotelDetails[hotel.hotelId]
    const hotelReview = hotelReviews[hotel.hotelId]
    const isLoadingDetail = loadingDetails.has(hotel.hotelId)

    const rating = hotel.rating || hotelReview?.averageRating || 0
    const reviewCount = hotelReview?.total || 0
    const originalPrice = hotel.offer?.price?.total
    const originalCurrency = hotel.offer?.price?.currency || query.currency
    const price = originalPrice ? convertToUSD(originalPrice, originalCurrency) : null
    const formattedPrice = price ? convertAndFormatToUSD(originalPrice, originalCurrency) : null

    // Get rating description
    const getRatingDescription = (rating) => {
      if (rating >= 9) return 'Exceptional'
      if (rating >= 8) return 'Excellent'
      if (rating >= 7) return 'Very Good'
      if (rating >= 6) return 'Good'
      if (rating >= 5) return 'Fair'
      return 'Poor'
    }

    // Get sample amenities from offers
    const amenities = []
    if (hotel.offers && hotel.offers.length > 0) {
      const offer = hotel.offers[0]
      if (offer.policies?.paymentType) amenities.push('Payment: ' + offer.policies.paymentType)
      if (offer.policies?.cancellations?.[0]?.deadline) amenities.push('Free cancellation')
      if (offer.boardType) amenities.push('Board: ' + offer.boardType)
    }

    // Get room info
    const roomInfo = hotel.offers?.[0]?.roomInformation || hotel.offers?.[0]?.room
    const roomCategory = roomInfo?.typeEstimated?.category || 'Standard Room'
    const bedType = roomInfo?.typeEstimated?.bedType

    // Calculate price per night in USD
    const pricePerNight = price && nights > 0 ? Math.round(price / nights) : price

    return (
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200">
        <div className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Hotel Image Placeholder */}
            <div className="w-full sm:w-48 h-48 sm:h-32 bg-gray-100 rounded-lg flex-shrink-0 flex items-center justify-center">
              {hotelReview?.reviews?.[0]?.images?.[0]?.url ? (
                <img
                  src={hotelReview.reviews[0].images[0].url}
                  alt={hotel.name}
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <div className="text-gray-400 text-center">
                  <svg className="w-8 h-8 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                  </svg>
                  <span className="text-xs">No image</span>
                </div>
              )}
            </div>

            {/* Hotel Info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">{hotel.name}</h3>

                  {/* Rating */}
                  {rating > 0 && (
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center">
                        <div className="bg-blue-600 text-white px-2 py-1 rounded text-sm font-semibold">
                          {rating.toFixed(1)}
                        </div>
                        <span className="ml-2 text-sm text-gray-600">
                          {getRatingDescription(rating)}
                        </span>
                      </div>
                      {reviewCount > 0 && (
                        <span className="text-sm text-gray-500">
                          ({reviewCount} reviews)
                        </span>
                      )}
                    </div>
                  )}

                  {/* Address */}
                  {(hotel.address?.lines || hotelDetail?.address?.lines) && (
                    <p className="text-sm text-gray-600 mt-1 truncate">
                      {(hotel.address?.lines || hotelDetail?.address?.lines)?.join(', ')}
                      {hotel.cityCode && `, ${hotel.cityCode}`}
                    </p>
                  )}

                  {/* Distance - if available */}
                  {hotelDetail?.distance && (
                    <p className="text-sm text-green-600 mt-1">
                      {hotelDetail.distance.value} {hotelDetail.distance.unit} from city center
                    </p>
                  )}

                  {/* Room Type */}
                  <div className="mt-2">
                    <span className="text-sm font-medium text-gray-700">{roomCategory}</span>
                    {bedType && <span className="text-sm text-gray-600"> • {bedType}</span>}
                  </div>

                  {/* Amenities */}
                  {amenities.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {amenities.slice(0, 3).map((amenity, idx) => (
                        <span key={idx} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                          {amenity}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Price Section */}
                <div className="text-left sm:text-right flex-shrink-0 w-full sm:w-auto">
                  {price && (
                    <div className="mb-3 sm:mb-0">
                      <div className="text-xs sm:text-sm text-gray-500">
                        {nights > 1 ? `${nights} nights, ${query.adults} adults` : `${query.adults} adults`}
                      </div>
                      {nights > 1 && (
                        <div className="text-xs sm:text-sm text-gray-600">
                          {formatUSD(pricePerNight)} per night
                        </div>
                      )}
                      <div className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">
                        {formattedPrice}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-500">
                        Total price
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="mt-3 sm:mt-3 flex flex-col sm:flex-col gap-2">
                    {hotel.offer?.id && (
                      <Link
                        to={buildDetailsLink(hotel.hotelId, hotel.offer.id)}
                        className="block w-full bg-blue-600 text-white text-center py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                      >
                        See availability
                      </Link>
                    )}
                    <Link
                      to={buildDetailsLink(hotel.hotelId)}
                      className="block w-full border border-blue-600 text-blue-600 text-center py-2 px-4 rounded-lg hover:bg-blue-50 transition-colors text-sm font-medium"
                    >
                      More details
                    </Link>
                  </div>
                </div>
              </div>

              {/* Offers Section */}
              {hotel.offers && hotel.offers.length > 1 && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <h4 className="text-xs sm:text-sm font-medium text-gray-900 mb-2">
                    {hotel.offers.length} room options available
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {hotel.offers.slice(0, 4).map((offer, idx) => {
                      const offerRoom = offer.roomInformation || offer.room
                      const offerCategory = offerRoom?.typeEstimated?.category || 'Room'
                      const offerBed = offerRoom?.typeEstimated?.bedType
                      const offerOriginalPrice = offer.price?.total
                      const offerOriginalCurrency = offer.price?.currency
                      const offerPrice = offerOriginalPrice ? convertAndFormatToUSD(offerOriginalPrice, offerOriginalCurrency) : null

                      return (
                        <div key={offer.id || idx} className="border border-gray-200 rounded-lg p-3">
                          <div className="flex justify-between items-start">
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-gray-900 truncate">
                                {offerCategory}
                              </div>
                              {offerBed && (
                                <div className="text-xs text-gray-600">{offerBed}</div>
                              )}
                              {offer.boardType && (
                                <div className="text-xs text-gray-600">Board: {offer.boardType}</div>
                              )}
                              {offer.policies?.cancellations?.[0]?.deadline && (
                                <div className="text-xs text-green-600">
                                  Free cancel until {offer.policies.cancellations[0].deadline}
                                </div>
                              )}
                            </div>
                            {offerPrice && (
                              <div className="text-right ml-2">
                                <div className="text-sm font-semibold text-gray-900">
                                  {offerPrice}
                                </div>
                                <div className="text-xs text-gray-400">
                                  (from {offerOriginalCurrency})
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Reviews Preview */}
              {hotelReview?.reviews && hotelReview.reviews.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Recent reviews</h4>
                  <div className="space-y-2">
                    {hotelReview.reviews.slice(0, 2).map((review, idx) => (
                      <div key={review._id || idx} className="text-sm">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900">{review.title}</span>
                          <span className="text-yellow-500">★ {review.rating}</span>
                        </div>
                        <p className="text-gray-600 overflow-hidden" style={{
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical'
                        }}>{review.comment}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  const buildDetailsLink = (hotelId, nextOfferId) => {
    const next = new URLSearchParams(searchParams)
    next.set('hotelId', hotelId)
    if (nextOfferId) next.set('offerId', nextOfferId)
    else next.delete('offerId')
    return `/PropertyDetails?${next.toString()}`
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 md:py-10">
      <Container>
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-4 md:px-0 py-4 mb-4 md:mb-6 rounded-xl">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 p-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
                {query.cityCode}: {filteredAndSortedResults.length} properties found
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 mt-1 break-words">
                {query.checkInDate && query.checkOutDate ? (
                  <>
                    {new Date(query.checkInDate).toLocaleDateString()} - {new Date(query.checkOutDate).toLocaleDateString()}
                    {nights > 0 && ` • ${nights} night${nights > 1 ? 's' : ''}`}
                    • {query.adults} adult{query.adults > 1 ? 's' : ''}
                    • {query.roomQuantity} room{query.roomQuantity > 1 ? 's' : ''}
                  </>
                ) : (
                  'Search for your perfect stay'
                )}
              </p>
            </div>
            <Link
              to="/hotels"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm sm:text-base whitespace-nowrap self-start sm:self-auto"
            >
              New search
            </Link>
          </div>
        </div>

        {/* Main Search Results */}
        {loading && (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <div className="text-gray-700 font-medium text-lg">Searching hotels...</div>
            <div className="text-sm text-gray-500 mt-2">Finding the best deals for you</div>
          </div>
        )}

        {error && !loading && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          </div>
        )}

        {!loading && !error && (
          <>
            {/* Filters and Sorting */}
            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 mb-4 sm:mb-6">
              <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3 sm:gap-4">
                {/* View Mode Toggle */}
                <div className="flex items-center gap-2 border border-gray-300 rounded-lg p-1 w-full sm:w-auto">
                  <button
                    onClick={() => setViewMode('list')}
                    className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors ${viewMode === 'list'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                      }`}
                  >
                    List
                  </button>
                  <button
                    onClick={() => setViewMode('map')}
                    className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors ${viewMode === 'map'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                      }`}
                  >
                    Map
                  </button>
                </div>

                {/* Sort By */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                  <label className="text-xs sm:text-sm font-medium text-gray-700 sm:whitespace-nowrap">Sort by:</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full sm:w-auto"
                  >
                    <option value="price">Price (low to high)</option>
                    <option value="rating">Rating (high to low)</option>
                    <option value="name">Name (A to Z)</option>
                  </select>
                </div>

                {/* Clear Filters */}
                <button
                  onClick={() => setFilterBy({ minPrice: '', maxPrice: '', minRating: '', amenities: [] })}
                  className="text-blue-600 hover:text-blue-700 text-xs sm:text-sm font-medium w-full sm:w-auto text-left"
                >
                  Clear filters
                </button>
              </div>
            </div>

            {/* Hotel Cards */}
            {filteredAndSortedResults.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-2">No hotels found</h3>
                <p className="text-gray-600">Try adjusting your dates or location.</p>
              </div>
            ) : viewMode === 'map' ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="h-[500px] lg:h-[calc(100vh-250px)] sticky top-4">
                  <GoogleMap
                    center={
                      filteredAndSortedResults[0]?.latitude && filteredAndSortedResults[0]?.longitude
                        ? { lat: filteredAndSortedResults[0].latitude, lng: filteredAndSortedResults[0].longitude }
                        : { lat: 0, lng: 0 }
                    }
                    zoom={13}
                    markers={filteredAndSortedResults.map(hotel => {
                      const originalPrice = hotel.offer?.price?.total
                      const originalCurrency = hotel.offer?.price?.currency || query.currency
                      const usdPrice = originalPrice ? convertAndFormatToUSD(originalPrice, originalCurrency) : null

                      return {
                        position: {
                          lat: hotel.latitude || 0,
                          lng: hotel.longitude || 0
                        },
                        title: hotel.name,
                        content: `
                          <div style="padding: 12px; min-width: 200px;">
                            <h4 style="font-weight: bold; margin-bottom: 8px; font-size: 16px;">${hotel.name}</h4>
                            ${hotel.rating ? `<div style="color: #2563eb; font-weight: 600; margin-bottom: 4px;">★ ${hotel.rating}</div>` : ''}
                            ${usdPrice ? `<div style="color: #059669; font-weight: bold; font-size: 18px; margin-top: 8px;">${usdPrice}</div>` : ''}
                            <a href="${buildDetailsLink(hotel.hotelId, hotel.offer?.id)}" 
                               style="display: inline-block; margin-top: 8px; padding: 6px 12px; background: #2563eb; color: white; text-decoration: none; border-radius: 6px; font-size: 14px;">
                              View Details
                            </a>
                          </div>
                        `
                      }
                    })}
                    className="w-full h-full rounded-xl border border-gray-200"
                  />
                </div>
                <div className="space-y-4 overflow-y-auto max-h-[calc(100vh-250px)]">
                  {filteredAndSortedResults.map((hotel, index) => (
                    <HotelCard key={hotel.hotelId || index} hotel={hotel} />
                  ))}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {filteredAndSortedResults.map((hotel, index) => (
                  <HotelCard key={hotel.hotelId || index} hotel={hotel} />
                ))}
              </div>
            )}
          </>
        )}
      </Container>
    </div>
  )
}

export default HotelSearchResults