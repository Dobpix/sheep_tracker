'use client'

import { useApp } from '@/lib/context/app-context'
import { Card, CardContent } from '@/components/ui/card'
import { MapPin, Wifi, WifiOff, AlertTriangle } from 'lucide-react'

export function StatsOverlay() {
  const { animals } = useApp()
  
  const stats = {
    total: animals.length,
    online: animals.filter(a => a.status === 'online').length,
    offline: animals.filter(a => a.status === 'offline').length,
    alert: animals.filter(a => a.status === 'alert').length,
  }

  return (
    <div className="absolute right-4 top-4 z-[1000] flex flex-col gap-2">
      <Card className="bg-card/90 backdrop-blur-sm border-border">
        <CardContent className="p-3">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <MapPin className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Всего</p>
                <p className="font-semibold text-foreground">{stats.total}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-500/10">
                <Wifi className="h-4 w-4 text-green-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Онлайн</p>
                <p className="font-semibold text-green-500">{stats.online}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-500/10">
                <WifiOff className="h-4 w-4 text-zinc-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Оффлайн</p>
                <p className="font-semibold text-zinc-500">{stats.offline}</p>
              </div>
            </div>
            
            {stats.alert > 0 && (
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/10">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Тревога</p>
                  <p className="font-semibold text-red-500">{stats.alert}</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
