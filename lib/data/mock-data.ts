import type { Animal, Zone, Notification } from '@/lib/types'

// Центр пастбища - примерные координаты сельской местности
const CENTER = { lat: 43.2220, lng: 76.8512 }

export const mockAnimals: Animal[] = [
  {
    id: 'animal-101',
    name: 'Баран 101',
    trackerId: '101',
    coordinates: null,
    status: 'offline',
    batteryLevel: 0,
    satellites: 0,
    hasGpsSignal: false,
    lastSeen: new Date(),
    history: []
  },
]

export const mockZones: Zone[] = [
  {
    id: 'zone-1',
    name: 'Основное пастбище',
    coordinates: [
      { lat: CENTER.lat + 0.005, lng: CENTER.lng - 0.005 },
      { lat: CENTER.lat + 0.005, lng: CENTER.lng + 0.008 },
      { lat: CENTER.lat - 0.004, lng: CENTER.lng + 0.008 },
      { lat: CENTER.lat - 0.004, lng: CENTER.lng - 0.005 },
    ],
    color: '#22c55e'
  }
]

export const mockNotifications: Notification[] = []

export const MAP_CENTER = CENTER
