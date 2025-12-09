import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import Navbar from './Navbar'
import Footer from './Footer'
import { restoreSearchResults } from '../../store/slices/flightSlice'


const RootLayout = () => {
  const location = useLocation()
  const dispatch = useDispatch()
  
  const hideNavbarRoutes = ['/login', '/register', '/forgot-password', '/add-payment-method']
  const hideFooterRoutes = ['/login', '/register', '/forgot-password', '/add-payment-method']
  const shouldHideNavbar = hideNavbarRoutes.includes(location.pathname)
  const shouldHideFooter = hideFooterRoutes.includes(location.pathname)
  const isHomePage = location.pathname === '/'
  const isAccountPage = location.pathname === '/account'
  const isOtherRoute = !isHomePage && !isAccountPage

  // Restore search results on app mount
  useEffect(() => {
    dispatch(restoreSearchResults())
  }, [dispatch])

  return (
    <div>

      {!shouldHideNavbar && <Navbar />}

      <div className={isOtherRoute ? 'mt-0' : isHomePage ? 'mt-0' : 'mt-20'}>
        <Outlet />
      </div>

      {!shouldHideFooter && <Footer />}

    </div>
  )
}

export default RootLayout