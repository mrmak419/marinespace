import { MapContainer, TileLayer, ZoomControl, GeoJSON } from 'react-leaflet'
import { MAP_CENTER, MAP_ZOOM } from '@/lib/constants'
import { useEffect, useState } from 'react'
import type { FeatureCollection } from 'geojson'

/**
 * MapView - Full screen ocean map centered on India.
 * 
 * Uses ESRI Ocean Basemap for beautiful ocean detail, with India's official
 * boundary drawn as a SOLID line overlay. This ensures J&K, Ladakh, and 
 * Arunachal Pradesh are shown as integral parts of India per the 
 * Constitution of India.
 * 
 * For SIH demo: Consider also getting MapmyIndia API key for full 
 * compliance. Sign up free at https://apis.mappls.com/console/
 */
export default function MapView() {
  const [indiaBoundary, setIndiaBoundary] = useState<FeatureCollection | null>(null)

  useEffect(() => {
    fetch('/india_boundary_overlay.geojson')
      .then(res => res.json())
      .then(data => setIndiaBoundary(data))
      .catch(err => console.warn('Could not load India boundary overlay:', err))
  }, [])

  return (
    <MapContainer
      center={MAP_CENTER}
      zoom={MAP_ZOOM}
      zoomControl={false}
      className="h-full w-full"
      minZoom={3}
      maxZoom={18}
    >
      <ZoomControl position="bottomright" />

      {/* ESRI Ocean Basemap — beautiful ocean detail */}
      <TileLayer
        attribution='Tiles &copy; Esri &mdash; Sources: GEBCO, NOAA, National Geographic'
        url="https://server.arcgisonline.com/ArcGIS/rest/services/Ocean/World_Ocean_Base/MapServer/tile/{z}/{y}/{x}"
        maxZoom={13}
      />
      <TileLayer
        url="https://server.arcgisonline.com/ArcGIS/rest/services/Ocean/World_Ocean_Reference/MapServer/tile/{z}/{y}/{x}"
        maxZoom={13}
      />

      {/* India Official Boundary Overlay — SOLID lines */}
      {indiaBoundary && (
        <GeoJSON
          data={indiaBoundary}
          style={{
            color: '#1a1a1a',
            weight: 2.5,
            opacity: 0.9,
            dashArray: '',    // SOLID line, not dotted
            fillOpacity: 0,
          }}
        />
      )}
    </MapContainer>
  )
}
