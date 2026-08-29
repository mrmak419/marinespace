import { MapContainer, TileLayer, ZoomControl } from 'react-leaflet'
import { MAP_CENTER, MAP_ZOOM } from '@/lib/constants'

export default function MapView() {
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
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
    </MapContainer>
  )
}
