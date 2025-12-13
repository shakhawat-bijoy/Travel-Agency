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
                const { token } = auth.getUserData()

                if (!token) {
                    setIsAuthenticated(false)
                    setIsLoading(false)
                    return
                }

                const response = await authAPI.getProfile()

                if (response.success) {
                    setIsAuthenticated(true)
                    auth.saveUserData(token, response.user)
                    return
                }

                // Non-success without explicit auth failure: keep user signed in but log for visibility
                console.warn('Auth check returned non-success response, keeping session.', response)
                setIsAuthenticated(true)
            } catch (error) {
                const isAuthError = error?.status === 401 || error?.status === 403

                if (isAuthError) {
                    auth.logout()
                    setIsAuthenticated(false)
                } else {
                    // Transient/server errors should not force logout; allow access while backend recovers
                    console.warn('Non-auth error during auth check, keeping session:', error)
                    setIsAuthenticated(true)
                }
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