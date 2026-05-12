'use client'

import { AppSidebar } from '@/components/sidebar/app-sidebar'
import { MapContainer } from '@/components/map/map-container'
import { ZoneDrawingControls } from '@/components/zones/zone-drawing-controls'
import { StatsOverlay } from '@/components/stats/stats-overlay'
import { NotificationsPanel } from '@/components/notifications/notifications-panel'
import { AnimalDetailsPanel } from '@/components/animals/animal-details-panel'

export default function DashboardPage() {
  return (
    <>
      <AppSidebar />
      <main className="relative flex-1">
        <MapContainer />
        <ZoneDrawingControls />
        <StatsOverlay />
        <AnimalDetailsPanel />
        <NotificationsPanel />
      </main>
    </>
  )
}
