'use client'

import { Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import type { Animal } from '@/lib/types'
import { useApp } from '@/lib/context/app-context'
import { Button } from '@/components/ui/button'
import { Trash2, Battery, Clock } from 'lucide-react'

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
  const { setSelectedAnimalId, removeAnimal } = useApp()

  const formatLastSeen = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    
    if (minutes < 1) return 'Только что'
    if (minutes < 60) return `${minutes} мин. назад`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours} ч. назад`
    return `${Math.floor(hours / 24)} дн. назад`
  }

  const statusLabels = {
    online: 'Онлайн',
    offline: 'Оффлайн',
    alert: 'Тревога'
  }

  return (
    <Marker
      position={[animal.coordinates.lat, animal.coordinates.lng]}
      icon={createMarkerIcon(animal.status)}
      eventHandlers={{
        click: () => setSelectedAnimalId(animal.id)
      }}
    >
      <Popup className="animal-popup">
        <div className="min-w-48 p-1">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-white">{animal.name}</h3>
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              animal.status === 'online' ? 'bg-green-500/20 text-green-400' :
              animal.status === 'alert' ? 'bg-red-500/20 text-red-400' :
              'bg-zinc-500/20 text-zinc-400'
            }`}>
              {statusLabels[animal.status]}
            </span>
          </div>
          
          <div className="space-y-1 text-sm text-zinc-400">
            <p className="flex items-center gap-2">
              <span className="text-zinc-400">ID:</span>
              <span className="text-white">{animal.trackerId}</span>
            </p>
            <p className="flex items-center gap-2">
              <Battery className="h-3.5 w-3.5" />
              <span className="text-white">{animal.batteryLevel}%</span>
            </p>
            <p className="flex items-center gap-2">
              <Clock className="h-3.5 w-3.5" />
              <span className="text-white">{formatLastSeen(animal.lastSeen)}</span>
            </p>
          </div>
          
          <div className="mt-3 pt-2 border-t border-zinc-700">
            <Button 
              variant="destructive" 
              size="sm" 
              className="w-full gap-2"
              onClick={() => removeAnimal(animal.id)}
            >
              <Trash2 className="h-3.5 w-3.5" />
              Удалить
            </Button>
          </div>
        </div>
      </Popup>
    </Marker>
  )
}
