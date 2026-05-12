'use client'

import { Polyline, CircleMarker } from 'react-leaflet'
import type { Coordinates } from '@/lib/types'

interface DrawingLayerProps {
  coordinates: Coordinates[]
}

export function DrawingLayer({ coordinates }: DrawingLayerProps) {
  const positions = coordinates.map(c => [c.lat, c.lng] as [number, number])
  
  // Замыкаем полигон для отображения
  const closedPositions = coordinates.length > 2 
    ? [...positions, positions[0]] 
    : positions

  return (
    <>
      {/* Линия контура */}
      <Polyline
        positions={closedPositions}
        pathOptions={{
          color: '#3b82f6',
          weight: 2,
          dashArray: '5, 5'
        }}
      />
      
      {/* Точки вершин */}
      {coordinates.map((coord, index) => (
        <CircleMarker
          key={index}
          center={[coord.lat, coord.lng]}
          radius={6}
          pathOptions={{
            color: '#3b82f6',
            fillColor: '#ffffff',
            fillOpacity: 1,
            weight: 2
          }}
        />
      ))}
    </>
  )
}
