import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authAPI } from '../utils/api'
import { ArrowLeft } from 'lucide-react'
import Slider from 'react-slick'
import Container from '../components/common/Container'
import Image from '../components/common/Image'
import logoImage from '../assets/images/logo.png'
import login1 from '../assets/images/login1.jpg'
import login2 from '../assets/images/login2.jpg'
import banner1 from '../assets/images/banner1.png'
import banner2 from '../assets/images/banner2.png'
import banner3 from '../assets/images/banner3.png'

const ForgotPassword = () => {
  const navigate = useNavigate()
  const [active, setActive] = useState(0)
  const [step, setStep] = useState(1) // 1: Email, 2: Verify Code, 3: New Password
  const [formData, setFormData] = useState({
    email: '',
    verificationCode: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [resetToken, setResetToken] = useState('')

  const sliderData = [
    {
      id: 1,
      image: login1,
      title: "Welcome to Dream Holidays",
      description: "Discover amazing destinations and create unforgettable memories"
    },
    {
      id: 2,
      image: login2,
      title: "Explore Paradise",
      description: "Find your perfect getaway with our exclusive travel packages"
    },
    {
      id: 3,
      image: banner1,
      title: "Adventure Awaits",
      description: "Experience the world's most beautiful destinations"
    },
    {
      id: 4,
      image: banner2,
      title: "Luxury Travel",
      description: "Indulge in premium experiences and world-class hospitality"
    },
    {
      id: 5,
      image: banner3,
      title: "Create Memories",
      description: "Make every journey an unforgettable adventure"
    }
  ]

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
    setError('')
  }

  const handleSendCode = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const data = await authAPI.forgotPassword(formData.email)

      if (data.success) {
        setMessage('Verification code sent to your email')
        setStep(2)
      }
    } catch (error) {
      console.error('Send code error:', error)
      setError(error.message || 'Failed to send verification code. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyCode = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const data = await authAPI.verifyResetCode(formData.email, formData.verificationCode)

      if (data.success) {
        setResetToken(data.resetToken)
        setMessage('Code verified successfully')
        setStep(3)
      }
    } catch (error) {
      console.error('Verify code error:', error)
      setError(error.message || 'Invalid verification code. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    if (formData.newPassword.length < 8) {
      setError('Password must be at least 8 characters long')
      setLoading(false)
      return
    }

    try {
      const data = await authAPI.resetPassword(resetToken, formData.newPassword, formData.email)

      if (data.success) {
        setMessage('Password reset successfully! Redirecting to login...')
        setTimeout(() => {
          navigate('/login')
        }, 2000)
      }
    } catch (error) {
      console.error('Reset password error:', error)
      setError(error.message || 'Failed to reset password. Please try again.')
    } finally {
      setLoading(false)
    }
  }
  const sliderSettings = {
    dots: true,
    arrows: false,
    infinite: true,
    fade: true,
    autoplay: true,
    speed: 2000,
    autoplaySpeed: 5000,
    slidesToShow: 1,
    slidesToScroll: 1,
    beforeChange: (_, next) => {
      setActive(next)
    },
    appendDots: dots => (
      <div
        style={{
          position: "absolute",
          bottom: "8%",
          left: "50%",
          transform: "translateX(-50%)",
        }}
      >
        <ul style={{
          margin: "0px",
          display: "flex",
          gap: "16px",
          justifyContent: "center",
          alignItems: "center",
          padding: "20px 0",
          listStyle: "none"
        }}> {dots} </ul>
      </div>
    ),
    customPaging: i => (
      <div className="relative group cursor-pointer">
        <div className={`
          relative w-12 h-1 rounded-full overflow-hidden transition-all duration-700 ease-in-out
          ${i === active ? 'bg-white/30' : 'bg-white/20 hover:bg-white/25'}
        `}>
          <div className={`
            absolute top-0 left-0 h-full rounded-full transition-all duration-700 ease-in-out
            ${i === active
              ? 'w-full bg-gradient-to-red from-teal-400 to-blue-500 shadow-lg shadow-teal-500/50'
              : 'w-0 bg-white/40'
            }
          `} />
        </div>
        <div className={`
          absolute -top-6 left-1/2 transform -translate-x-1/2 transition-all duration-500 ease-in-out
          ${i === active
            ? 'text-white font-bold text-xs opacity-100 scale-110'
            : 'text-white/60 font-medium text-xs opacity-70 scale-100 group-hover:opacity-90 group-hover:scale-105'
          }
        `}>
          {String(i + 1).padStart(2, '0')}
        </div>
        <div className={`
          absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
          w-1.5 h-1.5 rounded-full transition-all duration-300 ease-in-out
          ${i === active
            ? 'bg-white scale-100 opacity-100 shadow-lg shadow-white/50'
            : 'bg-white/60 scale-0 opacity-0 group-hover:scale-75 group-hover:opacity-80'
          }
        `} />
      </div>
    ),
  }

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <form onSubmit={handleSendCode} className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Forgot your password?</h2>
              <p className="text-gray-600 mb-8">Don't worry, happens to all of us. Enter your email below to recover your password</p>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="john.doe@gmail.com"
                className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !formData.email.trim()}
              className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white transition-color cursor-pointer ${loading || !formData.email.trim()
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-teal-500 hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500'
                }`}
            >
              {loading ? 'Sending...' : 'Submit'}
            </button>
          </form>
        )

      case 2:
        return (
          <form onSubmit={handleVerifyCode} className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Verify code</h2>
              <p className="text-gray-600 mb-8">An authentication code has been sent to your email.</p>
            </div>

            <div>
              <label htmlFor="verificationCode" className="block text-sm font-medium text-gray-700 mb-1">
                Enter Code
              </label>
              <input
                id="verificationCode"
                name="verificationCode"
                type="text"
                required
                maxLength="6"
                value={formData.verificationCode}
                onChange={handleChange}
                placeholder="Enter 6-digit code"
                className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 sm:text-sm text-center text-lg tracking-widest"
              />
            </div>

            <button
              type="submit"
              disabled={loading || formData.verificationCode.length !== 6}
              className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white transition-colors cursor-pointer ${loading || formData.verificationCode.length !== 6
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-teal-500 hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500'
                }`}
            >
              {loading ? 'Verifying...' : 'Verify'}
            </button>

            <div className="text-center">
              <span className="text-sm text-gray-600">
                Didn't receive a code?{' '}
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="font-medium text-teal-600 hover:text-teal-500 cursor-pointer"
                >
                  Resend
                </button>
              </span>
            </div>
          </form>
        )

      case 3:
        return (
          <form onSubmit={handleResetPassword} className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Set a password</h2>
              <p className="text-gray-600 mb-8">Your previous password has been reset. Please set a new password for your account.</p>
            </div>

            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Create Password
              </label>
              <input
                id="newPassword"
                name="newPassword"
                type="password"
                required
                value={formData.newPassword}
                onChange={handleChange}
                placeholder="••••••••••••"
                className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Re-enter Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••••••"
                className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !formData.newPassword || !formData.confirmPassword}
              className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white transition-colors cursor-pointer ${loading || !formData.newPassword || !formData.confirmPassword
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-teal-500 hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500'
                }`}
            >
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        )

      default:
        return null
    }
  }
  return (
    <div className="min-h-screen">
      <Container>
        <div className="min-h-screen flex">
          {/* Left Side - Form */}
          <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-white">
            <div className="max-w-md w-full space-y-8">
              {/* Logo */}
              <div className="text-center">
                <div className="flex items-center justify-center mb-6">
                  <Image
                    to={'/'}
                    src={logoImage}
                    alt="Dream Holidays"
                    className="h-8 w-auto mr-2"
                  />
                </div>
              </div>

              {/* Back Button */}
              <div className="flex items-center mb-6">
                <Link
                  to="/login"
                  className="flex items-center text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  <span className="text-sm font-medium">Back to login</span>
                </Link>
              </div>

              {/* Messages */}
              {message && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <p className="text-green-800 text-sm">{message}</p>
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              )}

              {/* Form Steps */}
              {renderStep()}

              {/* Step Indicator */}
              <div className="flex justify-center space-x-2 mt-8">
                {[1, 2, 3].map((stepNumber) => (
                  <div
                    key={stepNumber}
                    className={`w-2 h-2 rounded-full transition-colors ${stepNumber === step
                      ? 'bg-teal-500'
                      : stepNumber < step
                        ? 'bg-teal-300'
                        : 'bg-gray-300'
                      }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Right Side - Slider */}
          <div className="hidden lg:block relative flex-1 min-h-screen overflow-hidden rounded-xl">
            <Slider {...sliderSettings}>
              {sliderData.map((slide) => (
                <div key={slide.id}>
                  <div className='h-screen flex items-center justify-center relative'>
                    <div className='w-full h-[816px] relative'>
                      <Image src={slide.image} className="w-full h-full object-cover rounded-xl" />
                      <div className='absolute inset-0 bg-opacity-30'></div>
                      <div className='absolute bottom-16 left-8 right-8 text-white'>
                        <h3 className='text-2xl sm:text-3xl lg:text-4xl font-bold font-league mb-3 leading-tight'>
                          {slide.title}
                        </h3>
                        <p className='text-base sm:text-lg lg:text-xl font-medium font-montserrat opacity-90 leading-relaxed max-w-md'>
                          {slide.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </Slider>
          </div>
        </div>
      </Container>
    </div>
  )
}

export default ForgotPassword