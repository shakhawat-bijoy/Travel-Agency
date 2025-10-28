import { useState, useEffect } from 'react'
import { flightAPI } from '../../utils/api'
import { Plane, Globe, MapPin, TrendingUp } from 'lucide-react'

const AirportStats = () => {
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        const loadStats = async () => {
            try {
                const response = await flightAPI.getAirportStats()
                if (response.success) {
                    setStats(response.data)
                } else {
                    setError('Failed to load airport statistics')
                }
            } catch (error) {
                console.error('Error loading airport stats:', error)
                setError('Failed to load airport statistics')
            } finally {
                setLoading(false)
            }
        }

        loadStats()
    }, [])

    if (loading) {
        return (
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="space-y-2">
                                <div className="h-8 bg-gray-200 rounded"></div>
                                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    if (error || !stats) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="text-red-700 text-sm">{error || 'No statistics available'}</div>
            </div>
        )
    }

    return (
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-teal-600" />
                Airport Database Statistics
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                    <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-2">
                        <Plane className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{stats.totalAirports}</div>
                    <div className="text-sm text-gray-600">Total Airports</div>
                </div>

                <div className="text-center">
                    <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mx-auto mb-2">
                        <Globe className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{stats.internationalAirports}</div>
                    <div className="text-sm text-gray-600">International</div>
                </div>

                <div className="text-center">
                    <div className="flex items-center justify-center w-12 h-12 bg-teal-100 rounded-lg mx-auto mb-2">
                        <MapPin className="w-6 h-6 text-teal-600" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{stats.bangladeshAirports}</div>
                    <div className="text-sm text-gray-600">Bangladesh</div>
                </div>

                <div className="text-center">
                    <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mx-auto mb-2">
                        <TrendingUp className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{stats.totalSearches?.toLocaleString() || 0}</div>
                    <div className="text-sm text-gray-600">Total Searches</div>
                </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>Countries covered: {stats.countriesCount}</span>
                    <span>Avg searches per airport: {stats.avgSearchCount}</span>
                </div>
            </div>
        </div>
    )
}

export default AirportStats