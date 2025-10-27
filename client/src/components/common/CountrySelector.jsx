import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Search, Check } from 'lucide-react'
import { countries, popularCountries } from '../../data/countries'

const CountrySelector = ({ value, onChange, className = '', placeholder = 'Select a country' }) => {
    const [isOpen, setIsOpen] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [highlightedIndex, setHighlightedIndex] = useState(-1)
    const dropdownRef = useRef(null)
    const searchInputRef = useRef(null)

    // Filter countries based on search term
    const filteredCountries = countries.filter(country =>
        country.name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    // Combine popular and filtered countries
    const displayCountries = searchTerm
        ? filteredCountries
        : [...popularCountries, { code: 'separator', name: '──────────' }, ...countries]

    // Handle country selection
    const handleSelect = (country) => {
        if (country.code === 'separator') return
        onChange(country.name)
        setIsOpen(false)
        setSearchTerm('')
        setHighlightedIndex(-1)
    }

    // Handle keyboard navigation
    const handleKeyDown = (e) => {
        if (!isOpen) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                setIsOpen(true)
            }
            return
        }

        const selectableCountries = displayCountries.filter(c => c.code !== 'separator')

        switch (e.key) {
            case 'Escape':
                setIsOpen(false)
                setSearchTerm('')
                setHighlightedIndex(-1)
                break
            case 'ArrowDown':
                e.preventDefault()
                setHighlightedIndex(prev =>
                    prev < selectableCountries.length - 1 ? prev + 1 : 0
                )
                break
            case 'ArrowUp':
                e.preventDefault()
                setHighlightedIndex(prev =>
                    prev > 0 ? prev - 1 : selectableCountries.length - 1
                )
                break
            case 'Enter':
                e.preventDefault()
                if (highlightedIndex >= 0 && selectableCountries[highlightedIndex]) {
                    handleSelect(selectableCountries[highlightedIndex])
                }
                break
        }
    }

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false)
                setSearchTerm('')
                setHighlightedIndex(-1)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    // Focus search input when dropdown opens
    useEffect(() => {
        if (isOpen && searchInputRef.current) {
            searchInputRef.current.focus()
        }
    }, [isOpen])

    return (
        <div className={`relative ${className}`} ref={dropdownRef}>
            {/* Trigger Button */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                onKeyDown={handleKeyDown}
                className="appearance-none relative block w-full px-3 py-3 pr-10 border border-gray-300 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 sm:text-sm bg-white cursor-pointer text-left"
                aria-haspopup="listbox"
                aria-expanded={isOpen}
            >
                <span className={value ? 'text-gray-900' : 'text-gray-500'}>
                    {value || placeholder}
                </span>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </div>
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-80 overflow-hidden">
                    {/* Search Input */}
                    <div className="p-3 border-b border-gray-200">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                ref={searchInputRef}
                                type="text"
                                placeholder="Search countries..."
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value)
                                    setHighlightedIndex(-1)
                                }}
                                onKeyDown={handleKeyDown}
                                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
                            />
                        </div>
                    </div>

                    {/* Countries List */}
                    <div className="max-h-60 overflow-y-auto">
                        {!searchTerm && (
                            <div className="px-3 py-2 text-xs font-semibold text-gray-500 bg-gray-50 border-b border-gray-200">
                                Popular Countries
                            </div>
                        )}

                        {displayCountries.length === 0 ? (
                            <div className="px-3 py-4 text-sm text-gray-500 text-center">
                                No countries found
                            </div>
                        ) : (
                            displayCountries.map((country) => {
                                if (country.code === 'separator') {
                                    return !searchTerm ? (
                                        <div key="separator" className="px-3 py-2 text-xs font-semibold text-gray-500 bg-gray-50 border-b border-gray-200">
                                            All Countries
                                        </div>
                                    ) : null
                                }

                                const selectableCountries = displayCountries.filter(c => c.code !== 'separator')
                                const selectableIndex = selectableCountries.findIndex(c => c.code === country.code)
                                const isHighlighted = selectableIndex === highlightedIndex
                                const isSelected = value === country.name

                                return (
                                    <button
                                        key={country.code}
                                        type="button"
                                        onClick={() => handleSelect(country)}
                                        className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 focus:outline-none focus:bg-gray-50 flex items-center justify-between ${isHighlighted ? 'bg-teal-50 text-teal-900' : 'text-gray-900'
                                            }`}
                                    >
                                        <span>{country.name}</span>
                                        {isSelected && (
                                            <Check className="h-4 w-4 text-teal-600" />
                                        )}
                                    </button>
                                )
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

export default CountrySelector