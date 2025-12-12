import React from 'react'
import Container from '../common/Container'
import Button from '../common/Buttton'
import { FaStar } from 'react-icons/fa6'
import { MdLocationOn } from 'react-icons/md'

const Packeges = () => {
  const recommendedPackages = [
    {
      id: 1,
      title: 'Bangkok & Pattaya Adventure',
      location: 'Thailand',
      duration: '7 Days / 6 Nights',
      image: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=600&q=80',
      price: 899,
      originalPrice: 1299,
      rating: 4.8,
      reviews: 342,
      features: ['Flights', 'Hotels', 'Transfers', 'Breakfast'],
      discount: '30% OFF',
      badge: 'Best Seller'
    },
    {
      id: 2,
      title: 'Dubai Desert Safari',
      location: 'United Arab Emirates',
      duration: '5 Days / 4 Nights',
      image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&q=80',
      price: 1199,
      originalPrice: 1599,
      rating: 4.9,
      reviews: 528,
      features: ['Flights', 'Hotels', 'Desert Safari', 'City Tour'],
      discount: '25% OFF',
      badge: 'Trending'
    },
    {
      id: 3,
      title: 'Maldives Paradise Escape',
      location: 'Maldives',
      duration: '6 Days / 5 Nights',
      image: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=600&q=80',
      price: 1899,
      originalPrice: 2499,
      rating: 5.0,
      reviews: 421,
      features: ['Flights', 'Resort', 'Water Sports', 'All Meals'],
      discount: '24% OFF',
      badge: 'Luxury'
    },
    {
      id: 4,
      title: 'Turkey Heritage Tour',
      location: 'Turkey',
      duration: '8 Days / 7 Nights',
      image: 'https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?w=600&q=80',
      price: 1299,
      originalPrice: 1799,
      rating: 4.7,
      reviews: 289,
      features: ['Flights', 'Hotels', 'City Tours', 'Breakfast'],
      discount: '28% OFF',
      badge: 'Popular'
    },
    {
      id: 5,
      title: 'Singapore City Break',
      location: 'Singapore',
      duration: '4 Days / 3 Nights',
      image: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=600&q=80',
      price: 799,
      originalPrice: 1099,
      rating: 4.6,
      reviews: 312,
      features: ['Flights', 'Hotels', 'City Pass', 'Breakfast'],
      discount: '27% OFF',
      badge: 'New'
    },
    {
      id: 6,
      title: 'Bali Tropical Paradise',
      location: 'Indonesia',
      duration: '7 Days / 6 Nights',
      image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&q=80',
      price: 1099,
      originalPrice: 1499,
      rating: 4.8,
      reviews: 456,
      features: ['Flights', 'Resort', 'Temple Tours', 'Spa'],
      discount: '27% OFF',
      badge: 'Top Rated'
    }
  ]

  return (
    <div className="py-12 sm:py-16 lg:py-20 bg-gradient-to-b from-gray-50 to-white">
      <Container className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-8 sm:mb-12 lg:mb-16 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl lg:text-[32px] font-bold text-gray-900 mb-2 font-montserrat">
              Recommended for You
            </h2>
            <p className="text-sm sm:text-base lg:text-lg text-gray-600 font-montserrat">
              Handpicked travel packages tailored to your preferences
            </p>
          </div>
          <div className="flex justify-start sm:justify-end">
            <Button
              text="View All Packages"
              className="bg-teal-600 text-white px-5 sm:px-6 py-2.5 rounded-lg hover:bg-teal-700 transition-colors text-sm lg:text-base font-medium shadow-md"
              to="/packages"
            />
          </div>
        </div>

        {/* Packages Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {recommendedPackages.map((pkg) => (
            <div
              key={pkg.id}
              className="bg-white rounded-2xl transition-all duration-300 overflow-hidden group cursor-pointer"
            >
              {/* Image Section */}
              <div className="relative h-56 sm:h-60 lg:h-64 overflow-hidden">
                <img
                  src={pkg.image}
                  alt={pkg.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                
                {/* Badges */}
                <div className="absolute top-3 left-3 flex gap-2">
                  <span className="bg-teal-600 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-md">
                    {pkg.badge}
                  </span>
                  <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-md">
                    {pkg.discount}
                  </span>
                </div>

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
              </div>

              {/* Content Section */}
              <div className="p-5 sm:p-6">
                {/* Location */}
                <div className="flex items-center gap-1 text-gray-500 mb-2">
                  <MdLocationOn className="text-teal-600 text-base sm:text-lg" />
                  <span className="text-xs sm:text-sm font-medium">{pkg.location}</span>
                </div>

                {/* Title */}
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 font-montserrat line-clamp-2 group-hover:text-teal-600 transition-colors">
                  {pkg.title}
                </h3>

                {/* Duration */}
                <p className="text-sm text-gray-600 mb-3 font-medium">
                  {pkg.duration}
                </p>

                {/* Features */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {pkg.features.map((feature, index) => (
                    <span
                      key={index}
                      className="bg-teal-50 text-teal-700 px-3 py-1 rounded-full text-xs font-medium"
                    >
                      {feature}
                    </span>
                  ))}
                </div>

                {/* Rating */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center gap-1">
                    <FaStar className="text-yellow-400 text-sm" />
                    <span className="text-sm font-bold text-gray-900">{pkg.rating}</span>
                  </div>
                  <span className="text-xs text-gray-500">({pkg.reviews} reviews)</span>
                </div>

                {/* Price Section */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div>
                    <p className="text-xs text-gray-500 line-through mb-1">
                      ${pkg.originalPrice}
                    </p>
                    <p className="text-2xl font-bold text-teal-600">
                      ${pkg.price}
                      <span className="text-sm text-gray-500 font-normal"> /person</span>
                    </p>
                  </div>
                  <Button
                    text="Book Now"
                    className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors text-sm font-medium shadow-md"
                    to={`/packages/${pkg.id}`}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-12 sm:mt-16 lg:mt-20 bg-gradient-to-r from-teal-600 to-teal-500 rounded-2xl p-8 sm:p-10 lg:p-12 text-center shadow-xl">
          <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4 font-montserrat">
            Can't find what you're looking for?
          </h3>
          <p className="text-white/90 text-sm sm:text-base lg:text-lg mb-6 max-w-2xl mx-auto">
            Let us create a custom package just for you. Tell us your dream destination and we'll handle the rest.
          </p>
          <Button
            text="Create Custom Package"
            className="bg-white text-teal-600 px-6 sm:px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors text-sm lg:text-base font-semibold shadow-lg"
            to="/custom-package"
          />
        </div>
      </Container>
    </div>
  )
}

export default Packeges
