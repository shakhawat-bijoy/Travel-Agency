import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import Container from '../components/common/Container'
import { hotelAPI } from '../utils/api'
import GoogleMap from '../components/GoogleMap'
import { convertAndFormatToUSD, convertToUSD, formatUSD } from '../utils/currency'

const HotelSearchResults = () => {
  const [searchParams, setSearchParams] = useSearchParams()

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

  // Hotel details state
  const [detailsLoading, setDetailsLoading] = useState(false)
  const [detailsError, setDetailsError] = useState(null)
  const [detailsData, setDetailsData] = useState(null)
  const [hotelInfo, setHotelInfo] = useState(null)
  const [reviews, setReviews] = useState({ averageRating: 0, total: 0, reviews: [] })

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
    ].join('|')
  }, [
    query.cityCode,
    query.checkInDate,
    query.checkOutDate,
    query.adults,
    query.roomQuantity,
    query.currency,
    query.limit,
    query.radiusKm
  ])

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
          const hotels = response.data || []
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

  useEffect(() => {
    const run = async () => {
      setDetailsError(null)
      setDetailsData(null)
      setHotelInfo(null)
      setReviews({ averageRating: 0, total: 0, reviews: [] })

      if (!offerId) return

      try {
        setDetailsLoading(true)
        const res = await hotelAPI.getHotelOffer(offerId)
        if (res.success) {
          setDetailsData(res.data)
        } else {
          setDetailsError(res.message || 'Failed to load hotel details')
        }
      } catch (e) {
        setDetailsError(e.message || 'Failed to load hotel details')
      } finally {
        setDetailsLoading(false)
      }
    }

    run()
  }, [offerId])

  const offerDetails = detailsData?.data
  const hotel = offerDetails?.hotel
  const externalHotelId = hotel?.hotelId

  useEffect(() => {
    const hydrate = async () => {
      if (!externalHotelId) return

      try {
        const [hotelRes, reviewsRes] = await Promise.all([
          hotelAPI.getAmadeusHotel(externalHotelId),
          hotelAPI.getHotelReviews(externalHotelId)
        ])

        if (hotelRes?.success) setHotelInfo(hotelRes.data)
        if (reviewsRes?.success) setReviews(reviewsRes.data)
      } catch {
        // keep page usable even if these fail
      }
    }

    hydrate()
  }, [externalHotelId])

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

                  {/* Location Map Preview - Hidden on mobile for space */}
                  {((hotel.latitude && hotel.longitude) || hotelDetail?.geoCode) && (
                    <div className="mt-2 hidden sm:block">
                      <GoogleMap
                        center={{
                          lat: hotel.latitude || hotelDetail.geoCode.latitude,
                          lng: hotel.longitude || hotelDetail.geoCode.longitude
                        }}
                        zoom={14}
                        markers={[
                          {
                            position: {
                              lat: hotel.latitude || hotelDetail.geoCode.latitude,
                              lng: hotel.longitude || hotelDetail.geoCode.longitude
                            },
                            title: hotel.name
                          }
                        ]}
                        className="w-full h-24 rounded border border-gray-200"
                      />
                    </div>
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
                        to={buildDetailsLink(hotel.offer.id)}
                        className="block w-full bg-blue-600 text-white text-center py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                      >
                        See availability
                      </Link>
                    )}
                    <button
                      onClick={() => loadHotelDetails(hotel.hotelId)}
                      disabled={isLoadingDetail}
                      className="block w-full border border-blue-600 text-blue-600 text-center py-2 px-4 rounded-lg hover:bg-blue-50 transition-colors text-sm font-medium disabled:opacity-50"
                    >
                      {isLoadingDetail ? 'Loading...' : 'More details'}
                    </button>
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

  const buildDetailsLink = (nextOfferId) => {
    const next = new URLSearchParams(searchParams)
    next.set('offerId', nextOfferId)
    return `/hotels/search?${next.toString()}`
  }

  const clearOfferId = () => {
    const next = new URLSearchParams(searchParams)
    next.delete('offerId')
    setSearchParams(next, { replace: true })
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 md:py-10" style={{ minHeight: '100vh' }}>
      <Container>
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-4 md:px-0 py-4 mb-4 md:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
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

        {/* Hotel Details Modal/Page */}
        {offerId && (
          <div className="mb-6">
            <div className="flex items-center justify-between gap-3 mb-3 px-4 md:px-0">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Hotel details</h2>
                <p className="text-sm text-gray-600 truncate">
                  {detailsData?.data?.hotel?.name || 'Hotel'}{detailsData?.data?.hotel?.cityCode ? ` • ${detailsData.data.hotel.cityCode}` : ''}
                </p>
              </div>
              <button
                type="button"
                onClick={clearOfferId}
                className="text-blue-600 hover:text-blue-700 font-semibold "
              >
                ← Back to results
              </button>
            </div>

            {detailsLoading && (
              <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <div className="text-gray-700 font-medium">Loading hotel details...</div>
              </div>
            )}

            {detailsError && !detailsLoading && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {detailsError}
              </div>
            )}

            {!detailsLoading && !detailsError && detailsData && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Hotel Overview */}
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">
                      {detailsData.data.hotel?.name}
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">Hotel ID:</span>
                        <span className="ml-2 text-gray-600">{detailsData.data.hotel?.hotelId}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">City:</span>
                        <span className="ml-2 text-gray-600">{detailsData.data.hotel?.cityCode}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Rating:</span>
                        <span className="ml-2 text-gray-600">
                          {detailsData.data.hotel?.rating || reviews.averageRating || '—'}
                          {reviews.total > 0 && ` (${reviews.total} reviews)`}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Address:</span>
                        <span className="ml-2 text-gray-600">
                          {hotelInfo?.address?.lines?.length
                            ? `${hotelInfo.address.lines.join(', ')}${hotelInfo.address.cityName ? `, ${hotelInfo.address.cityName}` : ''}`
                            : detailsData.data.hotel?.address?.lines?.length
                              ? detailsData.data.hotel.address.lines.join(', ')
                              : '—'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Room Options */}
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Available rooms</h3>
                    {detailsData.data.offers?.length > 0 ? (
                      <div className="space-y-4">
                        {detailsData.data.offers.map((offer, idx) => {
                          const room = offer.roomInformation || offer.room
                          const roomCategory = room?.typeEstimated?.category || 'Standard Room'
                          const bedType = room?.typeEstimated?.bedType
                          
                          return (
                            <div key={offer.id || idx} className="border border-gray-200 rounded-lg p-4">
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <h4 className="font-semibold text-gray-900">{roomCategory}</h4>
                                  {bedType && <p className="text-sm text-gray-600">{bedType}</p>}
                                  {offer.boardType && (
                                    <p className="text-sm text-gray-600">Board type: {offer.boardType}</p>
                                  )}
                                  
                                  {/* Room Description */}
                                  {(room?.description?.text || room?.description) && (
                                    <p className="text-sm text-gray-700 mt-2">
                                      {room.description.text || room.description}
                                    </p>
                                  )}
                                  
                                  {/* Policies */}
                                  <div className="mt-3 space-y-1 text-sm">
                                    {offer.policies?.cancellations?.[0]?.deadline && (
                                      <div className="text-green-600">
                                        ✓ Free cancellation until {offer.policies.cancellations[0].deadline}
                                      </div>
                                    )}
                                    {offer.policies?.paymentType && (
                                      <div className="text-gray-600">
                                        Payment: {offer.policies.paymentType}
                                      </div>
                                    )}
                                  </div>
                                </div>
                                
                                <div className="text-right ml-4">
                                  <div className="text-2xl font-bold text-gray-900">
                                    {offer.price?.total ? convertAndFormatToUSD(offer.price.total, offer.price.currency) : '—'}
                                  </div>
                                  <div className="text-sm text-gray-500">Total price</div>
                                  {nights > 1 && offer.price?.total && (
                                    <div className="text-sm text-gray-500">
                                      {formatUSD(Math.round(convertToUSD(offer.price.total, offer.price.currency) / nights))} per night
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    ) : (
                      <p className="text-gray-600">No room details available</p>
                    )}
                  </div>

                  {/* Photos */}
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Photos</h3>
                    {reviews.reviews?.some(r => r.images?.length > 0) ? (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {reviews.reviews
                          .flatMap(r => r.images || [])
                          .filter(img => img?.url)
                          .slice(0, 9)
                          .map((img, idx) => (
                            <img
                              key={idx}
                              src={img.url}
                              alt="Hotel photo"
                              className="w-full h-32 object-cover rounded-lg border border-gray-200"
                              loading="lazy"
                            />
                          ))}
                      </div>
                    ) : (
                      <p className="text-gray-600">
                        No photos available. Photos will appear here when guests upload them with reviews.
                      </p>
                    )}
                  </div>

                  {/* Reviews */}
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Guest reviews</h3>
                    {reviews.total > 0 ? (
                      <div className="space-y-4">
                        <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg">
                          <div className="text-center">
                            <div className="text-3xl font-bold text-blue-600">{reviews.averageRating}</div>
                            <div className="text-sm text-gray-600">out of 5</div>
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">
                              {reviews.averageRating >= 9 ? 'Exceptional' :
                               reviews.averageRating >= 8 ? 'Excellent' :
                               reviews.averageRating >= 7 ? 'Very Good' :
                               reviews.averageRating >= 6 ? 'Good' : 'Fair'}
                            </div>
                            <div className="text-sm text-gray-600">{reviews.total} verified reviews</div>
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          {reviews.reviews.slice(0, 5).map((review, idx) => (
                            <div key={review._id || idx} className="border-b border-gray-100 pb-4 last:border-b-0">
                              <div className="flex items-start justify-between mb-2">
                                <h4 className="font-semibold text-gray-900">{review.title}</h4>
                                <div className="flex items-center gap-1 text-yellow-500">
                                  <span>★</span>
                                  <span className="text-gray-700">{review.rating}</span>
                                </div>
                              </div>
                              <p className="text-gray-700 mb-2">{review.comment}</p>
                              {review.images?.length > 0 && (
                                <div className="flex gap-2 overflow-x-auto">
                                  {review.images.slice(0, 3).map((img, imgIdx) => (
                                    <img
                                      key={imgIdx}
                                      src={img.url}
                                      alt="Review photo"
                                      className="h-16 w-24 object-cover rounded border border-gray-200 flex-shrink-0"
                                      loading="lazy"
                                    />
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-600">No reviews yet for this hotel.</p>
                    )}
                  </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                  {/* Booking Summary */}
                  <div className="bg-white rounded-xl shadow-sm p-6 sticky top-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Your booking</h3>
                    
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Check-in:</span>
                        <span className="font-medium">{query.checkInDate}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Check-out:</span>
                        <span className="font-medium">{query.checkOutDate}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Guests:</span>
                        <span className="font-medium">{query.adults} adults</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Rooms:</span>
                        <span className="font-medium">{query.roomQuantity}</span>
                      </div>
                      {nights > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Duration:</span>
                          <span className="font-medium">{nights} night{nights > 1 ? 's' : ''}</span>
                        </div>
                      )}
                    </div>

                    {detailsData.data.offers?.[0]?.price && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-semibold text-gray-900">Total price:</span>
                          <span className="text-2xl font-bold text-blue-600">
                            {convertAndFormatToUSD(detailsData.data.offers[0].price.total, detailsData.data.offers[0].price.currency)}
                          </span>
                        </div>
                        {nights > 1 && (
                          <div className="text-sm text-gray-600 text-right">
                            {formatUSD(Math.round(convertToUSD(detailsData.data.offers[0].price.total, detailsData.data.offers[0].price.currency) / nights))} per night
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Map */}
                  {hotelInfo?.geoCode && (
                    <div className="bg-white rounded-xl shadow-sm p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Location</h3>
                      <GoogleMap
                        center={{
                          lat: hotelInfo.geoCode.latitude,
                          lng: hotelInfo.geoCode.longitude
                        }}
                        zoom={15}
                        markers={[
                          {
                            position: {
                              lat: hotelInfo.geoCode.latitude,
                              lng: hotelInfo.geoCode.longitude
                            },
                            title: detailsData.data.hotel?.name || 'Hotel',
                            content: `
                              <div style="padding: 8px;">
                                <h4 style="font-weight: bold; margin-bottom: 4px;">${detailsData.data.hotel?.name || 'Hotel'}</h4>
                                ${hotelInfo.address?.cityName ? `<p style="color: #666; font-size: 14px;">${hotelInfo.address.cityName}</p>` : ''}
                              </div>
                            `
                          }
                        ]}
                        className="w-full h-64 rounded-lg overflow-hidden border border-gray-200"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Main Search Results */}
        {!offerId && (
          <>
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
                        className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                          viewMode === 'list'
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <span className="flex items-center justify-center gap-2">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                          </svg>
                          <span className="hidden sm:inline">List</span>
                        </span>
                      </button>
                      <button
                        onClick={() => setViewMode('map')}
                        className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                          viewMode === 'map'
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <span className="flex items-center justify-center gap-2">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M12 1.586l-4 4v12.828l4-4V1.586zM3.707 3.293A1 1 0 002 4v10a1 1 0 00.293.707L6 18.414V5.586L3.707 3.293zM17.707 5.293L14 1.586v12.828l2.293 2.293A1 1 0 0018 16V6a1 1 0 00-.293-.707z" clipRule="evenodd" />
                          </svg>
                          <span className="hidden sm:inline">Map</span>
                        </span>
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

                    {/* Price Filter */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                      <label className="text-xs sm:text-sm font-medium text-gray-700 sm:whitespace-nowrap">Price (USD):</label>
                      <div className="flex items-center gap-2 flex-1 sm:flex-none">
                        <input
                          type="number"
                          placeholder={`Min`}
                          value={filterBy.minPrice}
                          onChange={(e) => setFilterBy(prev => ({ ...prev, minPrice: e.target.value }))}
                          className="border border-gray-300 rounded-lg px-2 sm:px-3 py-2 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 flex-1 sm:w-24"
                        />
                        <span className="text-gray-500">-</span>
                        <input
                          type="number"
                          placeholder={`Max`}
                          value={filterBy.maxPrice}
                          onChange={(e) => setFilterBy(prev => ({ ...prev, maxPrice: e.target.value }))}
                          className="border border-gray-300 rounded-lg px-2 sm:px-3 py-2 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 flex-1 sm:w-24"
                        />
                      </div>
                    </div>

                    {/* Rating Filter */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                      <label className="text-xs sm:text-sm font-medium text-gray-700 sm:whitespace-nowrap">Min rating:</label>
                      <select
                        value={filterBy.minRating}
                        onChange={(e) => setFilterBy(prev => ({ ...prev, minRating: e.target.value }))}
                        className="border border-gray-300 rounded-lg px-3 py-2 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full sm:w-auto"
                      >
                        <option value="">Any rating</option>
                        <option value="6">6+ Good</option>
                        <option value="7">7+ Very Good</option>
                        <option value="8">8+ Excellent</option>
                        <option value="9">9+ Exceptional</option>
                      </select>
                    </div>

                    {/* Clear Filters */}
                    <button
                      onClick={() => setFilterBy({ minPrice: '', maxPrice: '', minRating: '', amenities: [] })}
                      className="text-blue-600 hover:text-blue-700 text-xs sm:text-sm font-medium w-full sm:w-auto text-left sm:text-center px-2 sm:px-0 py-2 sm:py-0"
                    >
                      Clear filters
                    </button>
                  </div>
                </div>

                {/* Results Count */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4 px-4 md:px-0">
                  <div className="text-xs sm:text-sm text-gray-600">
                    Showing <span className="font-semibold">{filteredAndSortedResults.length}</span> of <span className="font-semibold">{results.length}</span> properties
                  </div>
                  {priceRange.min > 0 && (
                    <div className="text-xs sm:text-sm text-gray-600">
                      Price range: {formatUSD(priceRange.min)} - {formatUSD(priceRange.max)}
                    </div>
                  )}
                </div>

                {/* Hotel Cards */}
                {filteredAndSortedResults.length === 0 ? (
                  <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                    <div className="text-gray-400 mb-4">
                      <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h12a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1V8z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No hotels found</h3>
                    <p className="text-gray-600">
                      {results.length === 0 
                        ? "No hotels found for this search. Try adjusting your dates or location."
                        : "No hotels match your current filters. Try adjusting your criteria."
                      }
                    </p>
                  </div>
                ) : viewMode === 'map' ? (
                  /* Map View */
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    {/* Map */}
                    <div className="lg:col-span-1 sticky top-4 h-[400px] sm:h-[500px] lg:h-[calc(100vh-200px)]">
                      <GoogleMap
                        center={
                          filteredAndSortedResults[0]?.latitude && filteredAndSortedResults[0]?.longitude
                            ? {
                                lat: filteredAndSortedResults[0].latitude,
                                lng: filteredAndSortedResults[0].longitude
                              }
                            : hotelDetails[filteredAndSortedResults[0]?.hotelId]?.geoCode
                            ? {
                                lat: hotelDetails[filteredAndSortedResults[0].hotelId].geoCode.latitude,
                                lng: hotelDetails[filteredAndSortedResults[0].hotelId].geoCode.longitude
                              }
                            : { lat: 0, lng: 0 }
                        }
                        zoom={13}
                        markers={filteredAndSortedResults
                          .filter(hotel => {
                            const hasCoords = hotel.latitude && hotel.longitude
                            const hasDetailCoords = hotelDetails[hotel.hotelId]?.geoCode
                            return hasCoords || hasDetailCoords
                          })
                          .map(hotel => {
                            const lat = hotel.latitude || hotelDetails[hotel.hotelId]?.geoCode?.latitude
                            const lng = hotel.longitude || hotelDetails[hotel.hotelId]?.geoCode?.longitude
                            const originalPrice = hotel.offer?.price?.total
                            const originalCurrency = hotel.offer?.price?.currency || query.currency
                            const usdPrice = originalPrice ? convertAndFormatToUSD(originalPrice, originalCurrency) : null
                            
                            return {
                              position: { lat, lng },
                              title: hotel.name,
                              content: `
                                <div style="padding: 12px; min-width: 200px;">
                                  <h4 style="font-weight: bold; margin-bottom: 8px; font-size: 16px;">${hotel.name}</h4>
                                  ${hotel.rating ? `<div style="color: #2563eb; font-weight: 600; margin-bottom: 4px;">★ ${hotel.rating}</div>` : ''}
                                  ${usdPrice ? `<div style="color: #059669; font-weight: bold; font-size: 18px; margin-top: 8px;">${usdPrice}</div>` : ''}
                                  ${hotel.address?.lines ? `<div style="color: #666; font-size: 12px; margin-top: 4px;">${hotel.address.lines[0]}</div>` : ''}
                                  <a href="/hotels/search?${new URLSearchParams({ ...Object.fromEntries(searchParams), offerId: hotel.offer?.id || '' }).toString()}" 
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

                    {/* Hotel List */}
                    <div className="lg:col-span-1 space-y-4 overflow-y-auto max-h-[400px] lg:max-h-[calc(100vh-200px)]">
                      {filteredAndSortedResults.map((hotel, index) => (
                        <HotelCard key={hotel.hotelId || hotel.name || index} hotel={hotel} />
                      ))}
                    </div>
                  </div>
                ) : (
                  /* List View */
                  <div className="space-y-4">
                    {filteredAndSortedResults.map((hotel, index) => (
                      <HotelCard key={hotel.hotelId || hotel.name || index} hotel={hotel} />
                    ))}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </Container>
    </div>
  )
}

export default HotelSearchResults