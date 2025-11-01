import React from 'react'
import Container from '../common/Container'
import Button from '../common/Buttton'
import flights from '../../assets/images/flights.jpg'
import hotels from '../../assets/images/hotels.jpg'

const FlightHotelCard = () => {
  const cards = [
    {
      id: 1,
      type: 'Flights',
      title: 'Flights',
      description: 'Search Flights & Places Hire to our most popular destinations',
      image: flights,
      buttonText: 'Show Flights',
      buttonLink: '/flights',
      overlay: 'bg-black bg-opacity-40'
    },
    {
      id: 2,
      type: 'Hotels',
      title: 'Hotels',
      description: 'Search Hotels & Places Hire to our most popular destinations',
      image: hotels,
      buttonText: 'Show Hotels',
      buttonLink: '/hotels',
      overlay: 'bg-black bg-opacity-40'
    }
  ]

  return (
    <div className="py-8 sm:py-12 lg:py-16 bg-white px-2 md:px-0">
      <Container className={'w-[1280px]'}>
        <div className="flex flex-wrap justify-between items-center gap-4 sm:gap-6 lg:gap-8">
          {cards.map((card) => (
            <div
              key={card.id}
              className="relative w-full max-w-[604px] mx-auto h-[400px] sm:h-[480px] md:h-[520px] lg:h-[559px] rounded-xl sm:rounded-2xl overflow-hidden group cursor-pointer shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {/* Background Image */}
              <div className="absolute inset-0">
                <img
                  src={card.image}
                  alt={card.title}
                  className="w-full h-full object-cover"
                />
                
              </div>

              {/* Content Overlay */}
              <div className="relative z-10 h-full flex flex-col justify-center items-center text-center p-4 sm:p-6 lg:p-8">
                <h3 className="font-bold text-3xl sm:text-4xl lg:text-[40px] font-serif text-white mb-2 sm:mb-1">
                  {card.title}
                </h3>
                <p className="text-white text-sm sm:text-base lg:text-lg mb-4 sm:mb-2 max-w-xs sm:max-w-sm lg:max-w-md px-2">
                  {card.description}
                </p>

                <Button
                  text={card.buttonText}
                  to={card.buttonLink}
                  className="bg-teal-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-teal-700 transition-colors"
                />
              </div>

              {/* Decorative Elements */}
              <div className="absolute top-3 right-3 sm:top-4 sm:right-4 w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 border-2 border-white border-opacity-30 rounded-full flex items-center justify-center">
                {card.type === 'Flights' ? (
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                  </svg>
                )}
              </div>

              {/* Bottom Gradient */}
              <div className="absolute bottom-0 left-0 right-0 h-24 sm:h-28 lg:h-32 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
            </div>
          ))}
        </div>

        {/* Additional Info Section */}
        <div className="mt-8 sm:mt-12 lg:mt-16 text-center px-4 sm:px-0">
          <h4 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-gray-800 mb-3 sm:mb-4">
            Why Choose Us?
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mt-6 sm:mt-8">
            <div className="text-center px-4 sm:px-0">
              <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <svg className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-teal-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <h5 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">Best Prices</h5>
              <p className="text-sm sm:text-base text-gray-600">We guarantee the best prices for flights and hotels</p>
            </div>

            <div className="text-center px-4 sm:px-0">
              <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <svg className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-teal-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <h5 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">24/7 Support</h5>
              <p className="text-sm sm:text-base text-gray-600">Round-the-clock customer support for your peace of mind</p>
            </div>

            <div className="text-center px-4 sm:px-0 sm:col-span-2 lg:col-span-1">
              <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <svg className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-teal-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h5 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">Secure Booking</h5>
              <p className="text-sm sm:text-base text-gray-600">Your bookings are protected with advanced security</p>
            </div>
          </div>
        </div>
      </Container>
    </div>
  )
}

export default FlightHotelCard