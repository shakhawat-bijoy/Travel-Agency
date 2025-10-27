import { Outlet, useLocation } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'


const RootLayout = () => {
  const location = useLocation()
  const hideNavbarRoutes = ['/login', '/register', '/forgot-password', '/add-payment-method']
  const hideFooterRoutes = ['/login', '/register', '/forgot-password', '/add-payment-method']
  const shouldHideNavbar = hideNavbarRoutes.includes(location.pathname)
  const shouldHideFooter = hideFooterRoutes.includes(location.pathname)
  const isHomePage = location.pathname === '/'

  return (
    <div>

      {!shouldHideNavbar && <Navbar />}

      <div className={isHomePage ? 'mt-0' : 'mt-20'}>
        <Outlet />
      </div>

      {!shouldHideFooter && <Footer />}

    </div>
  )
}

export default RootLayout