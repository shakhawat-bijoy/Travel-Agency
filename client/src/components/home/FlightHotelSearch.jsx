import { useState, useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useLocation } from 'react-router-dom'
import { Plane, Hotel, ArrowLeftRight, Calendar, Search, MapPin, Edit3 } from 'lucide-react'
import { searchFlights, setSearchParams, clearSearchResults } from '../../store/slices/flightSlice'
import { flightAPI, hotelAPI } from '../../utils/api'
import Container from '../common/Container'

const FlightHotelSearch = ({ className, initialTab = 'flights' }) => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const { searchLoading, searchError, searchResults } = useSelector(state => state.flights)

  const [activeTab, setActiveTab] = useState(initialTab)
  const [tripType, setTripType] = useState('round_trip')
  const [searchData, setSearchData] = useState({
    departure_id: '',
    arrival_id: '',
    outbound_date: '',
    return_date: '',
    adults: 1,
    children: 0,
    infants: 0,
    travel_class: 'ECONOMY'
  })
  const [hotelSearchData, setHotelSearchData] = useState({
    destination: '',
    check_in: '',
    check_out: '',
    adults: 2,
    children: 0,
    rooms: 1
  })
  const [fromAirports, setFromAirports] = useState([])
  const [toAirports, setToAirports] = useState([])
  const [showFromDropdown, setShowFromDropdown] = useState(false)
  const [showToDropdown, setShowToDropdown] = useState(false)
  const [fromQuery, setFromQuery] = useState('')
  const [toQuery, setToQuery] = useState('')
  const [fromSearching, setFromSearching] = useState(false)
  const [toSearching, setToSearching] = useState(false)
  const [destinationQuery, setDestinationQuery] = useState('')
  const [showDestinationDropdown, setShowDestinationDropdown] = useState(false)

  const [destinations, setDestinations] = useState([])
  const [destinationSearching, setDestinationSearching] = useState(false)
  const [hotelSearchError, setHotelSearchError] = useState(null)

  // Handle pre-filled search data from navigation state
  useEffect(() => {
    if (location.state) {
      console.log('Applying pre-filled search data:', location.state)
      const { departure_id, arrival_id, from_query, to_query } = location.state

      if (departure_id || arrival_id) {
        setSearchData(prev => ({
          ...prev,
          departure_id: departure_id || prev.departure_id,
          arrival_id: arrival_id || prev.arrival_id
        }))
      }

      if (from_query) setFromQuery(from_query)
      if (to_query) setToQuery(to_query)

      // Clear the state so it doesn't persist if they navigate away and back without intent
      // specialized handling might be needed but for now this is good to trigger once
      window.history.replaceState({}, document.title)
    }
  }, [location.state])

  // Debounce timer refs
  const fromSearchTimer = useRef(null)
  const toSearchTimer = useRef(null)
  const destinationSearchTimer = useRef(null)
  const containerRef = useRef(null)

  // Handle pre-filled search data from navigation state
  useEffect(() => {
    if (location.state) {
      console.log('Applying pre-filled search data:', location.state)
      const { departure_id, arrival_id, from_query, to_query } = location.state

      if (departure_id || arrival_id) {
        setSearchData(prev => ({
          ...prev,
          departure_id: departure_id || prev.departure_id,
          arrival_id: arrival_id || prev.arrival_id
        }))
      }

      if (from_query) setFromQuery(from_query)
      if (to_query) setToQuery(to_query)

      // Scroll into view
      if (containerRef.current) {
        containerRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }

      // Clear the state so it doesn't persist if they navigate away and back without intent
      // specialized handling might be needed but for now this is good to trigger once
      window.history.replaceState({}, document.title)
    }
  }, [location.state])

  const searchDestinations = async (keyword) => {
    if (!keyword || keyword.trim().length < 2) {
      setDestinations([])
      return
    }

    try {
      setDestinationSearching(true)
      const response = await hotelAPI.searchCities(keyword.trim(), 10)

      if (response.success) {
        setDestinations(response.data || [])
      } else {
        setDestinations([])
      }
    } catch (error) {
      console.error('Destination search error:', error)
      setDestinations([])
    } finally {
      setDestinationSearching(false)
    }
  }

  const handleDestinationQueryChange = (value) => {
    setDestinationQuery(value)
    setHotelSearchData(prev => ({ ...prev, destination: value }))
    setShowDestinationDropdown(true)

    if (destinationSearchTimer.current) clearTimeout(destinationSearchTimer.current)
    destinationSearchTimer.current = setTimeout(() => {
      searchDestinations(value)
    }, 300)
  }

  const handleDestinationSelect = (destination, event) => {
    if (event) {
      event.preventDefault()
      event.stopPropagation()
    }

    const code = destination.iataCode
    const label = `${destination.city || destination.name}${destination.country ? `, ${destination.country}` : ''} (${code})`

    setDestinationQuery(label)
    setHotelSearchData(prev => ({ ...prev, destination: code }))
    setShowDestinationDropdown(false)
    setDestinations([])
  }

  const handleHotelSearch = async () => {
    setHotelSearchError(null)

    const cityCode = String(hotelSearchData.destination || '').trim().toUpperCase()
    if (cityCode.length !== 3) {
      setHotelSearchError('Please pick a destination from the list (3-letter city code).')
      return
    }
    if (!hotelSearchData.check_in || !hotelSearchData.check_out) {
      setHotelSearchError('Please select check-in and check-out dates.')
      return
    }

    const params = new URLSearchParams({
      cityCode,
      checkInDate: hotelSearchData.check_in,
      checkOutDate: hotelSearchData.check_out,
      adults: String(hotelSearchData.adults || 2),
      roomQuantity: String(hotelSearchData.rooms || 1),
      currency: 'USD',
      limit: '60',
      radiusKm: '5'
    })

    navigate(`/hotels/search?${params.toString()}`)
  }

  // Airport search using Amadeus API with debouncing
  const searchAirports = async (query, type) => {
    if (query.length < 2) {
      if (type === 'from') setFromAirports([])
      else setToAirports([])
      return
    }

    try {
      if (type === 'from') setFromSearching(true)
      else setToSearching(true)

      console.log(`Searching airports for "${query}" (${type})...`)
      const response = await flightAPI.searchAirports(query, 20)

      console.log(`Airport search response for "${query}":`, response)

      if (response.success) {
        const airports = response.data || []
        console.log(`Found ${airports.length} airports for "${query}"`)

        if (type === 'from') setFromAirports(airports)
        else setToAirports(airports)
      } else {
        console.warn(`Airport search failed for "${query}":`, response.message)
        if (type === 'from') setFromAirports([])
        else setToAirports([])
      }
    } catch (error) {
      console.error(`Airport search error for "${query}":`, error)
      if (type === 'from') setFromAirports([])
      else setToAirports([])
    } finally {
      if (type === 'from') setFromSearching(false)
      else setToSearching(false)
    }
  }

  // Debounced search handlers
  const handleFromQueryChange = (query) => {
    setFromQuery(query)
    setShowFromDropdown(true)

    if (fromSearchTimer.current) clearTimeout(fromSearchTimer.current)

    fromSearchTimer.current = setTimeout(() => {
      searchAirports(query, 'from')
    }, 300)
  }

  const handleToQueryChange = (query) => {
    setToQuery(query)
    setShowToDropdown(true)

    if (toSearchTimer.current) clearTimeout(toSearchTimer.current)

    toSearchTimer.current = setTimeout(() => {
      searchAirports(query, 'to')
    }, 300)
  }

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (fromSearchTimer.current) clearTimeout(fromSearchTimer.current)
      if (toSearchTimer.current) clearTimeout(toSearchTimer.current)
      if (destinationSearchTimer.current) clearTimeout(destinationSearchTimer.current)
    }
  }, [])

  // Handle airport selection (works with mouse, touch, and keyboard)
  const handleAirportSelect = (airport, type, event) => {
    // Prevent default behavior
    if (event) {
      event.preventDefault()
      event.stopPropagation()
    }

    const airportCode = airport.iataCode || airport.id
    const airportName = airport.name

    if (type === 'from') {
      setSearchData(prev => ({ ...prev, departure_id: airportCode }))
      setFromQuery(`${airportName} (${airportCode})`)
      setShowFromDropdown(false)
    } else {
      setSearchData(prev => ({ ...prev, arrival_id: airportCode }))
      setToQuery(`${airportName} (${airportCode})`)
      setShowToDropdown(false)
    }
  }

  // Handle location swap
  const handleSwapLocations = () => {
    setSearchData(prev => ({
      ...prev,
      departure_id: prev.arrival_id,
      arrival_id: prev.departure_id
    }))
    const tempQuery = fromQuery
    setFromQuery(toQuery)
    setToQuery(tempQuery)
  }

  // Enhanced flight search with Redux
  const handleFlightSearch = async () => {
    // Clear previous results
    dispatch(clearSearchResults())

    // Validation
    if (!searchData.departure_id || !searchData.arrival_id || !searchData.outbound_date) {
      return
    }

    if (tripType === 'round_trip' && !searchData.return_date) {
      return
    }

    if (tripType === 'round_trip' && new Date(searchData.return_date) <= new Date(searchData.outbound_date)) {
      return
    }

    if (searchData.departure_id === searchData.arrival_id) {
      return
    }

    const searchParams = {
      ...searchData,
      type: tripType
    }

    // Remove return_date for one-way trips
    if (tripType === 'one_way') {
      delete searchParams.return_date
    }

    // Store search params in Redux
    dispatch(setSearchParams(searchParams))

    // Dispatch search action
    const result = await dispatch(searchFlights(searchParams))

    if (searchFlights.fulfilled.match(result)) {
      // Navigate to results page on success
      navigate('/flight-results')
    }
  }

  // Format date for input
  const formatDateForInput = (date) => {
    if (!date) return ''
    return new Date(date).toISOString().split('T')[0]
  }

  return (
    <div ref={containerRef} className={`${className}`}>
      <Container className={`lg:w-[1280px] max-w-7xl mx-auto px-4 sm:px-6 lg:px-0`}>
        {/* Search Form */}
        <div className="bg-white rounded-2xl shadow-xl px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-4 mb-8">
          {/* Tab Navigation */}
          <div className="flex items-center gap-4 sm:gap-6 lg:gap-8 mb-6 sm:mb-8 border-b border-gray-200 overflow-x-auto">
            <button
              onClick={() => setActiveTab('flights')}
              className={`flex items-center gap-2 px-3 sm:px-4 py-3 border-b-2 transition-all duration-300 cursor-pointer whitespace-nowrap ${activeTab === 'flights'
                ? 'text-teal-600 border-teal-600'
                : 'text-gray-600 border-transparent hover:text-teal-600'
                }`}
            >
              <Plane className="w-4 h-4 lg:w-5 lg:h-5" />
              <span className="text-sm lg:text-base">Flights</span>
            </button>
            <span className='w-px h-8 sm:h-10 lg:h-12 bg-gray-200'></span>
            <button
              onClick={() => setActiveTab('stays')}
              className={`flex items-center gap-2 px-3 sm:px-4 py-3 border-b-2 transition-all duration-300 cursor-pointer whitespace-nowrap ${activeTab === 'stays'
                ? 'text-teal-600 border-teal-600'
                : 'text-gray-600 border-transparent hover:text-teal-600'
                }`}
            >
              <Hotel className="w-4 h-4 lg:w-5 lg:h-5" />
              <span className="text-sm lg:text-base">Stays</span>
            </button>
          </div>

          {activeTab === 'flights' && (
            <div className="space-y-4 lg:space-y-6">
              {/* Trip Type */}
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 lg:gap-4 mb-4 lg:mb-6">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    value="round_trip"
                    checked={tripType === 'round_trip'}
                    onChange={(e) => setTripType(e.target.value)}
                    className="text-teal-600"
                  />
                  Round Trip
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    value="one_way"
                    checked={tripType === 'one_way'}
                    onChange={(e) => setTripType(e.target.value)}
                    className="text-teal-600"
                  />
                  One Way
                </label>
              </div>

              {/* Flight Search Form */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {/* From */}
                <div className="relative">
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 lg:mb-2">
                    From
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={fromQuery}
                      onChange={(e) => handleFromQueryChange(e.target.value)}
                      onFocus={() => setShowFromDropdown(true)}
                      onBlur={() => setTimeout(() => setShowFromDropdown(false), 300)}
                      onTouchStart={() => setShowFromDropdown(true)}
                      className="w-full lg:pl-3 lg:pr-9 pl-2 pr-2 py-2 sm:py-3 text-sm lg:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 touch-manipulation"
                      placeholder="Search departure city or airport"
                      autoComplete="off"
                    />
                    <MapPin className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 lg:w-5 lg:h-5 text-gray-400" />


                    {/* Swap Button */}
                    <button
                      onClick={handleSwapLocations}
                      className="absolute -right-4 sm:-right-5 lg:-right-6 top-1/2 transform -translate-y-1/2 p-1 sm:p-2 hover:bg-gray-100 rounded-full transition-colors z-10"
                    >
                      <ArrowLeftRight className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
                    </button>

                    {/* Airport Dropdown */}
                    {showFromDropdown && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {/* Loading State */}
                        {fromSearching && (
                          <div className="px-4 py-3 text-center">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-teal-600 mx-auto"></div>
                            <div className="text-sm text-gray-500 mt-2">Searching airports...</div>
                          </div>
                        )}

                        {/* Search Results */}
                        {!fromSearching && fromAirports.length > 0 && (
                          <>
                            <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
                              <div className="text-xs font-semibold text-gray-600 uppercase">
                                {fromAirports.length} Airport{fromAirports.length > 1 ? 's' : ''} Found
                              </div>
                            </div>
                            {fromAirports.map((airport, index) => (
                              <button
                                key={`from-${airport.iataCode || airport.id}-${index}`}
                                onClick={(e) => handleAirportSelect(airport, 'from', e)}
                                onTouchEnd={(e) => handleAirportSelect(airport, 'from', e)}
                                className="w-full px-4 py-3 text-left hover:bg-teal-50 active:bg-teal-100 border-b border-gray-100 last:border-b-0 transition-colors group cursor-pointer touch-manipulation"
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex-1 min-w-0">
                                    <div className="font-medium text-gray-900 group-hover:text-teal-700 transition-colors truncate">
                                      {airport.name}
                                    </div>
                                    <div className="text-sm text-gray-500 mt-0.5">
                                      {airport.city}{airport.country ? `, ${airport.country}` : ''}
                                    </div>
                                  </div>
                                  <div className="ml-3 flex-shrink-0">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-800 group-hover:bg-teal-100 group-hover:text-teal-800 transition-colors">
                                      {airport.iataCode || airport.id}
                                    </span>
                                  </div>
                                </div>
                              </button>
                            ))}
                          </>
                        )}

                        {/* Empty state - show hint */}
                        {!fromSearching && !fromQuery && fromAirports.length === 0 && (
                          <div className="px-4 py-6 text-center">
                            <MapPin className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                            <div className="text-sm text-gray-500 font-medium">Search airports worldwide</div>
                            <div className="text-xs text-gray-400 mt-2">Try searching by:</div>
                            <div className="text-xs text-gray-500 mt-1 space-y-0.5">
                              <div>• City name: "Dhaka", "Bangkok", "Dubai"</div>
                              <div>• Airport code: "DAC", "BKK", "DXB"</div>
                              <div>• Airport name: "Heathrow", "JFK"</div>
                            </div>
                          </div>
                        )}

                        {/* No results message */}
                        {!fromSearching && fromQuery && fromAirports.length === 0 && (
                          <div className="px-4 py-6 text-center">
                            <div className="text-sm text-gray-500">No airports found for "{fromQuery}"</div>
                            <div className="text-xs text-gray-400 mt-1">Try a different city or airport code</div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* To */}
                <div className="relative">
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 lg:mb-2">
                    To
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={toQuery}
                      onChange={(e) => handleToQueryChange(e.target.value)}
                      onFocus={() => setShowToDropdown(true)}
                      onBlur={() => setTimeout(() => setShowToDropdown(false), 300)}
                      onTouchStart={() => setShowToDropdown(true)}
                      className="w-full lg:pl-3 lg:pr-9 pl-2 pr-2 py-2 sm:py-3 text-sm lg:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 touch-manipulation"
                      placeholder="Search destination city or airport"
                      autoComplete="off"
                    />
                    <MapPin className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 lg:w-5 lg:h-5 text-gray-400" />



                    {/* Airport Dropdown */}
                    {showToDropdown && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {/* Loading State */}
                        {toSearching && (
                          <div className="px-4 py-3 text-center">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-teal-600 mx-auto"></div>
                            <div className="text-sm text-gray-500 mt-2">Searching airports...</div>
                          </div>
                        )}

                        {/* Search Results */}
                        {!toSearching && toAirports.length > 0 && (
                          <>
                            <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
                              <div className="text-xs font-semibold text-gray-600 uppercase">
                                {toAirports.length} Airport{toAirports.length > 1 ? 's' : ''} Found
                              </div>
                            </div>
                            {toAirports.map((airport, index) => (
                              <button
                                key={`to-${airport.iataCode || airport.id}-${index}`}
                                onClick={(e) => handleAirportSelect(airport, 'to', e)}
                                onTouchEnd={(e) => handleAirportSelect(airport, 'to', e)}
                                className="w-full px-4 py-3 text-left hover:bg-teal-50 active:bg-teal-100 border-b border-gray-100 last:border-b-0 transition-colors group cursor-pointer touch-manipulation"
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex-1 min-w-0">
                                    <div className="font-medium text-gray-900 group-hover:text-teal-700 transition-colors truncate">
                                      {airport.name}
                                    </div>
                                    <div className="text-sm text-gray-500 mt-0.5">
                                      {airport.city}{airport.country ? `, ${airport.country}` : ''}
                                    </div>
                                  </div>
                                  <div className="ml-3 flex-shrink-0">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-800 group-hover:bg-teal-100 group-hover:text-teal-800 transition-colors">
                                      {airport.iataCode || airport.id}
                                    </span>
                                  </div>
                                </div>
                              </button>
                            ))}
                          </>
                        )}

                        {/* Empty state - show hint */}
                        {!toSearching && !toQuery && toAirports.length === 0 && (
                          <div className="px-4 py-6 text-center">
                            <MapPin className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                            <div className="text-sm text-gray-500 font-medium">Search airports worldwide</div>
                            <div className="text-xs text-gray-400 mt-2">Try searching by:</div>
                            <div className="text-xs text-gray-500 mt-1 space-y-0.5">
                              <div>• City name: "Singapore", "Mumbai", "London"</div>
                              <div>• Airport code: "SIN", "BOM", "LHR"</div>
                              <div>• Airport name: "Changi", "Indira Gandhi"</div>
                            </div>
                          </div>
                        )}

                        {/* No results message */}
                        {!toSearching && toQuery && toAirports.length === 0 && (
                          <div className="px-4 py-6 text-center">
                            <div className="text-sm text-gray-500">No airports found for "{toQuery}"</div>
                            <div className="text-xs text-gray-400 mt-1">Try a different city or airport code</div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Departure Date */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 lg:mb-2">
                    Departure
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={formatDateForInput(searchData.outbound_date)}
                      onChange={(e) => setSearchData(prev => ({ ...prev, outbound_date: e.target.value }))}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm lg:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    />
                    <Calendar className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 lg:w-5 lg:h-5 text-gray-800 pointer-events-none" />
                  </div>
                </div>

                {/* Return Date */}
                {tripType === 'round_trip' && (
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 lg:mb-2">
                      Return
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        value={formatDateForInput(searchData.return_date)}
                        onChange={(e) => setSearchData(prev => ({ ...prev, return_date: e.target.value }))}
                        min={searchData.outbound_date || new Date().toISOString().split('T')[0]}
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm lg:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      />
                      <Calendar className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 lg:w-5 lg:h-5 text-gray-800 pointer-events-none" />
                    </div>
                  </div>
                )}

                {/* Passengers */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 lg:mb-2">
                    Passengers
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={searchData.adults}
                      onChange={(e) => setSearchData(prev => ({ ...prev, adults: parseInt(e.target.value) }))}
                      className="flex-1 px-2 sm:px-3 py-2 sm:py-3 text-sm lg:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                        <option key={num} value={num}>{num} Adult{num > 1 ? 's' : ''}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Class */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 lg:mb-2">
                    Class
                  </label>
                  <select
                    value={searchData.travel_class}
                    onChange={(e) => setSearchData(prev => ({ ...prev, travel_class: e.target.value }))}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm lg:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  >
                    <option value="ECONOMY">Economy</option>
                    <option value="PREMIUM_ECONOMY">Premium Economy</option>
                    <option value="BUSINESS">Business</option>
                    <option value="FIRST">First Class</option>
                  </select>
                </div>
              </div>

              {/* Error Message */}
              {searchError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-3">
                  <div className="shrink-0 mt-0.5">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Search Error</h4>
                    <p className="text-sm">{searchError}</p>
                  </div>
                </div>
              )}

              {/* Search Button */}
              <div className="flex justify-center pt-4 gap-4">
                <button
                  onClick={handleFlightSearch}
                  disabled={searchLoading || !searchData.departure_id || !searchData.arrival_id || !searchData.outbound_date}
                  className={`${searchResults && searchResults.flights && searchResults.flights.length > 0
                    ? 'bg-blue-500 hover:bg-blue-600'
                    : 'bg-teal-500 hover:bg-teal-600'
                    } disabled:bg-gray-400 disabled:cursor-not-allowed cursor-pointer text-white px-6 sm:px-8 py-2 sm:py-3 lg:py-2 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 text-base sm:text-lg shadow-lg hover:shadow-xl disabled:shadow-none touch-manipulation`}
                >
                  {searchLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white"></div>
                      <span className="hidden sm:inline">Searching Flights...</span>
                      <span className="sm:hidden">Searching...</span>
                    </>
                  ) : (
                    <>
                      {searchResults && searchResults.flights && searchResults.flights.length > 0 ? (
                        <Edit3 className="w-4 h-4 sm:w-5 sm:h-5" />
                      ) : (
                        <Search className="w-4 h-4 sm:w-5 sm:h-5" />
                      )}
                      <span className="hidden sm:inline">
                        {searchResults && searchResults.flights && searchResults.flights.length > 0
                          ? 'Modify Search'
                          : 'Search Flights'
                        }
                      </span>
                      <span className="sm:hidden">
                        {searchResults && searchResults.flights && searchResults.flights.length > 0
                          ? 'Modify'
                          : 'Search'
                        }
                      </span>
                    </>
                  )}
                </button>
              </div>

              {/* Loading Progress */}
              {searchLoading && (
                <div className="mt-4 text-center px-4">
                  <div className="text-xs sm:text-sm text-gray-600 mb-2">
                    <span className="hidden sm:inline">Searching flights from Bangladesh and worldwide...</span>
                    <span className="sm:hidden">Searching flights...</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 max-w-xs sm:max-w-md mx-auto">
                    <div className="bg-teal-500 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'stays' && (
            <div className="space-y-4 lg:space-y-6">
              {/* Hotel Search Form */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {/* Destination */}
                <div className="relative sm:col-span-2">
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 lg:mb-2">
                    Destination
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={destinationQuery}
                      onChange={(e) => handleDestinationQueryChange(e.target.value)}
                      onFocus={() => setShowDestinationDropdown(true)}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm lg:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      placeholder="Search hotels, cities, or landmarks"
                    />
                    <MapPin className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 lg:w-5 lg:h-5 text-gray-400" />

                    {/* Destination Dropdown */}
                    {showDestinationDropdown && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {/* Popular Destinations */}
                        {!destinationQuery && (
                          <>

                          </>
                        )}

                        {/* Search Results */}
                        {(destinationSearching || destinations.length > 0) && (
                          <>
                            {destinationQuery && (
                              <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
                                <div className="text-sm font-semibold text-gray-700">Search Results</div>
                              </div>
                            )}
                            {destinationSearching && (
                              <div className="px-4 py-3 text-sm text-gray-500 text-center">Searching...</div>
                            )}
                            {!destinationSearching && destinations.map((destination, index) => (
                              <button
                                key={`dest-${destination.iataCode || index}`}
                                className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                                onClick={(e) => handleDestinationSelect(destination, e)}
                                type="button"
                              >
                                <div className="font-medium">{destination.city || destination.name} ({destination.iataCode})</div>
                                <div className="text-sm text-gray-500">
                                  {destination.country || ''}
                                </div>
                              </button>
                            ))}
                          </>
                        )}

                        {/* No results message */}
                        {destinationQuery && destinations.length === 0 && (
                          <div className="px-4 py-3 text-sm text-gray-500 text-center">
                            No destinations found for "{destinationQuery}"
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Check-in Date */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 lg:mb-2">
                    Check-in
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={formatDateForInput(hotelSearchData.check_in)}
                      onChange={(e) => setHotelSearchData(prev => ({ ...prev, check_in: e.target.value }))}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm lg:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    />
                    <Calendar className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 lg:w-5 lg:h-5 text-gray-800 pointer-events-none" />
                  </div>
                </div>

                {/* Check-out Date */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 lg:mb-2">
                    Check-out
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={formatDateForInput(hotelSearchData.check_out)}
                      onChange={(e) => setHotelSearchData(prev => ({ ...prev, check_out: e.target.value }))}
                      min={hotelSearchData.check_in || new Date().toISOString().split('T')[0]}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm lg:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    />
                    <Calendar className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 lg:w-5 lg:h-5 text-gray-800 pointer-events-none" />
                  </div>
                </div>

                {/* Guests & Rooms */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 lg:mb-2">
                    Guests
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={hotelSearchData.adults}
                      onChange={(e) => setHotelSearchData(prev => ({ ...prev, adults: parseInt(e.target.value) }))}
                      className="flex-1 px-2 sm:px-3 py-2 sm:py-3 text-sm lg:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                        <option key={num} value={num}>{num} Adult{num > 1 ? 's' : ''}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Children */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 lg:mb-2">
                    Children
                  </label>
                  <select
                    value={hotelSearchData.children}
                    onChange={(e) => setHotelSearchData(prev => ({ ...prev, children: parseInt(e.target.value) }))}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm lg:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  >
                    {[0, 1, 2, 3, 4, 5, 6].map(num => (
                      <option key={num} value={num}>{num} {num === 1 ? 'Child' : 'Children'}</option>
                    ))}
                  </select>
                </div>

                {/* Rooms */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 lg:mb-2">
                    Rooms
                  </label>
                  <select
                    value={hotelSearchData.rooms}
                    onChange={(e) => setHotelSearchData(prev => ({ ...prev, rooms: parseInt(e.target.value) }))}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm lg:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  >
                    {[1, 2, 3, 4, 5, 6].map(num => (
                      <option key={num} value={num}>{num} Room{num > 1 ? 's' : ''}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Error Message */}
              {hotelSearchError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-3">
                  <div className="shrink-0 mt-0.5">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Search Error</h4>
                    <p className="text-sm">{hotelSearchError}</p>
                  </div>
                </div>
              )}

              {/* Search Button */}
              <div className="flex justify-center pt-4 gap-4">
                <button
                  onClick={handleHotelSearch}
                  disabled={!hotelSearchData.destination || !hotelSearchData.check_in || !hotelSearchData.check_out}
                  className={`bg-teal-500 hover:bg-teal-600 disabled:bg-gray-400 disabled:cursor-not-allowed cursor-pointer text-white px-6 sm:px-8 py-2 sm:py-3 lg:py-2 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 text-base sm:text-lg shadow-lg hover:shadow-xl disabled:shadow-none touch-manipulation`}
                >
                  <>
                    <Search className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="hidden sm:inline">Search Hotels</span>
                    <span className="sm:hidden">Search</span>
                  </>
                </button>
              </div>
            </div>
          )}
        </div>
      </Container>
    </div>
  )
}

export default FlightHotelSearch