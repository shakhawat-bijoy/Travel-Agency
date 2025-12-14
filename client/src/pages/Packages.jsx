import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Container from '../components/common/Container'
import Breadcrumb from '../components/common/Breadcrumb'
import Button from '../components/common/Buttton'
import { FaStar } from 'react-icons/fa6'
import { MdLocationOn } from 'react-icons/md'
import { packagesData } from '../data/packages'

const Packages = () => {
  const heroSlides = [
    {
      title: 'Curated Journeys, Seamless Stays',
      subtitle: 'From alpine escapes to island retreats, book handpicked itineraries built for you.',
      image: 'https://images.unsplash.com/photo-1505761671935-60b3a7427bad?w=1600&q=80',
      cta: 'Plan My Escape',
      link: packagesData[0] ? `/packages/${packagesData[0].id}` : '/packages'
    },
    {
      title: 'Chase the Northern Lights',
      subtitle: 'Glass igloos, husky safaris, and starry skies across Norway & Finland.',
      image: 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=1600&q=80',
      cta: 'View Arctic Deals',
      link: packagesData[1] ? `/packages/${packagesData[1].id}` : '/packages'
    },
    {
      title: 'Cities, Culture, Coastlines',
      subtitle: 'Mix heritage walks, food tours, and beach days in one effortless booking.',
      image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1600&q=80',
      cta: 'Browse Packages',
      link: packagesData[2] ? `/packages/${packagesData[2].id}` : '/packages'
    }
  ]

  const [activeSlide, setActiveSlide] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % heroSlides.length)
    }, 6000)
    return () => clearInterval(interval)
  }, [heroSlides.length])

  const goToSlide = (index) => {
    setActiveSlide(index)
  }

  const handlePrev = () => {
    setActiveSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)
  }

  const handleNext = () => {
    setActiveSlide((prev) => (prev + 1) % heroSlides.length)
  }

  return (
    <div className="bg-gray-50 min-h-screen py-5 lg:py-8">
      <Container className="max-w-[1280px] mx-auto px-2 lg:px-0">
        <Breadcrumb
          items={[
            { label: 'Home', to: '/' },
            { label: 'Packages' }
          ]}
          className="mb-4"
        />

        {/* Hero Carousel */}
        <div className="relative overflow-hidden rounded-3xl bg-gray-900 text-white shadow-2xl mb-8 sm:mb-12 lg:mb-16 min-h-[420px] sm:min-h-[460px] lg:min-h-[520px]">
          <div
            className="absolute inset-0 transition-all duration-700"
            style={{ backgroundImage: `url(${heroSlides[activeSlide].image})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/55 to-black/40" />

          <div className="relative px-5 sm:px-10 lg:px-14 py-10 sm:py-16 lg:py-20 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            <div className="max-w-2xl space-y-4">
              <p className="inline-flex items-center gap-2 bg-white/15 text-white px-3 py-1 rounded-full text-xs sm:text-sm tracking-wide uppercase font-semibold">
                Limited-time picks
              </p>
              <h1 className="text-3xl sm:text-4xl lg:text-[40px] font-bold leading-tight font-montserrat drop-shadow-[0_6px_24px_rgba(0,0,0,0.45)]">
                {heroSlides[activeSlide].title}
              </h1>
              <p className="text-white/85 text-base sm:text-lg lg:text-xl max-w-xl">
                {heroSlides[activeSlide].subtitle}
              </p>
              <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                <Button
                  text={heroSlides[activeSlide].cta}
                  className="bg-white text-gray-900 px-5 sm:px-6 py-3 rounded-xl font-semibold shadow-lg hover:bg-gray-100 transition-colors"
                  to={heroSlides[activeSlide].link || '/packages'}
                />
                <button
                  onClick={handlePrev}
                  className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white/15 border border-white/30 backdrop-blur hover:bg-white/25 transition-all cursor-pointer"
                  aria-label="Previous slide"
                >
                  ‹
                </button>
                <button
                  onClick={handleNext}
                  className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white/15 border border-white/30 backdrop-blur hover:bg-white/25 transition-all cursor-pointer"
                  aria-label="Next slide"
                >
                  ›
                </button>
              </div>
            </div>

            <div className="bg-white/15 border border-white/20 rounded-2xl p-5 sm:p-6 lg:p-7 backdrop-blur shadow-xl w-full lg:w-[360px]">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold">Top Rated Picks</span>
                <span className="text-xs bg-white/20 px-3 py-1 rounded-full">{packagesData.length} options</span>
              </div>
              <div className="space-y-3">
                {packagesData.slice(0, 3).map((pkg) => (
                  <div key={pkg.id} className="bg-white/20 border border-white/20 rounded-xl p-3 flex items-center gap-3">
                    <img
                      src={pkg.images?.[0]}
                      alt={pkg.title}
                      className="w-16 h-16 rounded-lg object-cover"
                      loading="lazy"
                    />
                    <div className="flex-1">
                      <Link
                        to={`/packages/${pkg.id}`}
                        className="text-sm font-semibold line-clamp-1 hover:text-teal-200"
                      >
                        {pkg.title}
                      </Link>
                      <p className="text-xs text-white/75">{pkg.location}</p>
                      <div className="flex items-center gap-1 text-xs text-amber-200 mt-1">
                        <FaStar className="w-3.5 h-3.5" />
                        <span className="font-semibold">{pkg.rating}</span>
                        <span className="text-white/60">({pkg.reviews})</span>
                      </div>
                    </div>
                    <Button
                      text="View"
                      className="bg-white text-teal-700 px-3 py-2 rounded-lg text-xs font-semibold hover:bg-gray-100 transition-colors"
                      to={`/packages/${pkg.id}`}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Dots */}
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
            {heroSlides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => goToSlide(idx)}
                className={`h-2.5 rounded-full transition-all cursor-pointer ${
                  activeSlide === idx ? 'w-6 bg-white' : 'w-2 bg-white/50'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 sm:mb-12">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 font-montserrat">All Packages</h1>
            <p className="text-gray-600 mt-2">Explore every curated trip we offer.</p>
          </div>
        </div>

        <div id="packages-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
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

                <Link
                  to={`/packages/${pkg.id}`}
                  className="text-lg sm:text-xl font-bold text-gray-900 mb-2 font-montserrat line-clamp-2 group-hover:text-teal-600 transition-colors block"
                >
                  {pkg.title}
                </Link>

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
