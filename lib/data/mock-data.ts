import type { Animal, Zone, Notification } from '@/lib/types'

// Центр пастбища - примерные координаты сельской местности
const CENTER = { lat: 43.2220, lng: 76.8512 }

export const mockAnimals: Animal[] = [
  {
    id: '1',
    name: 'Барашек',
    trackerId: 'TRK-001',
    coordinates: { lat: CENTER.lat + 0.002, lng: CENTER.lng + 0.003 },
    status: 'online',
    batteryLevel: 85,
    lastSeen: new Date(),
    history: [
      { coordinates: { lat: CENTER.lat + 0.001, lng: CENTER.lng + 0.002 }, timestamp: new Date(Date.now() - 3600000) },
      { coordinates: { lat: CENTER.lat + 0.0015, lng: CENTER.lng + 0.0025 }, timestamp: new Date(Date.now() - 1800000) },
    ]
  },
  {
    id: '2',
    name: 'Кудряш',
    trackerId: 'TRK-002',
    coordinates: { lat: CENTER.lat - 0.001, lng: CENTER.lng + 0.002 },
    status: 'online',
    batteryLevel: 72,
    lastSeen: new Date(),
    history: []
  },
  {
    id: '3',
    name: 'Белый',
    trackerId: 'TRK-003',
    coordinates: { lat: CENTER.lat + 0.001, lng: CENTER.lng - 0.001 },
    status: 'online',
    batteryLevel: 91,
    lastSeen: new Date(),
    history: []
  },
  {
    id: '4',
    name: 'Рогач',
    trackerId: 'TRK-004',
    coordinates: { lat: CENTER.lat + 0.008, lng: CENTER.lng + 0.01 },
    status: 'alert',
    batteryLevel: 45,
    lastSeen: new Date(Date.now() - 300000),
    history: []
  },
  {
    id: '5',
    name: 'Серый',
    trackerId: 'TRK-005',
    coordinates: { lat: CENTER.lat - 0.003, lng: CENTER.lng - 0.002 },
    status: 'online',
    batteryLevel: 63,
    lastSeen: new Date(),
    history: []
  },
  {
    id: '6',
    name: 'Пушок',
    trackerId: 'TRK-006',
    coordinates: { lat: CENTER.lat + 0.0005, lng: CENTER.lng + 0.001 },
    status: 'offline',
    batteryLevel: 12,
    lastSeen: new Date(Date.now() - 7200000),
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

export const mockNotifications: Notification[] = [
  {
    id: 'notif-1',
    type: 'zone_exit',
    animalId: '4',
    animalName: 'Рогач',
    message: 'Рогач вышел за пределы зоны "Основное пастбище"',
    timestamp: new Date(Date.now() - 300000),
    read: false
  },
  {
    id: 'notif-2',
    type: 'connection_lost',
    animalId: '6',
    animalName: 'Пушок',
    message: 'Потеряна связь с Пушок более 2 часов назад',
    timestamp: new Date(Date.now() - 7200000),
    read: false
  },
  {
    id: 'notif-3',
    type: 'low_battery',
    animalId: '6',
    animalName: 'Пушок',
    message: 'Низкий заряд батареи у Пушок (12%)',
    timestamp: new Date(Date.now() - 7800000),
    read: true
  }
]

export const MAP_CENTER = CENTER
