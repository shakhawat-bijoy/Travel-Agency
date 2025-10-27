import React from 'react'
import Container from '../common/Container'
import Button from '../common/Buttton'

const FlightHotelCard = () => {
  const cards = [
    {
      id: 1,
      type: 'Flights',
      title: 'Flights',
      description: 'Search Flights & Places Hire to our most popular destinations',
      image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=600&h=400&fit=crop',
      buttonText: 'Show Flights',
      buttonLink: '/flights',
      overlay: 'bg-black bg-opacity-40'
    },
    {
      id: 2,
      type: 'Hotels',
      title: 'Hotels',
      description: 'Search Hotels & Places Hire to our most popular destinations',
      image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&h=400&fit=crop',
      buttonText: 'Show Hotels',
      buttonLink: '/hotels',
      overlay: 'bg-black bg-opacity-40'
    }
  ]

  return (
    <div className="py-16 bg-white">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {cards.map((card) => (
            <div
              key={card.id}
              className="relative h-80 rounded-2xl overflow-hidden group cursor-pointer shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {/* Background Image */}
              <div className="absolute inset-0">
                <img
                  src={card.image}
                  alt={card.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className={`absolute inset-0 ${card.overlay} group-hover:bg-opacity-50 transition-all duration-300`}></div>
              </div>

              {/* Content Overlay */}
              <div className="relative z-10 h-full flex flex-col justify-center items-center text-center p-8">
                <h3 className="text-4xl font-bold text-white mb-4 group-hover:scale-105 transition-transform duration-300">
                  {card.title}
                </h3>
                <p className="text-white text-lg mb-8 max-w-md opacity-90 group-hover:opacity-100 transition-opacity duration-300">
                  {card.description}
                </p>

                <Button
                  text={card.buttonText}
                  to={card.buttonLink}
                  className="bg-teal-500 hover:bg-teal-600 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300 transform group-hover:scale-105 shadow-lg"
                />
              </div>

              {/* Decorative Elements */}
              <div className="absolute top-4 right-4 w-12 h-12 border-2 border-white border-opacity-30 rounded-full flex items-center justify-center">
                {card.type === 'Flights' ? (
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                  </svg>
                )}
              </div>

              {/* Bottom Gradient */}
              <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
            </div>
          ))}
        </div>

        {/* Additional Info Section */}
        <div className="mt-16 text-center">
          <h4 className="text-2xl font-semibold text-gray-800 mb-4">
            Why Choose Us?
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-teal-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <h5 className="text-lg font-semibold text-gray-800 mb-2">Best Prices</h5>
              <p className="text-gray-600">We guarantee the best prices for flights and hotels</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-teal-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <h5 className="text-lg font-semibold text-gray-800 mb-2">24/7 Support</h5>
              <p className="text-gray-600">Round-the-clock customer support for your peace of mind</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-teal-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h5 className="text-lg font-semibold text-gray-800 mb-2">Secure Booking</h5>
              <p className="text-gray-600">Your bookings are protected with advanced security</p>
            </div>
          </div>
        </div>
      </Container>
    </div>
  )
}

export default FlightHotelCard