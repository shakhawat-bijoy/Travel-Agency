import { useEffect, useMemo, useRef, useState } from 'react'
import { Wrapper } from '@googlemaps/react-wrapper'

const buildOsmEmbedUrl = (lat, lng) => {
  const delta = 0.01
  const left = lng - delta
  const right = lng + delta
  const top = lat + delta
  const bottom = lat - delta
  const bbox = `${left}%2C${bottom}%2C${right}%2C${top}`
  const marker = `${lat}%2C${lng}`
  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${marker}`
}

const GoogleMapComponent = ({ center, zoom = 15, markers = [], className = "w-full h-64" }) => {
  const mapRef = useRef(null)
  const [map, setMap] = useState(null)
  const markersRef = useRef([])
  const [hasGoogleMapError, setHasGoogleMapError] = useState(false)

  const osmUrl = useMemo(() => {
    if (!center?.lat || !center?.lng) return null
    return buildOsmEmbedUrl(center.lat, center.lng)
  }, [center?.lat, center?.lng])

  useEffect(() => {
    if (!mapRef.current) return
    if (!window?.google?.maps) return

    if (!map) {
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

      // Some API key/billing/referrer issues still load the script but show an in-map error overlay.
      // Detect it and fall back to OSM so the UI stays usable.
      let checks = 0
      const timer = setInterval(() => {
        checks += 1
        const err = mapRef.current?.querySelector?.('.gm-err-container')
        if (err) {
          setHasGoogleMapError(true)
          clearInterval(timer)
        } else if (checks >= 10) {
          clearInterval(timer)
        }
      }, 400)

      return () => clearInterval(timer)
      return
    }

    // Update existing map on prop changes
    map.setCenter(center)
    map.setZoom(zoom)
  }, [center, zoom, map])

  useEffect(() => {
    if (!map) return
    if (!window?.google?.maps) return

    // Clear existing markers
    for (const m of markersRef.current) m.setMap(null)
    markersRef.current = []

    if (!Array.isArray(markers) || markers.length === 0) return

    // Create new markers
    const newMarkers = markers
      .filter(m => m?.position?.lat != null && m?.position?.lng != null)
      .map(markerData => {
        const marker = new window.google.maps.Marker({
          position: markerData.position,
          map,
          title: markerData.title,
          icon: {
            url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
            scaledSize: new window.google.maps.Size(32, 32)
          }
        })

        if (markerData.content) {
          const infoWindow = new window.google.maps.InfoWindow({
            content: markerData.content
          })

          marker.addListener('click', () => {
            infoWindow.open({ anchor: marker, map })
          })
        }

        return marker
      })

    markersRef.current = newMarkers

    // Fit bounds if multiple markers
    if (markers.length > 1) {
      const bounds = new window.google.maps.LatLngBounds()
      markers.forEach(marker => {
        if (marker?.position?.lat != null && marker?.position?.lng != null) {
          bounds.extend(marker.position)
        }
      })
      map.fitBounds(bounds)
    }
  }, [map, markers])

  if (hasGoogleMapError && osmUrl) {
    return (
      <div className={className}>
        <iframe
          title="Map"
          src={osmUrl}
          className="w-full h-full"
          loading="lazy"
        />
      </div>
    )
  }

  return <div ref={mapRef} className={className} />
}

const GoogleMap = ({ 
  center, 
  zoom = 15, 
  markers = [], 
  className = "w-full h-64",
  apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
}) => {
  const render = (status, classNameOverride = className) => {
    switch (status) {
      case 'LOADING':
        return (
          <div className={`${classNameOverride} bg-gray-100 flex items-center justify-center`}>
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <div className="text-sm text-gray-600">Loading map...</div>
            </div>
          </div>
        )
      case 'FAILURE':
        return (
          <div className={`${classNameOverride} bg-gray-100 flex items-center justify-center border border-gray-200 rounded-lg`}> 
            <div className="text-center text-gray-600">
              <svg className="w-8 h-8 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h12a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1V8z" clipRule="evenodd" />
              </svg>
              <div className="text-sm">Map unavailable</div>
              <div className="text-xs text-gray-500 mt-1">
                Check your Google Maps API key and referrer restrictions.
              </div>
            </div>
          </div>
        )
      case 'SUCCESS':
        return (
          <GoogleMapComponent 
            center={center} 
            zoom={zoom} 
            markers={markers} 
            className={classNameOverride}
          />
        )
      default:
        return null
    }
  }

  if (!center || !center.lat || !center.lng) {
    return (
      <div className={`${className} bg-gray-100 flex items-center justify-center border border-gray-200 rounded-lg overflow-hidden`}>
        <div className="text-center text-gray-600">
          <svg className="w-8 h-8 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
          </svg>
          <div className="text-sm">Location not available</div>
        </div>
      </div>
    )
  }

  if (!apiKey) {
    return (
      <div className={`${className} bg-gray-100 flex items-center justify-center border border-gray-200 rounded-lg overflow-hidden`}>
        <div className="text-center text-gray-600">
          <div className="text-sm">Google Maps API key missing</div>
          <div className="text-xs text-gray-500 mt-1">Set VITE_GOOGLE_MAPS_API_KEY in client/.env</div>
        </div>
      </div>
    )
  }

  // Ensure rounded corners actually clip Google map tiles.
  const composedClassName = className.includes('overflow-hidden')
    ? className
    : `${className} overflow-hidden`

  // Back-compat: pass the composed className to the renderer
  const renderWithClass = (status) => {
    switch (status) {
      case 'LOADING':
      case 'FAILURE':
      case 'SUCCESS':
        return render(status, composedClassName)
      default:
        return null
    }
  }

  return <Wrapper apiKey={apiKey} render={renderWithClass} />
}

export default GoogleMap