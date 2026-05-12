'use client'

import { useEffect } from 'react'
import { MapContainer, TileLayer, useMap } from 'react-leaflet'
import { useApp } from '@/lib/context/app-context'
import { AnimalMarker } from './animal-marker'
import { ZoneLayer } from './zone-layer'
import { DrawingLayer } from './drawing-layer'
import { MAP_CENTER } from '@/lib/data/mock-data'
import 'leaflet/dist/leaflet.css'

function MapController() {
  const { mapCenter, selectedAnimalId, animals } = useApp()
  const map = useMap()

  useEffect(() => {
    if (selectedAnimalId) {
      const animal = animals.find(a => a.id === selectedAnimalId)
      if (animal) {
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
  const { animals, zones, isDrawingZone, drawingCoordinates, addDrawingPoint } = useApp()

  const handleMapClick = (e: { latlng: { lat: number; lng: number } }) => {
    if (isDrawingZone) {
      addDrawingPoint({ lat: e.latlng.lat, lng: e.latlng.lng })
    }
  }

  return (
    <MapContainer
      center={[MAP_CENTER.lat, MAP_CENTER.lng]}
      zoom={15}
      className="h-full w-full"
      style={{ background: '#1a1a1a' }}
    >
      <TileLayer
        attribution='&copy; Esri'
        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
      />
      
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
