import { useEffect, useRef, useState } from 'react'
import { Wrapper } from '@googlemaps/react-wrapper'

const GoogleMapComponent = ({ center, zoom = 15, markers = [], className = "w-full h-64" }) => {
  const mapRef = useRef(null)
  const [map, setMap] = useState(null)
  const [googleMarkers, setGoogleMarkers] = useState([])

  useEffect(() => {
    if (mapRef.current && !map && window.google) {
      const newMap = new window.google.maps.Map(mapRef.current, {
        center,
        zoom,
        mapTypeControl: true,
        streetViewControl: true,
        fullscreenControl: true,
        zoomControl: true,
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'on' }]
          }
        ]
      })
      setMap(newMap)
    }
  }, [center, zoom, map])

  useEffect(() => {
    if (map && markers.length > 0) {
      // Clear existing markers
      googleMarkers.forEach(marker => marker.setMap(null))
      
      // Create new markers
      const newMarkers = markers.map(markerData => {
        const marker = new window.google.maps.Marker({
          position: markerData.position,
          map,
          title: markerData.title,
          icon: {
            url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
            scaledSize: new window.google.maps.Size(32, 32)
          }
        })

        // Add info window if content is provided
        if (markerData.content) {
          const infoWindow = new window.google.maps.InfoWindow({
            content: markerData.content
          })

          marker.addListener('click', () => {
            infoWindow.open(map, marker)
          })
        }

        return marker
      })

      setGoogleMarkers(newMarkers)

      // Fit bounds if multiple markers
      if (markers.length > 1) {
        const bounds = new window.google.maps.LatLngBounds()
        markers.forEach(marker => bounds.extend(marker.position))
        map.fitBounds(bounds)
      }
    }
  }, [map, markers, googleMarkers])

  // Update map center and zoom when props change
  useEffect(() => {
    if (map && center) {
      map.setCenter(center)
      map.setZoom(zoom)
    }
  }, [map, center, zoom])

  return <div ref={mapRef} className={className} />
}

const GoogleMap = ({ 
  center, 
  zoom = 15, 
  markers = [], 
  className = "w-full h-64",
  apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyBFw0Qbyq9zTFTd-tUY6dO_BcqCGUOdAto' // Demo key - replace with your own
}) => {
  const render = (status) => {
    switch (status) {
      case 'LOADING':
        return (
          <div className={`${className} bg-gray-100 flex items-center justify-center rounded-lg`}>
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <div className="text-sm text-gray-600">Loading map...</div>
            </div>
          </div>
        )
      case 'FAILURE':
        return (
          <div className={`${className} bg-gray-100 flex items-center justify-center border border-gray-200 rounded-lg`}>
            <div className="text-center text-gray-600">
              <svg className="w-8 h-8 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h12a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1V8z" clipRule="evenodd" />
              </svg>
              <div className="text-sm">Map unavailable</div>
              <div className="text-xs text-gray-500 mt-1">Check your API key</div>
            </div>
          </div>
        )
      case 'SUCCESS':
        return (
          <GoogleMapComponent 
            center={center} 
            zoom={zoom} 
            markers={markers} 
            className={className}
          />
        )
      default:
        return (
          <div className={`${className} bg-gray-100 flex items-center justify-center rounded-lg`}>
            <div className="text-center text-gray-600">
              <div className="text-sm">Initializing map...</div>
            </div>
          </div>
        )
    }
  }

  if (!center || !center.lat || !center.lng) {
    return (
      <div className={`${className} bg-gray-100 flex items-center justify-center border border-gray-200 rounded-lg`}>
        <div className="text-center text-gray-600">
          <svg className="w-8 h-8 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
          </svg>
          <div className="text-sm">Location not available</div>
        </div>
      </div>
    )
  }

  return (
    <Wrapper apiKey={apiKey} render={render}>
      <GoogleMapComponent 
        center={center} 
        zoom={zoom} 
        markers={markers} 
        className={className}
      />
    </Wrapper>
  )
}

export default GoogleMap