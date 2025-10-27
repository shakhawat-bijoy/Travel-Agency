import { useState, useEffect } from 'react'
import { Plane, Building2, Menu, X } from 'lucide-react'
import Container from './Container'
import Button from './Buttton'
import Image from './Image'
import logoImage from '../../assets/images/logo.png'
import { Link, useLocation } from 'react-router'
import { auth } from '../../utils/api'

const Navbar = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const location = useLocation()
    const isAccountPage = location.pathname === '/account'

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen)
    }

    // Check authentication status
    useEffect(() => {
        const checkAuth = () => {
            const isLoggedIn = auth.isAuthenticated()
            setIsAuthenticated(isLoggedIn)
        }

        checkAuth()

        // Listen for storage changes (login/logout from other tabs)
        const handleStorageChange = () => {
            checkAuth()
        }

        window.addEventListener('storage', handleStorageChange)
        return () => window.removeEventListener('storage', handleStorageChange)
    }, [])

    const handleLogout = () => {
        auth.logout()
        setIsAuthenticated(false)
        window.location.href = '/'
    }

    return (
        <nav className={`absolute ${isAccountPage ? 'top-0' : 'md:top-5 top-0'} left-0 right-0 z-50 bg-transparent`}>
            <Container className='px-2'>
                <div className="relative z-10 flex items-center justify-between py-4">
                    {/* Left Side - Navigation Tabs (Desktop) */}
                    <div className="hidden lg:flex items-center gap-4">
                        <Link to={'/'} className={`flex items-center gap-1 px-4 py-2 rounded-lg transition-all duration-300 ${isAccountPage ? 'hover:bg-gray-100' : 'hover:bg-white/10'}`}>
                            <Plane className={`w-4 h-4 ${isAccountPage ? 'text-black' : 'text-white'}`} />
                            <span className={isAccountPage ? 'text-black' : 'text-white'}>Find Flights</span>
                        </Link>

                        <Link to={'/'} className={`flex items-center gap-1 px-4 py-2 rounded-lg transition-all duration-300 ${isAccountPage ? 'hover:bg-gray-100' : 'hover:bg-white/10'}`}>
                            <Building2 className={`w-4 h-4 ${isAccountPage ? 'text-black' : 'text-white'}`} />
                            <span className={isAccountPage ? 'text-black' : 'text-white'}>Find Stays</span>
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={toggleMobileMenu}
                        className={`lg:hidden p-2 rounded-lg transition-all duration-300 ${isAccountPage ? 'text-black hover:bg-gray-100' : 'text-white hover:bg-white/10'}`}
                        aria-label="Toggle mobile menu"
                    >
                        {isMobileMenuOpen ? (
                            <X className="w-6 h-6" />
                        ) : (
                            <Menu className="w-6 h-6" />
                        )}
                    </button>

                    {/* Center - Logo */}
                    <div className="flex items-center space-x-2">
                        <Image
                            to={'/'}
                            src={logoImage}
                            alt="Dream Holidays"
                            className="h-10 md:h-12 w-auto"
                        />
                    </div>

                    {/* Right Side - Auth Buttons (Desktop) */}
                    <div className="hidden lg:flex items-center space-x-3">
                        {isAuthenticated ? (
                            <>
                                <Button
                                    text="My Account"
                                    to="/account"
                                    className={isAccountPage ? 'text-black hover:bg-gray-100 font-medium px-4 py-2 transition-all duration-500 rounded-lg' : 'text-white hover:text-black hover:bg-white font-medium px-4 py-2 transition-all duration-500 rounded-lg'}
                                />
                                <button
                                    onClick={handleLogout}
                                    className={isAccountPage ? 'text-black hover:bg-gray-100 font-medium px-4 py-2 transition-all duration-500 rounded-lg' : 'text-white hover:text-black hover:bg-white font-medium px-4 py-2 transition-all duration-500 rounded-lg'}
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Button
                                    text="Login"
                                    to="/login"
                                    className={isAccountPage ? 'text-black hover:bg-gray-100 font-medium px-4 py-2 transition-all duration-500 rounded-lg' : 'text-white hover:text-black hover:bg-white font-medium px-4 py-2 transition-all duration-500 rounded-lg'}
                                />

                                <Button
                                    text="Sign up"
                                    to="/register"
                                    className={isAccountPage ? 'text-black hover:bg-gray-100 font-medium px-4 py-2 transition-all duration-500 rounded-lg' : 'text-white hover:text-black hover:bg-white font-medium px-4 py-2 transition-all duration-500 rounded-lg'}
                                />
                            </>
                        )}
                    </div>

                    {/* Mobile Auth Buttons (Tablet) */}
                    <div className="hidden md:flex lg:hidden items-center space-x-2">
                        {isAuthenticated ? (
                            <>
                                <Button
                                    text="My Account"
                                    to="/account"
                                    className={isAccountPage ? 'text-black hover:text-white hover:bg-black font-medium px-3 py-2 text-sm transition-all duration-500 rounded-lg' : 'text-white hover:text-black hover:bg-white font-medium px-3 py-2 text-sm transition-all duration-500 rounded-lg'}
                                />
                                <button
                                    onClick={handleLogout}
                                    className={isAccountPage ? 'text-black hover:text-white hover:bg-black font-medium px-3 py-2 text-sm transition-all duration-500 rounded-lg' : 'text-white hover:text-black hover:bg-white font-medium px-3 py-2 text-sm transition-all duration-500 rounded-lg'}
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Button
                                    text="Login"
                                    to="/login"
                                    className={isAccountPage ? 'text-black hover:text-white hover:bg-black font-medium px-3 py-2 text-sm transition-all duration-500 rounded-lg' : 'text-white hover:text-black hover:bg-white font-medium px-3 py-2 text-sm transition-all duration-500 rounded-lg'}
                                />

                                <Button
                                    text="Sign up"
                                    to="/register"
                                    className={isAccountPage ? 'text-black hover:text-white hover:bg-black font-medium px-3 py-2 text-sm transition-all duration-500 rounded-lg' : 'text-white hover:text-black hover:bg-white font-medium px-3 py-2 text-sm transition-all duration-500 rounded-lg'}
                                />
                            </>
                        )}
                    </div>
                </div>

                {/* Mobile Menu Overlay */}
                {isMobileMenuOpen && (
                    <div className="lg:hidden absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-md rounded-xl shadow-lg border border-white/20">
                        <div className="p-4 space-y-4">
                            {/* Mobile Navigation Links */}
                            <div className="space-y-2">
                                <Link
                                    to={'/'}
                                    className='flex items-center gap-2 px-4 py-3 rounded-lg transition-all duration-300 hover:bg-gray-100 text-gray-800'
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    <Plane className="w-5 h-5 text-teal-600" />
                                    <span className="font-medium">Find Flights</span>
                                </Link>

                                <Link
                                    to={'/'}
                                    className='flex items-center gap-2 px-4 py-3 rounded-lg transition-all duration-300 hover:bg-gray-100 text-gray-800'
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    <Building2 className="w-5 h-5 text-teal-600" />
                                    <span className="font-medium">Find Stays</span>
                                </Link>
                            </div>

                            {/* Mobile Auth Buttons */}
                            <div className="md:hidden pt-4 border-t border-gray-200 space-y-2">
                                {isAuthenticated ? (
                                    <>
                                        <Button
                                            text="My Account"
                                            to="/account"
                                            className="w-full text-center bg-transparent border border-teal-600 text-teal-600 hover:bg-teal-600 hover:text-white font-medium px-4 py-3 transition-all duration-300 rounded-lg"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                        />

                                        <button
                                            onClick={() => {
                                                handleLogout()
                                                setIsMobileMenuOpen(false)
                                            }}
                                            className="w-full text-center bg-transparent border border-red-600 text-red-600 hover:bg-red-600 hover:text-white font-medium px-4 py-3 transition-all duration-300 rounded-lg"
                                        >
                                            Logout
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <Button
                                            text="Login"
                                            to="/login"
                                            className="w-full text-center bg-transparent border border-teal-600 text-teal-600 hover:bg-teal-600 hover:text-white font-medium px-4 py-3 transition-all duration-300 rounded-lg"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                        />

                                        <Button
                                            text="Sign up"
                                            to="/register"
                                            className="w-full text-center bg-transparent border border-teal-600 text-teal-600 hover:bg-teal-600 hover:text-white font-medium px-4 py-3 transition-all duration-300 rounded-lg"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                        />
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </Container>
        </nav>
    )
}

export default Navbar