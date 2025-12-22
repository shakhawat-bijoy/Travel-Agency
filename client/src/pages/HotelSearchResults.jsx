import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import Container from '../components/common/Container'
import { hotelAPI } from '../utils/api'

let MapContainer, TileLayer, Marker, Popup

const HotelSearchResults = () => {
  const [searchParams, setSearchParams] = useSearchParams()

  const offerId = (searchParams.get('offerId') || '').trim()

  const query = useMemo(() => {
    const cityCode = (searchParams.get('cityCode') || '').trim().toUpperCase()
    const checkInDate = searchParams.get('checkInDate') || ''
    const checkOutDate = searchParams.get('checkOutDate') || ''
    const adults = Number(searchParams.get('adults') || 2)
    const roomQuantity = Number(searchParams.get('roomQuantity') || 1)
    const currency = (searchParams.get('currency') || 'USD').trim().toUpperCase()
    const limit = Number(searchParams.get('limit') || 60)
    const radiusKm = Number(searchParams.get('radiusKm') || 5)

    return { cityCode, checkInDate, checkOutDate, adults, roomQuantity, currency, limit, radiusKm }
  }, [searchParams])

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [results, setResults] = useState([])

  const [detailsLoading, setDetailsLoading] = useState(false)
  const [detailsError, setDetailsError] = useState(null)
  const [detailsData, setDetailsData] = useState(null)
  const [hotelInfo, setHotelInfo] = useState(null)
  const [reviews, setReviews] = useState({ averageRating: 0, total: 0, reviews: [] })
  const [mapReady, setMapReady] = useState(false)

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
          radiusKm: query.radiusKm
        })

        if (response.success) {
          setResults(response.data || [])
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
  }, [searchKey])

  useEffect(() => {
    // Load Leaflet only in browser (once)
    ;(async () => {
      if (typeof window === 'undefined') return
      if (mapReady) return

      const L = (await import('leaflet')).default
      const leaflet = await import('react-leaflet')
      MapContainer = leaflet.MapContainer
      TileLayer = leaflet.TileLayer
      Marker = leaflet.Marker
      Popup = leaflet.Popup

      await import('leaflet/dist/leaflet.css')

      delete L.Icon.Default.prototype._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl:
          'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl:
          'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl:
          'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png'
      })

      setMapReady(true)
    })()
  }, [mapReady])

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
  const offers = offerDetails?.offers || []
  const firstOffer = offers[0]
  const externalHotelId = hotel?.hotelId

  const location = useMemo(() => {
    const geo = hotelInfo?.geoCode
    if (!geo?.latitude || !geo?.longitude) return null
    return [geo.latitude, geo.longitude]
  }, [hotelInfo])

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

  const photoUrls = useMemo(() => {
    const imgs = []
    for (const r of reviews.reviews || []) {
      for (const img of r.images || []) {
        if (img?.url) imgs.push(img.url)
      }
    }
    return Array.from(new Set(imgs)).slice(0, 9)
  }, [reviews])

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
    <div className="py-8">
      <Container>
        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Hotel search results</h1>
            <p className="text-sm text-gray-600">
              {query.cityCode}{query.checkInDate && query.checkOutDate ? ` • ${query.checkInDate} → ${query.checkOutDate}` : ''}
            </p>
          </div>
          <Link
            to="/hotels"
            className="text-teal-600 hover:text-teal-700 font-semibold"
          >
            Back to search
          </Link>
        </div>

        {offerId && (
          <div className="mb-6">
            <div className="flex items-center justify-between gap-3 mb-3">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Hotel details</h2>
                <p className="text-sm text-gray-600 truncate">
                  {hotel?.name || 'Hotel'}{hotel?.cityCode ? ` • ${hotel.cityCode}` : ''}
                </p>
              </div>
              <button
                type="button"
                onClick={clearOfferId}
                className="text-teal-600 hover:text-teal-700 font-semibold"
              >
                Back to results
              </button>
            </div>

            {detailsLoading && (
              <div className="bg-white border border-gray-200 rounded-xl p-4">
                <div className="text-gray-700 font-medium">Loading details…</div>
              </div>
            )}

            {detailsError && !detailsLoading && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {detailsError}
              </div>
            )}

            {!detailsLoading && !detailsError && detailsData && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2 space-y-4">
                  <div className="bg-white border border-gray-200 rounded-xl p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">Hotel</h3>
                    <div className="text-sm text-gray-700 space-y-1">
                      <div><span className="font-medium">Name:</span> {hotel?.name || '—'}</div>
                      <div><span className="font-medium">Hotel ID:</span> {hotel?.hotelId || '—'}</div>
                      <div><span className="font-medium">City:</span> {hotel?.cityCode || '—'}</div>
                      <div>
                        <span className="font-medium">Rating:</span> {hotel?.rating || (reviews.averageRating ? reviews.averageRating : '—')}
                        {reviews.total ? ` (${reviews.total} reviews)` : ''}
                      </div>
                      <div>
                        <span className="font-medium">Address:</span>{' '}
                        {hotelInfo?.address?.lines?.length
                          ? `${hotelInfo.address.lines.join(', ')}${hotelInfo.address.cityName ? `, ${hotelInfo.address.cityName}` : ''}${hotelInfo.address.countryCode ? `, ${hotelInfo.address.countryCode}` : ''}`
                          : hotel?.address?.lines?.length
                            ? hotel.address.lines.join(', ')
                            : '—'}
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-xl p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">Itinerary</h3>
                    <div className="text-sm text-gray-700 space-y-1">
                      <div><span className="font-medium">Check-in:</span> {firstOffer?.checkInDate || '—'}</div>
                      <div><span className="font-medium">Check-out:</span> {firstOffer?.checkOutDate || '—'}</div>
                      <div><span className="font-medium">Guests:</span> {firstOffer?.guests?.adults ? `${firstOffer.guests.adults} adults` : '—'}</div>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-xl p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">What’s included</h3>
                    <div className="text-sm text-gray-700 space-y-2">
                      <div>
                        <div className="font-medium">Room</div>
                        <div className="text-gray-700">
                          {firstOffer?.roomInformation?.typeEstimated?.category || firstOffer?.room?.typeEstimated?.category || '—'}
                          {firstOffer?.roomInformation?.typeEstimated?.bedType || firstOffer?.room?.typeEstimated?.bedType
                            ? ` • ${firstOffer?.roomInformation?.typeEstimated?.bedType || firstOffer?.room?.typeEstimated?.bedType}`
                            : ''}
                        </div>
                        {(firstOffer?.roomInformation?.description || firstOffer?.room?.description?.text) && (
                          <div className="text-gray-600 whitespace-pre-line mt-1">
                            {firstOffer?.roomInformation?.description || firstOffer?.room?.description?.text}
                          </div>
                        )}
                      </div>

                      <div>
                        <div className="font-medium">Cancellation / refund</div>
                        {firstOffer?.policies?.cancellations?.length ? (
                          <div className="text-gray-700">
                            Deadline: {firstOffer.policies.cancellations[0].deadline}
                          </div>
                        ) : (
                          <div className="text-gray-600">—</div>
                        )}
                        {firstOffer?.policies?.refundable?.cancellationRefund && (
                          <div className="text-gray-700">{firstOffer.policies.refundable.cancellationRefund}</div>
                        )}
                      </div>

                      <div>
                        <div className="font-medium">Payment</div>
                        <div className="text-gray-700">{firstOffer?.policies?.paymentType || '—'}</div>
                        {firstOffer?.policies?.guarantee?.acceptedPayments?.methods?.length ? (
                          <div className="text-gray-700">
                            Methods: {firstOffer.policies.guarantee.acceptedPayments.methods.join(', ')}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-xl p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">Photos</h3>
                    {photoUrls.length ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {photoUrls.map((url) => (
                          <img
                            key={url}
                            src={url}
                            alt="Hotel photo"
                            className="w-full h-28 object-cover rounded-lg border border-gray-200"
                            loading="lazy"
                          />
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-600">
                        No photos available from this provider. Photos will appear here if users upload them with reviews.
                      </p>
                    )}
                  </div>

                  <div className="bg-white border border-gray-200 rounded-xl p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">Map location</h3>
                    {location && mapReady && MapContainer ? (
                      <div className="w-full h-[320px] rounded-xl overflow-hidden border border-gray-200">
                        <MapContainer
                          center={location}
                          zoom={15}
                          scrollWheelZoom={true}
                          style={{ height: '100%', width: '100%' }}
                        >
                          <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                          />
                          <Marker position={location}>
                            <Popup>
                              {hotel?.name || 'Hotel'}
                              {hotelInfo?.address?.cityName ? `, ${hotelInfo.address.cityName}` : ''}
                            </Popup>
                          </Marker>
                        </MapContainer>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-600">
                        Map location isn’t available for this hotel.
                      </p>
                    )}
                  </div>

                  <div className="bg-white border border-gray-200 rounded-xl p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">Reviews</h3>
                    {reviews.total ? (
                      <div className="space-y-3">
                        <div className="text-sm text-gray-700">
                          Average: <span className="font-semibold">{reviews.averageRating}</span> / 5 • {reviews.total} reviews
                        </div>
                        {(reviews.reviews || []).slice(0, 6).map((r) => (
                          <div key={r._id || r.createdAt} className="border border-gray-200 rounded-lg p-3">
                            <div className="flex items-center justify-between gap-3">
                              <div className="font-semibold text-gray-900 text-sm truncate">{r.title}</div>
                              <div className="text-sm text-gray-700">{r.rating} / 5</div>
                            </div>
                            <div className="text-sm text-gray-700 mt-1">{r.comment}</div>
                            {Array.isArray(r.images) && r.images.length > 0 && (
                              <div className="mt-2 flex gap-2 overflow-x-auto">
                                {r.images.slice(0, 4).map((img) => (
                                  img?.url ? (
                                    <img
                                      key={img.url}
                                      src={img.url}
                                      alt="Review photo"
                                      className="h-16 w-24 object-cover rounded-md border border-gray-200"
                                      loading="lazy"
                                    />
                                  ) : null
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-600">No reviews yet for this hotel.</p>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-white border border-gray-200 rounded-xl p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">Price</h3>
                    <div className="text-sm text-gray-700 space-y-1">
                      <div><span className="font-medium">Total:</span> {firstOffer?.price?.total ? `${firstOffer.price.total} ${firstOffer.price.currency}` : '—'}</div>
                      {firstOffer?.price?.base && (
                        <div><span className="font-medium">Base:</span> {firstOffer.price.base} {firstOffer.price.currency}</div>
                      )}
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-xl p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">Provider notes</h3>
                    <p className="text-sm text-gray-600">
                      Some details (like official hotel photos and external review feeds) aren’t provided by this Amadeus offer endpoint.
                      This page shows everything we can fetch from Amadeus plus any user reviews/photos stored in your database.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {loading && (
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="text-gray-700 font-medium">Searching hotels…</div>
            <div className="text-sm text-gray-500">This may take a few seconds.</div>
          </div>
        )}

        {error && !loading && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {!loading && !error && (
          <>
            <div className="text-sm text-gray-600 mb-3">
              Found <span className="font-semibold">{results.length}</span> hotels
            </div>

            {results.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-xl p-4 text-gray-700">
                No hotels found for this search.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {results.map((h) => (
                  <div key={h.hotelId || h.name} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                    <div className="font-semibold text-gray-900 truncate">{h.name}</div>
                    <div className="text-sm text-gray-600">
                      {h.cityCode}{h.rating ? ` • Rating: ${h.rating}` : ''}
                      {h.offer?.checkInDate && h.offer?.checkOutDate ? ` • ${h.offer.checkInDate} → ${h.offer.checkOutDate}` : ''}
                    </div>
                    {h.offer?.price?.total && (
                      <div className="mt-2 text-teal-600 font-bold">
                        {h.offer.price.total} {h.offer.price.currency}
                      </div>
                    )}

                    {h.offer?.id && (
                      <div className="mt-3">
                        <Link
                          to={buildDetailsLink(h.offer.id)}
                          className="text-teal-600 hover:text-teal-700 font-semibold text-sm"
                        >
                          View full details
                        </Link>
                      </div>
                    )}
                  </div>
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
