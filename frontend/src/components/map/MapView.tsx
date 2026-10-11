import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, ZoomControl, Marker, Popup, GeoJSON } from 'react-leaflet'
import L from 'leaflet'
import { MAP_CENTER, MAP_ZOOM, API_BASE_URL } from '@/lib/constants'

// Fix default Leaflet marker icon issue in Vite
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const portIcon = new L.DivIcon({
  className: 'custom-port-icon',
  html: `<div class="w-7 h-7 bg-blue-600 border-2 border-white rounded-full flex items-center justify-center shadow-md text-white text-xs">⚓</div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
  popupAnchor: [0, -14],
})

export default function MapView() {
  const [ports, setPorts] = useState<any[]>([])
  const [eezData, setEezData] = useState<any>(null)
  const [mpaData, setMpaData] = useState<any>(null)
  const [imblData, setImblData] = useState<any>(null)

  // Layer Toggles
  const [showPorts, setShowPorts] = useState(true)
  const [showEez, setShowEez] = useState(true)
  const [showMpa, setShowMpa] = useState(true)
  const [showImbl, setShowImbl] = useState(true)

  useEffect(() => {
    // 1. Fetch Ports
    fetch(`${API_BASE_URL}/api/map/ports`)
      .then(res => res.json())
      .then(data => {
        if (data && data.features) {
          setPorts(data.features)
        }
      })
      .catch(err => console.warn('Could not load ports:', err))

    // 2. Fetch EEZ
    fetch(`${API_BASE_URL}/api/map/geojson/india_eez`)
      .then(res => res.json())
      .then(data => setEezData(data))
      .catch(err => console.warn('Could not load EEZ:', err))

    // 3. Fetch MPAs
    fetch(`${API_BASE_URL}/api/map/geojson/marine_protected_areas`)
      .then(res => res.json())
      .then(data => setMpaData(data))
      .catch(err => console.warn('Could not load MPAs:', err))

    // 4. Fetch IMBL
    fetch(`${API_BASE_URL}/api/map/geojson/maritime_boundaries`)
      .then(res => res.json())
      .then(data => setImblData(data))
      .catch(err => console.warn('Could not load IMBL:', err))
  }, [])

  return (
    <div className="relative h-full w-full">
      <MapContainer
        center={MAP_CENTER}
        zoom={MAP_ZOOM}
        zoomControl={false}
        className="h-full w-full"
        minZoom={3}
        maxZoom={18}
      >
        <ZoomControl position="bottomright" />

        {/* ESRI Ocean Basemap — ocean-focused detail with depth contours */}
        <TileLayer
          attribution='Tiles &copy; Esri &mdash; Sources: GEBCO, NOAA, National Geographic'
          url="https://server.arcgisonline.com/ArcGIS/rest/services/Ocean/World_Ocean_Base/MapServer/tile/{z}/{y}/{x}"
          maxZoom={13}
        />

        {/* ESRI Ocean Reference — coastal labels, ports, and sea names */}
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/Ocean/World_Ocean_Reference/MapServer/tile/{z}/{y}/{x}"
          maxZoom={13}
        />

        {/* EEZ Boundary Layer */}
        {showEez && eezData && (
          <GeoJSON
            data={eezData}
            style={{
              color: '#0284c7',
              weight: 2,
              opacity: 0.8,
              dashArray: '6, 6',
              fillColor: '#0284c7',
              fillOpacity: 0.05,
            }}
          />
        )}

        {/* Marine Protected Areas Layer */}
        {showMpa && mpaData && (
          <GeoJSON
            data={mpaData}
            style={{
              color: '#f59e0b',
              weight: 2,
              opacity: 0.85,
              fillColor: '#f59e0b',
              fillOpacity: 0.2,
            }}
          />
        )}

        {/* IMBL Boundaries Layer */}
        {showImbl && imblData && (
          <GeoJSON
            data={imblData}
            style={{
              color: '#ef4444',
              weight: 2.5,
              opacity: 0.9,
              dashArray: '4, 4',
            }}
          />
        )}

        {/* Fishing Harbours Markers */}
        {showPorts && ports.map(port => {
          const [lon, lat] = port.geometry.coordinates
          const p = port.properties
          return (
            <Marker key={p.id} position={[lat, lon]} icon={portIcon}>
              <Popup>
                <div className="p-1 max-w-[220px]">
                  <div className="font-bold text-sm text-blue-900">{p.name}</div>
                  <div className="text-xs text-gray-600 mb-1">{p.state} • {p.coast}</div>
                  <div className="text-[11px] bg-blue-50 text-blue-700 p-1.5 rounded mb-1.5">
                    <strong>Capacity:</strong> ~{p.capacity_boats} motorized boats
                  </div>
                  {p.major_species && (
                    <div className="text-[11px] text-gray-700">
                      <strong>Target Catch:</strong> {p.major_species.join(', ')}
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          )
        })}
      </MapContainer>

      {/* Floating Layer Controls */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[999] flex gap-1.5 bg-white/90 backdrop-blur-md px-2.5 py-1.5 rounded-full shadow-lg border border-gray-200 text-xs font-medium">
        <button
          onClick={() => setShowPorts(!showPorts)}
          className={`px-2.5 py-1 rounded-full transition-colors flex items-center gap-1 ${
            showPorts ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
          }`}
        >
          ⚓ Harbours
        </button>
        <button
          onClick={() => setShowEez(!showEez)}
          className={`px-2.5 py-1 rounded-full transition-colors flex items-center gap-1 ${
            showEez ? 'bg-sky-600 text-white' : 'bg-gray-100 text-gray-600'
          }`}
        >
          🌐 EEZ
        </button>
        <button
          onClick={() => setShowMpa(!showMpa)}
          className={`px-2.5 py-1 rounded-full transition-colors flex items-center gap-1 ${
            showMpa ? 'bg-amber-600 text-white' : 'bg-gray-100 text-gray-600'
          }`}
        >
          🛡️ MPAs
        </button>
        <button
          onClick={() => setShowImbl(!showImbl)}
          className={`px-2.5 py-1 rounded-full transition-colors flex items-center gap-1 ${
            showImbl ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-600'
          }`}
        >
          ⚠️ IMBL
        </button>
      </div>
    </div>
  )
}
