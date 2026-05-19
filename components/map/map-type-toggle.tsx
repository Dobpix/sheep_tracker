'use client'

import { useApp } from '@/lib/context/app-context'
import { Button } from '@/components/ui/button'
import { Layers, Map, Satellite } from 'lucide-react'

export function MapTypeToggle() {
  const { mapType, setMapType } = useApp()

  return (
    <div className="absolute left-4 bottom-4 z-[1000]">
      <div className="flex overflow-hidden rounded-lg border border-border bg-background shadow-lg">
        <Button
          variant={mapType === 'satellite' ? 'default' : 'ghost'}
          size="sm"
          className="rounded-none gap-1.5"
          onClick={() => setMapType('satellite')}
        >
          <Satellite className="h-4 w-4" />
          Спутник
        </Button>
        <Button
          variant={mapType === 'streets' ? 'default' : 'ghost'}
          size="sm"
          className="rounded-none gap-1.5"
          onClick={() => setMapType('streets')}
        >
          <Map className="h-4 w-4" />
          Схема
        </Button>
        <Button
          variant={mapType === 'hybrid' ? 'default' : 'ghost'}
          size="sm"
          className="rounded-none gap-1.5"
          onClick={() => setMapType('hybrid')}
        >
          <Layers className="h-4 w-4" />
          Гибрид
        </Button>
      </div>
    </div>
  )
}
