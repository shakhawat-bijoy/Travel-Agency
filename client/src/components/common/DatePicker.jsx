import { useState, useRef, useEffect } from 'react'
import { Calendar, ChevronLeft, ChevronRight, X } from 'lucide-react'

const DatePicker = ({
    value,
    onChange,
    placeholder = "Select date",
    minDate = null,
    maxDate = null,
    className = "",
    disabled = false
}) => {
    const [isOpen, setIsOpen] = useState(false)
    const [currentMonth, setCurrentMonth] = useState(new Date())
    const [selectedDate, setSelectedDate] = useState(value ? new Date(value) : null)
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

    // Update selected date when value prop changes
    useEffect(() => {
        if (value) {
            setSelectedDate(new Date(value))
            setCurrentMonth(new Date(value))
        }
    }, [value])

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
        if (minDate && date < new Date(minDate)) return true
        if (maxDate && date > new Date(maxDate)) return true

        return false
    }

    const isDateSelected = (date) => {
        if (!date || !selectedDate) return false
        return date.toDateString() === selectedDate.toDateString()
    }

    const isToday = (date) => {
        if (!date) return false
        const today = new Date()
        return date.toDateString() === today.toDateString()
    }

    const handleDateSelect = (date) => {
        if (isDateDisabled(date)) return

        setSelectedDate(date)
        onChange(date.toISOString().split('T')[0])
        setIsOpen(false)
    }

    const navigateMonth = (direction) => {
        setCurrentMonth(prev => {
            const newMonth = new Date(prev)
            newMonth.setMonth(prev.getMonth() + direction)
            return newMonth
        })
    }

    const formatDisplayDate = (date) => {
        if (!date) return placeholder
        return new Date(date).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        })
    }

    const clearDate = (e) => {
        e.stopPropagation()
        setSelectedDate(null)
        onChange('')
    }

    return (
        <div ref={containerRef} className={`relative ${className}`}>
            {/* Input Field */}
            <div
                onClick={() => !disabled && setIsOpen(!isOpen)}
                className={`
          w-full px-4 py-3 border border-gray-300 rounded-lg cursor-pointer
          focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500
          ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white hover:border-gray-400'}
          ${isOpen ? 'ring-2 ring-teal-500 border-teal-500' : ''}
        `}
            >
                <div className="flex items-center justify-between">
                    <span className={selectedDate ? 'text-gray-900' : 'text-gray-500'}>
                        {formatDisplayDate(selectedDate)}
                    </span>
                    <div className="flex items-center gap-2">
                        {selectedDate && !disabled && (
                            <button
                                onClick={clearDate}
                                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <X className="w-4 h-4 text-gray-400" />
                            </button>
                        )}
                        <Calendar className="w-5 h-5 text-gray-400" />
                    </div>
                </div>
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

                        <div className="text-lg font-semibold text-gray-900">
                            {months[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                        </div>

                        <button
                            onClick={() => navigateMonth(1)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <ChevronRight className="w-5 h-5 text-gray-600" />
                        </button>
                    </div>

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
                                className={`
                  h-10 w-10 rounded-lg text-sm font-medium transition-all duration-200
                  ${!date ? 'invisible' : ''}
                  ${isDateDisabled(date)
                                        ? 'text-gray-300 cursor-not-allowed'
                                        : 'text-gray-700 hover:bg-teal-50 hover:text-teal-600 cursor-pointer'
                                    }
                  ${isDateSelected(date)
                                        ? 'bg-teal-500 text-white hover:bg-teal-600'
                                        : ''
                                    }
                  ${isToday(date) && !isDateSelected(date)
                                        ? 'bg-blue-100 text-blue-600 font-bold'
                                        : ''
                                    }
                `}
                            >
                                {date?.getDate()}
                            </button>
                        ))}
                    </div>

                    {/* Quick Actions */}
                    <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                        <button
                            onClick={() => handleDateSelect(new Date())}
                            className="flex-1 px-3 py-2 text-sm text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                        >
                            Today
                        </button>
                        <button
                            onClick={() => {
                                const tomorrow = new Date()
                                tomorrow.setDate(tomorrow.getDate() + 1)
                                handleDateSelect(tomorrow)
                            }}
                            className="flex-1 px-3 py-2 text-sm text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                        >
                            Tomorrow
                        </button>
                        <button
                            onClick={() => {
                                const nextWeek = new Date()
                                nextWeek.setDate(nextWeek.getDate() + 7)
                                handleDateSelect(nextWeek)
                            }}
                            className="flex-1 px-3 py-2 text-sm text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                        >
                            Next Week
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default DatePicker