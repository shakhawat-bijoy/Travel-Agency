import { useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { auth, authAPI } from '../../utils/api'

const ProtectedRoute = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(null) // null = loading, true/false = result
    const [isLoading, setIsLoading] = useState(true)
    const location = useLocation()

    useEffect(() => {
        const checkAuth = async () => {
            try {
                // Check if user has token in localStorage
                const { token } = auth.getUserData()

                if (!token) {
                    setIsAuthenticated(false)
                    setIsLoading(false)
                    return
                }

                // Verify token with backend
                const response = await authAPI.getProfile()
                if (response.success) {
                    setIsAuthenticated(true)
                    // Update user data in localStorage if needed
                    auth.saveUserData(token, response.user)
                } else {
                    // Token is invalid, clear it
                    auth.logout()
                    setIsAuthenticated(false)
                }
            } catch (error) {
                console.error('Auth check failed:', error)
                // Token is invalid or expired, clear it
                auth.logout()
                setIsAuthenticated(false)
            } finally {
                setIsLoading(false)
            }
        }

        checkAuth()
    }, [])

    // Show loading spinner while checking authentication
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Verifying authentication...</p>
                </div>
            </div>
        )
    }

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />
    }

    // Render protected content if authenticated
    return children
}

export default ProtectedRoute