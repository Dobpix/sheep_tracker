'use client'

import { useApp } from '@/lib/context/app-context'
import { Button } from '@/components/ui/button'
import { Satellite, Map } from 'lucide-react'

export function MapTypeToggle() {
  const { mapType, setMapType } = useApp()

  return (
    <div className="absolute right-4 top-4 z-[1000]">
      <div className="flex rounded-lg border border-border bg-card shadow-lg overflow-hidden">
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
          Карта
        </Button>
      </div>
    </div>
  )
}
