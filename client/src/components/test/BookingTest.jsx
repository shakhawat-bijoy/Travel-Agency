import { useState } from 'react'
import { flightAPI } from '../../utils/api'

const BookingTest = () => {
    const [testResult, setTestResult] = useState(null)
    const [loading, setLoading] = useState(false)
    const [searchResult, setSearchResult] = useState(null)
    const [dbResult, setDbResult] = useState(null)
    const [searchLoading, setSearchLoading] = useState(false)
    const [dbLoading, setDbLoading] = useState(false)

    const testBookingFlow = async () => {
        setLoading(true)
        setTestResult(null)

        try {
            // Test flight data
            const testFlight = {
                id: 'test-flight-1',
                flightNumber: 'TP1351',
                airline: 'TP',
                airlineName: 'TAP Portugal',
                aircraftModel: 'Airbus A321neo',
                aircraftCode: '32Q',
                departureAirport: 'LHR',
                arrivalAirport: 'JFK',
                departureTime: new Date('2024-12-01T10:00:00Z'),
                arrivalTime: new Date('2024-12-01T18:00:00Z'),
                duration: 'PT8H0M',
                stops: 0,
                oneWay: true,
                price: {
                    total: '402.83',
                    currency: 'USD',
                    base: '350.00',
                    grandTotal: '402.83'
                },
                departureLocation: {
                    iataCode: 'LHR',
                    name: 'Heathrow Airport',
                    city: 'London',
                    country: 'United Kingdom'
                },
                arrivalLocation: {
                    iataCode: 'JFK',
                    name: 'John F. Kennedy International Airport',
                    city: 'New York',
                    country: 'United States'
                },
                itineraries: [{
                    duration: 'PT8H0M',
                    segments: [{
                        carrierCode: 'TP',
                        carrierName: 'TAP Portugal',
                        number: '1351',
                        aircraft: { code: '32Q', name: 'Airbus A321neo' },
                        departure: {
                            iataCode: 'LHR',
                            at: '2024-12-01T10:00:00Z',
                            terminal: '2'
                        },
                        arrival: {
                            iataCode: 'JFK',
                            at: '2024-12-01T18:00:00Z',
                            terminal: '5'
                        },
                        duration: 'PT8H0M',
                        numberOfStops: 0
                    }]
                }]
            }

            // Test passenger data
            const testPassengers = {
                passenger: {
                    firstName: 'John',
                    lastName: 'Doe',
                    email: 'john.doe@example.com',
                    phone: '+1-555-123-4567',
                    dateOfBirth: '1990-01-01',
                    passportNumber: 'A12345678',
                    nationality: 'United States'
                },
                payment: {
                    cardNumber: '4111111111111111',
                    expiryDate: '12/25',
                    cvv: '123',
                    cardholderName: 'John Doe'
                }
            }

            // Test search params
            const testSearchParams = {
                departure_id: 'LHR',
                arrival_id: 'JFK',
                outbound_date: '2024-12-01',
                adults: 1,
                travel_class: 'ECONOMY',
                type: 'one_way'
            }

            console.log('Testing booking with:', { testFlight, testPassengers, testSearchParams })

            const response = await flightAPI.bookFlight({
                flight: testFlight,
                passengers: testPassengers,
                searchParams: testSearchParams
            })

            console.log('Booking response:', response)

            setTestResult({
                success: true,
                data: response,
                message: 'Booking test completed successfully!'
            })

        } catch (error) {
            console.error('Booking test error:', error)
            setTestResult({
                success: false,
                error: error.message,
                message: 'Booking test failed'
            })
        } finally {
            setLoading(false)
        }
    }

    const testSearchFlow = async () => {
        setSearchLoading(true)
        setSearchResult(null)

        try {
            console.log('Testing flight search flow...')

            const searchParams = {
                departure_id: 'LHR',
                arrival_id: 'JFK',
                outbound_date: '2024-12-15',
                adults: 1,
                travel_class: 'ECONOMY',
                type: 'one_way'
            }

            const response = await flightAPI.searchFlights(searchParams)
            console.log('Search response:', response)

            setSearchResult({
                success: true,
                data: response,
                message: 'Flight search completed successfully!'
            })

        } catch (error) {
            console.error('Search test error:', error)
            setSearchResult({
                success: false,
                error: error.message,
                message: 'Flight search test failed'
            })
        } finally {
            setSearchLoading(false)
        }
    }

    const testDatabaseFetch = async () => {
        if (!searchResult?.data?.data?.searchId) {
            alert('Please run flight search test first to get a search ID')
            return
        }

        setDbLoading(true)
        setDbResult(null)

        try {
            console.log('Testing database fetch for search ID:', searchResult.data.data.searchId)

            const response = await flightAPI.getFlightResults(searchResult.data.data.searchId)
            console.log('Database fetch response:', response)

            setDbResult({
                success: true,
                data: response,
                message: 'Database fetch completed successfully!'
            })

        } catch (error) {
            console.error('Database fetch test error:', error)
            setDbResult({
                success: false,
                error: error.message,
                message: 'Database fetch test failed'
            })
        } finally {
            setDbLoading(false)
        }
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="bg-white rounded-lg shadow-lg p-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">Flight System Test</h1>

                {/* Test Buttons */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <button
                        onClick={testSearchFlow}
                        disabled={searchLoading}
                        className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2"
                    >
                        {searchLoading ? (
                            <>
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                Testing Search...
                            </>
                        ) : (
                            'Test Flight Search'
                        )}
                    </button>

                    <button
                        onClick={testDatabaseFetch}
                        disabled={dbLoading || !searchResult?.data?.data?.searchId}
                        className="bg-purple-500 hover:bg-purple-600 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2"
                    >
                        {dbLoading ? (
                            <>
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                Testing DB Fetch...
                            </>
                        ) : (
                            'Test DB Fetch'
                        )}
                    </button>

                    <button
                        onClick={testBookingFlow}
                        disabled={loading}
                        className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2"
                    >
                        {loading ? (
                            <>
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                Testing Booking...
                            </>
                        ) : (
                            'Test Booking Flow'
                        )}
                    </button>
                </div>

                {/* Test Results */}
                <div className="space-y-6">
                    {/* Search Results */}
                    {searchResult && (
                        <div className={`p-4 rounded-lg ${searchResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                            <h3 className={`font-semibold mb-2 ${searchResult.success ? 'text-green-800' : 'text-red-800'}`}>
                                Flight Search: {searchResult.message}
                            </h3>

                            {searchResult.success && searchResult.data && (
                                <div className="space-y-2 text-sm">
                                    <p><strong>Search ID:</strong> {searchResult.data.data?.searchId}</p>
                                    <p><strong>Flights Found:</strong> {searchResult.data.data?.flights?.length || 0}</p>
                                    <p><strong>From Cache:</strong> {searchResult.data.data?.fromCache ? 'Yes' : 'No'}</p>
                                    <p><strong>Source:</strong> {searchResult.data.data?.fromDatabase ? 'Database' : 'API'}</p>
                                </div>
                            )}

                            {!searchResult.success && (
                                <p className="text-red-700 text-sm">{searchResult.error}</p>
                            )}

                            <details className="mt-4">
                                <summary className="cursor-pointer text-sm font-medium">View Search Response</summary>
                                <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-auto max-h-40">
                                    {JSON.stringify(searchResult, null, 2)}
                                </pre>
                            </details>
                        </div>
                    )}

                    {/* Database Fetch Results */}
                    {dbResult && (
                        <div className={`p-4 rounded-lg ${dbResult.success ? 'bg-purple-50 border border-purple-200' : 'bg-red-50 border border-red-200'}`}>
                            <h3 className={`font-semibold mb-2 ${dbResult.success ? 'text-purple-800' : 'text-red-800'}`}>
                                Database Fetch: {dbResult.message}
                            </h3>

                            {dbResult.success && dbResult.data && (
                                <div className="space-y-2 text-sm">
                                    <p><strong>Search ID:</strong> {dbResult.data.data?.searchId}</p>
                                    <p><strong>Flights Retrieved:</strong> {dbResult.data.data?.flights?.length || 0}</p>
                                    <p><strong>From Database:</strong> {dbResult.data.data?.fromDatabase ? 'Yes' : 'No'}</p>
                                    <p><strong>Cache Expiry:</strong> {dbResult.data.data?.cacheExpiry ? new Date(dbResult.data.data.cacheExpiry).toLocaleString() : 'N/A'}</p>
                                </div>
                            )}

                            {!dbResult.success && (
                                <p className="text-red-700 text-sm">{dbResult.error}</p>
                            )}

                            <details className="mt-4">
                                <summary className="cursor-pointer text-sm font-medium">View DB Response</summary>
                                <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-auto max-h-40">
                                    {JSON.stringify(dbResult, null, 2)}
                                </pre>
                            </details>
                        </div>
                    )}

                    {/* Booking Results */}
                    {testResult && (
                        <div className={`p-4 rounded-lg ${testResult.success ? 'bg-blue-50 border border-blue-200' : 'bg-red-50 border border-red-200'}`}>
                            <h3 className={`font-semibold mb-2 ${testResult.success ? 'text-blue-800' : 'text-red-800'}`}>
                                Booking Test: {testResult.message}
                            </h3>

                            {testResult.success && testResult.data && (
                                <div className="space-y-2 text-sm">
                                    <p><strong>Booking Reference:</strong> {testResult.data.data?.bookingReference}</p>
                                    <p><strong>Status:</strong> {testResult.data.data?.status}</p>
                                    <p><strong>Total Amount:</strong> ${testResult.data.data?.totalAmount} {testResult.data.data?.currency}</p>
                                    <p><strong>Passenger:</strong> {testResult.data.data?.passenger?.firstName} {testResult.data.data?.passenger?.lastName}</p>
                                    <p><strong>Flight:</strong> {testResult.data.data?.flight?.flightNumber} ({testResult.data.data?.flight?.departureAirport} → {testResult.data.data?.flight?.arrivalAirport})</p>
                                </div>
                            )}

                            {!testResult.success && (
                                <p className="text-red-700 text-sm">{testResult.error}</p>
                            )}

                            <details className="mt-4">
                                <summary className="cursor-pointer text-sm font-medium">View Booking Response</summary>
                                <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-auto max-h-40">
                                    {JSON.stringify(testResult, null, 2)}
                                </pre>
                            </details>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default BookingTest