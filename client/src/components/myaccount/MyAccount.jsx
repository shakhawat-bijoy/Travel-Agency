import { useState, useEffect } from 'react'
import { User, Mail, Phone, MapPin, Calendar, Edit3, Camera } from 'lucide-react'
import { auth, authAPI, userAPI } from '../../utils/api'

const MyAccount = () => {
  const [userInfo, setUserInfo] = useState({
    name: '',
    email: '',
    password: '••••••••••••',
    phone: '',
    address: '',
    dateOfBirth: ''
  })
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [saveMessage, setSaveMessage] = useState('')

  // Load user data on component mount
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const { user } = auth.getUserData()
        if (user) {
          setUserInfo({
            name: user.name || '',
            email: user.email || '',
            password: '••••••••••••',
            phone: user.phone || '',
            address: user.address || '',
            dateOfBirth: user.dateOfBirth || ''
          })
        }

        // Optionally fetch fresh data from API
        try {
          const response = await authAPI.getProfile()
          if (response.success) {
            setUserInfo({
              name: response.user.name || '',
              email: response.user.email || '',
              password: '••••••••••••',
              phone: response.user.phone || '',
              address: response.user.address || '',
              dateOfBirth: response.user.dateOfBirth || ''
            })
          }
        } catch (error) {
          console.log('Could not fetch fresh user data:', error)
        }
      } catch (error) {
        console.error('Error loading user data:', error)
      } finally {
        setInitialLoading(false)
      }
    }

    loadUserData()
  }, [])

  const [isEditing, setIsEditing] = useState({
    name: false,
    email: false,
    password: false,
    phone: false,
    address: false,
    dateOfBirth: false
  })

  const handleEdit = (field) => {
    setIsEditing(prev => ({
      ...prev,
      [field]: !prev[field]
    }))
  }

  const handleSave = async (field, value) => {
    if (!value.trim()) return

    setLoading(true)
    try {
      // Here you would typically make an API call to update the user data
      // For now, we'll just update the local state
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
    } catch (error) {
      console.error('Error saving changes:', error)
      setSaveMessage('Error saving changes. Please try again.')
      setTimeout(() => setSaveMessage(''), 3000)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveAllChanges = async () => {
    setLoading(true)
    try {
      // Make API call to save all changes
      const response = await userAPI.updateProfile(userInfo)
      if (response.success) {
        // Update localStorage with new data
        const { token } = auth.getUserData()
        auth.saveUserData(token, response.user)
        setSaveMessage('All changes saved successfully!')
      } else {
        setSaveMessage('Error saving changes. Please try again.')
      }
      setTimeout(() => setSaveMessage(''), 3000)
    } catch (error) {
      console.error('Error saving changes:', error)
      setSaveMessage('Error saving changes. Please try again.')
      setTimeout(() => setSaveMessage(''), 3000)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    auth.logout()
    window.location.href = '/login'
  }

  // Show loading spinner while loading initial data
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Banner */}
      <div className="relative h-64 bg-gradient-to-r from-teal-600 via-orange-400 to-yellow-400 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-teal-600/90 via-orange-400/90 to-yellow-400/90"></div>

        {/* Profile Section */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-white">
          <div className="relative mb-4">
            <div className="w-24 h-24 rounded-full bg-white p-1">
              <img
                src=""
                alt="Profile"
                className="w-full h-full rounded-full object-cover"
              />
            </div>
            <button className="absolute bottom-0 right-0 w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center text-white hover:bg-teal-600 transition-colors">
              <Camera className="w-4 h-4" />
            </button>
          </div>

          <h2 className="text-2xl font-bold mb-1">{userInfo.name || 'Welcome!'}</h2>
          <p className="text-white/80">{userInfo.email || 'Please complete your profile'}</p>

          <button className="mt-4 px-6 py-2 bg-teal-500 hover:bg-teal-600 rounded-lg font-medium transition-colors">
            Upload new picture
          </button>
        </div>
      </div>

      {/* Account Information */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-8">Account</h3>

          <div className="space-y-6">
            {/* Name */}
            <div className="flex items-center justify-between py-4 border-b border-gray-100">
              <div className="flex items-center space-x-4">
                <User className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  {isEditing.name ? (
                    <input
                      type="text"
                      defaultValue={userInfo.name}
                      placeholder="Enter your full name"
                      className="mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      onBlur={(e) => handleSave('name', e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSave('name', e.target.value)}
                      autoFocus
                    />
                  ) : (
                    <p className="font-medium text-gray-900">{userInfo.name || 'Not provided'}</p>
                  )}
                </div>
              </div>
              <button
                onClick={() => handleEdit('name')}
                className="px-4 py-2 text-sm text-teal-600 hover:text-teal-700 font-medium"
              >
                Change
              </button>
            </div>

            {/* Email */}
            <div className="flex items-center justify-between py-4 border-b border-gray-100">
              <div className="flex items-center space-x-4">
                <Mail className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <div className="flex items-center space-x-2">
                    {isEditing.email ? (
                      <input
                        type="email"
                        defaultValue={userInfo.email}
                        placeholder="Enter your email address"
                        className="mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                        onBlur={(e) => handleSave('email', e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSave('email', e.target.value)}
                        autoFocus
                      />
                    ) : (
                      <>
                        <p className="font-medium text-gray-900">{userInfo.email || 'Not provided'}</p>
                        {userInfo.email && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Verified
                          </span>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleEdit('email')}
                className="px-4 py-2 text-sm text-teal-600 hover:text-teal-700 font-medium"
              >
                Change
              </button>
            </div>

            {/* Password */}
            <div className="flex items-center justify-between py-4 border-b border-gray-100">
              <div className="flex items-center space-x-4">
                <div className="w-5 h-5 flex items-center justify-center">
                  <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Password</p>
                  <p className="font-medium text-gray-900">{userInfo.password}</p>
                </div>
              </div>
              <button
                onClick={() => handleEdit('password')}
                className="px-4 py-2 text-sm text-teal-600 hover:text-teal-700 font-medium"
              >
                Change
              </button>
            </div>

            {/* Phone */}
            <div className="flex items-center justify-between py-4 border-b border-gray-100">
              <div className="flex items-center space-x-4">
                <Phone className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  {isEditing.phone ? (
                    <input
                      type="tel"
                      defaultValue={userInfo.phone}
                      placeholder="Enter your phone number"
                      className="mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      onBlur={(e) => handleSave('phone', e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSave('phone', e.target.value)}
                      autoFocus
                    />
                  ) : (
                    <p className="font-medium text-gray-900">{userInfo.phone || 'Not provided'}</p>
                  )}
                </div>
              </div>
              <button
                onClick={() => handleEdit('phone')}
                className="px-4 py-2 text-sm text-teal-600 hover:text-teal-700 font-medium"
              >
                Change
              </button>
            </div>

            {/* Address */}
            <div className="flex items-center justify-between py-4 border-b border-gray-100">
              <div className="flex items-center space-x-4">
                <MapPin className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Address</p>
                  {isEditing.address ? (
                    <textarea
                      defaultValue={userInfo.address}
                      placeholder="Enter your address"
                      className="mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 w-80"
                      rows="2"
                      onBlur={(e) => handleSave('address', e.target.value)}
                      autoFocus
                    />
                  ) : (
                    <p className="font-medium text-gray-900">{userInfo.address || 'Not provided'}</p>
                  )}
                </div>
              </div>
              <button
                onClick={() => handleEdit('address')}
                className="px-4 py-2 text-sm text-teal-600 hover:text-teal-700 font-medium"
              >
                Change
              </button>
            </div>

            {/* Date of Birth */}
            <div className="flex items-center justify-between py-4">
              <div className="flex items-center space-x-4">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Date of birth</p>
                  {isEditing.dateOfBirth ? (
                    <input
                      type="date"
                      defaultValue={userInfo.dateOfBirth}
                      className="mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      onBlur={(e) => handleSave('dateOfBirth', e.target.value)}
                      autoFocus
                    />
                  ) : (
                    <p className="font-medium text-gray-900">{userInfo.dateOfBirth || 'Not provided'}</p>
                  )}
                </div>
              </div>
              <button
                onClick={() => handleEdit('dateOfBirth')}
                className="px-4 py-2 text-sm text-teal-600 hover:text-teal-700 font-medium"
              >
                Change
              </button>
            </div>
          </div>

          {/* Save Message */}
          {saveMessage && (
            <div className={`mt-4 p-4 rounded-lg ${saveMessage.includes('Error') ? 'bg-red-50 text-red-800' : 'bg-green-50 text-green-800'}`}>
              {saveMessage}
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-8 pt-6 border-t border-gray-100 flex space-x-4">
            <button
              onClick={handleSaveAllChanges}
              disabled={loading}
              className="px-6 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              onClick={handleLogout}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MyAccount