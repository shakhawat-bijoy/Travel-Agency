import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { Plane, Clock, ArrowLeft, Info, CreditCard } from 'lucide-react'
import Container from '../common/Container'
import { restoreSearchResults } from '../../store/slices/flightSlice'

const FlightResults = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [expandedFlights, setExpandedFlights] = useState({})

  const {
    searchResults,
    searchLoading,
    searchError,
    searchParams,
    currency
  } = useSelector(state => state.flights)

  // Check if we have search results, if not try to restore from localStorage
  useEffect(() => {
    if (!searchResults) {
      console.log('No search results found, attempting to restore from localStorage...')
      dispatch(restoreSearchResults())
    }
  }, [searchResults, dispatch])

  // Redirect to search if no results after restoration attempt
  useEffect(() => {
    if (!searchResults && !searchLoading) {
      console.log('No search results available, redirecting to search page')
      navigate('/flights')
    }
  }, [searchResults, searchLoading, navigate])

  // Handle flight details dropdown
  const toggleFlightDetails = (flightId) => {
    setExpandedFlights(prev => ({
      ...prev,
      [flightId]: !prev[flightId]
    }))
  }



  // Handle flight selection for booking
  const handleSelectFlight = (flight) => {
    // Log the complete flight data being passed
    console.log('Complete flight data being passed to ConfirmBooking:', flight)
    console.log('Search parameters being passed:', searchParams)

    // Persist search results before navigation (in case user needs to login)
    dispatch({ type: 'flights/persistSearchResults' })

    // Also store the specific flight selection in localStorage for recovery
    localStorage.setItem('selectedFlightForBooking', JSON.stringify({
      flight: flight,
      searchParams: searchParams,
      timestamp: Date.now()
    }))

    navigate('/confirm-booking', {
      state: {
        flight: flight, // This contains all flight data from the search results
        searchParams: searchParams // This contains all search parameters
      }
    })
  }

  // Loading state
  if (searchLoading) {
    return (
      <div className="bg-gray-50 min-h-screen py-12">
        <Container>
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Searching Flights</h2>
            <p className="text-gray-600">Please wait while we search for the best flights with prices in {currency}...</p>
          </div>
        </Container>
      </div>
    )
  }

  // Error state
  if (searchError && !searchResults) {
    return (
      <div className="bg-gray-50 min-h-screen py-12">
        <Container>
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="text-red-500 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Search Error</h2>
            <p className="text-gray-600 mb-6">{searchError}</p>
            <button
              onClick={() => navigate('/flights')}
              className="bg-teal-500 hover:bg-teal-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2 mx-auto cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Search
            </button>
          </div>
        </Container>
      </div>
    )
  }

  // No results state
  if (!searchResults) {
    return (
      <div className="bg-gray-50 min-h-screen py-12">
        <Container>
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <Plane className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No Search Results</h2>
            <p className="text-gray-600 mb-6">Please perform a flight search to see results here.</p>
            <button
              onClick={() => navigate('/flights')}
              className="bg-teal-500 hover:bg-teal-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2 mx-auto"
            >
              <ArrowLeft className="w-5 h-5" />
              Start New Search
            </button>
          </div>
        </Container>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 min-h-screen py-16">
      <Container>
        {/* Header with Back Button */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/flights')}
            className="flex items-center gap-2 text-teal-600 hover:text-teal-700 font-medium transition-colors mb-4 cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Search
          </button>
        </div>

        {/* Search Results */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Flight Results ({searchResults.flights?.length || 0} flights found)
              </h2>
              {/* Search Info */}
              <div className="flex items-center gap-4 mt-2">

                <div className="text-[16px] text-gray-500">
                  Prices in {currency} • Search time: {new Date(searchResults.searchTime).toLocaleTimeString()}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Success Indicator */}
              {searchResults.flights?.length > 0 && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-lg flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-medium">Flights found with prices in {currency}!</span>
                </div>
              )}
            </div>
          </div>



          {searchResults.flights && searchResults.flights.length > 0 ? (
            <div className="space-y-12">
              {searchResults.flights.map((flight, index) => (
                <div key={flight.id || index} className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 bg-white">
                  {/* Flight Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="text-xl font-bold text-gray-900">
                        {flight.departureAirport} → {flight.arrivalAirport}
                        {searchParams && searchParams.return_date && !flight.oneWay && (
                          <span className="text-blue-600"> ⇄ </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                          {flight.flightNumber}
                        </div>
                        {searchParams && searchParams.return_date && !flight.oneWay && (
                          <div className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                            Round Trip
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-teal-500 flex items-center gap-2 ">
                        <span className="text-2xl">৳</span>
                        {flight.price.total}
                        <p>{flight.price.currency}</p>
                      </div>
                      <div className="text-gray-500">
                        {flight.price.originalCurrency && flight.price.originalCurrency !== flight.price.currency && (
                          <span className="ml-1 text-sm">
                            (${flight.price.originalTotal} {flight.price.originalCurrency})
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Flight Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Aircraft</div>
                      <div className="font-semibold text-gray-900">{flight.aircraftModel}</div>
                      {flight.aircraftCode && flight.aircraftCode !== flight.aircraftModel && (
                        <div className="text-xs text-gray-400">({flight.aircraftCode})</div>
                      )}
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Airline</div>
                      <div className="font-semibold text-gray-900">{flight.airlineName || flight.airline}</div>
                      {flight.airlineName && flight.airlineName !== flight.airline && (
                        <div className="text-xs text-gray-400">({flight.airline})</div>
                      )}
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Duration</div>
                      <div className="font-semibold text-gray-900 flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {flight.duration.replace('PT', '').replace('H', 'h ').replace('M', 'm')}
                      </div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Stops</div>
                      <div className="font-semibold text-gray-900">
                        {flight.stops === 0 ? 'Direct' : `${flight.stops} stop${flight.stops > 1 ? 's' : ''}`}
                      </div>
                      {flight.stopLocations && flight.stopLocations.length > 0 && (
                        <div className="text-xs mt-1">
                          <div className="font-medium text-gray-500 mb-1">via:</div>
                          <div className="space-y-1">
                            {flight.stopLocations.map((stop, index) => (
                              <div key={stop.iataCode || index} className="text-xs">
                                {stop.name && (
                                  <div className="font-medium text-gray-600">{stop.name}</div>
                                )}
                                {stop.iataCode && (
                                  <div className="text-gray-500">({stop.iataCode})</div>
                                )}
                                {stop.cityCountry && (
                                  <div className="text-gray-400">{stop.cityCountry}</div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Flight Times */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">
                        {new Date(flight.departureTime).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(flight.departureTime).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric'
                        })}
                      </div>
                      <div className="text-lg font-semibold text-gray-700 mt-1">
                        {flight.departureAirport}
                      </div>
                      {flight.departureLocation && (
                        <div className="text-xs text-gray-500 mt-1">
                          {flight.departureLocation.name}
                          {flight.departureLocation.cityCountry && (
                            <div className="text-xs text-gray-400">{flight.departureLocation.cityCountry}</div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex-1 mx-8">
                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t-2 border-gray-300"></div>
                        </div>
                        <div className="relative flex justify-center">
                          <div className="bg-white px-4">
                            <Plane className="w-6 h-6 text-teal-500 transform rotate-90" />
                          </div>
                        </div>
                      </div>
                      <div className="text-center mt-2 text-sm text-gray-500">
                        {flight.duration.replace('PT', '').replace('H', 'h ').replace('M', 'm')}
                      </div>
                    </div>

                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">
                        {new Date(flight.arrivalTime).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(flight.arrivalTime).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric'
                        })}
                      </div>
                      <div className="text-lg font-semibold text-gray-700 mt-1">
                        {flight.arrivalAirport}
                      </div>
                      {flight.arrivalLocation && (
                        <div className="text-xs text-gray-500 mt-1">
                          {flight.arrivalLocation.name}
                          {flight.arrivalLocation.cityCountry && (
                            <div className="text-xs text-gray-400">{flight.arrivalLocation.cityCountry}</div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Round Trip Journey Summary */}
                  {searchParams && searchParams.return_date && !flight.oneWay && (
                    <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                      <div className="text-center">
                        <div className="text-sm font-medium text-gray-700 mb-2">Complete Round Trip Journey</div>
                        <div className="flex items-center justify-center gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                            <span className="font-medium">
                              {new Date(searchParams.outbound_date).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric'
                              })}
                            </span>
                            <span className="text-gray-600">Outbound</span>
                          </div>
                          <div className="text-gray-400">•</div>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span className="font-medium">
                              {new Date(searchParams.return_date).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric'
                              })}
                            </span>
                            <span className="text-gray-600">Return</span>
                          </div>
                          <div className="text-gray-400">•</div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-purple-500" />
                            <span className="font-medium text-purple-600">
                              {Math.ceil((new Date(searchParams.return_date) - new Date(searchParams.outbound_date)) / (1000 * 60 * 60 * 24))} days trip
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Detailed Flight Route with Full Airport Names */}


                  {/* Enhanced Price Information */}
                  {flight.price.discount?.hasDiscount && (
                    <div className="border-t pt-4 mt-4">
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-green-800 font-semibold">💰 Special Discount Available!</div>
                            <div className="text-sm text-green-600 mt-1">
                              Save {flight.price.discount.percentage}% on this flight
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-gray-500 line-through">
                              ৳{flight.price.discount.originalPrice}
                            </div>
                            <div className="text-lg font-bold text-green-600">
                              Save ৳{flight.price.discount.savings}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Price Breakdown */}
                  {flight.price.breakdown && (
                    <div className="border-t pt-4 mt-4">
                      <h4 className="font-semibold text-gray-900 mb-3">Price Breakdown</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Base Price</div>
                          <div className="font-semibold text-gray-900">৳{flight.price.breakdown.basePrice}</div>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Taxes</div>
                          <div className="font-semibold text-gray-900">৳{flight.price.breakdown.taxes}</div>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Fees</div>
                          <div className="font-semibold text-gray-900">৳{flight.price.breakdown.supplierFees}</div>
                        </div>
                        <div className="bg-teal-50 p-3 rounded-lg border border-teal-200">
                          <div className="text-xs text-teal-600 uppercase tracking-wide mb-1">Total</div>
                          <div className="font-bold text-teal-700">৳{flight.price.total}</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="mt-6 flex justify-between items-center">
                    <button
                      onClick={() => toggleFlightDetails(flight.id)}
                      className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 px-6 py-3 rounded-lg font-semibold transition-all duration-300 shadow-sm hover:shadow-md flex items-center gap-2 cursor-pointer"
                    >
                      <Info className={`w-5 h-5 transition-transform duration-300 ${expandedFlights[flight.id] ? 'rotate-180' : 'rotate-0'}`} />
                      {expandedFlights[flight.id] ? 'Hide Details' : 'View Details'}
                    </button>
                    <button
                      onClick={() => handleSelectFlight(flight)}
                      className="bg-teal-500 hover:bg-teal-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors shadow-md hover:shadow-lg cursor-pointer"
                    >
                      Book Flight
                    </button>
                  </div>

                  {/* Flight Details Dropdown */}
                  <div className={`overflow-hidden transition-all duration-500 ease-in-out ${expandedFlights[flight.id]
                    ? 'max-h-[4000px] opacity-100'
                    : 'max-h-0 opacity-0'
                    }`}>
                    <div className={`mt-6 border-t border-gray-200 pt-6 bg-gray-50 rounded-b-xl -mx-6 -mb-6 px-6 pb-6 transform transition-all duration-500 ease-in-out ${expandedFlights[flight.id]
                      ? 'translate-y-0 scale-100'
                      : '-translate-y-4 scale-95'
                      }`}>
                      <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Plane className="w-5 h-5 text-teal-500" />
                        Complete Flight Details
                      </h4>

                      {/* Enhanced Flight Route Display for Layover Flights */}
                      {flight.stops > 0 ? (
                        <div className={`mb-6 transform transition-all duration-700 ease-out ${expandedFlights[flight.id]
                          ? 'translate-y-0 opacity-100'
                          : 'translate-y-4 opacity-0'
                          }`} style={{ transitionDelay: expandedFlights[flight.id] ? '100ms' : '0ms' }}>
                          <h5 className="text-md font-semibold text-gray-800 mb-3">Flight Route</h5>
                          <div className="bg-white rounded-lg p-4 border border-gray-200">
                            <div className="flex items-center justify-between">
                              <div className="text-center flex-1">
                                <div className="text-2xl font-bold text-gray-900 mb-1">
                                  {new Date(flight.departureTime).toLocaleTimeString('en-US', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </div>
                                <div className="text-lg font-semibold text-gray-700 mb-1">
                                  {flight.departureAirport}
                                </div>
                                {flight.departureLocation && (
                                  <div className="text-sm text-gray-600">
                                    {flight.departureLocation.fullName || flight.departureLocation.name}
                                  </div>
                                )}
                                {flight.departureLocation?.cityCountry && (
                                  <div className="text-sm text-gray-500">{flight.departureLocation.cityCountry}</div>
                                )}
                              </div>

                              <div className="flex-1 mx-6">
                                <div className="relative">
                                  <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t-2 border-teal-300"></div>
                                  </div>
                                  <div className="relative flex justify-center">
                                    <div className="bg-white px-3">
                                      <Plane className="w-6 h-6 text-teal-500 transform rotate-90" />
                                    </div>
                                  </div>
                                </div>
                                <div className="text-center mt-3">
                                  <div className="text-sm font-medium text-gray-700">
                                    {flight.airlineName || flight.airline}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {flight.duration.replace('PT', '').replace('H', 'h ').replace('M', 'm')}
                                  </div>
                                </div>
                              </div>

                              <div className="text-center flex-1">
                                <div className="text-2xl font-bold text-gray-900 mb-1">
                                  {new Date(flight.arrivalTime).toLocaleTimeString('en-US', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </div>
                                <div className="text-lg font-semibold text-gray-700 mb-1">
                                  {flight.arrivalAirport}
                                </div>
                                {flight.arrivalLocation && (
                                  <div className="text-sm text-gray-600">
                                    {flight.arrivalLocation.fullName || flight.arrivalLocation.name}
                                  </div>
                                )}
                                {flight.arrivalLocation?.cityCountry && (
                                  <div className="text-sm text-gray-500">{flight.arrivalLocation.cityCountry}</div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : null}

                      {/* Round Trip Return Flight Details */}
                      {searchParams && searchParams.return_date && !flight.oneWay && (
                        <div className={`mb-6 transform transition-all duration-700 ease-out ${expandedFlights[flight.id]
                          ? 'translate-y-0 opacity-100'
                          : 'translate-y-4 opacity-0'
                          }`} style={{ transitionDelay: expandedFlights[flight.id] ? '150ms' : '0ms' }}>
                          <h5 className="text-md font-semibold text-gray-800 mb-3 flex items-center gap-2">
                            <div className="flex items-center gap-2">
                              <Plane className="w-4 h-4 text-blue-500 transform -rotate-90" />
                              Return Flight Details
                            </div>
                            <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                              Round Trip
                            </div>
                          </h5>
                          <div className="bg-white rounded-lg p-4 border border-gray-200">
                            {/* Return Flight Route */}
                            <div className="flex items-center justify-between mb-4">
                              <div className="text-center flex-1">
                                <div className="text-xl font-bold text-gray-900 mb-1">
                                  {searchParams.return_date && new Date(searchParams.return_date).toLocaleTimeString('en-US', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </div>
                                <div className="text-lg font-semibold text-gray-700 mb-1">
                                  {flight.arrivalAirport}
                                </div>
                                <div className="text-sm text-gray-600">
                                  Return Departure
                                </div>
                                <div className="text-sm text-gray-500">
                                  {searchParams.return_date && new Date(searchParams.return_date).toLocaleDateString('en-US', {
                                    weekday: 'short',
                                    month: 'short',
                                    day: 'numeric'
                                  })}
                                </div>
                              </div>

                              <div className="flex-1 mx-6">
                                <div className="relative">
                                  <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t-2 border-blue-300"></div>
                                  </div>
                                  <div className="relative flex justify-center">
                                    <div className="bg-white px-3">
                                      <Plane className="w-6 h-6 text-blue-500 transform -rotate-90" />
                                    </div>
                                  </div>
                                </div>
                                <div className="text-center mt-3">
                                  <div className="text-sm font-medium text-blue-700">
                                    Return Flight
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    Same Duration
                                  </div>
                                </div>
                              </div>

                              <div className="text-center flex-1">
                                <div className="text-xl font-bold text-gray-900 mb-1">
                                  {searchParams.return_date && new Date(new Date(searchParams.return_date).getTime() +
                                    (new Date(flight.arrivalTime).getTime() - new Date(flight.departureTime).getTime())).toLocaleTimeString('en-US', {
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                </div>
                                <div className="text-lg font-semibold text-gray-700 mb-1">
                                  {flight.departureAirport}
                                </div>
                                <div className="text-sm text-gray-600">
                                  Return Arrival
                                </div>
                                <div className="text-sm text-gray-500">
                                  {searchParams.return_date && new Date(searchParams.return_date).toLocaleDateString('en-US', {
                                    weekday: 'short',
                                    month: 'short',
                                    day: 'numeric'
                                  })}
                                </div>
                              </div>
                            </div>

                            {/* Return Flight Information */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 pt-4 border-t border-gray-200">
                              <div className="bg-blue-50 p-3 rounded-lg">
                                <div className="text-xs text-blue-600 uppercase tracking-wide mb-1">Return Flight</div>
                                <div className="font-semibold text-gray-900">{flight.flightNumber}R</div>
                                <div className="text-xs text-gray-500">Estimated</div>
                              </div>
                              <div className="bg-blue-50 p-3 rounded-lg">
                                <div className="text-xs text-blue-600 uppercase tracking-wide mb-1">Same Airline</div>
                                <div className="font-semibold text-gray-900">{flight.airlineName || flight.airline}</div>
                              </div>
                              <div className="bg-blue-50 p-3 rounded-lg">
                                <div className="text-xs text-blue-600 uppercase tracking-wide mb-1">Duration</div>
                                <div className="font-semibold text-gray-900">
                                  {flight.duration.replace('PT', '').replace('H', 'h ').replace('M', 'm')}
                                </div>
                              </div>
                              <div className="bg-blue-50 p-3 rounded-lg">
                                <div className="text-xs text-blue-600 uppercase tracking-wide mb-1">Route Type</div>
                                <div className="font-semibold text-gray-900">
                                  {flight.stops === 0 ? 'Direct' : `${flight.stops} stop${flight.stops > 1 ? 's' : ''}`}
                                </div>
                              </div>
                            </div>

                            {/* Return Trip Notice */}
                            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                              <div className="flex items-start gap-3">
                                <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                                <div>
                                  <div className="text-sm font-medium text-blue-900">Round Trip Booking</div>
                                  <div className="text-sm text-blue-700 mt-1">
                                    This price includes both outbound and return flights. Return flight details will be confirmed during booking process.
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Flight Segments for Multi-Stop Flights - Enhanced with All Details */}
                      {flight.itineraries && flight.itineraries[0]?.segments && flight.itineraries[0].segments.length > 0 && (
                        <div className={`mb-6 transform transition-all duration-700 ease-out ${expandedFlights[flight.id]
                          ? 'translate-y-0 opacity-100'
                          : 'translate-y-4 opacity-0'
                          }`} style={{ transitionDelay: expandedFlights[flight.id] ? '200ms' : '0ms' }}>
                          <h5 className="text-md font-semibold text-gray-800 mb-3 flex items-center gap-2">
                            <Plane className="w-5 h-5 text-teal-500" />
                            {flight.itineraries[0].segments.length > 1 ? 'Flight Segments (Connecting Flights)' : 'Flight Segment Details'}
                            <span className="bg-teal-100 text-teal-800 px-2 py-1 rounded-full text-xs font-medium">
                              {flight.itineraries[0].segments.length} segment{flight.itineraries[0].segments.length > 1 ? 's' : ''}
                            </span>
                          </h5>
                          <div className="space-y-4">
                            {flight.itineraries[0].segments.map((segment, index) => {
                              // Calculate layover time if not the last segment
                              let layoverDuration = null
                              if (index < flight.itineraries[0].segments.length - 1) {
                                const currentArrival = new Date(segment.arrival.at)
                                const nextDeparture = new Date(flight.itineraries[0].segments[index + 1].departure.at)
                                const layoverMs = nextDeparture - currentArrival
                                const layoverHours = Math.floor(layoverMs / (1000 * 60 * 60))
                                const layoverMinutes = Math.floor((layoverMs % (1000 * 60 * 60)) / (1000 * 60))
                                layoverDuration = `${layoverHours}h ${layoverMinutes}m`
                              }

                              return (
                                <div key={segment.id || index} className="bg-white border-2 border-gray-200 rounded-xl p-5 hover:border-teal-300 transition-all shadow-sm hover:shadow-md">
                                  {/* Segment Header */}
                                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
                                    <div className="flex items-center gap-3">
                                      <div className="bg-teal-100 text-teal-800 px-3 py-1.5 rounded-full text-sm font-bold">
                                        Segment {index + 1}
                                      </div>
                                      {index === 0 && (
                                        <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                                          First Flight
                                        </div>
                                      )}
                                      {index === flight.itineraries[0].segments.length - 1 && flight.itineraries[0].segments.length > 1 && (
                                        <div className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-medium">
                                          Final Flight
                                        </div>
                                      )}
                                    </div>
                                    <div className="text-right">
                                      <div className="text-sm font-bold text-teal-600">
                                        {segment.carrierName || segment.carrierCode} {segment.number}
                                      </div>
                                      <div className="text-xs text-gray-500">Flight Number</div>
                                    </div>
                                  </div>

                                  {/* Flight Route Visualization */}
                                  <div className="flex items-center justify-between mb-4">
                                    <div className="text-center flex-1">
                                      <div className="text-2xl font-bold text-gray-900 mb-1">
                                        {new Date(segment.departure.at).toLocaleTimeString('en-US', {
                                          hour: '2-digit',
                                          minute: '2-digit'
                                        })}
                                      </div>
                                      <div className="text-lg font-semibold text-gray-700 mb-1">
                                        {segment.departure.iataCode}
                                      </div>
                                      <div className="text-sm text-gray-600 mb-1">
                                        {segment.departure.fullName || segment.departure.name}
                                      </div>
                                      <div className="text-xs text-gray-500">
                                        {segment.departure.cityCountry}
                                      </div>
                                      <div className="text-xs text-gray-400 mt-1">
                                        {new Date(segment.departure.at).toLocaleDateString('en-US', {
                                          weekday: 'short',
                                          month: 'short',
                                          day: 'numeric',
                                          year: 'numeric'
                                        })}
                                      </div>
                                    </div>

                                    <div className="flex-1 mx-6">
                                      <div className="relative">
                                        <div className="absolute inset-0 flex items-center">
                                          <div className="w-full border-t-2 border-teal-300"></div>
                                        </div>
                                        <div className="relative flex justify-center">
                                          <div className="bg-white px-3">
                                            <Plane className="w-6 h-6 text-teal-500 transform rotate-90" />
                                          </div>
                                        </div>
                                      </div>
                                      <div className="text-center mt-3">
                                        <div className="text-sm font-medium text-gray-700">
                                          {segment.duration?.replace('PT', '').replace('H', 'h ').replace('M', 'm') || 'Duration TBD'}
                                        </div>
                                        <div className="text-xs text-gray-500">Flight Time</div>
                                      </div>
                                    </div>

                                    <div className="text-center flex-1">
                                      <div className="text-2xl font-bold text-gray-900 mb-1">
                                        {new Date(segment.arrival.at).toLocaleTimeString('en-US', {
                                          hour: '2-digit',
                                          minute: '2-digit'
                                        })}
                                      </div>
                                      <div className="text-lg font-semibold text-gray-700 mb-1">
                                        {segment.arrival.iataCode}
                                      </div>
                                      <div className="text-sm text-gray-600 mb-1">
                                        {segment.arrival.fullName || segment.arrival.name}
                                      </div>
                                      <div className="text-xs text-gray-500">
                                        {segment.arrival.cityCountry}
                                      </div>
                                      <div className="text-xs text-gray-400 mt-1">
                                        {new Date(segment.arrival.at).toLocaleDateString('en-US', {
                                          weekday: 'short',
                                          month: 'short',
                                          day: 'numeric',
                                          year: 'numeric'
                                        })}
                                      </div>
                                    </div>
                                  </div>

                                  {/* Detailed Segment Information Grid */}
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                                    <div className="bg-gray-50 p-3 rounded-lg">
                                      <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Airline</div>
                                      <div className="font-semibold text-gray-900 text-sm">
                                        {segment.carrierName || segment.carrierCode}
                                      </div>
                                      <div className="text-xs text-gray-500">({segment.carrierCode})</div>
                                    </div>
                                    <div className="bg-gray-50 p-3 rounded-lg">
                                      <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Aircraft</div>
                                      <div className="font-semibold text-gray-900 text-sm">
                                        {segment.aircraft?.name || segment.aircraft?.code || 'TBD'}
                                      </div>
                                      {segment.aircraft?.code && (
                                        <div className="text-xs text-gray-500">({segment.aircraft.code})</div>
                                      )}
                                    </div>
                                    <div className="bg-gray-50 p-3 rounded-lg">
                                      <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Duration</div>
                                      <div className="font-semibold text-gray-900 text-sm flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {segment.duration?.replace('PT', '').replace('H', 'h ').replace('M', 'm') || 'TBD'}
                                      </div>
                                    </div>
                                    <div className="bg-gray-50 p-3 rounded-lg">
                                      <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Operating</div>
                                      <div className="font-semibold text-gray-900 text-sm">
                                        {segment.operating?.carrierCode || segment.carrierCode}
                                      </div>
                                      {segment.operating?.carrierCode && segment.operating.carrierCode !== segment.carrierCode && (
                                        <div className="text-xs text-orange-600">Codeshare</div>
                                      )}
                                    </div>
                                  </div>

                                  {/* Additional Segment Details */}
                                  {(segment.numberOfStops > 0 || segment.blacklistedInEU || segment.id) && (
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3">
                                      {segment.numberOfStops > 0 && (
                                        <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
                                          <div className="text-xs text-orange-600 uppercase tracking-wide mb-1">Technical Stops</div>
                                          <div className="font-semibold text-gray-900 text-sm">
                                            {segment.numberOfStops} stop{segment.numberOfStops > 1 ? 's' : ''}
                                          </div>
                                        </div>
                                      )}
                                      {segment.blacklistedInEU && (
                                        <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                                          <div className="text-xs text-red-600 uppercase tracking-wide mb-1">EU Status</div>
                                          <div className="font-semibold text-red-700 text-sm">Blacklisted</div>
                                        </div>
                                      )}
                                      {segment.id && (
                                        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                                          <div className="text-xs text-blue-600 uppercase tracking-wide mb-1">Segment ID</div>
                                          <div className="font-mono text-xs text-gray-700">{segment.id}</div>
                                        </div>
                                      )}
                                    </div>
                                  )}

                                  {/* Layover Information */}
                                  {index < flight.itineraries[0].segments.length - 1 && (
                                    <div className="mt-4 pt-4 border-t-2 border-orange-200">
                                      <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-300 rounded-lg p-4">
                                        <div className="flex items-center justify-between">
                                          <div className="flex items-center gap-3">
                                            <div className="bg-orange-500 text-white rounded-full p-2">
                                              <Clock className="w-5 h-5" />
                                            </div>
                                            <div>
                                              <div className="text-sm font-bold text-orange-900">
                                                Layover at {segment.arrival.iataCode}
                                              </div>
                                              <div className="text-xs text-orange-700">
                                                {segment.arrival.fullName || segment.arrival.name}
                                              </div>
                                              <div className="text-xs text-orange-600">
                                                {segment.arrival.cityCountry}
                                              </div>
                                            </div>
                                          </div>
                                          <div className="text-right">
                                            <div className="text-xl font-bold text-orange-600">
                                              {layoverDuration}
                                            </div>
                                            <div className="text-xs text-orange-700">Connection Time</div>
                                          </div>
                                        </div>
                                        <div className="mt-3 pt-3 border-t border-orange-200">
                                          <div className="text-xs text-orange-800">
                                            ℹ️ You will need to change planes at this airport. Please check if you need to collect and re-check your baggage.
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )
                            })}
                          </div>

                          {/* Journey Summary */}
                          {flight.itineraries[0].segments.length > 1 && (
                            <div className="mt-4 bg-gradient-to-r from-teal-50 to-blue-50 border-2 border-teal-200 rounded-lg p-4">
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="text-sm font-bold text-gray-900 mb-1">Complete Journey Summary</div>
                                  <div className="text-xs text-gray-600">
                                    {flight.itineraries[0].segments.length} connecting flight{flight.itineraries[0].segments.length > 1 ? 's' : ''} • 
                                    {flight.stops} layover{flight.stops > 1 ? 's' : ''} • 
                                    Total duration: {flight.duration.replace('PT', '').replace('H', 'h ').replace('M', 'm')}
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-lg font-bold text-teal-600">
                                    {flight.itineraries[0].segments[0].departure.iataCode} → {flight.itineraries[0].segments[flight.itineraries[0].segments.length - 1].arrival.iataCode}
                                  </div>
                                  <div className="text-xs text-gray-500">Full Route</div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Enhanced Price Breakdown with VAT & Tax Details */}
                      <div className={`mb-6 transform transition-all duration-700 ease-out ${expandedFlights[flight.id]
                        ? 'translate-y-0 opacity-100'
                        : 'translate-y-4 opacity-0'
                        }`} style={{ transitionDelay: expandedFlights[flight.id] ? '300ms' : '0ms' }}>
                        <h5 className="text-md font-semibold text-gray-800 mb-3 flex items-center gap-2">
                          <CreditCard className="w-5 h-5 text-teal-500" />
                          Detailed Price Breakdown
                        </h5>
                        <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-6 border-2 border-gray-200 shadow-sm">
                          {flight.price.breakdown ? (
                            <>
                              {/* Main Price Grid */}
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                                <div className="bg-white p-4 rounded-lg border border-blue-200 shadow-sm hover:shadow-md transition-shadow">
                                  <div className="flex items-center gap-2 mb-2">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                    <div className="text-xs text-gray-600 uppercase tracking-wide font-semibold">Base Fare</div>
                                  </div>
                                  <div className="text-2xl font-bold text-gray-900">৳{flight.price.breakdown.basePrice}</div>
                                  <div className="text-xs text-gray-500 mt-1">Flight ticket cost</div>
                                </div>

                                <div className="bg-white p-4 rounded-lg border border-orange-200 shadow-sm hover:shadow-md transition-shadow">
                                  <div className="flex items-center gap-2 mb-2">
                                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                                    <div className="text-xs text-gray-600 uppercase tracking-wide font-semibold">Taxes & VAT</div>
                                  </div>
                                  <div className="text-2xl font-bold text-gray-900">৳{flight.price.breakdown.taxes}</div>
                                  <div className="text-xs text-gray-500 mt-1">Government charges</div>
                                </div>

                                <div className="bg-white p-4 rounded-lg border border-purple-200 shadow-sm hover:shadow-md transition-shadow">
                                  <div className="flex items-center gap-2 mb-2">
                                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                    <div className="text-xs text-gray-600 uppercase tracking-wide font-semibold">Service Fees</div>
                                  </div>
                                  <div className="text-2xl font-bold text-gray-900">৳{flight.price.breakdown.supplierFees}</div>
                                  <div className="text-xs text-gray-500 mt-1">Booking & processing</div>
                                </div>

                                <div className="bg-gradient-to-br from-teal-50 to-teal-100 p-4 rounded-lg border-2 border-teal-300 shadow-md">
                                  <div className="flex items-center gap-2 mb-2">
                                    <div className="w-2 h-2 bg-teal-600 rounded-full animate-pulse"></div>
                                    <div className="text-xs text-teal-700 uppercase tracking-wide font-bold">Total Amount</div>
                                  </div>
                                  <div className="text-3xl font-black text-teal-700">৳{flight.price.total}</div>
                                  <div className="text-xs text-teal-600 mt-1 font-medium">All inclusive</div>
                                </div>
                              </div>

                              {/* Detailed Tax Breakdown */}
                              <div className="bg-white rounded-lg p-4 border border-gray-200 mb-4">
                                <h6 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                  <Info className="w-4 h-4 text-orange-500" />
                                  Tax & Fee Details
                                </h6>
                                <div className="space-y-2 text-sm">
                                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                    <span className="text-gray-600 flex items-center gap-2">
                                      <span className="w-1.5 h-1.5 bg-orange-400 rounded-full"></span>
                                      Airport Tax
                                    </span>
                                    <span className="font-semibold text-gray-900">
                                      ৳{Math.round(flight.price.breakdown.taxes * 0.4)}
                                    </span>
                                  </div>
                                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                    <span className="text-gray-600 flex items-center gap-2">
                                      <span className="w-1.5 h-1.5 bg-orange-400 rounded-full"></span>
                                      VAT (15%)
                                    </span>
                                    <span className="font-semibold text-gray-900">
                                      ৳{Math.round(flight.price.breakdown.taxes * 0.35)}
                                    </span>
                                  </div>
                                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                    <span className="text-gray-600 flex items-center gap-2">
                                      <span className="w-1.5 h-1.5 bg-orange-400 rounded-full"></span>
                                      Fuel Surcharge
                                    </span>
                                    <span className="font-semibold text-gray-900">
                                      ৳{Math.round(flight.price.breakdown.taxes * 0.15)}
                                    </span>
                                  </div>
                                  <div className="flex justify-between items-center py-2">
                                    <span className="text-gray-600 flex items-center gap-2">
                                      <span className="w-1.5 h-1.5 bg-orange-400 rounded-full"></span>
                                      Other Charges
                                    </span>
                                    <span className="font-semibold text-gray-900">
                                      ৳{Math.round(flight.price.breakdown.taxes * 0.1)}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Price Summary */}
                              <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-300">
                                <div className="space-y-2">
                                  <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-600">Subtotal (Base + Fees)</span>
                                    <span className="font-medium text-gray-900">
                                      ৳{Number(flight.price.breakdown.basePrice) + Number(flight.price.breakdown.supplierFees)}
                                    </span>
                                  </div>
                                  <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-600">Total Taxes & VAT</span>
                                    <span className="font-medium text-gray-900">৳{flight.price.breakdown.taxes}</span>
                                  </div>
                                  <div className="flex justify-between items-center pt-3 border-t-2 border-gray-300">
                                    <span className="text-base font-bold text-gray-900">Grand Total</span>
                                    <span className="text-2xl font-black text-teal-600">৳{flight.price.total}</span>
                                  </div>
                                </div>
                              </div>
                            </>
                          ) : (
                            <div className="text-center py-4 text-gray-500">
                              <Info className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                              <p>Detailed price breakdown not available</p>
                            </div>
                          )}

                          {/* Discount Badge */}
                          {flight.price.discount?.hasDiscount && (
                            <div className="mt-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-lg p-4 shadow-sm">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="bg-green-500 text-white rounded-full p-2">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                      <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                                    </svg>
                                  </div>
                                  <div>
                                    <div className="text-green-900 font-bold text-lg">Special Discount Applied!</div>
                                    <div className="text-sm text-green-700 font-medium">
                                      You're saving {flight.price.discount.percentage}% on this booking
                                    </div>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-sm text-gray-600 line-through">
                                    Original: ৳{flight.price.discount.originalPrice}
                                  </div>
                                  <div className="text-xl font-black text-green-600">
                                    Save ৳{flight.price.discount.savings}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Round Trip Price Breakdown */}
                      {searchParams && searchParams.return_date && !flight.oneWay && flight.price.breakdown && (
                        <div className={`mb-6 transform transition-all duration-700 ease-out ${expandedFlights[flight.id]
                          ? 'translate-y-0 opacity-100'
                          : 'translate-y-4 opacity-0'
                          }`} style={{ transitionDelay: expandedFlights[flight.id] ? '350ms' : '0ms' }}>
                          <h5 className="text-md font-semibold text-gray-800 mb-3 flex items-center gap-2">
                            <div className="flex items-center gap-2">
                              <CreditCard className="w-4 h-4 text-purple-500" />
                              Round Trip Price Breakdown
                            </div>
                          </h5>
                          <div className="bg-white rounded-lg p-4 border border-gray-200">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {/* Outbound Flight Pricing */}
                              <div>
                                <div className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                                  <Plane className="w-4 h-4 text-teal-500 transform rotate-90" />
                                  Outbound Flight ({flight.departureAirport} → {flight.arrivalAirport})
                                </div>
                                <div className="space-y-2 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Base Price:</span>
                                    <span className="font-medium">৳{Math.round(flight.price.breakdown.basePrice / 2)}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Taxes:</span>
                                    <span className="font-medium">৳{Math.round(flight.price.breakdown.taxes / 2)}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Fees:</span>
                                    <span className="font-medium">৳{Math.round(flight.price.breakdown.supplierFees / 2)}</span>
                                  </div>
                                  <div className="flex justify-between font-semibold border-t pt-2">
                                    <span className="text-teal-600">Subtotal:</span>
                                    <span className="text-teal-600">৳{Math.round(flight.price.total / 2)}</span>
                                  </div>
                                </div>
                              </div>

                              {/* Return Flight Pricing */}
                              <div>
                                <div className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                                  <Plane className="w-4 h-4 text-blue-500 transform -rotate-90" />
                                  Return Flight ({flight.arrivalAirport} → {flight.departureAirport})
                                </div>
                                <div className="space-y-2 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Base Price:</span>
                                    <span className="font-medium">৳{Math.round(flight.price.breakdown.basePrice / 2)}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Taxes:</span>
                                    <span className="font-medium">৳{Math.round(flight.price.breakdown.taxes / 2)}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Fees:</span>
                                    <span className="font-medium">৳{Math.round(flight.price.breakdown.supplierFees / 2)}</span>
                                  </div>
                                  <div className="flex justify-between font-semibold border-t pt-2">
                                    <span className="text-blue-600">Subtotal:</span>
                                    <span className="text-blue-600">৳{Math.round(flight.price.total / 2)}</span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Total Round Trip Price */}
                            <div className="mt-4 pt-4 border-t border-gray-200">
                              <div className="bg-gradient-to-r from-teal-50 to-blue-50 rounded-lg p-4">
                                <div className="flex justify-between items-center">
                                  <div>
                                    <div className="text-lg font-bold text-gray-900">Total Round Trip Price</div>
                                    <div className="text-sm text-gray-600">Includes both outbound and return flights</div>
                                  </div>
                                  <div className="text-right">
                                    <div className="text-2xl font-bold text-purple-600">৳{flight.price.total}</div>
                                    <div className="text-sm text-gray-500">{flight.price.currency}</div>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Savings Notice */}
                            <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                              <div className="flex items-start gap-3">
                                <div className="text-green-600 text-lg">💰</div>
                                <div>
                                  <div className="text-sm font-medium text-green-900">Round Trip Savings</div>
                                  <div className="text-sm text-green-700 mt-1">
                                    Round trip bookings often offer better value compared to booking two separate one-way flights.
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Comprehensive Flight Information */}
                      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 transform transition-all duration-700 ease-out ${expandedFlights[flight.id]
                        ? 'translate-y-0 opacity-100'
                        : 'translate-y-4 opacity-0'
                        }`} style={{ transitionDelay: expandedFlights[flight.id] ? '400ms' : '0ms' }}>

                        {/* Flight Information */}
                        <div>
                          <h5 className="text-md font-semibold text-gray-800 mb-3">Flight Information</h5>
                          <div className="bg-white rounded-lg p-4 border border-gray-200">
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-600">Flight Number:</span>
                                <span className="font-medium">{flight.flightNumber}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Airline:</span>
                                <span className="font-medium">{flight.airlineName || flight.airline}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Aircraft:</span>
                                <span className="font-medium">{flight.aircraftModel}</span>
                              </div>
                              {flight.aircraftCode && (
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Aircraft Code:</span>
                                  <span className="font-medium">{flight.aircraftCode}</span>
                                </div>
                              )}
                              <div className="flex justify-between">
                                <span className="text-gray-600">Duration:</span>
                                <span className="font-medium">
                                  {flight.duration.replace('PT', '').replace('H', 'h ').replace('M', 'm')}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Stops:</span>
                                <span className="font-medium">
                                  {flight.stops === 0 ? 'Direct Flight' : `${flight.stops} stop${flight.stops > 1 ? 's' : ''}`}
                                </span>
                              </div>
                              {flight.numberOfBookableSeats && (
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Available Seats:</span>
                                  <span className="font-medium text-green-600">{flight.numberOfBookableSeats}</span>
                                </div>
                              )}
                              {flight.validatingAirlineCodes && (
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Validating Airlines:</span>
                                  <span className="font-medium">{flight.validatingAirlineCodes.join(', ')}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Booking & Pricing Information */}
                        <div>
                          <h5 className="text-md font-semibold text-gray-800 mb-3">Booking Information</h5>
                          <div className="bg-white rounded-lg p-4 border border-gray-200">
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-600">Currency:</span>
                                <span className="font-medium">{flight.price.currency}</span>
                              </div>
                              {flight.price.originalCurrency && flight.price.originalCurrency !== flight.price.currency && (
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Original Price:</span>
                                  <span className="font-medium">
                                    ${flight.price.originalTotal} {flight.price.originalCurrency}
                                  </span>
                                </div>
                              )}
                              {flight.lastTicketingDate && (
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Last Ticketing Date:</span>
                                  <span className="font-medium text-orange-600">
                                    {new Date(flight.lastTicketingDate).toLocaleDateString()}
                                  </span>
                                </div>
                              )}
                              <div className="flex justify-between">
                                <span className="text-gray-600">Trip Type:</span>
                                <span className="font-medium">{flight.oneWay ? 'One Way' : 'Round Trip'}</span>
                              </div>
                              {searchParams && searchParams.return_date && !flight.oneWay && (
                                <>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Outbound Date:</span>
                                    <span className="font-medium">
                                      {new Date(searchParams.outbound_date).toLocaleDateString('en-US', {
                                        weekday: 'short',
                                        month: 'short',
                                        day: 'numeric'
                                      })}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Return Date:</span>
                                    <span className="font-medium">
                                      {new Date(searchParams.return_date).toLocaleDateString('en-US', {
                                        weekday: 'short',
                                        month: 'short',
                                        day: 'numeric'
                                      })}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Total Trip Duration:</span>
                                    <span className="font-medium text-blue-600">
                                      {Math.ceil((new Date(searchParams.return_date) - new Date(searchParams.outbound_date)) / (1000 * 60 * 60 * 24))} days
                                    </span>
                                  </div>
                                </>
                              )}
                              {flight.instantTicketingRequired && (
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Instant Ticketing:</span>
                                  <span className="font-medium text-red-600">Required</span>
                                </div>
                              )}
                              {flight.nonHomogeneous && (
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Mixed Cabin:</span>
                                  <span className="font-medium">Yes</span>
                                </div>
                              )}
                              {flight.paymentCardRequired && (
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Card Required:</span>
                                  <span className="font-medium text-blue-600">Yes</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Travel Class & Cabin Information */}
                        <div>
                          <h5 className="text-md font-semibold text-gray-800 mb-3">Travel Class</h5>
                          <div className="bg-white rounded-lg p-4 border border-gray-200">
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-600">Class:</span>
                                <span className="font-medium">{searchParams?.travel_class || 'ECONOMY'}</span>
                              </div>
                              {flight.fareDetailsBySegment && flight.fareDetailsBySegment[0] && (
                                <>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Cabin:</span>
                                    <span className="font-medium">{flight.fareDetailsBySegment[0].cabin}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Fare Class:</span>
                                    <span className="font-medium">{flight.fareDetailsBySegment[0].class}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Fare Basis:</span>
                                    <span className="font-medium">{flight.fareDetailsBySegment[0].fareBasis}</span>
                                  </div>
                                  {flight.fareDetailsBySegment[0].brandedFare && (
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">Branded Fare:</span>
                                      <span className="font-medium text-purple-600">{flight.fareDetailsBySegment[0].brandedFare}</span>
                                    </div>
                                  )}
                                  {flight.fareDetailsBySegment[0].includedCheckedBags && (
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">Checked Bags:</span>
                                      <span className="font-medium text-green-600">
                                        {flight.fareDetailsBySegment[0].includedCheckedBags.quantity || 0} included
                                      </span>
                                    </div>
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Baggage Information */}
                      {flight.fareDetailsBySegment && flight.fareDetailsBySegment[0]?.includedCheckedBags && (
                        <div className={`mt-6 transform transition-all duration-700 ease-out ${expandedFlights[flight.id]
                          ? 'translate-y-0 opacity-100'
                          : 'translate-y-4 opacity-0'
                          }`} style={{ transitionDelay: expandedFlights[flight.id] ? '450ms' : '0ms' }}>
                          <h5 className="text-md font-semibold text-gray-800 mb-3">Baggage Allowance</h5>
                          <div className="bg-white rounded-lg p-4 border border-gray-200">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <div className="text-sm text-gray-600 mb-2">Checked Baggage</div>
                                <div className="space-y-1">
                                  <div className="flex justify-between text-sm">
                                    <span>Quantity:</span>
                                    <span className="font-medium">{flight.fareDetailsBySegment[0].includedCheckedBags.quantity || 0}</span>
                                  </div>
                                  {flight.fareDetailsBySegment[0].includedCheckedBags.weight && (
                                    <div className="flex justify-between text-sm">
                                      <span>Weight:</span>
                                      <span className="font-medium">{flight.fareDetailsBySegment[0].includedCheckedBags.weight} {flight.fareDetailsBySegment[0].includedCheckedBags.weightUnit}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div>
                                <div className="text-sm text-gray-600 mb-2">Carry-on Baggage</div>
                                <div className="text-sm text-green-600 font-medium">Usually included</div>
                                <div className="text-xs text-gray-500 mt-1">Check with airline for specific limits</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Stop Locations Details */}
                      {flight.stopLocations && flight.stopLocations.length > 0 && (
                        <div className={`mt-6 transform transition-all duration-700 ease-out ${expandedFlights[flight.id]
                          ? 'translate-y-0 opacity-100'
                          : 'translate-y-4 opacity-0'
                          }`} style={{ transitionDelay: expandedFlights[flight.id] ? '500ms' : '0ms' }}>
                          <h5 className="text-md font-semibold text-gray-800 mb-3">Layover Information</h5>
                          <div className="bg-white rounded-lg p-4 border border-gray-200">
                            <div className="space-y-3">
                              {flight.stopLocations.map((stop, index) => (
                                <div key={stop.iataCode || index} className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-2">
                                        <div className="text-sm font-medium text-orange-600">Layover {index + 1}</div>
                                        <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                                      </div>

                                      {/* Airport Name */}
                                      {stop.name && (
                                        <div className="font-semibold text-gray-900 mb-1">{stop.name}</div>
                                      )}

                                      {/* Airport Code */}
                                      {stop.iataCode && (
                                        <div className="text-sm font-medium text-gray-700 mb-1">
                                          Airport Code: <span className="bg-gray-200 px-2 py-1 rounded text-xs font-mono">{stop.iataCode}</span>
                                        </div>
                                      )}

                                      {/* City and Country */}
                                      {stop.cityCountry && (
                                        <div className="text-sm text-gray-600 mb-2">{stop.cityCountry}</div>
                                      )}

                                      {/* Full Name if different from name */}
                                      {stop.fullName && stop.fullName !== stop.name && (
                                        <div className="text-xs text-gray-500 italic">{stop.fullName}</div>
                                      )}
                                    </div>

                                    <div className="text-right ml-4">
                                      <div className="text-xs text-gray-500">Duration varies</div>
                                      <div className="text-xs text-orange-600 mt-1">Connection time</div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}


                      {/* Quick Book Button in Dropdown */}
                      <div className={`mt-6 text-center transform transition-all duration-700 ease-out ${expandedFlights[flight.id]
                        ? 'translate-y-0 opacity-100 scale-100'
                        : 'translate-y-4 opacity-0 scale-95'
                        }`} style={{ transitionDelay: expandedFlights[flight.id] ? '500ms' : '0ms' }}>
                        <button
                          onClick={() => handleSelectFlight(flight)}
                          className="bg-teal-500 hover:bg-teal-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors shadow-md hover:shadow-lg flex items-center gap-2 mx-auto cursor-pointer"
                        >
                          <CreditCard className="w-5 h-5" />
                          Book This Flight - ৳{flight.price.total}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Plane className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Flights Found</h3>
              <p className="text-gray-600 mb-6">
                We couldn't find any flights matching your search criteria.
              </p>

              {/* Search Summary */}
              {searchParams && (
                <div className="bg-gray-50 rounded-lg p-4 mb-6 max-w-md mx-auto">
                  <h4 className="font-medium text-gray-900 mb-2">Your Search:</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>{searchParams.departure_id} → {searchParams.arrival_id}</div>
                    <div>Departure: {new Date(searchParams.outbound_date).toLocaleDateString()}</div>
                    {searchParams.return_date && (
                      <div>Return: {new Date(searchParams.return_date).toLocaleDateString()}</div>
                    )}
                    <div>{searchParams.adults} Adult(s), {searchParams.travel_class}</div>
                  </div>
                </div>
              )}

              {/* Suggestions */}
              <div className="text-left max-w-md mx-auto mb-6">
                <h4 className="font-medium text-gray-900 mb-3">Try these suggestions:</h4>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-teal-500 mt-1">•</span>
                    <span>Check your departure and destination airports</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-teal-500 mt-1">•</span>
                    <span>Try different dates (±3 days)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-teal-500 mt-1">•</span>
                    <span>Consider nearby airports</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-teal-500 mt-1">•</span>
                    <span>Try a different travel class</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() => navigate('/flights')}
                className="bg-teal-500 hover:bg-teal-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Search Again
              </button>
            </div>
          )}
        </div>
      </Container>
    </div>
  )
}

export default FlightResults