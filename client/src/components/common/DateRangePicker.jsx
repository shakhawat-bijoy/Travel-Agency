import { useState, useRef, useEffect } from 'react'
import { Calendar, ChevronLeft, ChevronRight, X, Plane } from 'lucide-react'

const DateRangePicker = ({
    departureDate,
    returnDate,
    onDepartureDateChange,
    onReturnDateChange,
    tripType = 'round_trip',
    className = "",
    disabled = false
}) => {
    const [isOpen, setIsOpen] = useState(false)
    const [currentMonth, setCurrentMonth] = useState(new Date())
    const [selectingType, setSelectingType] = useState('departure') // 'departure' or 'return'
    const containerRef = useRef(null)

    // Close calendar when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ]

    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

    const getDaysInMonth = (date) => {
        const year = date.getFullYear()
        const month = date.getMonth()
        const firstDay = new Date(year, month, 1)
        const lastDay = new Date(year, month + 1, 0)
        const daysInMonth = lastDay.getDate()
        const startingDayOfWeek = firstDay.getDay()

        const days = []

        // Add empty cells for days before the first day of the month
        for (let i = 0; i < startingDayOfWeek; i++) {
            days.push(null)
        }

        // Add days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            days.push(new Date(year, month, day))
        }

        return days
    }

    const isDateDisabled = (date) => {
        if (!date) return true

        const today = new Date()
        today.setHours(0, 0, 0, 0)

        if (date < today) return true

        // If selecting return date, it must be after departure date
        if (selectingType === 'return' && departureDate) {
            const depDate = new Date(departureDate)
            depDate.setHours(0, 0, 0, 0)
            if (date <= depDate) return true
        }

        return false
    }

    const isDepartureDate = (date) => {
        if (!date || !departureDate) return false
        return date.toISOString().split('T')[0] === departureDate
    }

    const isReturnDate = (date) => {
        if (!date || !returnDate) return false
        return date.toISOString().split('T')[0] === returnDate
    }

    const isInRange = (date) => {
        if (!date || !departureDate || !returnDate) return false
        const dateStr = date.toISOString().split('T')[0]
        return dateStr > departureDate && dateStr < returnDate
    }

    const isToday = (date) => {
        if (!date) return false
        const today = new Date()
        return date.toDateString() === today.toDateString()
    }

    const handleDateSelect = (date) => {
        if (isDateDisabled(date)) return

        const dateStr = date.toISOString().split('T')[0]

        if (selectingType === 'departure') {
            onDepartureDateChange(dateStr)
            if (tripType === 'round_trip') {
                setSelectingType('return')
                // If return date is before new departure date, clear it
                if (returnDate && returnDate <= dateStr) {
                    onReturnDateChange('')
                }
            } else {
                setIsOpen(false)
            }
        } else {
            onReturnDateChange(dateStr)
            setIsOpen(false)
        }
    }

    const navigateMonth = (direction) => {
        setCurrentMonth(prev => {
            const newMonth = new Date(prev)
            newMonth.setMonth(prev.getMonth() + direction)
            return newMonth
        })
    }

    const formatDisplayDate = (date, type) => {
        if (!date) return type === 'departure' ? 'Departure' : 'Return'
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        })
    }

    const clearDates = (e) => {
        e.stopPropagation()
        onDepartureDateChange('')
        onReturnDateChange('')
        setSelectingType('departure')
    }

    const getDateButtonClass = (date) => {
        let baseClass = `
      h-10 w-10 rounded-lg text-sm font-medium transition-all duration-200 relative
    `

        if (!date) return baseClass + ' invisible'

        if (isDateDisabled(date)) {
            return baseClass + ' text-gray-300 cursor-not-allowed'
        }

        if (isDepartureDate(date)) {
            return baseClass + ' bg-teal-500 text-white hover:bg-teal-600 cursor-pointer'
        }

        if (isReturnDate(date)) {
            return baseClass + ' bg-orange-500 text-white hover:bg-orange-600 cursor-pointer'
        }

        if (isInRange(date)) {
            return baseClass + ' bg-teal-50 text-teal-700 cursor-pointer'
        }

        if (isToday(date)) {
            return baseClass + ' bg-blue-100 text-blue-600 font-bold cursor-pointer hover:bg-teal-50 hover:text-teal-600'
        }

        return baseClass + ' text-gray-700 hover:bg-teal-50 hover:text-teal-600 cursor-pointer'
    }

    return (
        <div ref={containerRef} className={`relative ${className}`}>
            {/* Input Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Departure Date */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Departure
                    </label>
                    <div
                        onClick={() => {
                            if (!disabled) {
                                setSelectingType('departure')
                                setIsOpen(true)
                            }
                        }}
                        className={`
              w-full px-4 py-3 border border-gray-300 rounded-lg cursor-pointer
              focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500
              ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white hover:border-gray-400'}
              ${isOpen && selectingType === 'departure' ? 'ring-2 ring-teal-500 border-teal-500' : ''}
            `}
                    >
                        <div className="flex items-center justify-between">
                            <span className={departureDate ? 'text-gray-900' : 'text-gray-500'}>
                                {formatDisplayDate(departureDate, 'departure')}
                            </span>
                            <Calendar className="w-5 h-5 text-gray-400" />
                        </div>
                    </div>
                </div>

                {/* Return Date */}
                {tripType === 'round_trip' && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Return
                        </label>
                        <div
                            onClick={() => {
                                if (!disabled && departureDate) {
                                    setSelectingType('return')
                                    setIsOpen(true)
                                }
                            }}
                            className={`
                w-full px-4 py-3 border border-gray-300 rounded-lg cursor-pointer
                focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500
                ${disabled || !departureDate ? 'bg-gray-100 cursor-not-allowed' : 'bg-white hover:border-gray-400'}
                ${isOpen && selectingType === 'return' ? 'ring-2 ring-orange-500 border-orange-500' : ''}
              `}
                        >
                            <div className="flex items-center justify-between">
                                <span className={returnDate ? 'text-gray-900' : 'text-gray-500'}>
                                    {formatDisplayDate(returnDate, 'return')}
                                </span>
                                <div className="flex items-center gap-2">
                                    {(departureDate || returnDate) && !disabled && (
                                        <button
                                            onClick={clearDates}
                                            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                                        >
                                            <X className="w-4 h-4 text-gray-400" />
                                        </button>
                                    )}
                                    <Calendar className="w-5 h-5 text-gray-400" />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Calendar Dropdown */}
            {isOpen && (
                <div className="absolute z-50 mt-2 bg-white border border-gray-200 rounded-xl shadow-2xl p-4 min-w-[320px]">
                    {/* Calendar Header */}
                    <div className="flex items-center justify-between mb-4">
                        <button
                            onClick={() => navigateMonth(-1)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <ChevronLeft className="w-5 h-5 text-gray-600" />
                        </button>

                        <div className="text-center">
                            <div className="text-lg font-semibold text-gray-900">
                                {months[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                            </div>
                            <div className="text-sm text-gray-500 flex items-center justify-center gap-2">
                                {selectingType === 'departure' ? (
                                    <>
                                        <Plane className="w-4 h-4 text-teal-500" />
                                        Select departure date
                                    </>
                                ) : (
                                    <>
                                        <Plane className="w-4 h-4 text-orange-500 transform rotate-180" />
                                        Select return date
                                    </>
                                )}
                            </div>
                        </div>

                        <button
                            onClick={() => navigateMonth(1)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <ChevronRight className="w-5 h-5 text-gray-600" />
                        </button>
                    </div>

                    {/* Legend */}
                    {tripType === 'round_trip' && (
                        <div className="flex items-center justify-center gap-4 mb-4 text-xs">
                            <div className="flex items-center gap-1">
                                <div className="w-3 h-3 bg-teal-500 rounded"></div>
                                <span>Departure</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <div className="w-3 h-3 bg-orange-500 rounded"></div>
                                <span>Return</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <div className="w-3 h-3 bg-teal-50 border border-teal-200 rounded"></div>
                                <span>In Range</span>
                            </div>
                        </div>
                    )}

                    {/* Weekday Headers */}
                    <div className="grid grid-cols-7 gap-1 mb-2">
                        {weekdays.map(day => (
                            <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Calendar Days */}
                    <div className="grid grid-cols-7 gap-1">
                        {getDaysInMonth(currentMonth).map((date, index) => (
                            <button
                                key={index}
                                onClick={() => date && handleDateSelect(date)}
                                disabled={!date || isDateDisabled(date)}
                                className={getDateButtonClass(date)}
                            >
                                {date?.getDate()}
                                {/* Date type indicator */}
                                {isDepartureDate(date) && (
                                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-white rounded-full"></div>
                                )}
                                {isReturnDate(date) && (
                                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-white rounded-full"></div>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Popular Travel Dates */}
                    <div className="mt-4 pt-4 border-t border-gray-100">
                        <div className="text-xs font-medium text-gray-600 mb-3">Popular Travel Dates</div>
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                onClick={() => {
                                    const today = new Date()
                                    handleDateSelect(today)
                                }}
                                className="px-3 py-2 text-sm text-teal-600 hover:bg-teal-50 rounded-lg transition-colors text-left"
                            >
                                <div className="font-medium">Today</div>
                                <div className="text-xs text-gray-500">Same day travel</div>
                            </button>
                            <button
                                onClick={() => {
                                    const tomorrow = new Date()
                                    tomorrow.setDate(tomorrow.getDate() + 1)
                                    handleDateSelect(tomorrow)
                                }}
                                className="px-3 py-2 text-sm text-teal-600 hover:bg-teal-50 rounded-lg transition-colors text-left"
                            >
                                <div className="font-medium">Tomorrow</div>
                                <div className="text-xs text-gray-500">Next day</div>
                            </button>
                            <button
                                onClick={() => {
                                    const nextWeek = new Date()
                                    nextWeek.setDate(nextWeek.getDate() + 7)
                                    handleDateSelect(nextWeek)
                                }}
                                className="px-3 py-2 text-sm text-teal-600 hover:bg-teal-50 rounded-lg transition-colors text-left"
                            >
                                <div className="font-medium">Next Week</div>
                                <div className="text-xs text-gray-500">7 days ahead</div>
                            </button>
                            <button
                                onClick={() => {
                                    const nextMonth = new Date()
                                    nextMonth.setMonth(nextMonth.getMonth() + 1)
                                    handleDateSelect(nextMonth)
                                }}
                                className="px-3 py-2 text-sm text-teal-600 hover:bg-teal-50 rounded-lg transition-colors text-left"
                            >
                                <div className="font-medium">Next Month</div>
                                <div className="text-xs text-gray-500">Better deals</div>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default DateRangePicker