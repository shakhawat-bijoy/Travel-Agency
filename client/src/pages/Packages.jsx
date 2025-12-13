import Container from '../components/common/Container'
import Button from '../components/common/Buttton'
import { FaStar } from 'react-icons/fa6'
import { MdLocationOn } from 'react-icons/md'
import { packagesData } from '../data/packages'

const Packages = () => {
  return (
    <div className="bg-gray-50 min-h-screen py-10 sm:py-14 lg:py-16">
      <Container className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 sm:mb-12">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 font-montserrat">All Packages</h1>
            <p className="text-gray-600 mt-2">Explore every curated trip we offer.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {packagesData.map((pkg) => (
            <div
              key={pkg.id}
              className="bg-white rounded-2xl transition-all duration-300 overflow-hidden group shadow-sm hover:shadow-xl"
            >
              <div className="relative h-56 sm:h-60 lg:h-64 overflow-hidden">
                <img
                  src={pkg.images?.[0]}
                  alt={pkg.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 flex gap-2">
                  <span className="bg-teal-600 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-md">
                    {pkg.badge}
                  </span>
                  <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-md">
                    {pkg.discount}
                  </span>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              </div>

              <div className="p-5 sm:p-6">
                <div className="flex items-center gap-1 text-gray-500 mb-2">
                  <MdLocationOn className="text-teal-600 text-base sm:text-lg" />
                  <span className="text-xs sm:text-sm font-medium">{pkg.location}</span>
                </div>

                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 font-montserrat line-clamp-2 group-hover:text-teal-600 transition-colors">
                  {pkg.title}
                </h3>

                <p className="text-sm text-gray-600 mb-3 font-medium">{pkg.duration}</p>

                <div className="flex flex-wrap gap-2 mb-4">
                  {pkg.features?.map((feature, index) => (
                    <span
                      key={index}
                      className="bg-teal-50 text-teal-700 px-3 py-1 rounded-full text-xs font-medium"
                    >
                      {feature}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center gap-1">
                    <FaStar className="text-yellow-400 text-sm" />
                    <span className="text-sm font-bold text-gray-900">{pkg.rating}</span>
                  </div>
                  <span className="text-xs text-gray-500">({pkg.reviews} reviews)</span>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div>
                    <p className="text-xs text-gray-500 line-through mb-1">${pkg.originalPrice}</p>
                    <p className="text-2xl font-bold text-teal-600">
                      ${pkg.price}
                      <span className="text-sm text-gray-500 font-normal"> /person</span>
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      text="View"
                      className="bg-gray-100 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                      to={`/packages/${pkg.id}`}
                    />
                    <Button
                      text="Book"
                      className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors text-sm font-medium shadow-md"
                      to={`/packages/${pkg.id}`}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </div>
  )
}

export default Packages
