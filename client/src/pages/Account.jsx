import { useState, useEffect, useRef } from 'react'
import {
  User, Mail, Phone, MapPin, Calendar, Camera,
  X, Check, CreditCard, History, Settings,
  Edit3, Bell, Shield, Globe, LogOut, Trash2, AlertTriangle, Plus, Star, Trash
} from 'lucide-react'
import { auth, authAPI, userAPI, paymentAPI } from '../utils/api'
import { Link } from 'react-router-dom'

const Account = () => {
  const [activeTab, setActiveTab] = useState('profile')
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

  const profileImageRef = useRef(null)
  const coverImageRef = useRef(null)

  // Load user data on component mount
  useEffect(() => {
    const loadUserData = async () => {
      try {
        setInitialLoading(true)
        const response = await authAPI.getProfile()
        if (response.success) {
          console.log('User data received:', response.user)
          console.log('Avatar URL:', response.user.avatar)
          console.log('Cover Image URL:', response.user.coverImage)

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
        <div className="h-96 bg-gradient-to-r from-teal-600 via-orange-400 to-yellow-400 rounded-2xl overflow-hidden shadow-xl">
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
            <div className="w-full h-full bg-gradient-to-r from-teal-600 via-orange-400 to-yellow-400"></div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>

          {/* Cover Upload Button */}
          <button
            onClick={() => coverImageRef.current?.click()}
            className="absolute top-6 right-6 bg-white/95 hover:bg-white text-gray-800 px-5 py-2.5 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl backdrop-blur-sm cursor-pointer"
          >
            <Camera className="w-4 h-4" />
            Upload Cover
          </button>

          {/* Profile Image */}
          <div className='flex items-center gap-5'>


            <div className="absolute -bottom-20 left-8">
              <div className="relative">
                <div className="w-40 h-40 rounded-full bg-white p-1.5 shadow-2xl ring-1 ring-white">
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
                  className="absolute bottom-2 right-2 w-12 h-12 bg-teal-500 hover:bg-teal-600 rounded-full flex items-center justify-center text-white transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 cursor-pointer"
                >
                  <Camera className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="z-10 absolute left-52">
              <h1 className="text-4xl font-bold text-white drop-shadow-lg">{userInfo.name || 'Welcome!'}</h1>
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

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Booking History</h2>
        <div className="text-center py-12">
          <History className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No booking history available</p>
          <p className="text-sm text-gray-400 mt-2">Your past bookings will appear here</p>
        </div>
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
        return 'bg-gradient-to-br from-green-600 via-teal-600 to-cyan-700'
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

      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Payment Methods</h2>
            <p className="text-gray-500 mt-1">Manage your saved payment methods</p>
          </div>
          <Link
            to="/add-payment-method"
            className="flex items-center gap-2 px-6 py-3 bg-teal-500 text-white rounded-xl hover:bg-teal-600 transition-all duration-300 shadow-lg hover:shadow-xl font-medium"
          >
            <Plus className="w-5 h-5" />
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paymentMethods.map((payment) => (
              <div key={payment._id} className="relative">
                {/* Credit Card Design */}
                <div className={`relative ${getCardGradient(payment.cardType)} rounded-2xl p-6 shadow-2xl overflow-hidden`}>
                  {/* Card Background Pattern */}
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full -mr-20 -mt-20"></div>
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-white rounded-full -ml-16 -mb-16"></div>
                  </div>

                  {/* Card Content */}
                  <div className="relative z-10">
                    {/* Card Header */}
                    <div className="flex items-start justify-between mb-8">
                      <div className="flex items-center gap-2">
                        {getCardLogo(payment.cardType)}
                      </div>
                      {payment.isDefault && (
                        <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                          <Star className="w-3 h-3 text-yellow-300 fill-yellow-300" />
                          <span className="text-xs text-white font-medium">Default</span>
                        </div>
                      )}
                    </div>

                    {/* Chip */}
                    <div className="mb-6">
                      <div className="w-12 h-9 bg-gradient-to-br from-yellow-200 to-yellow-400 rounded-md shadow-lg"></div>
                    </div>

                    {/* Card Number */}
                    <div className="mb-6">
                      <div className="flex items-center gap-3 text-white text-xl font-mono tracking-wider">
                        <span>••••</span>
                        <span>••••</span>
                        <span>••••</span>
                        <span className="font-semibold">{payment.cardNumber}</span>
                      </div>
                    </div>

                    {/* Card Footer */}
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-white/60 text-xs mb-1 uppercase tracking-wide">Card Holder</p>
                        <p className="text-white font-semibold text-sm uppercase tracking-wide">
                          {payment.nameOnCard}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-white/60 text-xs mb-1 uppercase tracking-wide">Expires</p>
                        <p className="text-white font-semibold text-sm tracking-wide">
                          {payment.expiryDate}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="mt-4 flex items-center gap-2">
                  {!payment.isDefault && (
                    <button
                      onClick={() => handleSetDefaultPayment(payment._id)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                    >
                      <Star className="w-4 h-4" />
                      Set Default
                    </button>
                  )}
                  <button
                    onClick={() => handleDeletePayment(payment._id)}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
                  >
                    <Trash className="w-4 h-4" />
                    Delete
                  </button>
                </div>

                {/* Country Badge */}
                <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
                  <Globe className="w-4 h-4" />
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
            <button className="px-4 py-2 text-sm text-teal-600 hover:text-teal-700 font-medium">
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
            <button className="px-4 py-2 text-sm text-teal-600 hover:text-teal-700 font-medium">
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