'use client'

import { Marker } from 'react-leaflet'
import L from 'leaflet'
import type { Animal } from '@/lib/types'
import { useApp } from '@/lib/context/app-context'

interface AnimalMarkerProps {
  animal: Animal
}

const createMarkerIcon = (status: Animal['status']) => {
  const colors = {
    online: '#22c55e',
    offline: '#71717a',
    alert: '#ef4444'
  }
  
  const color = colors[status]
  
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        width: 32px;
        height: 32px;
        background: ${color};
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 8px rgba(0,0,0,0.4);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
          <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
          <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
        </svg>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  })
}

export function AnimalMarker({ animal }: AnimalMarkerProps) {
  const { setSelectedAnimalId } = useApp()

  if (!animal.coordinates) {
    return null
  }

  return (
    <Marker
      position={[animal.coordinates.lat, animal.coordinates.lng]}
      icon={createMarkerIcon(animal.status)}
      eventHandlers={{
        click: () => setSelectedAnimalId(animal.id)
      }}
    />
  )
}
