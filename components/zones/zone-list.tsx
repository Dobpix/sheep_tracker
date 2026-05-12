'use client'

import { useApp } from '@/lib/context/app-context'
import { Button } from '@/components/ui/button'
import { Trash2, Layers } from 'lucide-react'
import { cn } from '@/lib/utils'

export function ZonesList() {
  const { zones, removeZone } = useApp()

  if (zones.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <Layers className="h-8 w-8 text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground">
          Зоны не созданы
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Нажмите кнопку выше для создания
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      {zones.map(zone => (
        <div
          key={zone.id}
          className={cn(
            'flex items-center gap-3 rounded-lg px-3 py-2.5',
            'bg-sidebar-accent'
          )}
        >
          <div 
            className="h-4 w-4 rounded-sm" 
            style={{ backgroundColor: zone.color }}
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">
              {zone.name}
            </p>
            <p className="text-xs text-muted-foreground">
              {zone.coordinates.length} точек
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
            onClick={() => removeZone(zone.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>
  )
}
