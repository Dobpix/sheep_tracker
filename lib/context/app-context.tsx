'use client'

import { createContext, useContext, useState, ReactNode } from 'react'
import type { Animal, Zone, Notification, Coordinates } from '@/lib/types'
import { mockAnimals, mockZones, mockNotifications, MAP_CENTER } from '@/lib/data/mock-data'

interface AppState {
  animals: Animal[]
  zones: Zone[]
  notifications: Notification[]
  selectedAnimalId: string | null
  isDrawingZone: boolean
  drawingCoordinates: Coordinates[]
  mapCenter: Coordinates
}

interface AppContextType extends AppState {
  setSelectedAnimalId: (id: string | null) => void
  addAnimal: (animal: Omit<Animal, 'id' | 'history' | 'lastSeen'>) => Animal
  removeAnimal: (id: string) => void
  updateAnimal: (id: string, updates: Partial<Animal>) => void
  addZone: (name: string, coordinates: Coordinates[], color: string) => Zone
  removeZone: (id: string) => void
  startDrawingZone: () => void
  addDrawingPoint: (coord: Coordinates) => void
  finishDrawingZone: () => Coordinates[]
  cancelDrawingZone: () => void
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void
  markNotificationRead: (id: string) => void
  setMapCenter: (center: Coordinates) => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: ReactNode }) {
  const [animals, setAnimals] = useState<Animal[]>(mockAnimals)
  const [zones, setZones] = useState<Zone[]>(mockZones)
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications)
  const [selectedAnimalId, setSelectedAnimalId] = useState<string | null>(null)
  const [isDrawingZone, setIsDrawingZone] = useState(false)
  const [drawingCoordinates, setDrawingCoordinates] = useState<Coordinates[]>([])
  const [mapCenter, setMapCenter] = useState<Coordinates>(MAP_CENTER)

  const addAnimal = (animal: Omit<Animal, 'id' | 'history' | 'lastSeen'>) => {
    const newAnimal: Animal = {
      ...animal,
      id: `animal-${Date.now()}`,
      history: [],
      lastSeen: new Date()
    }
    setAnimals(prev => [...prev, newAnimal])
    return newAnimal
  }

  const removeAnimal = (id: string) => {
    setAnimals(prev => prev.filter(a => a.id !== id))
    if (selectedAnimalId === id) {
      setSelectedAnimalId(null)
    }
  }

  const updateAnimal = (id: string, updates: Partial<Animal>) => {
    setAnimals(prev => prev.map(a => 
      a.id === id ? { ...a, ...updates } : a
    ))
  }

  const addZone = (name: string, coordinates: Coordinates[], color: string) => {
    const newZone: Zone = {
      id: `zone-${Date.now()}`,
      name,
      coordinates,
      color
    }
    setZones(prev => [...prev, newZone])
    return newZone
  }

  const removeZone = (id: string) => {
    setZones(prev => prev.filter(z => z.id !== id))
  }

  const startDrawingZone = () => {
    setIsDrawingZone(true)
    setDrawingCoordinates([])
  }

  const addDrawingPoint = (coord: Coordinates) => {
    setDrawingCoordinates(prev => [...prev, coord])
  }

  const finishDrawingZone = () => {
    setIsDrawingZone(false)
    const coords = [...drawingCoordinates]
    setDrawingCoordinates([])
    return coords
  }

  const cancelDrawingZone = () => {
    setIsDrawingZone(false)
    setDrawingCoordinates([])
  }

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `notif-${Date.now()}`,
      timestamp: new Date(),
      read: false
    }
    setNotifications(prev => [newNotification, ...prev])
  }

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n =>
      n.id === id ? { ...n, read: true } : n
    ))
  }

  return (
    <AppContext.Provider value={{
      animals,
      zones,
      notifications,
      selectedAnimalId,
      isDrawingZone,
      drawingCoordinates,
      mapCenter,
      setSelectedAnimalId,
      addAnimal,
      removeAnimal,
      updateAnimal,
      addZone,
      removeZone,
      startDrawingZone,
      addDrawingPoint,
      finishDrawingZone,
      cancelDrawingZone,
      addNotification,
      markNotificationRead,
      setMapCenter
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within AppProvider')
  }
  return context
}
