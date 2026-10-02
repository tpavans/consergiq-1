import React, { useEffect, useRef, useState } from 'react'
import { MapPin, Compass, Navigation, ExternalLink } from 'lucide-react'

export interface MapPinData {
  id: number
  name: string
  lat: number
  lng: number
  type: 'HOTEL' | 'RESTAURANT' | 'EVENT' | 'ATTRACTION' | 'MALL' | 'CINEMA' | 'HOSPITAL'
}

interface MapProps {
  pins?: MapPinData[]
  drawRoute?: boolean
  userCoords?: { lat: number; lng: number } | null
  nearbyPlaces?: MapPinData[]
  onSelectPlace?: (place: MapPinData) => void
}

export default function Map({
  pins = [],
  drawRoute = false,
  userCoords = null,
  nearbyPlaces = [],
  onSelectPlace
}: MapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])
  const polylinesRef = useRef<any[]>([])
  const tileLayerRef = useRef<any>(null)
  const [leafletLoaded, setLeafletLoaded] = useState(false)
  const [selectedPin, setSelectedPin] = useState<MapPinData | null>(null)
  const [mapType, setMapType] = useState<'roadmap' | 'satellite'>('roadmap')

  // Dynamically load Leaflet CDN files
  useEffect(() => {
    if ((window as any).L) {
      setLeafletLoaded(true);
      return;
    }

    const cssLink = document.createElement('link')
    cssLink.rel = 'stylesheet'
    cssLink.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
    document.head.appendChild(cssLink)

    const jsScript = document.createElement('script')
    jsScript.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
    jsScript.onload = () => setLeafletLoaded(true)
    document.head.appendChild(jsScript)
  }, [])

  // Initialize Map
  useEffect(() => {
    if (!leafletLoaded || !mapContainerRef.current) return

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove()
      mapInstanceRef.current = null
    }

    let centerLat = 15.5562
    let centerLng = 73.7512

    if (pins.length > 0) {
      centerLat = pins[0].lat
      centerLng = pins[0].lng
    } else if (userCoords) {
      centerLat = userCoords.lat
      centerLng = userCoords.lng
    }

    const L = (window as any).L
    const map = L.map(mapContainerRef.current, {
      zoomControl: false,
      attributionControl: false
    }).setView([centerLat, centerLng], 13)

    // Load working standard road or hybrid satellite tiles
    const tileUrl = mapType === 'satellite' 
      ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
      : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

    const tileLayer = L.tileLayer(tileUrl, {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map)
    tileLayerRef.current = tileLayer

    L.control.zoom({
      position: 'bottomright'
    }).addTo(map)

    mapInstanceRef.current = map

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [leafletLoaded])

  // Dynamically switch tile layer URLs when mapType switches
  useEffect(() => {
    if (!tileLayerRef.current || !leafletLoaded) return
    const tileUrl = mapType === 'satellite'
      ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
      : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

    tileLayerRef.current.setUrl(tileUrl);
  }, [mapType, leafletLoaded])

  // Update Markers, Route Tracing, and Google-style Midpoint Labels
  useEffect(() => {
    if (!leafletLoaded || !mapInstanceRef.current) return

    const L = (window as any).L
    const map = mapInstanceRef.current

    // Clear old markers/popups
    markersRef.current.forEach(marker => marker.remove())
    markersRef.current = []

    polylinesRef.current.forEach(p => p.remove())
    polylinesRef.current = []

    const bounds: any[] = []

    const createCustomIcon = (type: string, numberLabel?: number) => {
      let color = '#2563eb' // Blue (Google Maps Primary)
      if (type === 'RESTAURANT') color = '#dc2626' // Red (Dining)
      if (type === 'EVENT') color = '#9333ea' // Purple (Leisure/Events)
      if (type === 'MALL' || type === 'CINEMA') color = '#d97706' // Amber (Entertainment)
      if (type === 'USER') color = '#059669' // Emerald Green (Live location)
      if (type === 'HOSPITAL') color = '#e11d48' // Rose (Medical Emergency)
      if (type === 'HOTEL') color = '#4f46e5' // Indigo (Hotel & Stay)

      let iconSvg = '';
      if (numberLabel) {
        iconSvg = `<span style="color: white; font-weight: 800; font-size: 11px;">${numberLabel}</span>`;
      } else if (type === 'RESTAURANT') {
        iconSvg = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg>`;
      } else if (type === 'EVENT' || type === 'CINEMA') {
        iconSvg = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M13 5v2"/><path d="M13 17v2"/><path d="M13 11v2"/></svg>`;
      } else if (type === 'HOTEL') {
        iconSvg = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M2 4v16"/><path d="M2 8h18a2 2 0 0 1 2 2v10"/><path d="M2 17h20"/><path d="M6 8v9"/></svg>`;
      } else if (type === 'HOSPITAL') {
        iconSvg = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`;
      } else if (type === 'USER') {
        iconSvg = `<div style="width: 8px; height: 8px; border-radius: 50%; background-color: white;"></div>`;
      } else {
        iconSvg = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>`;
      }

      const html = `
        <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 34px; height: 34px;">
          <div style="position: absolute; width: 100%; height: 100%; border-radius: 50%; background-color: ${color}; opacity: 0.2; transform: scale(1.3); animation: pulse 2s infinite;"></div>
          <div style="position: absolute; width: 26px; height: 26px; border-radius: 50%; background-color: ${color}; border: 2.5px solid white; display: flex; align-items: center; justify-content: center; box-shadow: 0 3px 8px rgba(0,0,0,0.4);">
            ${iconSvg}
          </div>
        </div>
      `
      return L.divIcon({
        html,
        className: 'google-maps-marker-icon',
        iconSize: [34, 34],
        iconAnchor: [17, 17]
      })
    }

    // Add Live User Location
    if (userCoords) {
      const userMarker = L.marker([userCoords.lat, userCoords.lng], {
        icon: createCustomIcon('USER')
      }).addTo(map)
      userMarker.bindTooltip('<b>Your Live Location</b>', { permanent: false, direction: 'top' })
      markersRef.current.push(userMarker)
      bounds.push([userCoords.lat, userCoords.lng])
    }

    // Plot Schedule Pins
    pins.forEach((pin, i) => {
      const marker = L.marker([pin.lat, pin.lng], {
        icon: createCustomIcon(pin.type, i + 1)
      }).addTo(map)
      
      marker.bindTooltip(`<b>${i + 1}. ${pin.name}</b><br><span style="text-transform: capitalize; font-size: 10px; color: #4b5563;">${pin.type.toLowerCase()}</span>`, { 
        permanent: false, 
        direction: 'top' 
      })

      marker.on('click', () => {
        setSelectedPin(pin)
        if (onSelectPlace) onSelectPlace(pin)
      })

      markersRef.current.push(marker)
      bounds.push([pin.lat, pin.lng])
    })

    // Plot Nearby Places Pins
    nearbyPlaces.forEach((place) => {
      const marker = L.marker([place.lat, place.lng], {
        icon: createCustomIcon(place.type)
      }).addTo(map)

      marker.bindTooltip(`<b>${place.name}</b><br><span style="text-transform: capitalize; font-size: 10px; color: #6b7280;">Nearby ${place.type.toLowerCase()}</span>`, {
        permanent: false,
        direction: 'top'
      })

      marker.on('click', () => {
        setSelectedPin(place)
        if (onSelectPlace) onSelectPlace(place)
      })

      markersRef.current.push(marker)
      bounds.push([place.lat, place.lng])
    })

    // Draw Google-style route polyline between itinerary pins
    if (drawRoute && pins.length >= 1) {
      const pathCoords: [number, number][] = []

      // Check distance to user location: only prepend userCoords if user is nearby (< 50 km)
      if (userCoords && pins.length > 0) {
        const dLat = pins[0].lat - userCoords.lat
        const dLng = pins[0].lng - userCoords.lng
        const userDistKm = Math.sqrt(dLat * dLat + dLng * dLng) * 111.0
        if (userDistKm < 50.0) {
          pathCoords.push([userCoords.lat, userCoords.lng])
        }
      }

      pins.forEach(pin => {
        pathCoords.push([pin.lat, pin.lng])
      })

      if (pathCoords.length >= 2) {
        const isEmergency = pins.some(p => p.type === 'HOSPITAL');
        const outerColor = isEmergency ? '#991b1b' : '#1e3a8a';
        const innerColor = isEmergency ? '#ef4444' : '#2563eb';

        const drawSegmentPolyline = (coords: [number, number][]) => {
          // Dual Polyline for authentic Google Maps polyline styling
          const outerLine = L.polyline(coords, {
            color: outerColor,
            weight: 8,
            opacity: 0.35,
            lineJoin: 'round',
            lineCap: 'round'
          }).addTo(map)

          const innerLine = L.polyline(coords, {
            color: innerColor,
            weight: 5,
            opacity: 0.95,
            lineJoin: 'round',
            lineCap: 'round'
          }).addTo(map)

          polylinesRef.current.push(outerLine, innerLine)
        }

        // Query OpenStreetMap Routing Service (OSRM) for real street driving geometry
        const osrmCoords = pathCoords.map(c => `${c[1]},${c[0]}`).join(';')
        const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${osrmCoords}?overview=full&geometries=geojson`

        fetch(osrmUrl)
          .then(res => res.json())
          .then(data => {
            if (data && data.routes && data.routes[0] && data.routes[0].geometry) {
              const streetCoords: [number, number][] = data.routes[0].geometry.coordinates.map((c: any) => [c[1], c[0]]);
              drawSegmentPolyline(streetCoords);
            } else {
              drawSegmentPolyline(pathCoords);
            }
          })
          .catch(() => {
            drawSegmentPolyline(pathCoords);
          });

        // Add Google Maps drive-time duration bubbles at the midpoint of each segment
        for (let i = 0; i < pathCoords.length - 1; i++) {
          const p1 = pathCoords[i]
          const p2 = pathCoords[i + 1]
          
          const midLat = (p1[0] + p2[0]) / 2
          const midLng = (p1[1] + p2[1]) / 2
          
          const dLat = p2[0] - p1[0]
          const dLng = p2[1] - p1[1]
          const distance = Math.sqrt(dLat * dLat + dLng * dLng) * 111.0
          const durationMin = Math.max(3, Math.round(distance * 2.2))

          const labelIcon = L.divIcon({
            html: `<div style="background-color: white; border: 1.5px solid #2563eb; border-radius: 12px; padding: 3px 8px; font-size: 10px; font-weight: 800; color: #1e3a8a; white-space: nowrap; box-shadow: 0 2px 8px rgba(0,0,0,0.25); display: flex; align-items: center; gap: 4px;">
                     <span>🚗</span>
                     <span>${durationMin} min (${distance.toFixed(1)} km)</span>
                   </div>`,
            className: 'route-duration-bubble',
            iconSize: [80, 24],
            iconAnchor: [40, 12]
          })

          const labelMarker = L.marker([midLat, midLng], { icon: labelIcon }).addTo(map)
          markersRef.current.push(labelMarker)
        }
      }
    }

    // Auto-fit coordinates bounds nicely
    if (bounds.length > 0) {
      map.fitBounds(bounds, {
        padding: [60, 60],
        maxZoom: 15
      })
    }

  }, [leafletLoaded, pins, userCoords, nearbyPlaces, drawRoute])

  return (
    <div className="relative w-full h-full min-h-[320px] bg-slate-100 dark:bg-zinc-950 border border-gray-250 dark:border-darkBorder rounded-2xl overflow-hidden flex flex-col shadow-inner">
      
      {/* Map Control Badge */}
      <div className="absolute top-4 left-4 z-[1000] flex flex-col gap-2">
        <div className="bg-white/95 dark:bg-zinc-900/95 shadow-md px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-gray-200 dark:border-darkBorder">
          <Compass size={14} className="text-blue-500 animate-spin" />
          <span className="text-gray-800 dark:text-gray-200">Google Maps Live Route</span>
        </div>
      </div>

      {/* Map Type Toggle Overlay */}
      <div className="absolute top-4 right-4 z-[1000] flex bg-white/95 dark:bg-zinc-900/95 p-1 rounded-xl border border-gray-200 dark:border-darkBorder shadow-md">
        <button
          onClick={() => setMapType('roadmap')}
          className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all ${
            mapType === 'roadmap'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-gray-500 hover:text-gray-800 dark:hover:text-white'
          }`}
        >
          Map
        </button>
        <button
          onClick={() => setMapType('satellite')}
          className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all ${
            mapType === 'satellite'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-gray-500 hover:text-gray-800 dark:hover:text-white'
          }`}
        >
          Satellite
        </button>
      </div>

      {/* Map target div */}
      <div ref={mapContainerRef} className="flex-1 w-full h-full min-h-[320px]" style={{ zIndex: 1 }} />

      {/* Selected Marker Details Drawer */}
      {selectedPin && (() => {
        let distStr = '1.8 km'
        let timeStr = '8 min'
        if (userCoords) {
          const dLat = selectedPin.lat - userCoords.lat
          const dLng = selectedPin.lng - userCoords.lng
          const distance = Math.sqrt(dLat * dLat + dLng * dLng) * 111.0
          distStr = `${distance.toFixed(1)} km`
          timeStr = `${Math.max(2, Math.round(distance * 2.2))} min`
        }

        const mapsDirectionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${selectedPin.lat},${selectedPin.lng}`

        return (
          <div className="absolute bottom-4 left-4 right-4 z-[1000] bg-white/95 dark:bg-zinc-900/95 border border-gray-200/80 dark:border-darkBorder shadow-xl rounded-2xl p-4 animate-slide-up flex flex-col gap-3">
            <div className="flex justify-between items-start">
              <div className="flex gap-3 items-center">
                <div className="bg-blue-50 dark:bg-blue-950/30 p-2.5 rounded-xl text-blue-600">
                  <MapPin size={18} />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-gray-800 dark:text-gray-200">{selectedPin.name}</h4>
                  <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">{selectedPin.type.toLowerCase()}</p>
                  <p className="text-[11px] text-indigo-600 dark:text-brand-400 font-bold mt-0.5">
                    🚗 {timeStr} drive • {distStr} away
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedPin(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-white text-xs font-semibold px-2 py-1"
              >
                Close
              </button>
            </div>
            
            <a 
              href={mapsDirectionsUrl}
              target="_blank"
              rel="noreferrer"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
            >
              <Navigation size={14} />
              <span>Open Directions in Google Maps</span>
              <ExternalLink size={12} />
            </a>
          </div>
        )
      })()}
    </div>
  )
}
