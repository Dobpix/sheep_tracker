'use client'

import { useEffect } from 'react'
import { MapContainer, TileLayer, useMap } from 'react-leaflet'
import { useApp } from '@/lib/context/app-context'
import { AnimalMarker } from './animal-marker'
import { ZoneLayer } from './zone-layer'
import { DrawingLayer } from './drawing-layer'
import { MAP_CENTER } from '@/lib/data/mock-data'
// Leaflet CSS imported in globals.css

const MAP_LAYERS = {
  satellite: [
    {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      attribution: '&copy; Esri',
    },
  ],
  streets: [
    {
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '&copy; OpenStreetMap contributors',
    },
  ],
  hybrid: [
    {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      attribution: '&copy; Esri',
    },
    {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}',
      attribution: '&copy; Esri',
    },
    {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
      attribution: '&copy; Esri',
    },
  ],
}

function MapController() {
  const { mapCenter, selectedAnimalId, animals } = useApp()
  const map = useMap()

  useEffect(() => {
    if (selectedAnimalId) {
      const animal = animals.find(a => a.id === selectedAnimalId)
      if (animal?.coordinates) {
        map.flyTo([animal.coordinates.lat, animal.coordinates.lng], 16, {
          duration: 0.8
        })
      }
    }
  }, [selectedAnimalId, animals, map])

  useEffect(() => {
    map.flyTo([mapCenter.lat, mapCenter.lng], map.getZoom(), {
      duration: 0.5
    })
  }, [mapCenter, map])

  return null
}

export function MapView() {
  const { animals, zones, isDrawingZone, drawingCoordinates, addDrawingPoint, mapType } = useApp()

  const handleMapClick = (e: { latlng: { lat: number; lng: number } }) => {
    console.log('[v0] Map clicked, isDrawingZone:', isDrawingZone)
    if (isDrawingZone) {
      console.log('[v0] Adding point:', e.latlng)
      addDrawingPoint({ lat: e.latlng.lat, lng: e.latlng.lng })
    }
  }

  const layers = MAP_LAYERS[mapType]

  return (
    <MapContainer
      center={[MAP_CENTER.lat, MAP_CENTER.lng]}
      zoom={15}
      className="h-full w-full"
      style={{ background: '#1a1a1a' }}
    >
      {layers.map((layer, index) => (
        <TileLayer
          key={`${mapType}-${index}`}
          attribution={layer.attribution}
          url={layer.url}
        />
      ))}
      
      <MapController />
      
      {/* Зоны */}
      {zones.map(zone => (
        <ZoneLayer key={zone.id} zone={zone} />
      ))}

      {/* Рисуемая зона */}
      {isDrawingZone && drawingCoordinates.length > 0 && (
        <DrawingLayer coordinates={drawingCoordinates} />
      )}

      {/* Маркеры животных */}
      {animals.map(animal => (
        <AnimalMarker key={animal.id} animal={animal} />
      ))}

      {/* Обработчик кликов */}
      <MapClickHandler onClick={handleMapClick} />
    </MapContainer>
  )
}

function MapClickHandler({ onClick }: { onClick: (e: { latlng: { lat: number; lng: number } }) => void }) {
  const map = useMap()
  
  useEffect(() => {
    map.on('click', onClick)
    return () => {
      map.off('click', onClick)
    }
  }, [map, onClick])
  
  return null
}
