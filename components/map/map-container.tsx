'use client'

import dynamic from 'next/dynamic'

const MapView = dynamic(
  () => import('./map-view').then(mod => mod.MapView),
  { 
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center bg-background">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="mt-2 text-sm text-muted-foreground">Загрузка карты...</p>
        </div>
      </div>
    )
  }
)

export function MapContainer() {
  return <MapView />
}
