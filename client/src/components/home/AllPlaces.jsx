import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPin, Plane, Building2, Utensils, Landmark, X, BookOpen } from 'lucide-react'
import Container from '../common/Container'
import Button from '../common/Buttton'
import Breadcrumb from '../common/Breadcrumb'
import { destinations } from '../../data/destinations'
import { packagesData } from '../../data/packages'

const AllPlaces = () => {
  const [selected, setSelected] = useState(null)
  const navigate = useNavigate()

  const handlePlanTrip = (place) => {
    const city = place.name.split(',')[0].trim().toLowerCase()
    const country = place.name.split(',')[1]?.trim().toLowerCase() || ''

    const match = packagesData.find((pkg) => {
      const title = pkg.title?.toLowerCase() || ''
      const location = pkg.location?.toLowerCase() || ''
      return (
        title.includes(city) ||
        title.includes(country) ||
        location.includes(city) ||
        location.includes(country)
      )
    })

    setSelected(null)
    if (match) {
      navigate(`/packages/${match.id}`, { state: { fromDestination: place.id } })
    } else {
      navigate('/packages', { state: { query: place.name } })
    }
  }

  return (
    <div className="py-4 sm:py-16 lg:py-8 bg-gray-50">
      <Container className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-0">
        <Breadcrumb
          items={[
            { label: 'Home', to: '/' },
            { label: 'Places' },
          ]}
          className="mb-6 sm:mb-8"
        />
        <div className="mb-10 sm:mb-12 text-center">
          <p className="uppercase tracking-[0.25em] text-blue-700 text-xs sm:text-sm font-semibold mb-2">All places</p>
          <h1 className="text-3xl sm:text-4xl lg:text-[40px] font-bold text-gray-900 leading-tight">Find your next escape</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-3">
            Browse destinations, tap a card for history and highlights, then plan the perfect package.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {destinations.map((place) => (
            <button
              key={place.id}
              onClick={() => setSelected(place)}
              className="text-left bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer"
            >
              <div className="h-44 sm:h-52 w-full overflow-hidden">
                <img
                  src={place.image}
                  alt={place.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
              </div>
              <div className="p-5 space-y-3">
                <div className="flex items-center gap-2 text-teal-700 font-semibold text-sm">
                  <MapPin className="w-4 h-4" />
                  <span>{place.name}</span>
                </div>
                <p className="text-gray-700 text-sm line-clamp-2">{place.description}</p>
                <div className="flex flex-wrap gap-2">
                  {place.services.map((service, idx) => (
                    <span
                      key={idx}
                      className="text-xs font-semibold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-100"
                    >
                      {service}
                    </span>
                  ))}
                </div>
              </div>
            </button>
          ))}
        </div>

        {selected && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto no-scrollbar shadow-2xl">
              <div className="relative">
                <img
                  src={selected.image}
                  alt={selected.name}
                  className="w-full h-64 sm:h-80 object-cover rounded-t-2xl"
                />
                <button
                  aria-label="Close details"
                  onClick={() => setSelected(null)}
                  className="absolute top-3 right-3 bg-black/60 text-white rounded-full p-2 hover:bg-black/80"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 sm:p-8 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 text-teal-700 font-semibold text-sm">
                      <MapPin className="w-4 h-4" />
                      <span>{selected.name}</span>
                    </div>
                    <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">{selected.description}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selected.services.map((service, idx) => (
                      <span key={idx} className="text-xs font-semibold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-100">
                        {service}
                      </span>
                    ))}
                  </div>
                </div>

                <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
                  {selected.historyLong || selected.history}
                </p>

                {selected.blogPosts?.length > 0 && (
                  <div className="p-4 rounded-xl bg-white border border-gray-200">
                    <div className="flex items-center gap-2 text-gray-900 font-semibold mb-3">
                      <BookOpen className="w-4 h-4 text-teal-700" />
                      <span>Travel blog picks</span>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {selected.blogPosts.map((post, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-lg border border-gray-100 bg-white hover:border-teal-200 hover:bg-teal-50/60 transition-colors"
                        >
                          <p className="text-sm font-semibold text-gray-900">{post.title}</p>
                          {post.excerpt && <p className="text-xs text-gray-600 mt-1">{post.excerpt}</p>}
                          {post.details && <p className="text-xs text-gray-700 mt-1 leading-relaxed">{post.details}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selected.bestTime && (
                  <div className="p-4 rounded-xl bg-white border border-gray-200">
                    <div className="flex items-center gap-2 text-gray-900 font-semibold mb-2">
                      <Landmark className="w-4 h-4 text-teal-700" />
                      <span>Best time to visit</span>
                    </div>
                    <p className="text-sm text-gray-700">{selected.bestTime}</p>
                  </div>
                )}

                <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="p-4 rounded-xl bg-teal-50 border border-teal-100">
                    <div className="flex items-center gap-2 text-teal-800 font-semibold mb-2">
                      <Landmark className="w-4 h-4" />
                      <span>Must-see spots</span>
                    </div>
                    <ul className="text-sm text-teal-900 space-y-1">
                      {selected.touristSpots.map((spot, idx) => (
                        <li key={idx}>• {spot}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 rounded-xl bg-white border border-gray-200 space-y-3">
                    <div className="flex items-center gap-2 text-gray-900 font-semibold">
                      <Plane className="w-4 h-4 text-teal-700" />
                      <span>Nearby airport</span>
                    </div>
                    <p className="text-sm text-gray-700">{selected.nearbyAirport}</p>

                    <div className="flex items-center gap-2 text-gray-900 font-semibold">
                      <Building2 className="w-4 h-4 text-teal-700" />
                      <span>Accommodation</span>
                    </div>
                    <p className="text-sm text-gray-700">{selected.accommodation}</p>

                    <div className="flex items-center gap-2 text-gray-900 font-semibold">
                      <Utensils className="w-4 h-4 text-teal-700" />
                      <span>Food to try</span>
                    </div>
                    <p className="text-sm text-gray-700">{selected.food}</p>
                  </div>
                </div>



                <div className="flex justify-end gap-3 pt-2">
                  <Button
                    text="Close"
                    className="bg-white border border-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm font-semibold"
                    onClick={() => setSelected(null)}
                  />
                  <Button
                    text="Plan this trip"
                    className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors text-sm font-semibold"
                    onClick={() => handlePlanTrip(selected)}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </Container>
    </div>
  )
}

export default AllPlaces
