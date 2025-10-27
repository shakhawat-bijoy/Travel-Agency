import { useState } from 'react'
import { MapPin } from 'lucide-react'
import { flightAPI } from '../../utils/api'

const AirportSearch = ({
    value,
    onChange,
    placeholder = "Search airport",
    className = ""
}) => {
    const [airports, setAirports] = useState([])
    const [showDropdown, setShowDropdown] = useState(false)
    const [loading, setLoading] = useState(false)

    const searchAirports = async (query) => {
        if (query.length < 2) {
            setAirports([])
            return
        }

        setLoading(true)
        try {
            const response = await flightAPI.searchAirports(query)
            if (response.success) {
                setAirports(response.data)
            }
        } catch (error) {
            console.error('Airport search error:', error)
            setAirports([])
        } finally {
            setLoading(false)
        }
    }

    const handleInputChange = (e) => {
        const query = e.target.value
        onChange(query)
        searchAirports(query)
        setShowDropdown(true)
    }

    const handleAirportSelect = (airport) => {
        onChange(`${airport.name} (${airport.id})`)
        setShowDropdown(false)
        setAirports([])
    }

    return (
        <div className="relative">
            <div className="relative">
                <input
                    type="text"
                    value={value}
                    onChange={handleInputChange}
                    onFocus={() => setShowDropdown(true)}
                    onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                    className={`w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 ${className}`}
                    placeholder={placeholder}
                />
                <MapPin className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />

                {loading && (
                    <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-teal-500"></div>
                    </div>
                )}
            </div>

            {/* Airport Dropdown */}
            {showDropdown && airports.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {airports.map((airport, index) => (
                        <button
                            key={index}
                            onClick={() => handleAirportSelect(airport)}
                            className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 focus:outline-none focus:bg-gray-50"
                        >
                            <div className="font-medium">{airport.name}</div>
                            <div className="text-sm text-gray-500">{airport.city}, {airport.country} ({airport.id})</div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}

export default AirportSearch