import { useState, useEffect, useRef } from 'react'
import {
  User, Mail, Phone, MapPin, Calendar, Camera,
  X, Check, CreditCard, History, Settings,
  Edit3, Bell, Shield, Globe, LogOut, Trash2, AlertTriangle, Plus, Star, Trash,
  Plane, Download, Eye, RefreshCw, Lock, MapPin as LocationIcon, Backpack
} from 'lucide-react'
import { auth, authAPI, userAPI, paymentAPI, flightAPI, packageAPI } from '../utils/api'
import { Link } from 'react-router-dom'
import jsPDF from 'jspdf'
import 'jspdf-autotable'

const Account = () => {
  const [activeTab, setActiveTab] = useState('profile')
  const [userId, setUserId] = useState(null)
  const [userInfo, setUserInfo] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    dateOfBirth: '',
    avatar: '',
    coverImage: '',
    bio: '',
    location: '',
    website: ''
  })
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [saveMessage, setSaveMessage] = useState('')
  const [isEditing, setIsEditing] = useState({})
  const [tempValues, setTempValues] = useState({})
  const [showDeletePopup, setShowDeletePopup] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [paymentMethods, setPaymentMethods] = useState([])
  const [loadingPayments, setLoadingPayments] = useState(false)
  const [bookings, setBookings] = useState([])
  const [packageBookings, setPackageBookings] = useState([])
  const [loadingBookings, setLoadingBookings] = useState(false)
  const [loadingPackageBookings, setLoadingPackageBookings] = useState(false)
  const [bookingError, setBookingError] = useState('')
  const [packageBookingError, setPackageBookingError] = useState('')
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [showBookingDetails, setShowBookingDetails] = useState(false)
  const [selectedPackageBooking, setSelectedPackageBooking] = useState(null)
  const [showPackageBookingDetails, setShowPackageBookingDetails] = useState(false)
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)
  const [bookingToDelete, setBookingToDelete] = useState(null)
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('')
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [passwordError, setPasswordError] = useState('')
  const [showCancelPopup, setShowCancelPopup] = useState(false)
  const [packageToCancel, setPackageToCancel] = useState(null)
  const [cancelConfirmationText, setCancelConfirmationText] = useState('')

  const profileImageRef = useRef(null)
  const coverImageRef = useRef(null)

  // Load user data on component mount
  useEffect(() => {
    const loadUserData = async () => {
      try {
        setInitialLoading(true)
        const response = await authAPI.getProfile()
        if (response.success) {
          // Store user ID
          setUserId(response.user._id || response.user.id)

          setUserInfo({
            name: response.user.name || '',
            email: response.user.email || '',
            phone: response.user.phone || '',
            address: response.user.address || '',
            dateOfBirth: response.user.dateOfBirth || '',
            avatar: response.user.avatar || '',
            coverImage: response.user.coverImage || '',
            bio: response.user.bio || '',
            location: response.user.location || '',
            website: response.user.website || ''
          })
        }
      } catch (error) {
        console.error('Error loading user data:', error)
        setSaveMessage('Error loading user data. Please refresh the page.')
      } finally {
        setInitialLoading(false)
      }
    }

    loadUserData()
  }, [])

  // Load payment methods when payment tab is active
  useEffect(() => {
    if (activeTab === 'payment') {
      loadPaymentMethods()
    }
  }, [activeTab])

  // Load bookings when history tab is active
  useEffect(() => {
    if (activeTab === 'history') {
      loadBookings()
      loadPackageBookings()
    }
     
  }, [activeTab, userId, userInfo.email])

  // Reload payment methods when user returns to the page (e.g., after adding a card)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && activeTab === 'payment') {
        loadPaymentMethods()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [activeTab])

  const loadPaymentMethods = async () => {
    try {
      setLoadingPayments(true)
      const response = await paymentAPI.getPaymentMethods()
      if (response.success) {
        setPaymentMethods(response.payments || [])
      }
    } catch (error) {
      console.error('Error loading payment methods:', error)
      setSaveMessage('Error loading payment methods.')
      setTimeout(() => setSaveMessage(''), 3000)
    } finally {
      setLoadingPayments(false)
    }
  }

  const loadBookings = async () => {
    try {
      setLoadingBookings(true)
      setBookingError('')

      console.log('Loading all bookings from database...')

      // Fetch all bookings from the database dynamically
      const response = await flightAPI.getAllBookings(1, 100)

      if (response.success) {
        console.log('Bookings loaded:', response.data?.length || 0, 'bookings')
        console.log('Booking details:', response.data)
        setBookings(response.data || [])
      } else {
        setBookingError(response.message || 'Failed to load booking history')
      }
    } catch (error) {
      console.error('Error loading bookings:', error)
      setBookingError('Error loading booking history. Please try again.')
    } finally {
      setLoadingBookings(false)
    }
  }

  const loadPackageBookings = async () => {
    try {
      setLoadingPackageBookings(true)
      setPackageBookingError('')

      if (userId) {
        const response = await packageAPI.getUserPackageBookings(userId, 1, 100)

        if (response.success) {
          console.log('Package bookings loaded:', response.data?.length || 0, 'bookings')
          setPackageBookings(response.data || [])
        } else {
          setPackageBookingError(response.message || 'Failed to load package bookings')
        }
      }
    } catch (error) {
      console.error('Error loading package bookings:', error)
      setPackageBookingError('Error loading package bookings. Please try again.')
    } finally {
      setLoadingPackageBookings(false)
    }
  }

  const handleDeletePayment = async (paymentId) => {
    if (!window.confirm('Are you sure you want to delete this payment method?')) {
      return
    }

    try {
      setLoading(true)
      const response = await paymentAPI.deletePaymentMethod(paymentId)
      if (response.success) {
        setSaveMessage('Payment method deleted successfully!')
        setTimeout(() => setSaveMessage(''), 3000)
        loadPaymentMethods()
      }
    } catch (error) {
      console.error('Error deleting payment method:', error)
      setSaveMessage('Error deleting payment method.')
      setTimeout(() => setSaveMessage(''), 3000)
    } finally {
      setLoading(false)
    }
  }

  const handleSetDefaultPayment = async (paymentId) => {
    try {
      setLoading(true)
      const response = await paymentAPI.setDefaultPaymentMethod(paymentId)
      if (response.success) {
        setSaveMessage('Default payment method updated!')
        setTimeout(() => setSaveMessage(''), 3000)
        loadPaymentMethods()
      }
    } catch (error) {
      console.error('Error setting default payment:', error)
      setSaveMessage('Error updating default payment method.')
      setTimeout(() => setSaveMessage(''), 3000)
    } finally {
      setLoading(false)
    }
  }

  const handleViewBookingDetails = (booking) => {
    setSelectedBooking(booking)
    setShowBookingDetails(true)
  }

  const handleCloseBookingDetails = () => {
    setSelectedBooking(null)
    setShowBookingDetails(false)
  }

  const handleViewPackageBookingDetails = (booking) => {
    setSelectedPackageBooking(booking)
    setShowPackageBookingDetails(true)
  }

  const handleClosePackageBookingDetails = () => {
    setSelectedPackageBooking(null)
    setShowPackageBookingDetails(false)
  }

  const handleDownloadTicket = (booking) => {
    const doc = new jsPDF()
    
    // Helper functions
    const formatDate = (dateStr) => {
      if (!dateStr) return 'N/A'
      const date = new Date(dateStr)
      const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY']
      const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
      return `${days[date.getDay()]} ${String(date.getDate()).padStart(2, '0')} ${months[date.getMonth()]} ${date.getFullYear()}`
    }

    const formatTime = (dateStr) => {
      if (!dateStr) return 'N/A'
      const date = new Date(dateStr)
      return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
    }

    const formatDuration = (duration) => {
      if (!duration) return 'N/A'
      return duration.replace('PT', '').replace('H', 'h ').replace('M', 'm')
    }

    // Get data
    const flight = booking.flight || {}
    const passenger = booking.passenger || {}
    const departureDate = flight.departureTime || booking.departureTime
    const arrivalDate = flight.arrivalTime || booking.arrivalTime
    
    // Colors
    const teal = [20, 184, 166]
    const darkBlue = [30, 58, 138]
    const lightBlue = [219, 234, 254]
    const darkGray = [31, 41, 55]
    const mediumGray = [107, 114, 128]
    const lightGray = [243, 244, 246]
    const white = [255, 255, 255]
    const orange = [249, 115, 22]
    
    // Header gradient background
    doc.setFillColor(...teal)
    doc.rect(0, 0, 210, 35, 'F')
    
    // Company name and logo
    doc.setTextColor(...white)
    doc.setFontSize(22)
    doc.setFont('helvetica', 'bold')
    doc.text('DREAM HOLIDAYS', 105, 15, { align: 'center' })
    
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text('Your Journey, Our Priority', 105, 22, { align: 'center' })
    
    // E-Ticket label
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text('E-TICKET', 105, 30, { align: 'center' })
    
    // Booking reference box
    let yPos = 45
    doc.setFillColor(...darkBlue)
    doc.roundedRect(15, yPos, 180, 15, 2, 2, 'F')
    
    doc.setTextColor(...white)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.text('BOOKING REFERENCE', 20, yPos + 6)
    
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text(booking.bookingReference, 190, yPos + 10, { align: 'right' })
    
    // Passenger information section
    yPos += 25
    doc.setFillColor(...lightGray)
    doc.roundedRect(15, yPos, 85, 28, 2, 2, 'F')
    
    doc.setTextColor(...darkGray)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold')
    doc.text('PASSENGER', 20, yPos + 6)
    
    doc.setFontSize(11)
    doc.text(`${passenger.firstName?.toUpperCase() || ''} ${passenger.lastName?.toUpperCase() || ''}`, 20, yPos + 13)
    
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.text(`Email: ${passenger.email || 'N/A'}`, 20, yPos + 19)
    doc.text(`Phone: ${passenger.phone || 'N/A'}`, 20, yPos + 24)
    
    // Booking status box
    doc.setFillColor(...lightBlue)
    doc.roundedRect(110, yPos, 85, 28, 2, 2, 'F')
    
    doc.setTextColor(...darkGray)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold')
    doc.text('BOOKING STATUS', 115, yPos + 6)
    
    doc.setFontSize(12)
    doc.setTextColor(...teal)
    doc.text(booking.status.toUpperCase(), 115, yPos + 14)
    
    doc.setTextColor(...darkGray)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.text(`Booked: ${new Date(booking.bookingDate).toLocaleDateString()}`, 115, yPos + 20)
    doc.text(`Total: ৳${booking.totalAmount} ${booking.currency}`, 115, yPos + 25)
    
    // Flight details header
    yPos += 38
    doc.setFillColor(...darkBlue)
    doc.rect(15, yPos, 180, 8, 'F')
    
    doc.setTextColor(...white)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text('FLIGHT DETAILS', 20, yPos + 6)
    
    // Main flight information box
    yPos += 10
    doc.setDrawColor(...mediumGray)
    doc.setLineWidth(0.5)
    doc.setFillColor(...white)
    doc.roundedRect(15, yPos, 180, 65, 2, 2, 'FD')
    
    // Airline and flight number
    yPos += 8
    doc.setTextColor(...darkGray)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.text('AIRLINE', 20, yPos)
    
    doc.setFontSize(12)
    doc.setTextColor(...teal)
    doc.text(flight.airlineName || flight.airline || 'N/A', 20, yPos + 6)
    
    doc.setFontSize(10)
    doc.setTextColor(...darkGray)
    doc.text(`Flight ${flight.flightNumber || 'N/A'}`, 20, yPos + 12)
    
    // Aircraft info
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...mediumGray)
    doc.text(`Aircraft: ${flight.aircraftModel || 'N/A'}`, 20, yPos + 17)
    
    // Departure section
    yPos += 25
    doc.setFillColor(...lightGray)
    doc.roundedRect(20, yPos, 55, 25, 2, 2, 'F')
    
    doc.setTextColor(...mediumGray)
    doc.setFontSize(7)
    doc.setFont('helvetica', 'bold')
    doc.text('DEPARTURE', 25, yPos + 5)
    
    doc.setTextColor(...darkGray)
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text(flight.departureAirport || 'N/A', 25, yPos + 12)
    
    doc.setFontSize(16)
    doc.setTextColor(...teal)
    doc.text(formatTime(departureDate), 25, yPos + 20)
    
    // Arrow
    doc.setFontSize(18)
    doc.setTextColor(...orange)
    doc.text('→', 82, yPos + 15)
    
    // Arrival section
    doc.setFillColor(...lightGray)
    doc.roundedRect(95, yPos, 55, 25, 2, 2, 'F')
    
    doc.setTextColor(...mediumGray)
    doc.setFontSize(7)
    doc.setFont('helvetica', 'bold')
    doc.text('ARRIVAL', 100, yPos + 5)
    
    doc.setTextColor(...darkGray)
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text(flight.arrivalAirport || 'N/A', 100, yPos + 12)
    
    doc.setFontSize(16)
    doc.setTextColor(...teal)
    doc.text(formatTime(arrivalDate), 100, yPos + 20)
    
    // Duration and stops
    doc.setFillColor(...lightBlue)
    doc.roundedRect(160, yPos, 30, 25, 2, 2, 'F')
    
    doc.setTextColor(...mediumGray)
    doc.setFontSize(7)
    doc.setFont('helvetica', 'bold')
    doc.text('DURATION', 165, yPos + 5)
    
    doc.setTextColor(...darkGray)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.text(formatDuration(flight.duration), 165, yPos + 12)
    
    doc.setFontSize(7)
    doc.setFont('helvetica', 'normal')
    doc.text(flight.stops === 0 ? 'Direct' : `${flight.stops} Stop(s)`, 165, yPos + 18)
    
    // Travel dates
    yPos += 30
    doc.setTextColor(...mediumGray)
    doc.setFontSize(7)
    doc.setFont('helvetica', 'normal')
    doc.text(`Departure: ${formatDate(departureDate)}`, 20, yPos)
    doc.text(`Arrival: ${formatDate(arrivalDate)}`, 110, yPos)
    
    // Additional information section
    yPos += 10
    doc.setFillColor(...lightGray)
    doc.rect(15, yPos, 180, 20, 'F')
    
    yPos += 6
    doc.setTextColor(...darkGray)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold')
    doc.text('ADDITIONAL INFORMATION', 20, yPos)
    
    yPos += 6
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7)
    doc.text(`Cabin Class: Economy`, 20, yPos)
    doc.text(`Baggage: Check airline policy`, 75, yPos)
    doc.text(`Check-in: 2 hours before departure`, 135, yPos)
    
    yPos += 5
    doc.text(`Passport: Required for international flights`, 20, yPos)
    doc.text(`Confirmation: ${booking.bookingReference}`, 135, yPos)
    
    // Footer
    yPos += 15
    doc.setDrawColor(...teal)
    doc.setLineWidth(1)
    doc.line(15, yPos, 195, yPos)
    
    yPos += 6
    doc.setTextColor(...mediumGray)
    doc.setFontSize(7)
    doc.setFont('helvetica', 'italic')
    doc.text('Thank you for choosing Dream Holidays! Have a pleasant journey.', 105, yPos, { align: 'center' })
    
    yPos += 4
    doc.text('Please present this e-ticket at check-in counter. Keep a copy for your records.', 105, yPos, { align: 'center' })
    
    yPos += 4
    doc.setFont('helvetica', 'bold')
    doc.text('24/7 Customer Support: +880-1234-567890 | support@dreamholidays.com', 105, yPos, { align: 'center' })
    
    // Save PDF
    doc.save(`DreamHolidays-Ticket-${booking.bookingReference}.pdf`)
  }

  const handleDownloadPackageBooking = (booking) => {
    const doc = new jsPDF()
    const pageHeight = doc.internal.pageSize.getHeight()
    const pageWidth = doc.internal.pageSize.getWidth()
    const margin = 15
    const maxWidth = pageWidth - (margin * 2)

    // Helper functions
    const formatDate = (dateStr) => {
      if (!dateStr) return 'N/A'
      const date = new Date(dateStr)
      const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
      return `${String(date.getDate()).padStart(2, '0')} ${months[date.getMonth()]} ${date.getFullYear()}`
    }

    // Colors
    const teal = [20, 184, 166]
    const darkBlue = [30, 58, 138]
    const lightGray = [243, 244, 246]
    const darkGray = [31, 41, 55]
    const mediumGray = [107, 114, 128]
    const white = [255, 255, 255]
    const green = [34, 197, 94]
    const red = [239, 68, 68]

    let yPos = 10

    // ===== Header Section =====
    doc.setFillColor(...teal)
    doc.rect(0, yPos, pageWidth, 30, 'F')

    doc.setTextColor(...white)
    doc.setFontSize(24)
    doc.setFont('helvetica', 'bold')
    doc.text('DREAM HOLIDAYS', pageWidth / 2, yPos + 10, { align: 'center' })

    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.text('Package Booking Confirmation', pageWidth / 2, yPos + 20, { align: 'center' })

    yPos += 35

    // ===== Booking Reference =====
    doc.setFillColor(...darkBlue)
    doc.rect(margin, yPos, maxWidth, 12, 'F')

    doc.setTextColor(...white)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.text('BOOKING REFERENCE', margin + 5, yPos + 8)

    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text(booking.bookingReference || 'N/A', pageWidth - margin - 5, yPos + 8, { align: 'right' })

    yPos += 18

    // ===== Package Title Section =====
    doc.setTextColor(...darkGray)
    doc.setFontSize(13)
    doc.setFont('helvetica', 'bold')
    doc.text(booking.packageData?.title || 'Package Tour', margin, yPos)

    yPos += 7
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.text(`Location: ${booking.packageData?.location || 'N/A'}`, margin, yPos)

    yPos += 2
    doc.setFontSize(8)
    doc.text(`Status: ${booking.status?.toUpperCase() || 'PENDING'}`, margin, yPos)

    yPos += 8

    // ===== Key Information Grid =====
    doc.setFillColor(...lightGray)
    doc.rect(margin, yPos, maxWidth, 24, 'F')

    doc.setTextColor(...darkGray)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold')

    const colWidth = maxWidth / 4
    doc.text('Duration', margin + 3, yPos + 5)
    doc.text('Travelers', margin + colWidth + 3, yPos + 5)
    doc.text('Travel Date', margin + colWidth * 2 + 3, yPos + 5)
    doc.text('Total Price', margin + colWidth * 3 + 3, yPos + 5)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.text(booking.packageData?.duration || 'N/A', margin + 3, yPos + 14)
    doc.text(`${booking.numberOfTravelers || 0}`, margin + colWidth + 3, yPos + 14)
    doc.text(formatDate(booking.selectedDate), margin + colWidth * 2 + 3, yPos + 14)
    doc.setFont('helvetica', 'bold')
    doc.text(`$${booking.totalPrice?.toFixed(2) || '0.00'}`, margin + colWidth * 3 + 3, yPos + 14)

    yPos += 32

    // ===== Itinerary Section =====
    doc.setTextColor(...white)
    doc.setFillColor(...teal)
    doc.rect(margin, yPos, maxWidth, 7, 'F')

    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.text('ITINERARY HIGHLIGHTS', margin + 3, yPos + 5)

    yPos += 10
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...darkGray)

    let itinerayShown = 0
    booking.packageData?.itinerary?.forEach((day) => {
      if (itinerayShown < 3 && yPos < pageHeight - 40) {
        doc.text(`Day ${day.day}: ${day.title}`, margin + 3, yPos)
        yPos += 5
        itinerayShown++
      }
    })

    if (booking.packageData?.itinerary && booking.packageData.itinerary.length > 3) {
      doc.text(`+ ${booking.packageData.itinerary.length - 3} more days`, margin + 3, yPos)
      yPos += 5
    }

    yPos += 3

    // ===== What's Included =====
    doc.setTextColor(...white)
    doc.setFillColor(...green)
    doc.rect(margin, yPos, maxWidth / 2 - 2, 7, 'F')

    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold')
    doc.text('INCLUDED', margin + 3, yPos + 5)

    yPos += 10
    doc.setFontSize(7)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...darkGray)

    let includedCount = 0
    booking.packageData?.included?.forEach((item) => {
      if (includedCount < 3 && yPos < pageHeight - 30) {
        doc.text(`✓ ${item}`, margin + 3, yPos)
        yPos += 4
        includedCount++
      }
    })

    // Reset Y position for Not Included section
    yPos -= (includedCount > 0 ? (includedCount * 4) + 10 : 0)
    yPos = yPos || 200

    // ===== Not Included =====
    doc.setTextColor(...white)
    doc.setFillColor(...red)
    doc.rect(margin + maxWidth / 2 + 2, yPos - 10 - (includedCount > 0 ? includedCount * 4 : 0), maxWidth / 2 - 2, 7, 'F')

    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold')
    doc.text('NOT INCLUDED', margin + maxWidth / 2 + 5, yPos - 5 - (includedCount > 0 ? includedCount * 4 : 0))

    doc.setFontSize(7)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...darkGray)

    yPos = yPos || 200
    let notIncludedCount = 0
    booking.packageData?.notIncluded?.forEach((item) => {
      if (notIncludedCount < 2 && yPos < pageHeight - 30) {
        doc.text(`✗ ${item}`, margin + maxWidth / 2 + 5, yPos)
        yPos += 4
        notIncludedCount++
      }
    })

    yPos = Math.max(yPos || 200, 220)
    yPos += 10

    // ===== Travelers =====
    doc.setTextColor(...white)
    doc.setFillColor(...darkBlue)
    doc.rect(margin, yPos, maxWidth, 7, 'F')

    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.text('TRAVELERS', margin + 3, yPos + 5)

    yPos += 10
    doc.setFontSize(7)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...darkGray)

    let travelerCount = 0
    booking.travelers?.forEach((traveler) => {
      if (travelerCount < 3 && yPos < pageHeight - 20) {
        doc.text(`${travelerCount + 1}. ${traveler.firstName} ${traveler.lastName}`, margin + 3, yPos)
        yPos += 4
        travelerCount++
      }
    })

    if (booking.travelers && booking.travelers.length > 3) {
      doc.text(`... and ${booking.travelers.length - 3} more`, margin + 3, yPos)
    }

    // ===== Footer =====
    yPos = pageHeight - 15
    doc.setDrawColor(...mediumGray)
    doc.setLineWidth(0.3)
    doc.line(margin, yPos, pageWidth - margin, yPos)

    yPos += 5
    doc.setFontSize(7)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...mediumGray)
    doc.text('24/7 Customer Support: +880-1234-567890 | support@dreamholidays.com', pageWidth / 2, yPos, { align: 'center' })

    // Save PDF
    doc.save(`DreamHolidays-Package-${booking.bookingReference}.pdf`)
  }

  const handleDeleteBooking = (booking) => {
    // Show custom confirmation modal
    setBookingToDelete(booking)
    setShowDeleteConfirmation(true)
    setDeleteConfirmationText('')
  }

  const confirmDeleteBooking = async () => {
    if (deleteConfirmationText !== 'DELETE') {
      setSaveMessage('Please type "DELETE" to confirm')
      setTimeout(() => setSaveMessage(''), 3000)
      return
    }

    try {
      setLoading(true)
      console.log('Deleting booking:', bookingToDelete._id)
      
      // Delete the booking permanently
      const response = await flightAPI.deleteBooking(bookingToDelete._id)
      console.log('Delete response:', response)

      if (response.success) {
        setSaveMessage('Booking deleted successfully!')
        setTimeout(() => setSaveMessage(''), 3000)
        // Close modal and reset
        setShowDeleteConfirmation(false)
        setBookingToDelete(null)
        setDeleteConfirmationText('')
        // Reload bookings to reflect the change
        loadBookings()
      } else {
        setSaveMessage(response.message || 'Failed to delete booking')
        setTimeout(() => setSaveMessage(''), 3000)
      }
    } catch (error) {
      console.error('Error deleting booking:', error)
      setSaveMessage(`Error deleting booking: ${error.message || 'Please try again.'}`)
      setTimeout(() => setSaveMessage(''), 5000)
    } finally {
      setLoading(false)
    }
  }

  const cancelDeleteBooking = () => {
    setShowDeleteConfirmation(false)
    setBookingToDelete(null)
    setDeleteConfirmationText('')
  }

  const handleCancelPackageBooking = (booking) => {
    setPackageToCancel(booking)
    setShowCancelPopup(true)
    setCancelConfirmationText('')
  }

  const confirmCancelPackageBooking = async () => {
    if (cancelConfirmationText !== 'CANCEL') {
      setSaveMessage('Please type "CANCEL" to confirm')
      setTimeout(() => setSaveMessage(''), 3000)
      return
    }

    try {
      setLoading(true)
      console.log('Cancelling package booking:', packageToCancel._id)
      
      const response = await packageAPI.cancelPackageBooking(packageToCancel._id)
      console.log('Cancel response:', response)

      if (response.success) {
        setSaveMessage('Package booking cancelled successfully!')
        setTimeout(() => setSaveMessage(''), 3000)
        setShowCancelPopup(false)
        setPackageToCancel(null)
        setCancelConfirmationText('')
        loadPackageBookings()
      } else {
        setSaveMessage(response.message || 'Failed to cancel booking')
        setTimeout(() => setSaveMessage(''), 3000)
      }
    } catch (error) {
      console.error('Error cancelling booking:', error)
      setSaveMessage(`Error cancelling booking: ${error.message || 'Please try again.'}`)
      setTimeout(() => setSaveMessage(''), 5000)
    } finally {
      setLoading(false)
    }
  }

  const closeCancelPopup = () => {
    setShowCancelPopup(false)
    setPackageToCancel(null)
    setCancelConfirmationText('')
  }

  const handleImageUpload = async (file, type) => {
    if (!file) return

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      setSaveMessage('Please select a valid image file (JPEG, PNG, GIF, WebP)')
      setTimeout(() => setSaveMessage(''), 3000)
      return
    }

    // Validate file size (2MB for MongoDB storage)
    if (file.size > 2 * 1024 * 1024) {
      setSaveMessage('Image size must be less than 2MB for MongoDB storage')
      setTimeout(() => setSaveMessage(''), 3000)
      return
    }

    const formData = new FormData()
    formData.append('image', file)
    formData.append('type', type)

    setLoading(true)
    try {
      console.log('Uploading image:', { fileName: file.name, fileSize: file.size, type })
      const response = await userAPI.uploadImage(formData)
      console.log('Upload response:', response)

      if (response.success) {
        console.log('Upload successful, updating UI with:', response.imageUrl)
        console.log('Updating field:', type === 'profile' ? 'avatar' : 'coverImage')

        setUserInfo(prev => {
          const updated = {
            ...prev,
            [type === 'profile' ? 'avatar' : 'coverImage']: response.imageUrl
          }
          console.log('Updated userInfo:', updated)
          return updated
        })
        setSaveMessage('Image uploaded successfully!')
        setTimeout(() => setSaveMessage(''), 3000)
      } else {
        setSaveMessage(response.message || 'Error uploading image. Please try again.')
        setTimeout(() => setSaveMessage(''), 3000)
      }
    } catch (error) {
      console.error('Error uploading image:', error)
      setSaveMessage(`Error uploading image: ${error.message}`)
      setTimeout(() => setSaveMessage(''), 3000)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (field) => {
    setIsEditing(prev => ({
      ...prev,
      [field]: !prev[field]
    }))
    if (!isEditing[field]) {
      setTempValues(prev => ({
        ...prev,
        [field]: userInfo[field]
      }))
    }
  }

  const handleSave = async (field) => {
    const value = tempValues[field]
    if (!value && value !== '') return

    setLoading(true)
    try {
      const updateData = { [field]: value }
      const response = await userAPI.updateProfile(updateData)

      if (response.success) {
        setUserInfo(prev => ({
          ...prev,
          [field]: value
        }))
        setIsEditing(prev => ({
          ...prev,
          [field]: false
        }))
        setSaveMessage('Changes saved successfully!')
        setTimeout(() => setSaveMessage(''), 3000)
      }
    } catch (error) {
      console.error('Error saving changes:', error)
      setSaveMessage('Error saving changes. Please try again.')
      setTimeout(() => setSaveMessage(''), 3000)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = (field) => {
    setIsEditing(prev => ({
      ...prev,
      [field]: false
    }))
    setTempValues(prev => ({
      ...prev,
      [field]: userInfo[field]
    }))
  }

  const handleLogout = () => {
    auth.logout()
    window.location.href = '/login'
  }

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') {
      setSaveMessage('Please type "DELETE" to confirm account deletion.')
      setTimeout(() => setSaveMessage(''), 3000)
      return
    }

    setLoading(true)
    try {
      const response = await userAPI.deleteAccount()
      if (response.success) {
        setSaveMessage('Account deleted successfully. Redirecting...')
        setTimeout(() => {
          auth.logout()
          window.location.href = '/'
        }, 2000)
      } else {
        setSaveMessage('Error deleting account. Please try again.')
        setTimeout(() => setSaveMessage(''), 3000)
      }
    } catch (error) {
      console.error('Error deleting account:', error)
      setSaveMessage('Error deleting account. Please try again.')
      setTimeout(() => setSaveMessage(''), 3000)
    } finally {
      setLoading(false)
      setShowDeletePopup(false)
      setDeleteConfirmText('')
    }
  }

  const closeDeletePopup = () => {
    setShowDeletePopup(false)
    setDeleteConfirmText('')
  }

  const handleChangePassword = async () => {
    setPasswordError('')

    // Validation
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setPasswordError('All fields are required')
      return
    }

    if (passwordData.newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters')
      return
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New passwords do not match')
      return
    }

    if (passwordData.currentPassword === passwordData.newPassword) {
      setPasswordError('New password must be different from current password')
      return
    }

    setLoading(true)
    try {
      const response = await authAPI.changePassword(
        passwordData.currentPassword,
        passwordData.newPassword
      )

      if (response.success) {
        setSaveMessage('Password changed successfully!')
        setTimeout(() => setSaveMessage(''), 3000)
        setShowChangePassword(false)
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        })
      }
    } catch (error) {
      console.error('Error changing password:', error)
      setPasswordError(error.message || 'Failed to change password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const closeChangePassword = () => {
    setShowChangePassword(false)
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    })
    setPasswordError('')
  }

  if (initialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your account...</p>
        </div>
      </div>
    )
  }

  const renderProfileContent = () => (
    <div className="space-y-8">
      {/* Account Navigation */}
      <div className="bg-white shadow-sm border border-gray-200 rounded-2xl">
        <div className="px-6 py-4">
          <nav className="flex space-x-8 overflow-x-auto">
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${activeTab === 'profile'
                ? 'bg-teal-100 text-teal-700'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
            >
              <User className="w-4 h-4" />
              Profile
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${activeTab === 'history'
                ? 'bg-teal-100 text-teal-700'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
            >
              <History className="w-4 h-4" />
              History
            </button>
            <button
              onClick={() => setActiveTab('payment')}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${activeTab === 'payment'
                ? 'bg-teal-100 text-teal-700'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
            >
              <CreditCard className="w-4 h-4" />
              Payment
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${activeTab === 'settings'
                ? 'bg-teal-100 text-teal-700'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
            >
              <Settings className="w-4 h-4" />
              Settings
            </button>
          </nav>
        </div>
      </div>

      {/* Cover Photo Section */}
      <div className="relative">
        <div className="lg:h-96 h-48 bg-gray-100 rounded-2xl overflow-hidden">
          {userInfo.coverImage && userInfo.coverImage !== '' && userInfo.coverImage.startsWith('data:image') ? (
            <img
              id="coverAvatar"
              src={userInfo.coverImage}
              alt="Cover"
              className="w-full h-full object-cover"
              onLoad={() => console.log('Cover image loaded successfully')}
              onError={(e) => {
                console.error('Cover image failed to load:', e)
                // Hide the broken image and show gradient background
                e.target.style.display = 'none'
              }}
            />
          ) : (
            <div className="w-full h-full"></div>
          )}
          

          {/* Cover Upload Button */}
          <button
            onClick={() => coverImageRef.current?.click()}
            className="absolute lg:top-6 lg:right-6 top-2 right-2 bg-white/65 hover:bg-white text-gray-900 lg:px-5 lg:py-2.5 py-1.5 px-3 lg:rounded-xl rounded-lg font-medium transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl backdrop-blur-sm cursor-pointer"
          >
            <Camera className="w-4 h-4" />
            Upload Cover
          </button>

          {/* Profile Image */}
          <div className='flex items-center gap-5'>


            <div className="absolute -bottom-20 lg:left-8 left-2">
              <div className="relative">
                <div className="lg:w-40 lg:h-40 w-32 h-32 rounded-full bg-white lg:p-1.5 p-0.5 shadow-2xl ring-1 ring-white">
                  {userInfo.avatar &&
                    userInfo.avatar !== 'https://via.placeholder.com/150' &&
                    userInfo.avatar !== '' &&
                    (userInfo.avatar.startsWith('data:image') || userInfo.avatar.startsWith('http')) ? (
                    <img
                      id="profileAvatar"
                      src={userInfo.avatar}
                      alt="Profile"
                      className="w-full h-full rounded-full object-cover"
                      onLoad={() => console.log('Profile image loaded successfully')}
                      onError={(e) => {
                        console.error('Profile image failed to load:', e)
                        // Hide the broken image and show default avatar
                        e.target.style.display = 'none'
                      }}
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                      <User className="w-16 h-16 text-gray-400" />
                    </div>
                  )}
                </div>
                <button
                  onClick={() => profileImageRef.current?.click()}
                  className="absolute lg:bottom-2 lg:right-2 bottom-1 -right-2 w-12 h-12 bg-teal-500 hover:bg-teal-600 rounded-full flex items-center justify-center text-white transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 cursor-pointer"
                >
                  <Camera className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="z-10 absolute lg:left-52 left-[150px] lg:top-100 top-52">
              <h1 className="lg:text-4xl text-lg lg:font-bold font-semibold text-black drop-shadow-lg">{userInfo.name || 'Welcome!'}</h1>
            </div>

          </div>
        </div>

        {/* User Info Header */}

      </div>

      {/* Profile Details */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 mt-28">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">Personal Information</h2>

        <div className="space-y-6">
          {/* Name */}
          <div className="flex items-center justify-between py-4 border-b border-gray-100">
            <div className="flex items-center space-x-4 flex-1">
              <User className="w-5 h-5 text-gray-400" />
              <div className="flex-1">
                <p className="text-sm text-gray-500">Full Name</p>
                {isEditing.name ? (
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="text"
                      value={tempValues.name || ''}
                      onChange={(e) => setTempValues(prev => ({ ...prev, name: e.target.value }))}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      placeholder="Enter your full name"
                    />
                    <button
                      onClick={() => handleSave('name')}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleCancel('name')}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <p className="font-medium text-gray-900 mt-1">{userInfo.name || 'Not provided'}</p>
                )}
              </div>
            </div>
            {!isEditing.name && (
              <button
                onClick={() => handleEdit('name')}
                className="px-4 py-2 text-sm text-teal-600 hover:text-teal-700 font-medium flex items-center gap-1 cursor-pointer"
              >
                <Edit3 className="w-4 h-4" />
                Edit
              </button>
            )}
          </div>

          {/* Email */}
          <div className="flex items-center justify-between py-4 border-b border-gray-100">
            <div className="flex items-center space-x-4 flex-1">
              <Mail className="w-5 h-5 text-gray-400" />
              <div className="flex-1">
                <p className="text-sm text-gray-500">Email Address</p>
                <div className="flex items-center gap-2 mt-1">
                  <p className="font-medium text-gray-900">{userInfo.email || 'Not provided'}</p>
                  {userInfo.email && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Verified
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Phone */}
          <div className="flex items-center justify-between py-4 border-b border-gray-100">
            <div className="flex items-center space-x-4 flex-1">
              <Phone className="w-5 h-5 text-gray-400" />
              <div className="flex-1">
                <p className="text-sm text-gray-500">Phone Number</p>
                {isEditing.phone ? (
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="tel"
                      value={tempValues.phone || ''}
                      onChange={(e) => setTempValues(prev => ({ ...prev, phone: e.target.value }))}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      placeholder="Enter your phone number"
                    />
                    <button
                      onClick={() => handleSave('phone')}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleCancel('phone')}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <p className="font-medium text-gray-900 mt-1">{userInfo.phone || 'Not provided'}</p>
                )}
              </div>
            </div>
            {!isEditing.phone && (
              <button
                onClick={() => handleEdit('phone')}
                className="px-4 py-2 text-sm text-teal-600 hover:text-teal-700 font-medium flex items-center gap-1 cursor-pointer"
              >
                <Edit3 className="w-4 h-4" />
                Edit
              </button>
            )}
          </div>

          {/* Address */}
          <div className="flex items-center justify-between py-4 border-b border-gray-100">
            <div className="flex items-center space-x-4 flex-1">
              <MapPin className="w-5 h-5 text-gray-400" />
              <div className="flex-1">
                <p className="text-sm text-gray-500">Address</p>
                {isEditing.address ? (
                  <div className="flex items-center gap-2 mt-1">
                    <textarea
                      value={tempValues.address || ''}
                      onChange={(e) => setTempValues(prev => ({ ...prev, address: e.target.value }))}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      placeholder="Enter your address"
                      rows="2"
                    />
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => handleSave('address')}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg cursor-pointer"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleCancel('address')}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="font-medium text-gray-900 mt-1">{userInfo.address || 'Not provided'}</p>
                )}
              </div>
            </div>
            {!isEditing.address && (
              <button
                onClick={() => handleEdit('address')}
                className="px-4 py-2 text-sm text-teal-600 hover:text-teal-700 font-medium flex items-center gap-1 cursor-pointer"
              >
                <Edit3 className="w-4 h-4" />
                Edit
              </button>
            )}
          </div>

          {/* Date of Birth */}
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4 flex-1">
              <Calendar className="w-5 h-5 text-gray-400" />
              <div className="flex-1">
                <p className="text-sm text-gray-500">Date of Birth</p>
                {isEditing.dateOfBirth ? (
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="date"
                      value={tempValues.dateOfBirth
                        ? new Date(tempValues.dateOfBirth).toISOString().split('T')[0]
                        : ''
                      }
                      onChange={(e) => setTempValues(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 "
                    />
                    <button
                      onClick={() => handleSave('dateOfBirth')}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleCancel('dateOfBirth')}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <p className="font-medium text-gray-900 mt-1">
                    {userInfo.dateOfBirth
                      ? new Date(userInfo.dateOfBirth).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })
                      : 'Not provided'
                    }
                  </p>
                )}
              </div>
            </div>
            {!isEditing.dateOfBirth && (
              <button
                onClick={() => handleEdit('dateOfBirth')}
                className="px-4 py-2 text-sm text-teal-600 hover:text-teal-700 font-medium flex items-center gap-1 cursor-pointer "
              >
                <Edit3 className="w-4 h-4" />
                Edit
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Hidden file inputs */}
      <input
        ref={profileImageRef}
        type="file"
        accept="image/*"
        onChange={(e) => handleImageUpload(e.target.files[0], 'profile')}
        className="hidden"
      />
      <input
        ref={coverImageRef}
        type="file"
        accept="image/*"
        onChange={(e) => handleImageUpload(e.target.files[0], 'cover')}
        className="hidden"
      />
    </div>
  )

  const renderHistoryContent = () => (
    <div className="space-y-8">
      {/* Account Navigation */}
      <div className="bg-white shadow-sm border border-gray-200 rounded-2xl">
        <div className="px-6 py-4">
          <nav className="flex space-x-8 overflow-x-auto">
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${activeTab === 'profile'
                ? 'bg-teal-100 text-teal-700'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
            >
              <User className="w-4 h-4" />
              Profile
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${activeTab === 'history'
                ? 'bg-teal-100 text-teal-700'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
            >
              <History className="w-4 h-4" />
              History
            </button>
            <button
              onClick={() => setActiveTab('payment')}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${activeTab === 'payment'
                ? 'bg-teal-100 text-teal-700'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
            >
              <CreditCard className="w-4 h-4" />
              Payment
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${activeTab === 'settings'
                ? 'bg-teal-100 text-teal-700'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
            >
              <Settings className="w-4 h-4" />
              Settings
            </button>
          </nav>
        </div>
      </div>

      {/* Booking History Content */}
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl border border-gray-100 p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
          <div className="flex-1">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Booking History</h2>
            <p className="text-sm sm:text-base text-gray-500 mt-1">View and manage your flight bookings</p>
            {/* Debug info */}
            <p className="text-xs text-gray-400 mt-2 hidden sm:block">
              User ID: {userId || 'Not loaded'} | Email: {userInfo.email || 'Not loaded'}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={async () => {
                if (userId && userInfo.email) {
                  try {
                    setSaveMessage('Linking bookings...')
                    const linkResponse = await flightAPI.linkUserBookings(userId, userInfo.email)
                    setSaveMessage(`Linked ${linkResponse.modifiedCount} bookings!`)
                    setTimeout(() => setSaveMessage(''), 3000)
                    loadBookings()
                  } catch {
                    setSaveMessage('Error linking bookings')
                    setTimeout(() => setSaveMessage(''), 3000)
                  }
                }
              }}
              className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm whitespace-nowrap touch-manipulation"
            >
              <Check className="w-4 h-4" />
              <span className="hidden sm:inline">Link My Bookings</span>
              <span className="sm:hidden">Link Bookings</span>
            </button>
            <button
              onClick={loadBookings}
              className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-teal-50 text-teal-600 rounded-lg hover:bg-teal-100 transition-colors text-sm whitespace-nowrap touch-manipulation"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loadingBookings ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your bookings...</p>
          </div>
        ) : bookingError ? (
          /* Error State */
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <X className="w-8 h-8 text-red-500" />
            </div>
            <p className="text-red-600 font-medium mb-2">Error Loading Bookings</p>
            <p className="text-gray-500 text-sm mb-4">{bookingError}</p>
            <button
              onClick={loadBookings}
              className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : bookings.length === 0 ? (
          /* Empty State */
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <History className="w-12 h-12 text-gray-400" />
            </div>
            <p className="text-gray-500 text-lg mb-2">No bookings found</p>
            <p className="text-gray-400 text-sm mb-6">Your flight bookings will appear here after you make a reservation</p>
            <Link
              to="/flights"
              className="inline-flex items-center gap-2 px-6 py-3 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors font-medium"
            >
              <Plane className="w-5 h-5" />
              Book Your First Flight
            </Link>
          </div>
        ) : (
          /* Bookings List */
          <div className="space-y-4 sm:space-y-6">
            {bookings.map((booking) => (
              <div key={booking._id} className="border border-gray-200 rounded-lg sm:rounded-xl p-4 sm:p-6 hover:shadow-lg transition-all duration-300">
                {/* Booking Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Plane className="w-5 h-5 sm:w-6 sm:h-6 text-teal-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                        {booking.departureAirport || booking.flight?.departureAirport || 'N/A'} → {booking.arrivalAirport || booking.flight?.arrivalAirport || 'N/A'}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-500 truncate">
                        Ref: <span className="font-medium text-gray-700">{booking.bookingReference}</span>
                      </p>
                    </div>
                  </div>
                  <div className="text-left sm:text-right">
                    <div className="text-lg sm:text-xl font-bold text-teal-600">
                      ৳{booking.totalAmount} {booking.currency}
                    </div>
                    <div className={`inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs font-medium mt-1 ${booking.status === 'confirmed'
                      ? 'bg-green-100 text-green-800'
                      : booking.status === 'cancelled'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                      }`}>
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </div>
                  </div>
                </div>

                {/* Flight Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-4">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wide mb-1">Flight</div>
                    <div className="font-semibold text-gray-900 text-sm sm:text-base truncate">{booking.flightNumber || booking.flight?.flightNumber || 'N/A'}</div>
                    <div className="text-xs sm:text-sm text-gray-600 truncate">{booking.airline || booking.flight?.airline || booking.flight?.airlineName || 'N/A'}</div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wide mb-1">Departure</div>
                    <div className="font-semibold text-gray-900 text-sm sm:text-base">
                      {booking.departureTime || booking.flight?.departureTime 
                        ? new Date(booking.departureTime || booking.flight.departureTime).toLocaleDateString() 
                        : 'N/A'}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600">
                      {booking.departureTime || booking.flight?.departureTime 
                        ? new Date(booking.departureTime || booking.flight.departureTime).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit'
                        }) 
                        : 'N/A'}
                    </div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg sm:col-span-2 lg:col-span-1">
                    <div className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wide mb-1">Passenger</div>
                    <div className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                      {booking.passenger?.firstName} {booking.passenger?.lastName}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600 truncate">{booking.passenger?.email}</div>
                  </div>
                </div>

                {/* Booking Date & Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500">
                    <Calendar className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                    <span className="truncate">
                      Booked {new Date(booking.bookingDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => handleViewBookingDetails(booking)}
                      className="flex items-center justify-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-xs sm:text-sm font-medium touch-manipulation"
                    >
                      <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline">View Details</span>
                      <span className="sm:hidden">View</span>
                    </button>
                    <button
                      onClick={() => handleDownloadTicket(booking)}
                      className="flex items-center justify-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors text-xs sm:text-sm font-medium touch-manipulation"
                    >
                      <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline">Download</span>
                      <span className="sm:hidden">PDF</span>
                    </button>
                    <button
                      onClick={() => handleDeleteBooking(booking)}
                      disabled={loading}
                      className="flex items-center justify-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-xs sm:text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
                    >
                      <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline">Delete</span>
                      <span className="sm:hidden">Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Package Bookings Section */}
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl border border-gray-100 p-4 sm:p-6 lg:p-8 mt-6 sm:mt-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
          <div className="flex-1">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">My Package Bookings</h2>
            <p className="text-sm sm:text-base text-gray-500 mt-1">View and manage your tour package bookings</p>
          </div>
          <button
            onClick={loadPackageBookings}
            className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-teal-50 text-teal-600 rounded-lg hover:bg-teal-100 transition-colors text-sm whitespace-nowrap touch-manipulation"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {/* Loading State */}
        {loadingPackageBookings ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your package bookings...</p>
          </div>
        ) : packageBookingError ? (
          /* Error State */
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <X className="w-8 h-8 text-red-500" />
            </div>
            <p className="text-red-600 font-medium mb-2">Error Loading Packages</p>
            <p className="text-gray-500 text-sm mb-4">{packageBookingError}</p>
            <button
              onClick={loadPackageBookings}
              className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : packageBookings.length === 0 ? (
          /* Empty State */
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Backpack className="w-12 h-12 text-gray-400" />
            </div>
            <p className="text-gray-500 text-lg mb-2">No package bookings found</p>
            <p className="text-gray-400 text-sm mb-6">Your tour package bookings will appear here after you make a reservation</p>
            <Link
              to="/hotels"
              className="inline-flex items-center gap-2 px-6 py-3 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors font-medium"
            >
              <Backpack className="w-5 h-5" />
              Book a Package Tour
            </Link>
          </div>
        ) : (
          /* Packages List */
          <div className="space-y-4 sm:space-y-6">
            {packageBookings.map((booking) => (
              <div key={booking._id} className="border border-gray-200 rounded-lg sm:rounded-xl p-4 sm:p-6 hover:shadow-lg transition-all duration-300">
                {/* Package Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Backpack className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                        {booking.packageData?.title || 'Package Tour'}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-500 truncate">
                        Ref: <span className="font-medium text-gray-700">{booking.bookingReference}</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 text-xs sm:text-sm font-medium rounded-full ${
                      booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                      booking.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      booking.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {booking.status?.charAt(0).toUpperCase() + booking.status?.slice(1)}
                    </span>
                  </div>
                </div>

                {/* Package Details */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-4 pb-4 border-b border-gray-200">
                  <div>
                    <p className="text-xs text-gray-500">Location</p>
                    <p className="text-sm sm:text-base font-medium text-gray-900 flex items-center gap-1 mt-1">
                      <LocationIcon className="w-4 h-4 text-teal-600" />
                      {booking.packageData?.location || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Duration</p>
                    <p className="text-sm sm:text-base font-medium text-gray-900 mt-1">
                      {booking.packageData?.duration || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Travelers</p>
                    <p className="text-sm sm:text-base font-medium text-gray-900 mt-1">
                      {booking.numberOfTravelers || 0} person(s)
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Total Price</p>
                    <p className="text-sm sm:text-base font-bold text-teal-600 mt-1">
                      ${booking.totalPrice?.toFixed(2) || '0.00'}
                    </p>
                  </div>
                </div>

                {/* Package Highlights */}
                {booking.packageData?.highlights && booking.packageData.highlights.length > 0 && (
                  <div className="mb-4 pb-4 border-b border-gray-200">
                    <p className="text-sm font-semibold text-gray-900 mb-2">Highlights</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {booking.packageData.highlights.slice(0, 3).map((highlight, idx) => (
                        <p key={idx} className="text-xs text-gray-600 flex items-center gap-1">
                          <Check className="w-3 h-3 text-green-500 flex-shrink-0" />
                          {highlight}
                        </p>
                      ))}
                    </div>
                  </div>
                )}

                {/* Travelers Info */}
                {booking.travelers && booking.travelers.length > 0 && (
                  <div className="mb-4 pb-4 border-b border-gray-200">
                    <p className="text-sm font-semibold text-gray-900 mb-2">Travelers</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {booking.travelers.map((traveler, idx) => (
                        <p key={idx} className="text-xs text-gray-600">
                          {traveler.firstName} {traveler.lastName}
                        </p>
                      ))}
                    </div>
                  </div>
                )}

                {/* Booking Dates */}
                <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4 pb-4 border-b border-gray-200">
                  <div>
                    <p className="text-xs text-gray-500">Selected Date</p>
                    <p className="text-sm font-medium text-gray-900 mt-1">
                      {booking.selectedDate ? new Date(booking.selectedDate).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Booked On</p>
                    <p className="text-sm font-medium text-gray-900 mt-1">
                      {booking.createdAt ? new Date(booking.createdAt).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => handleViewPackageBookingDetails(booking)}
                    className="flex items-center justify-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-xs sm:text-sm font-medium touch-manipulation"
                  >
                    <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">View Details</span>
                    <span className="sm:hidden">View</span>
                  </button>
                  <button
                    onClick={() => handleDownloadPackageBooking(booking)}
                    className="flex items-center justify-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors text-xs sm:text-sm font-medium touch-manipulation"
                  >
                    <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">Download</span>
                    <span className="sm:hidden">PDF</span>
                  </button>
                  <button
                    onClick={() => handleCancelPackageBooking(booking)}
                    disabled={loading || booking.status === 'cancelled'}
                    className="flex items-center justify-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-xs sm:text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
                  >
                    <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">{booking.status === 'cancelled' ? 'Cancelled' : 'Cancel'}</span>
                    <span className="sm:hidden">{booking.status === 'cancelled' ? 'Cancelled' : 'Cancel'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )

  const getCardGradient = (cardType) => {
    switch (cardType) {
      case 'visa':
        return 'bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900'
      case 'mastercard':
        return 'bg-gradient-to-br from-red-500 via-orange-600 to-yellow-500'
      case 'amex':
        return 'bg-gradient-to-br from-gray-600 via-black-600 to-cyan-700'
      case 'discover':
        return 'bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700'
      default:
        return 'bg-gradient-to-br from-gray-700 via-gray-800 to-gray-900'
    }
  }

  const getCardLogo = (cardType) => {
    switch (cardType) {
      case 'visa':
        return (
          <div className="text-white font-bold text-2xl italic tracking-wider">
            VISA
          </div>
        )
      case 'mastercard':
        return (
          <div className="flex gap-1">
            <div className="w-8 h-8 rounded-full bg-red-500 opacity-90"></div>
            <div className="w-8 h-8 rounded-full bg-yellow-500 opacity-90 -ml-3"></div>
          </div>
        )
      case 'amex':
        return (
          <div className="text-white font-bold text-xl tracking-wider">
            AMEX
          </div>
        )
      case 'discover':
        return (
          <div className="text-white font-bold text-xl tracking-wider">
            DISCOVER
          </div>
        )
      default:
        return <CreditCard className="w-8 h-8 text-white" />
    }
  }

  const renderPaymentContent = () => (
    <div className="space-y-8">
      {/* Account Navigation */}
      <div className="bg-white shadow-sm border border-gray-200 rounded-2xl">
        <div className="px-6 py-4">
          <nav className="flex space-x-8 overflow-x-auto">
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${activeTab === 'profile'
                ? 'bg-teal-100 text-teal-700'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
            >
              <User className="w-4 h-4" />
              Profile
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${activeTab === 'history'
                ? 'bg-teal-100 text-teal-700'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
            >
              <History className="w-4 h-4" />
              History
            </button>
            <button
              onClick={() => setActiveTab('payment')}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${activeTab === 'payment'
                ? 'bg-teal-100 text-teal-700'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
            >
              <CreditCard className="w-4 h-4" />
              Payment
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${activeTab === 'settings'
                ? 'bg-teal-100 text-teal-700'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
            >
              <Settings className="w-4 h-4" />
              Settings
            </button>
          </nav>
        </div>
      </div>

      <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl border border-gray-100 p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
          <div className="flex-1">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Payment Methods</h2>
            <p className="text-sm sm:text-base text-gray-500 mt-1">Manage your saved payment methods</p>
          </div>
          <Link
            to="/add-payment-method"
            className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-teal-500 text-white rounded-lg sm:rounded-xl hover:bg-teal-600 transition-all duration-300 shadow-lg hover:shadow-xl font-medium text-sm sm:text-base touch-manipulation"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
            Add Card
          </Link>
        </div>

        {loadingPayments ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading payment methods...</p>
          </div>
        ) : paymentMethods.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CreditCard className="w-12 h-12 text-gray-400" />
            </div>
            <p className="text-gray-500 text-lg mb-2">No payment methods added</p>
            <p className="text-gray-400 text-sm mb-6">Add a payment method to make bookings easier</p>
            <Link
              to="/add-payment-method"
              className="inline-flex items-center gap-2 px-6 py-3 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors font-medium"
            >
              <Plus className="w-5 h-5" />
              Add Your First Card
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
            {paymentMethods.map((payment) => (
              <div key={payment._id} className="relative">
                {/* Credit Card Design */}
                <div className={`relative ${getCardGradient(payment.cardType)} rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-2xl overflow-hidden`}>
                  {/* Card Background Pattern */}
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full -mr-20 -mt-20"></div>
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-white rounded-full -ml-16 -mb-16"></div>
                  </div>

                  {/* Card Content */}
                  <div className="relative z-10">
                    {/* Card Header */}
                    <div className="flex items-start justify-between mb-6 sm:mb-8">
                      <div className="flex items-center gap-2 scale-90 sm:scale-100">
                        {getCardLogo(payment.cardType)}
                      </div>
                      {payment.isDefault && (
                        <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm px-2 sm:px-3 py-1 rounded-full">
                          <Star className="w-3 h-3 text-yellow-300 fill-yellow-300" />
                          <span className="text-[10px] sm:text-xs text-white font-medium">Default</span>
                        </div>
                      )}
                    </div>

                    {/* Chip */}
                    <div className="mb-4 sm:mb-6">
                      <div className="w-10 h-7 sm:w-12 sm:h-9 bg-gradient-to-br from-yellow-200 to-yellow-400 rounded-md shadow-lg"></div>
                    </div>

                    {/* Card Number */}
                    <div className="mb-4 sm:mb-6">
                      <div className="flex items-center gap-2 sm:gap-3 text-white text-base sm:text-xl font-mono tracking-wider">
                        <span>••••</span>
                        <span>••••</span>
                        <span>••••</span>
                        <span className="font-semibold">{payment.cardNumber}</span>
                      </div>
                    </div>

                    {/* Card Footer */}
                    <div className="flex items-end justify-between">
                      <div className="flex-1 min-w-0 mr-2">
                        <p className="text-white/60 text-[10px] sm:text-xs mb-1 uppercase tracking-wide">Card Holder</p>
                        <p className="text-white font-semibold text-xs sm:text-sm uppercase tracking-wide truncate">
                          {payment.nameOnCard}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-white/60 text-[10px] sm:text-xs mb-1 uppercase tracking-wide">Expires</p>
                        <p className="text-white font-semibold text-xs sm:text-sm tracking-wide">
                          {payment.expiryDate}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="mt-3 sm:mt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  {!payment.isDefault && (
                    <button
                      onClick={() => handleSetDefaultPayment(payment._id)}
                      className="flex-1 flex items-center justify-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-xs sm:text-sm font-medium touch-manipulation"
                    >
                      <Star className="w-3 h-3 sm:w-4 sm:h-4" />
                      Set Default
                    </button>
                  )}
                  <button
                    onClick={() => handleDeletePayment(payment._id)}
                    className={`flex items-center justify-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-xs sm:text-sm font-medium touch-manipulation ${!payment.isDefault ? '' : 'flex-1'}`}
                  >
                    <Trash className="w-3 h-3 sm:w-4 sm:h-4" />
                    Delete
                  </button>
                </div>

                {/* Country Badge */}
                <div className="mt-2 flex items-center gap-2 text-xs sm:text-sm text-gray-500">
                  <Globe className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>{payment.country}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )

  const renderSettingsContent = () => (
    <div className="space-y-8">
      {/* Account Navigation */}
      <div className="bg-white shadow-sm border border-gray-200 rounded-2xl">
        <div className="px-6 py-4">
          <nav className="flex space-x-8 overflow-x-auto">
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${activeTab === 'profile'
                ? 'bg-teal-100 text-teal-700'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
            >
              <User className="w-4 h-4" />
              Profile
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${activeTab === 'history'
                ? 'bg-teal-100 text-teal-700'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
            >
              <History className="w-4 h-4" />
              History
            </button>
            <button
              onClick={() => setActiveTab('payment')}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${activeTab === 'payment'
                ? 'bg-teal-100 text-teal-700'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
            >
              <CreditCard className="w-4 h-4" />
              Payment
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${activeTab === 'settings'
                ? 'bg-teal-100 text-teal-700'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
            >
              <Settings className="w-4 h-4" />
              Settings
            </button>
          </nav>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Account Settings</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <Lock className="w-5 h-5 text-gray-400" />
              <div>
                <p className="font-medium text-gray-900">Password</p>
                <p className="text-sm text-gray-500">Change your account password</p>
              </div>
            </div>
            <button 
              onClick={() => setShowChangePassword(true)}
              className="px-4 py-2 text-sm text-teal-600 hover:text-teal-700 font-medium cursor-pointer"
            >
              Change
            </button>
          </div>

          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-gray-400" />
              <div>
                <p className="font-medium text-gray-900">Email Notifications</p>
                <p className="text-sm text-gray-500">Receive booking updates and offers</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-500"></div>
            </label>
          </div>

          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-gray-400" />
              <div>
                <p className="font-medium text-gray-900">Two-Factor Authentication</p>
                <p className="text-sm text-gray-500">Add an extra layer of security</p>
              </div>
            </div>
            <button className="px-4 py-2 text-sm text-gray-400 font-medium">
              Enable
            </button>
          </div>

          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <Globe className="w-5 h-5 text-gray-400" />
              <div>
                <p className="font-medium text-gray-900">Language & Region</p>
                <p className="text-sm text-gray-500">English (US)</p>
              </div>
            </div>
            <button className="px-4 py-2 text-sm text-gray-400  font-medium">
              Change
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Danger Zone</h2>
        <div className="space-y-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-medium"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>

          <div className="border-t border-gray-200 pt-4">
            <button
              onClick={() => setShowDeletePopup(true)}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              <Trash2 className="w-5 h-5" />
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Change Password Modal */}
      {showChangePassword && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
                    <Lock className="w-6 h-6 text-teal-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Change Password</h3>
                    <p className="text-sm text-gray-500">Update your account password</p>
                  </div>
                </div>
                <button
                  onClick={closeChangePassword}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Error Message */}
              {passwordError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700">{passwordError}</p>
                </div>
              )}

              {/* Form */}
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="Enter current password"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="Enter new password (min 8 characters)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="Confirm new password"
                  />
                </div>
              </div>

              {/* Info */}
              <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-700">
                  <strong>Password requirements:</strong>
                </p>
                <ul className="text-sm text-blue-600 mt-2 space-y-1">
                  <li>• At least 8 characters long</li>
                  <li>• Different from your current password</li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={closeChangePassword}
                  disabled={loading}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleChangePassword}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Changing...' : 'Change Password'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Booking Details Modal */}
      {showBookingDetails && selectedBooking && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6 lg:p-8">
              {/* Modal Header */}
              <div className="flex items-start justify-between mb-4 sm:mb-6 gap-2">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">Flight Ticket</h3>
                  <p className="text-xs sm:text-sm text-gray-500 truncate">Ref: {selectedBooking.bookingReference}</p>
                </div>
                <button
                  onClick={handleCloseBookingDetails}
                  className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                >
                  <X className="w-5 h-5 sm:w-6 sm:h-6 text-gray-500" />
                </button>
              </div>

              {/* Ticket Design */}
              <div className="bg-gradient-to-r from-teal-500 to-blue-600 rounded-lg sm:rounded-xl lg:rounded-2xl p-4 sm:p-6 lg:p-8 text-white mb-4 sm:mb-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-3">
                  <div>
                    <h4 className="text-lg sm:text-xl lg:text-2xl font-bold">Dream Holidays</h4>
                    <p className="text-xs sm:text-sm text-teal-100">Electronic Ticket</p>
                  </div>
                  <div className="sm:text-right">
                    <div className="text-xl sm:text-2xl lg:text-3xl font-bold">{selectedBooking.flightNumber || selectedBooking.flight?.flightNumber || 'N/A'}</div>
                    <div className="text-xs sm:text-sm text-teal-100 truncate">{selectedBooking.airline || selectedBooking.flight?.airline || selectedBooking.flight?.airlineName || 'N/A'}</div>
                  </div>
                </div>

                {/* Flight Route */}
                <div className="flex flex-col sm:flex-row items-center justify-between mb-6 sm:mb-8 gap-4">
                  <div className="text-center flex-1">
                    <div className="text-2xl sm:text-3xl font-bold mb-2">
                      {selectedBooking.departureTime || selectedBooking.flight?.departureTime 
                        ? new Date(selectedBooking.departureTime || selectedBooking.flight.departureTime).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit'
                        }) 
                        : 'N/A'}
                    </div>
                    <div className="text-base sm:text-lg lg:text-xl font-semibold mb-1">{selectedBooking.departureAirport || selectedBooking.flight?.departureAirport || 'N/A'}</div>
                    <div className="text-xs sm:text-sm text-teal-100">
                      {selectedBooking.departureTime || selectedBooking.flight?.departureTime 
                        ? new Date(selectedBooking.departureTime || selectedBooking.flight.departureTime).toLocaleDateString() 
                        : 'N/A'}
                    </div>
                  </div>

                  <div className="flex-1 mx-2 sm:mx-4 lg:mx-8 min-w-0">
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t-2 border-white/30"></div>
                      </div>
                      <div className="relative flex justify-center">
                        <div className="bg-white/20 px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 rounded-full">
                          <Plane className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white transform rotate-90" />
                        </div>
                      </div>
                    </div>
                    <div className="text-center mt-2 sm:mt-3">
                      <div className="text-xs sm:text-sm text-teal-100">
                        {(selectedBooking.duration || selectedBooking.flight?.duration)?.replace('PT', '').replace('H', 'h ').replace('M', 'm') || 'N/A'}
                      </div>
                    </div>
                  </div>

                  <div className="text-center flex-1">
                    <div className="text-2xl sm:text-3xl font-bold mb-2">
                      {selectedBooking.arrivalTime || selectedBooking.flight?.arrivalTime 
                        ? new Date(selectedBooking.arrivalTime || selectedBooking.flight.arrivalTime).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit'
                        }) 
                        : 'N/A'}
                    </div>
                    <div className="text-base sm:text-lg lg:text-xl font-semibold mb-1">{selectedBooking.arrivalAirport || selectedBooking.flight?.arrivalAirport || 'N/A'}</div>
                    <div className="text-xs sm:text-sm text-teal-100">
                      {selectedBooking.arrivalTime || selectedBooking.flight?.arrivalTime 
                        ? new Date(selectedBooking.arrivalTime || selectedBooking.flight.arrivalTime).toLocaleDateString() 
                        : 'N/A'}
                    </div>
                  </div>
                </div>

                {/* Passenger Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
                  <div>
                    <div className="text-teal-100 text-xs sm:text-sm mb-1">PASSENGER</div>
                    <div className="font-semibold text-sm sm:text-base lg:text-lg truncate">
                      {selectedBooking.passenger?.firstName} {selectedBooking.passenger?.lastName}
                    </div>
                  </div>
                  <div>
                    <div className="text-teal-100 text-xs sm:text-sm mb-1">BOOKING DATE</div>
                    <div className="font-semibold text-sm sm:text-base">
                      {new Date(selectedBooking.bookingDate).toLocaleDateString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-teal-100 text-xs sm:text-sm mb-1">STATUS</div>
                    <div className="font-semibold text-sm sm:text-base capitalize">
                      {selectedBooking.status.charAt(0).toUpperCase() + selectedBooking.status.slice(1)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Detailed Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
                {/* Passenger Details */}
                <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
                  <h5 className="font-semibold text-gray-900 mb-3 sm:mb-4 text-sm sm:text-base">Passenger Information</h5>
                  <div className="space-y-2 sm:space-y-3">
                    <div>
                      <div className="text-xs sm:text-sm text-gray-500">Full Name</div>
                      <div className="font-medium text-sm sm:text-base">{selectedBooking.passenger?.firstName} {selectedBooking.passenger?.lastName}</div>
                    </div>
                    <div>
                      <div className="text-xs sm:text-sm text-gray-500">Email</div>
                      <div className="font-medium text-sm sm:text-base break-all">{selectedBooking.passenger?.email}</div>
                    </div>
                    <div>
                      <div className="text-xs sm:text-sm text-gray-500">Phone</div>
                      <div className="font-medium text-sm sm:text-base">{selectedBooking.passenger?.phone || 'N/A'}</div>
                    </div>
                    {selectedBooking.passenger?.dateOfBirth && (
                      <div>
                        <div className="text-xs sm:text-sm text-gray-500">Date of Birth</div>
                        <div className="font-medium text-sm sm:text-base">
                          {new Date(selectedBooking.passenger.dateOfBirth).toLocaleDateString()}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Flight Details */}
                <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
                  <h5 className="font-semibold text-gray-900 mb-3 sm:mb-4 text-sm sm:text-base">Flight Information</h5>
                  <div className="space-y-2 sm:space-y-3">
                    <div>
                      <div className="text-xs sm:text-sm text-gray-500">Aircraft</div>
                      <div className="font-medium text-sm sm:text-base">{selectedBooking.aircraftModel || selectedBooking.flight?.aircraftModel || 'N/A'}</div>
                    </div>
                    <div>
                      <div className="text-xs sm:text-sm text-gray-500">Duration</div>
                      <div className="font-medium text-sm sm:text-base">
                        {(selectedBooking.duration || selectedBooking.flight?.duration)?.replace('PT', '').replace('H', 'h ').replace('M', 'm') || 'N/A'}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs sm:text-sm text-gray-500">Stops</div>
                      <div className="font-medium text-sm sm:text-base">
                        {(selectedBooking.stops !== undefined ? selectedBooking.stops : selectedBooking.flight?.stops) === 0 
                          ? 'Direct Flight' 
                          : `${selectedBooking.stops !== undefined ? selectedBooking.stops : selectedBooking.flight?.stops || 0} stop(s)`}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs sm:text-sm text-gray-500">Total Amount</div>
                      <div className="font-medium text-sm sm:text-base text-teal-600">
                        ৳{selectedBooking.totalAmount} {selectedBooking.currency}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Search Parameters */}
              {selectedBooking.searchParams && (
                <div className="bg-blue-50 rounded-lg p-4 sm:p-6 mb-4 sm:mb-6">
                  <h5 className="font-semibold text-gray-900 mb-3 sm:mb-4 text-sm sm:text-base">Booking Details</h5>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                    {(() => {
                      try {
                        const searchParams = typeof selectedBooking.searchParams === 'string'
                          ? JSON.parse(selectedBooking.searchParams)
                          : selectedBooking.searchParams;
                        return (
                          <>
                            <div>
                              <div className="text-xs sm:text-sm text-gray-500">Trip Type</div>
                              <div className="font-medium text-sm sm:text-base capitalize">{searchParams.type || 'N/A'}</div>
                            </div>
                            <div>
                              <div className="text-xs sm:text-sm text-gray-500">Travel Class</div>
                              <div className="font-medium text-sm sm:text-base capitalize">{searchParams.travel_class || 'N/A'}</div>
                            </div>
                            <div>
                              <div className="text-xs sm:text-sm text-gray-500">Adults</div>
                              <div className="font-medium text-sm sm:text-base">{searchParams.adults || 'N/A'}</div>
                            </div>
                            <div>
                              <div className="text-xs sm:text-sm text-gray-500">Children</div>
                              <div className="font-medium text-sm sm:text-base">{searchParams.children || 0}</div>
                            </div>
                          </>
                        );
                      } catch {
                        return <div className="text-xs sm:text-sm text-gray-500 col-span-2 sm:col-span-4">Search details not available</div>;
                      }
                    })()}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                <button
                  onClick={() => handleDownloadTicket(selectedBooking)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors font-medium text-sm sm:text-base"
                >
                  <Download className="w-4 h-4 sm:w-5 sm:h-5" />
                  Download Ticket
                </button>
                <button
                  onClick={handleCloseBookingDetails}
                  className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm sm:text-base"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Package Booking Details Modal */}
      {showPackageBookingDetails && selectedPackageBooking && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6 lg:p-8">
              {/* Modal Header */}
              <div className="flex items-start justify-between mb-4 sm:mb-6 gap-2">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">Package Details</h3>
                  <p className="text-xs sm:text-sm text-gray-500 truncate">Ref: {selectedPackageBooking.bookingReference}</p>
                </div>
                <button
                  onClick={handleClosePackageBookingDetails}
                  className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                >
                  <X className="w-5 h-5 sm:w-6 sm:h-6 text-gray-500" />
                </button>
              </div>

              {/* Package Header Card */}
              <div className="bg-gradient-to-br from-teal-600 via-cyan-500 to-blue-600 rounded-lg sm:rounded-xl lg:rounded-2xl p-4 sm:p-6 lg:p-8 text-white mb-4 sm:mb-6 shadow-lg">
                <div className="flex flex-col sm:flex-row items-start justify-between mb-4 sm:mb-6 gap-3">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2">{selectedPackageBooking.packageData?.title || 'Package Tour'}</h4>
                    <p className="text-teal-100 text-xs sm:text-sm flex items-center gap-1 mt-1">
                      <LocationIcon className="w-4 h-4" />
                      {selectedPackageBooking.packageData?.location || 'N/A'}
                    </p>
                  </div>
                  <div className={`px-4 py-2 rounded-full text-white font-semibold backdrop-blur-sm ${
                    selectedPackageBooking.status === 'confirmed' ? 'bg-emerald-500/80' :
                    selectedPackageBooking.status === 'pending' ? 'bg-amber-500/80' :
                    selectedPackageBooking.status === 'cancelled' ? 'bg-rose-500/80' :
                    'bg-gray-500/80'
                  }`}>
                    {selectedPackageBooking.status?.charAt(0).toUpperCase() + selectedPackageBooking.status?.slice(1)}
                  </div>
                </div>

                {/* Key Details */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 bg-white/10 backdrop-blur-sm p-3 sm:p-4 rounded-lg sm:rounded-xl">
                  <div>
                    <div className="text-teal-100 text-[10px] sm:text-xs uppercase tracking-wide mb-1 font-semibold">Duration</div>
                    <div className="font-bold text-sm sm:text-base lg:text-lg">{selectedPackageBooking.packageData?.duration || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-teal-100 text-xs uppercase tracking-wide mb-1 font-semibold">Travelers</div>
                    <div className="font-bold text-lg">{selectedPackageBooking.numberOfTravelers || 0} person(s)</div>
                  </div>
                  <div>
                    <div className="text-teal-100 text-xs uppercase tracking-wide mb-1 font-semibold">Travel Date</div>
                    <div className="font-bold">
                      {selectedPackageBooking.selectedDate ? new Date(selectedPackageBooking.selectedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'N/A'}
                    </div>
                  </div>
                  <div>
                    <div className="text-teal-100 text-xs uppercase tracking-wide mb-1 font-semibold">Total Price</div>
                    <div className="font-semibold text-xl">${selectedPackageBooking.totalPrice?.toFixed(2) || '0.00'}</div>
                  </div>
                </div>
              </div>

              {/* Package Information */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-6">
                {/* Itinerary */}
                <div className="lg:col-span-2 bg-gradient-to-br from-teal-50 to-cyan-50 rounded-lg sm:rounded-xl p-4 sm:p-6 border border-teal-200">
                  <h5 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <div className="w-1 h-6 bg-teal-600 rounded"></div>
                    Itinerary
                  </h5>
                  <div className="space-y-3">
                    {selectedPackageBooking.packageData?.itinerary?.slice(0, 5).map((day, idx) => (
                      <div key={idx} className="bg-white p-4 rounded-lg border border-teal-100 hover:shadow-md transition-shadow">
                        <div className="flex gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-sm">
                            {day.day}
                          </div>
                          <div className="flex-1">
                            <h6 className="font-semibold text-gray-900">{day.title}</h6>
                            <p className="text-sm text-gray-600 mt-1">{day.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                    {selectedPackageBooking.packageData?.itinerary && selectedPackageBooking.packageData.itinerary.length > 5 && (
                      <p className="text-sm text-teal-600 text-center py-2 font-medium">
                        + {selectedPackageBooking.packageData.itinerary.length - 5} more days
                      </p>
                    )}
                  </div>
                </div>

                {/* What's Included */}
                <div className="space-y-4">
                  <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-6 border border-emerald-200">
                    <h5 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Check className="w-5 h-5 text-emerald-600" />
                      Included
                    </h5>
                    <ul className="space-y-2">
                      {selectedPackageBooking.packageData?.included?.slice(0, 5).map((item, idx) => (
                        <li key={idx} className="flex gap-2 text-sm text-gray-700">
                          <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-xl p-6 border border-rose-200">
                    <h5 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <X className="w-5 h-5 text-rose-600" />
                      Not Included
                    </h5>
                    <ul className="space-y-2">
                      {selectedPackageBooking.packageData?.notIncluded?.slice(0, 3).map((item, idx) => (
                        <li key={idx} className="flex gap-2 text-sm text-gray-700">
                          <X className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Travelers */}
              {selectedPackageBooking.travelers && selectedPackageBooking.travelers.length > 0 && (
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 mb-6 border border-blue-200">
                  <h5 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <div className="w-1 h-6 bg-blue-600 rounded"></div>
                    Travelers Information ({selectedPackageBooking.travelers.length})
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedPackageBooking.travelers.map((traveler, idx) => (
                      <div key={idx} className="bg-white p-4 rounded-lg border border-blue-100 hover:shadow-md transition-shadow">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center flex-shrink-0">
                            <User className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900">
                              {traveler.firstName} {traveler.lastName}
                            </p>
                            <p className="text-sm text-gray-600 truncate">{traveler.email}</p>
                            <p className="text-sm text-gray-600">{traveler.phone}</p>
                            {traveler.passportNumber && (
                              <p className="text-xs text-gray-500 mt-1">Passport: {traveler.passportNumber}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Payment Information */}
              <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl p-6 mb-6 border border-violet-200">
                <h5 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-violet-600" />
                  Payment Information
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white p-4 rounded-lg border border-violet-100">
                    <div className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">Payment Method</div>
                    <div className="font-bold text-gray-900 capitalize">{selectedPackageBooking.payment?.paymentMethod || 'N/A'}</div>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-violet-100">
                    <div className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">Booking Date</div>
                    <div className="font-bold text-gray-900">
                      {new Date(selectedPackageBooking.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                  </div>
                </div>
                {selectedPackageBooking.payment?.cardholderName && (
                  <div className="mt-4 p-4 bg-white rounded-lg border border-violet-100">
                    <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">Card Holder</p>
                    <p className="font-bold text-gray-900">{selectedPackageBooking.payment.cardholderName}</p>
                  </div>
                )}
              </div>

              {/* Booking Summary */}
              <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-xl p-6 mb-6 border border-teal-200">
                <h5 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <div className="w-1 h-6 bg-teal-600 rounded"></div>
                  Booking Summary
                </h5>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-teal-100">
                    <span className="text-gray-700 font-medium">Base Price</span>
                    <span className="font-bold text-gray-900">${(selectedPackageBooking.totalPrice / selectedPackageBooking.numberOfTravelers)?.toFixed(2) || '0.00'}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-teal-100">
                    <span className="text-gray-700 font-medium">Number of Travelers</span>
                    <span className="font-bold text-gray-900">x {selectedPackageBooking.numberOfTravelers}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-lg text-white">
                    <span className="font-bold">Total Amount</span>
                    <span className="font-bold text-xl">${selectedPackageBooking.totalPrice?.toFixed(2) || '0.00'}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <button
                  onClick={handleClosePackageBookingDetails}
                  className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm sm:text-base order-3 sm:order-1"
                >
                  Close
                </button>
                <button
                  onClick={() => handleDownloadPackageBooking(selectedPackageBooking)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-lg hover:from-teal-600 hover:to-cyan-600 transition-colors font-medium shadow-md hover:shadow-lg text-sm sm:text-base order-1 sm:order-2"
                >
                  <Download className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="hidden sm:inline">Download Confirmation</span>
                  <span className="sm:hidden">Download</span>
                </button>
                {selectedPackageBooking.status !== 'cancelled' && (
                  <button
                    onClick={() => {
                      handleClosePackageBookingDetails()
                      handleCancelPackageBooking(selectedPackageBooking)
                    }}
                    disabled={loading}
                    className="flex-1 flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base order-2 sm:order-3"
                  >
                    <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="hidden sm:inline">Cancel Booking</span>
                    <span className="sm:hidden">Cancel</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Booking Confirmation Modal */}
      {showDeleteConfirmation && bookingToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Delete Booking</h3>
                  <p className="text-sm text-gray-500">This action cannot be undone</p>
                </div>
              </div>

              {/* Booking Info */}
              <div className="mb-6 bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-2">You are about to delete:</div>
                <div className="font-semibold text-gray-900 mb-1">
                  Booking Reference: {bookingToDelete.bookingReference}
                </div>
                <div className="text-sm text-gray-600">
                  {bookingToDelete.flight?.departureAirport || bookingToDelete.departureAirport} → {bookingToDelete.flight?.arrivalAirport || bookingToDelete.arrivalAirport}
                </div>
                <div className="text-sm text-gray-600">
                  Passenger: {bookingToDelete.passenger?.firstName} {bookingToDelete.passenger?.lastName}
                </div>
              </div>

              {/* Warning */}
              <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-700">
                  <strong>Warning:</strong> Deleting this booking will permanently remove it from your history. 
                  This action cannot be undone.
                </p>
              </div>

              {/* Confirmation Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type <span className="font-bold text-red-600">DELETE</span> to confirm:
                </label>
                <input
                  type="text"
                  value={deleteConfirmationText}
                  onChange={(e) => setDeleteConfirmationText(e.target.value)}
                  placeholder="Type DELETE"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  autoFocus
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={cancelDeleteBooking}
                  disabled={loading}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteBooking}
                  disabled={loading || deleteConfirmationText !== 'DELETE'}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Deleting...' : 'Delete Booking'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Package Booking Popup */}
      {showCancelPopup && packageToCancel && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Cancel Package Booking</h3>
                  <p className="text-sm text-gray-500">Request cancellation of this booking</p>
                </div>
              </div>

              {/* Booking Info */}
              <div className="mb-6 bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-2">You are about to cancel:</div>
                <div className="font-semibold text-gray-900 mb-1">
                  {packageToCancel.packageData?.title || 'Package Tour'}
                </div>
                <div className="text-sm text-gray-600">
                  Reference: {packageToCancel.bookingReference}
                </div>
                <div className="text-sm text-gray-600">
                  Location: {packageToCancel.packageData?.location || 'N/A'}
                </div>
                <div className="text-sm text-gray-600">
                  Travelers: {packageToCancel.numberOfTravelers} person(s)
                </div>
                <div className="text-sm font-semibold text-teal-600 mt-2">
                  Total: ${packageToCancel.totalPrice?.toFixed(2) || '0.00'}
                </div>
              </div>

              {/* Warning */}
              <div className="mb-6 bg-orange-50 border border-orange-200 rounded-lg p-4">
                <p className="text-sm text-orange-700">
                  <strong>Important:</strong> Cancelling this booking will send a cancellation request. 
                  Please review the cancellation policy for any applicable fees or refund details.
                </p>
              </div>

              {/* Confirmation Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type <span className="font-bold text-orange-600">CANCEL</span> to confirm:
                </label>
                <input
                  type="text"
                  value={cancelConfirmationText}
                  onChange={(e) => setCancelConfirmationText(e.target.value)}
                  placeholder="Type CANCEL"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  autoFocus
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={closeCancelPopup}
                  disabled={loading}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
                >
                  Keep Booking
                </button>
                <button
                  onClick={confirmCancelPackageBooking}
                  disabled={loading || cancelConfirmationText !== 'CANCEL'}
                  className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Cancelling...' : 'Cancel Booking'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Popup */}
      {showDeletePopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Delete Account</h3>
                  <p className="text-sm text-gray-500">This action cannot be undone</p>
                </div>
              </div>

              {/* Warning Content */}
              <div className="mb-6">
                <p className="text-gray-700 mb-4">
                  Once you delete your account, there is no going back. This will permanently delete your account,
                  profile information, booking history, and all associated data.
                </p>

                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-red-800 mb-2">What will be deleted:</h4>
                  <ul className="text-sm text-red-700 space-y-1">
                    <li>• All personal information and profile data</li>
                    <li>• Booking history and travel preferences</li>
                    <li>• Saved payment methods and addresses</li>
                    <li>• Account settings and preferences</li>
                    <li>• Profile and cover photos</li>
                  </ul>
                </div>
              </div>

              {/* Confirmation Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type "DELETE" to confirm account deletion:
                </label>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="Type DELETE here"
                  autoFocus
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleteConfirmText !== 'DELETE' || loading}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Trash2 className="w-5 h-5" />
                  {loading ? 'Deleting...' : 'Delete Account'}
                </button>
                <button
                  onClick={closeDeletePopup}
                  disabled={loading}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Save Message */}
        {saveMessage && (
          <div className={`mb-6 p-4 rounded-lg ${saveMessage.includes('Error')
            ? 'bg-red-50 text-red-800 border border-red-200'
            : 'bg-green-50 text-green-800 border border-green-200'
            }`}>
            <div className="flex items-center gap-2">
              {saveMessage.includes('Error') ? (
                <X className="w-5 h-5" />
              ) : (
                <Check className="w-5 h-5" />
              )}
              {saveMessage}
            </div>
          </div>
        )}

        {/* Loading Overlay */}
        {loading && (
          <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 shadow-xl">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Saving changes...</p>
            </div>
          </div>
        )}

        {/* Tab Content */}
        {activeTab === 'profile' && renderProfileContent()}
        {activeTab === 'history' && renderHistoryContent()}
        {activeTab === 'payment' && renderPaymentContent()}
        {activeTab === 'settings' && renderSettingsContent()}
      </div>
    </div>
  )
}

export default Account