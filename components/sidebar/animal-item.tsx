'use client'

import { cn } from '@/lib/utils'
import type { Animal } from '@/lib/types'
import { AnimalStatusBadge } from '@/components/animals/animal-status-badge'
import { Button } from '@/components/ui/button'
import { Battery, MapPin, Satellite, Trash2 } from 'lucide-react'

interface AnimalItemProps {
  animal: Animal
  isSelected: boolean
  onClick: () => void
  onRemove: () => void
}

export function AnimalItem({ animal, isSelected, onClick, onRemove }: AnimalItemProps) {
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
    <div
      className={cn(
        'group flex w-full items-center gap-2 rounded-lg pr-1 transition-colors',
        'hover:bg-sidebar-accent',
        isSelected && 'bg-sidebar-accent'
      )}
    >
      <button
        onClick={onClick}
        className="flex min-w-0 flex-1 items-center gap-3 rounded-lg px-3 py-2.5 text-left"
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
            <span className={cn(
              'flex items-center gap-1',
              animal.hasGpsSignal ? 'text-muted-foreground' : 'text-orange-400'
            )}>
              <Satellite className="h-3 w-3" />
              {animal.hasGpsSignal ? animal.satellites : 'GPS нет'}
            </span>
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

      <Button
        aria-label={`Удалить ${animal.name}`}
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-muted-foreground hover:text-destructive"
        onClick={onRemove}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  )
}
