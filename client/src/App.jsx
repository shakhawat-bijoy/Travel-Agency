import { Provider } from 'react-redux'
import { store } from './store/store'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import AddPaymentMethod from './pages/AddPaymentMethod'
import Account from './pages/Account'
import BookingTest from './components/test/BookingTest'
import ProtectedRoute from './components/common/ProtectedRoute'
import FlightBooking from './components/flights/FlightBooking'
import ConfirmBooking from './pages/ConfirmBooking'
import BookingSuccess from './components/flights/BookingSuccess'

import {
  createRoutesFromElements,
  createBrowserRouter,
  Route,
  RouterProvider,
} from "react-router-dom";

import RootLayout from './components/common/RootLayout'
import Flights from './pages/Flights'
import FlightResults from './components/flights/FlightResults'
import Hotels from './pages/Hotels'


const App = () => {
  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route
        path="/"
        element={<RootLayout />}
      // errorElement={<Error />}
      >
        <Route index element={<Home />} ></Route>
        <Route path="/login" element={<Login />}></Route>
        <Route path="/register" element={<Register />}></Route>
        <Route path="/forgot-password" element={<ForgotPassword />}></Route>
        <Route path="/add-payment-method" element={<AddPaymentMethod />}></Route>
        <Route path="/account" element={
          <ProtectedRoute>
            <Account />
          </ProtectedRoute>
        }></Route>
        <Route path="/test-booking" element={<BookingTest />}></Route>
        <Route path="/flights" element={<Flights />}></Route>
        <Route path="/hotels" element={<Hotels />}></Route>
        <Route path="/flight-results" element={<FlightResults />}></Route>
        <Route path="/book-flight" element={<FlightBooking />}></Route>
        <Route path="/confirm-booking" element={<ProtectedRoute>
            <ConfirmBooking />
          </ProtectedRoute>}></Route>
        <Route path="/booking-success" element={<BookingSuccess />}></Route>

      </Route>
    )
  );
  return (
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  )
}

export default App