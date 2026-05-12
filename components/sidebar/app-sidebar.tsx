'use client'

import { useApp } from '@/lib/context/app-context'
import { AnimalsList } from './animals-list'
import { ZonesList } from '@/components/zones/zone-list'
import { AddAnimalDialog } from '@/components/animals/add-animal-dialog'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MapPin, Layers, Bell, LogOut, Plus, PenTool } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function AppSidebar() {
  const { notifications, startDrawingZone, isDrawingZone } = useApp()
  const router = useRouter()
  const unreadCount = notifications.filter(n => !n.read).length

  const handleLogout = () => {
    router.push('/login')
  }

  return (
    <aside className="flex w-72 flex-col border-r border-sidebar-border bg-sidebar">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-sidebar-border px-4 py-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
          <MapPin className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="font-semibold text-sidebar-foreground">Smart Animals</h1>
          <p className="text-xs text-muted-foreground">Мониторинг</p>
        </div>
      </div>

      {/* Notifications indicator */}
      {unreadCount > 0 && (
        <div className="mx-4 mt-4 flex items-center gap-2 rounded-lg bg-red-500/10 px-3 py-2 text-red-400">
          <Bell className="h-4 w-4" />
          <span className="text-sm">{unreadCount} уведомл.</span>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 overflow-y-auto p-4">
        <Tabs defaultValue="animals" className="w-full">
          <TabsList className="w-full bg-sidebar-accent">
            <TabsTrigger value="animals" className="flex-1 gap-1.5">
              <MapPin className="h-3.5 w-3.5" />
              Животные
            </TabsTrigger>
            <TabsTrigger value="zones" className="flex-1 gap-1.5">
              <Layers className="h-3.5 w-3.5" />
              Зоны
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="animals" className="mt-4">
            <div className="mb-3">
              <AddAnimalDialog>
                <Button variant="outline" size="sm" className="w-full gap-2">
                  <Plus className="h-4 w-4" />
                  Добавить животное
                </Button>
              </AddAnimalDialog>
            </div>
            <AnimalsList />
          </TabsContent>
          
          <TabsContent value="zones" className="mt-4">
            <div className="mb-3">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full gap-2"
                onClick={startDrawingZone}
                disabled={isDrawingZone}
              >
                <PenTool className="h-4 w-4" />
                {isDrawingZone ? 'Рисование...' : 'Создать зону'}
              </Button>
            </div>
            <ZonesList />
          </TabsContent>
        </Tabs>
      </div>

      {/* Footer */}
      <div className="border-t border-sidebar-border p-4">
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          Выйти
        </Button>
      </div>
    </aside>
  )
}
