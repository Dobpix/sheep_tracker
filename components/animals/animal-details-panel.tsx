'use client'

import { useApp } from '@/lib/context/app-context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AnimalStatusBadge } from '@/components/animals/animal-status-badge'
import { Battery, Clock, MapPin, Activity, X, Route, Zap, Satellite, Trash2 } from 'lucide-react'

export function AnimalDetailsPanel() {
  const { selectedAnimalId, animals, setSelectedAnimalId, zones, removeAnimal } = useApp()
  
  const animal = animals.find(a => a.id === selectedAnimalId)
  
  if (!animal) return null

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

  // Проверяем, в какой зоне находится животное
  const isPointInZone = (point: { lat: number; lng: number }, zoneCoords: { lat: number; lng: number }[]) => {
    let inside = false
    for (let i = 0, j = zoneCoords.length - 1; i < zoneCoords.length; j = i++) {
      const xi = zoneCoords[i].lng, yi = zoneCoords[i].lat
      const xj = zoneCoords[j].lng, yj = zoneCoords[j].lat
      
      if (((yi > point.lat) !== (yj > point.lat)) &&
          (point.lng < (xj - xi) * (point.lat - yi) / (yj - yi) + xi)) {
        inside = !inside
      }
    }
    return inside
  }

  const currentZone = animal.coordinates
    ? zones.find(z => isPointInZone(animal.coordinates!, z.coordinates))
    : null

  // Мок-данные для статистики
  const mockStats = {
    distanceToday: (Math.random() * 5 + 1).toFixed(2),
    avgSpeed: (Math.random() * 2 + 0.5).toFixed(1),
    activeHours: Math.floor(Math.random() * 8 + 4)
  }

  return (
    <Card className="absolute left-80 top-4 z-[1000] w-72 bg-card/95 backdrop-blur-sm shadow-xl">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-base">{animal.name}</CardTitle>
            <AnimalStatusBadge status={animal.status} />
          </div>
          <div className="flex items-center gap-1">
            <Button 
              aria-label={`Удалить ${animal.name}`}
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
              onClick={() => removeAnimal(animal.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            <Button 
              aria-label="Закрыть карточку животного"
              variant="ghost" 
              size="icon" 
              className="h-8 w-8"
              onClick={() => setSelectedAnimalId(null)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">{animal.trackerId}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Основная информация */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 rounded-lg bg-muted/50 p-2">
            <Battery className={`h-4 w-4 ${
              animal.batteryLevel > 50 ? 'text-green-500' :
              animal.batteryLevel > 20 ? 'text-yellow-500' : 'text-red-500'
            }`} />
            <div>
              <p className="text-xs text-muted-foreground">Батарея</p>
              <p className="font-medium text-sm">{animal.batteryLevel}%</p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-muted/50 p-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Обновлено</p>
              <p className="font-medium text-sm">{formatLastSeen(animal.lastSeen)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-muted/50 p-2">
            <Satellite className={`h-4 w-4 ${animal.hasGpsSignal ? 'text-green-500' : 'text-orange-500'}`} />
            <div>
              <p className="text-xs text-muted-foreground">GPS</p>
              <p className="font-medium text-sm">{animal.hasGpsSignal ? `${animal.satellites} спутн.` : 'Нет сигнала'}</p>
            </div>
          </div>
        </div>

        {/* Зона */}
        <div className="flex items-center gap-2 rounded-lg bg-muted/50 p-3">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <div>
            <p className="text-xs text-muted-foreground">Зона</p>
            <p className={`font-medium text-sm ${currentZone ? 'text-green-500' : 'text-yellow-500'}`}>
              {!animal.coordinates ? 'Координат нет' : currentZone ? currentZone.name : 'Вне зоны'}
            </p>
          </div>
        </div>

        {/* Статистика за день */}
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">
            Статистика за сегодня
          </p>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Route className="h-4 w-4 text-blue-500" />
                <span className="text-sm">Пройдено</span>
              </div>
              <span className="font-medium text-sm">{mockStats.distanceToday} км</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-yellow-500" />
                <span className="text-sm">Ср. скорость</span>
              </div>
              <span className="font-medium text-sm">{mockStats.avgSpeed} км/ч</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-green-500" />
                <span className="text-sm">Активность</span>
              </div>
              <span className="font-medium text-sm">{mockStats.activeHours} ч</span>
            </div>
          </div>
        </div>

        {/* Координаты */}
        <div className="border-t border-border pt-3">
          <p className="text-xs text-muted-foreground">
            Координаты: {animal.coordinates
              ? `${animal.coordinates.lat.toFixed(5)}, ${animal.coordinates.lng.toFixed(5)}`
              : 'нет данных от GPS'}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
