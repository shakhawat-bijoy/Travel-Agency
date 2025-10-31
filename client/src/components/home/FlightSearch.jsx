import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { Plane, Hotel, ArrowLeftRight, Calendar, Search, MapPin, Edit3 } from 'lucide-react'
import { searchFlights, setSearchParams, clearSearchResults } from '../../store/slices/flightSlice'
import { flightAPI } from '../../utils/api'
import Container from '../common/Container'

const FlightSearch = ({className}) => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { searchLoading, searchError, searchResults } = useSelector(state => state.flights)

  const [activeTab, setActiveTab] = useState('flights')
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
  const [airports, setAirports] = useState([])
  const [bangladeshAirports, setBangladeshAirports] = useState([])
  const [showFromDropdown, setShowFromDropdown] = useState(false)
  const [showToDropdown, setShowToDropdown] = useState(false)
  const [fromQuery, setFromQuery] = useState('')
  const [toQuery, setToQuery] = useState('')
  const [showBangladeshAirports, setShowBangladeshAirports] = useState(false)



  // Load Bangladesh airports on component mount
  useEffect(() => {
    const loadBangladeshAirports = async () => {
      try {
        const response = await flightAPI.getBangladeshAirports()
        if (response.success) {
          setBangladeshAirports(response.data)
          console.log('Bangladesh airports loaded:', response.data.length)
        }
      } catch (error) {
        console.error('Failed to load Bangladesh airports:', error)
      }
    }

    loadBangladeshAirports()
  }, [])

  // Airport search using Amadeus API
  const searchAirports = async (query) => {
    if (query.length < 2) {
      setAirports([])
      return
    }

    try {
      const response = await flightAPI.searchAirports(query)
      if (response.success) {
        setAirports(response.data)
      } else {
        setAirports([])
      }
    } catch (error) {
      console.error('Airport search error:', error)
      setAirports([])
    }
  }

  // Handle airport selection
  const handleAirportSelect = (airport, type) => {
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
    <div className={`${className}`}>
      <Container className={`w-[1232px]`}>
        {/* Bangladesh Airports Quick Info */}
        {/* {bangladeshAirports.length > 0 && (
          <div className="bg-gradient-to-r from-teal-50 to-blue-50 rounded-2xl p-6 mb-6 border border-teal-100">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="text-2xl">🇧🇩</div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Bangladesh Airports</h3>
                  <p className="text-sm text-gray-600">{bangladeshAirports.length} airports available</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-600">
                  {bangladeshAirports.filter(a => a.isInternational).length} International • {bangladeshAirports.filter(a => !a.isInternational).length} Domestic
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {bangladeshAirports.filter(a => a.isInternational).map((airport, index) => (
                <div key={index} className="bg-white rounded-lg p-3 border border-gray-200 hover:border-teal-300 transition-colors">
                  <div className="font-medium text-sm text-gray-900">{airport.iataCode}</div>
                  <div className="text-xs text-gray-600 mt-1">{airport.city}</div>
                  <div className="text-xs text-blue-600 mt-1">International</div>
                </div>
              ))}
            </div>
          </div>
        )} */}

        {/* Search Form */}
        <div className="bg-white rounded-2xl shadow-xl px-8 py-4 mb-8">
          {/* Tab Navigation */}
          <div className="flex items-center gap-8 mb-8 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('flights')}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-all duration-300 cursor-pointer ${activeTab === 'flights'
                ? 'text-teal-600 border-teal-600'
                : 'text-gray-600 border-transparent hover:text-teal-600'
                }`}
            >
              <Plane className="w-5 h-5" />
              Flights
            </button>
            <span className='w-px h-12 bg-gray-200'></span>
            <button
              onClick={() => setActiveTab('stays')}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-all duration-300 cursor-pointer ${activeTab === 'stays'
                ? 'text-teal-600 border-teal-600'
                : 'text-gray-600 border-transparent hover:text-teal-600'
                }`}
            >
              <Hotel className="w-5 h-5" />
              Stays
            </button>
          </div>

          {activeTab === 'flights' && (
            <div className="space-y-6">
              {/* Trip Type */}
              <div className="flex gap-4 mb-6">
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* From */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    From
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={fromQuery}
                      onChange={(e) => {
                        setFromQuery(e.target.value)
                        searchAirports(e.target.value)
                        setShowFromDropdown(true)
                      }}
                      onFocus={() => setShowFromDropdown(true)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      placeholder="Search departure city"
                    />
                    <MapPin className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />

                    {/* Airport Dropdown */}
                    {showFromDropdown && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {/* Bangladesh Airports Section */}
                        {!fromQuery && bangladeshAirports.length > 0 && (
                          <>
                            <div className="px-4 py-2 bg-teal-50 border-b border-teal-100">
                              <div className="text-sm font-semibold text-teal-700">🇧🇩 Bangladesh Airports</div>
                            </div>
                            {bangladeshAirports.slice(0, 4).map((airport, index) => (
                              <button
                                key={`bd-${index}`}
                                onClick={() => handleAirportSelect(airport, 'from')}
                                className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100"
                              >
                                <div className="font-medium">{airport.name}</div>
                                <div className="text-sm text-gray-500">
                                  {airport.city}, {airport.country} ({airport.iataCode})
                                  {airport.isInternational && <span className="ml-2 text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded">International</span>}
                                </div>
                              </button>
                            ))}
                            {bangladeshAirports.length > 4 && (
                              <button
                                onClick={() => setShowBangladeshAirports(!showBangladeshAirports)}
                                className="w-full px-4 py-2 text-left text-sm text-teal-600 hover:bg-teal-50 border-b border-gray-100"
                              >
                                {showBangladeshAirports ? 'Show Less' : `Show ${bangladeshAirports.length - 4} More Bangladesh Airports`}
                              </button>
                            )}
                            {showBangladeshAirports && bangladeshAirports.slice(4).map((airport, index) => (
                              <button
                                key={`bd-more-${index}`}
                                onClick={() => handleAirportSelect(airport, 'from')}
                                className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100"
                              >
                                <div className="font-medium">{airport.name}</div>
                                <div className="text-sm text-gray-500">
                                  {airport.city}, {airport.country} ({airport.iataCode})
                                  {airport.isInternational && <span className="ml-2 text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded">International</span>}
                                </div>
                              </button>
                            ))}
                          </>
                        )}

                        {/* Search Results */}
                        {airports.length > 0 && (
                          <>
                            {fromQuery && (
                              <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
                                <div className="text-sm font-semibold text-gray-700">Search Results</div>
                              </div>
                            )}
                            {airports.map((airport, index) => (
                              <button
                                key={`search-${index}`}
                                onClick={() => handleAirportSelect(airport, 'from')}
                                className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                              >
                                <div className="font-medium">{airport.name}</div>
                                <div className="text-sm text-gray-500">
                                  {airport.city}, {airport.country} ({airport.iataCode || airport.id})
                                </div>
                              </button>
                            ))}
                          </>
                        )}

                        {/* No results message */}
                        {fromQuery && airports.length === 0 && (
                          <div className="px-4 py-3 text-sm text-gray-500 text-center">
                            No airports found for "{fromQuery}"
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* To */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    To
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={toQuery}
                      onChange={(e) => {
                        setToQuery(e.target.value)
                        searchAirports(e.target.value)
                        setShowToDropdown(true)
                      }}
                      onFocus={() => setShowToDropdown(true)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      placeholder="Search destination city"
                    />
                    <MapPin className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />

                    {/* Swap Button */}
                    <button
                      onClick={handleSwapLocations}
                      className="absolute -right-6 top-1/2 transform -translate-y-1/2 p-2 hover:bg-gray-100 rounded-full transition-colors z-10"
                    >
                      <ArrowLeftRight className="w-4 h-4 text-gray-500" />
                    </button>

                    {/* Airport Dropdown */}
                    {showToDropdown && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {/* Bangladesh Airports Section */}
                        {!toQuery && bangladeshAirports.length > 0 && (
                          <>
                            <div className="px-4 py-2 bg-teal-50 border-b border-teal-100">
                              <div className="text-sm font-semibold text-teal-700">🇧🇩 Bangladesh Airports</div>
                            </div>
                            {bangladeshAirports.slice(0, 4).map((airport, index) => (
                              <button
                                key={`bd-to-${index}`}
                                onClick={() => handleAirportSelect(airport, 'to')}
                                className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100"
                              >
                                <div className="font-medium">{airport.name}</div>
                                <div className="text-sm text-gray-500">
                                  {airport.city}, {airport.country} ({airport.iataCode})
                                  {airport.isInternational && <span className="ml-2 text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded">International</span>}
                                </div>
                              </button>
                            ))}
                          </>
                        )}

                        {/* Search Results */}
                        {airports.length > 0 && (
                          <>
                            {toQuery && (
                              <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
                                <div className="text-sm font-semibold text-gray-700">Search Results</div>
                              </div>
                            )}
                            {airports.map((airport, index) => (
                              <button
                                key={`search-to-${index}`}
                                onClick={() => handleAirportSelect(airport, 'to')}
                                className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                              >
                                <div className="font-medium">{airport.name}</div>
                                <div className="text-sm text-gray-500">
                                  {airport.city}, {airport.country} ({airport.iataCode || airport.id})
                                </div>
                              </button>
                            ))}
                          </>
                        )}

                        {/* No results message */}
                        {toQuery && airports.length === 0 && (
                          <div className="px-4 py-3 text-sm text-gray-500 text-center">
                            No airports found for "{toQuery}"
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Departure Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Departure
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={formatDateForInput(searchData.outbound_date)}
                      onChange={(e) => setSearchData(prev => ({ ...prev, outbound_date: e.target.value }))}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    />
                    <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {/* Return Date */}
                {tripType === 'round_trip' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Return
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        value={formatDateForInput(searchData.return_date)}
                        onChange={(e) => setSearchData(prev => ({ ...prev, return_date: e.target.value }))}
                        min={searchData.outbound_date || new Date().toISOString().split('T')[0]}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      />
                      <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                )}

                {/* Passengers */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Passengers
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={searchData.adults}
                      onChange={(e) => setSearchData(prev => ({ ...prev, adults: parseInt(e.target.value) }))}
                      className="flex-1 px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                        <option key={num} value={num}>{num} Adult{num > 1 ? 's' : ''}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Class */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Class
                  </label>
                  <select
                    value={searchData.travel_class}
                    onChange={(e) => setSearchData(prev => ({ ...prev, travel_class: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
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
                    } disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-8 py-2 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 text-lg shadow-lg hover:shadow-xl disabled:shadow-none`}
                >
                  {searchLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Searching Flights...
                    </>
                  ) : (
                    <>
                      {searchResults && searchResults.flights && searchResults.flights.length > 0 ? (
                        <Edit3 className="w-5 h-5" />
                      ) : (
                        <Search className="w-5 h-5" />
                      )}
                      {searchResults && searchResults.flights && searchResults.flights.length > 0
                        ? 'Modify Search'
                        : 'Search Flights'
                      }
                    </>
                  )}
                </button>


              </div>

              {/* Loading Progress */}
              {searchLoading && (
                <div className="mt-4 text-center">
                  <div className="text-sm text-gray-600 mb-2">
                    Searching flights from Bangladesh and worldwide...
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 max-w-md mx-auto">
                    <div className="bg-teal-500 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'stays' && (
            <div className="text-center py-12">
              <Hotel className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">Hotel Search</h3>
              <p className="text-gray-500">Hotel search functionality coming soon...</p>
            </div>
          )}
        </div>


      </Container>
    </div>
  )
}

export default FlightSearch