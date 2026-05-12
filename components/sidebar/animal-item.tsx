'use client'

import { cn } from '@/lib/utils'
import type { Animal } from '@/lib/types'
import { AnimalStatusBadge } from '@/components/animals/animal-status-badge'
import { Battery, MapPin } from 'lucide-react'

interface AnimalItemProps {
  animal: Animal
  isSelected: boolean
  onClick: () => void
}

export function AnimalItem({ animal, isSelected, onClick }: AnimalItemProps) {
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

  return (
    <button
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors',
        'hover:bg-sidebar-accent',
        isSelected && 'bg-sidebar-accent'
      )}
    >
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sidebar-accent">
        <MapPin className="h-4 w-4 text-sidebar-foreground" />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sidebar-foreground truncate">
            {animal.name}
          </span>
          <AnimalStatusBadge status={animal.status} />
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span>{animal.trackerId}</span>
          <span className="flex items-center gap-1">
            <Battery className={cn(
              'h-3 w-3',
              animal.batteryLevel > 50 ? 'text-green-500' :
              animal.batteryLevel > 20 ? 'text-yellow-500' : 'text-red-500'
            )} />
            {animal.batteryLevel}%
          </span>
        </div>
      </div>
      
      <div className="text-xs text-muted-foreground">
        {formatLastSeen(animal.lastSeen)}
      </div>
    </button>
  )
}
