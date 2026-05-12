'use client'

import { Polygon, Tooltip } from 'react-leaflet'
import type { Zone } from '@/lib/types'

interface ZoneLayerProps {
  zone: Zone
}

export function ZoneLayer({ zone }: ZoneLayerProps) {
  const positions = zone.coordinates.map(c => [c.lat, c.lng] as [number, number])

  return (
    <Polygon
      positions={positions}
      pathOptions={{
        color: zone.color,
        fillColor: zone.color,
        fillOpacity: 0.15,
        weight: 2
      }}
    >
      <Tooltip sticky>
        {zone.name}
      </Tooltip>
    </Polygon>
  )
}
