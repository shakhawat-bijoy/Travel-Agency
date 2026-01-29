import { useRouteError, Link } from 'react-router-dom'
import { Home, ArrowLeft, RefreshCw, AlertTriangle } from 'lucide-react'

const Error = () => {
    const error = useRouteError()
    console.error(error)

    const getErrorMessage = () => {
        if (error?.status === 404) {
            return {
                title: '404 - Page Not Found',
                message: "Oops! The page you're looking for doesn't exist.",
                suggestion: "It might have been moved or deleted. Let's get you back on track!"
            }
        }

        if (error?.status === 500) {
            return {
                title: '500 - Server Error',
                message: "Something went wrong on our end.",
                suggestion: "We're working to fix it. Please try again later."
            }
        }

        return {
            title: 'Unexpected Error',
            message: error?.statusText || error?.message || 'An unexpected error occurred.',
            suggestion: "Don't worry, you can return to the homepage or try refreshing the page."
        }
    }

    const { title, message, suggestion } = getErrorMessage()

    return (
        <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 flex items-center justify-center px-4 py-8">
            <div className="max-w-2xl w-full">
                {/* Error Card */}
                <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 border border-gray-100">
                    {/* Icon */}
                    <div className="flex justify-center mb-6">
                        <div className="w-24 h-24 bg-gradient-to-br from-red-100 to-orange-100 rounded-full flex items-center justify-center animate-pulse">
                            <AlertTriangle className="w-12 h-12 text-red-600" />
                        </div>
                    </div>

                    {/* Error Title */}
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-4">
                        {title}
                    </h1>

                    {/* Error Message */}
                    <p className="text-lg text-gray-600 text-center mb-3">
                        {message}
                    </p>

                    <p className="text-base text-gray-500 text-center mb-8">
                        {suggestion}
                    </p>

                    {/* Error Details (Development) */}
                    {import.meta.env.DEV && error?.stack && (
                        <details className="mb-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <summary className="cursor-pointer text-sm font-semibold text-gray-700 hover:text-gray-900">
                                Error Details (Development Only)
                            </summary>
                            <pre className="mt-4 text-xs text-red-600 overflow-auto max-h-64">
                                {error.stack}
                            </pre>
                        </details>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            to="/"
                            className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-xl hover:from-teal-600 hover:to-cyan-600 transition-all duration-300 shadow-lg hover:shadow-xl font-medium"
                        >
                            <Home className="w-5 h-5" />
                            Go to Homepage
                        </Link>

                        <button
                            onClick={() => window.location.reload()}
                            className="flex items-center justify-center gap-2 px-6 py-3 bg-white text-gray-700 border-2 border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-300 font-medium"
                        >
                            <RefreshCw className="w-5 h-5" />
                            Refresh Page
                        </button>

                        <button
                            onClick={() => window.history.back()}
                            className="flex items-center justify-center gap-2 px-6 py-3 bg-white text-gray-700 border-2 border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-300 font-medium"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            Go Back
                        </button>
                    </div>
                </div>

                {/* Decorative Elements */}
                <div className="mt-8 text-center">
                    <p className="text-sm text-gray-500">
                        Need help? Contact our{' '}
                        <Link to="/contact" className="text-teal-600 hover:text-teal-700 font-semibold">
                            support team
                        </Link>
                    </p>
                </div>

                {/* Floating Shapes */}
                <div className="absolute top-20 left-10 w-20 h-20 bg-teal-200 rounded-full opacity-20 blur-xl animate-pulse"></div>
                <div className="absolute bottom-20 right-10 w-32 h-32 bg-cyan-200 rounded-full opacity-20 blur-xl animate-pulse delay-1000"></div>
            </div>
        </div>
    )
}

export default Error
