export interface Coordinates {
  lat: number
  lng: number
}

export interface CoordinateHistory {
  coordinates: Coordinates
  timestamp: Date
}

export interface Animal {
  id: string
  name: string
  trackerId: string
  coordinates: Coordinates
  status: 'online' | 'offline' | 'alert'
  batteryLevel: number
  lastSeen: Date
  history: CoordinateHistory[]
}

export interface Zone {
  id: string
  name: string
  coordinates: Coordinates[]
  color: string
}

export interface Notification {
  id: string
  type: 'zone_exit' | 'connection_lost' | 'low_battery'
  animalId: string
  animalName: string
  message: string
  timestamp: Date
  read: boolean
}

export interface User {
  id: string
  email: string
  name: string
}
