import { useState } from 'react'
import { Plane, Hotel, ArrowLeftRight, Calendar, Search, MapPin, Clock, DollarSign } from 'lucide-react'
import { flightAPI } from '../../utils/api'
import Container from '../common/Container'

const FlightSearch = () => {
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
    travel_class: 'economy'
  })
  const [airports, setAirports] = useState([])
  const [searchResults, setSearchResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showFromDropdown, setShowFromDropdown] = useState(false)
  const [showToDropdown, setShowToDropdown] = useState(false)
  const [fromQuery, setFromQuery] = useState('')
  const [toQuery, setToQuery] = useState('')



  // Search airports when user types
  const searchAirports = async (query) => {
    if (query.length < 2) return

    try {
      const response = await flightAPI.searchAirports(query)
      if (response.success) {
        setAirports(response.data)
      }
    } catch (error) {
      console.error('Airport search error:', error)
    }
  }

  // Handle airport selection
  const handleAirportSelect = (airport, type) => {
    if (type === 'from') {
      setSearchData(prev => ({ ...prev, departure_id: airport.id }))
      setFromQuery(`${airport.name} (${airport.id})`)
      setShowFromDropdown(false)
    } else {
      setSearchData(prev => ({ ...prev, arrival_id: airport.id }))
      setToQuery(`${airport.name} (${airport.id})`)
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

  // Handle flight search
  const handleFlightSearch = async () => {
    if (!searchData.departure_id || !searchData.arrival_id || !searchData.outbound_date) {
      setError('Please fill in all required fields')
      return
    }

    setLoading(true)
    setError('')

    try {
      const searchParams = {
        ...searchData,
        type: tripType
      }

      // Remove return_date for one-way trips
      if (tripType === 'one_way') {
        delete searchParams.return_date
      }

      const response = await flightAPI.searchFlights(searchParams)

      if (response.success) {
        setSearchResults(response.data)
      } else {
        setError(response.message || 'Failed to search flights')
      }
    } catch (error) {
      console.error('Flight search error:', error)
      setError('Failed to search flights. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Format date for input
  const formatDateForInput = (date) => {
    if (!date) return ''
    return new Date(date).toISOString().split('T')[0]
  }



  return (
    <div className="bg-gray-50 py-12">
      <Container>
        {/* Search Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          {/* Tab Navigation */}
          <div className="flex items-center gap-8 mb-8 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('flights')}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-all duration-300 ${activeTab === 'flights'
                ? 'text-teal-600 border-teal-600'
                : 'text-gray-600 border-transparent hover:text-teal-600'
                }`}
            >
              <Plane className="w-5 h-5" />
              Flights
            </button>
            <button
              onClick={() => setActiveTab('stays')}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-all duration-300 ${activeTab === 'stays'
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
                    {showFromDropdown && airports.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {airports.map((airport, index) => (
                          <button
                            key={index}
                            onClick={() => handleAirportSelect(airport, 'from')}
                            className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                          >
                            <div className="font-medium">{airport.name}</div>
                            <div className="text-sm text-gray-500">{airport.city}, {airport.country} ({airport.id})</div>
                          </button>
                        ))}
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
                    {showToDropdown && airports.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {airports.map((airport, index) => (
                          <button
                            key={index}
                            onClick={() => handleAirportSelect(airport, 'to')}
                            className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                          >
                            <div className="font-medium">{airport.name}</div>
                            <div className="text-sm text-gray-500">{airport.city}, {airport.country} ({airport.id})</div>
                          </button>
                        ))}
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
                      {[1, 2, 3, 4, 5, 6].map(num => (
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
                    <option value="economy">Economy</option>
                    <option value="premium_economy">Premium Economy</option>
                    <option value="business">Business</option>
                    <option value="first">First Class</option>
                  </select>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              {/* Search Button */}
              <div className="flex justify-center pt-4">
                <button
                  onClick={handleFlightSearch}
                  disabled={loading}
                  className="bg-teal-500 hover:bg-teal-600 disabled:bg-gray-400 text-white px-12 py-4 rounded-lg font-semibold transition-colors flex items-center gap-2 text-lg"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="w-5 h-5" />
                      Search Flights
                    </>
                  )}
                </button>
              </div>
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

        {/* Search Results */}
        {searchResults && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Flight Results</h2>

            {searchResults.flights && searchResults.flights.length > 0 ? (
              <div className="space-y-4">
                {searchResults.flights.map((flight, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-2">
                          <div className="text-lg font-semibold">
                            {flight.flights?.[0]?.departure_airport?.id} → {flight.flights?.[0]?.arrival_airport?.id}
                          </div>
                          <div className="text-sm text-gray-500">
                            {flight.flights?.[0]?.airline}
                          </div>
                        </div>

                        <div className="flex items-center gap-6 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {flight.total_duration}
                          </div>
                          <div>
                            {flight.flights?.length > 1 ? `${flight.flights.length - 1} stop${flight.flights.length > 2 ? 's' : ''}` : 'Direct'}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-2xl font-bold text-teal-600 flex items-center gap-1">
                          <DollarSign className="w-5 h-5" />
                          {flight.price}
                        </div>
                        <button className="mt-2 bg-teal-500 hover:bg-teal-600 text-white px-6 py-2 rounded-lg transition-colors">
                          Select
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Plane className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No flights found for your search criteria.</p>
              </div>
            )}
          </div>
        )}
      </Container>
    </div>
  )
}

export default FlightSearch