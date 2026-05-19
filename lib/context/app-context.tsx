'use client'

import { MAP_CENTER, mockAnimals, mockNotifications, mockZones } from '@/lib/data/mock-data'
import type { Animal, Coordinates, Notification, Zone } from '@/lib/types'
import { createContext, ReactNode, useCallback, useContext, useState } from 'react'

type MapType = 'satellite' | 'streets' | 'hybrid'

interface AppState {
	animals: Animal[]
	zones: Zone[]
	notifications: Notification[]
	selectedAnimalId: string | null
	isDrawingZone: boolean
	drawingCoordinates: Coordinates[]
	mapCenter: Coordinates
	mapType: MapType
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
	setMapType: (type: MapType) => void
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
	const [mapType, setMapType] = useState<MapType>('satellite')

	const addAnimal = useCallback((animal: Omit<Animal, 'id' | 'history' | 'lastSeen'>) => {
		console.log('[v0] Adding animal:', animal)
		const newAnimal: Animal = {
			...animal,
			id: `animal-${Date.now()}`,
			history: [],
			lastSeen: new Date(),
		}
		setAnimals(prev => [...prev, newAnimal])
		console.log('[v0] Animal added successfully:', newAnimal.id)
		return newAnimal
	}, [])

	const removeAnimal = useCallback(
		(id: string) => {
			setAnimals(prev => prev.filter(a => a.id !== id))
			if (selectedAnimalId === id) {
				setSelectedAnimalId(null)
			}
		},
		[selectedAnimalId],
	)

	const updateAnimal = useCallback((id: string, updates: Partial<Animal>) => {
		setAnimals(prev => prev.map(a => (a.id === id ? { ...a, ...updates } : a)))
	}, [])

	const addZone = useCallback((name: string, coordinates: Coordinates[], color: string) => {
		const newZone: Zone = {
			id: `zone-${Date.now()}`,
			name,
			coordinates,
			color,
		}
		setZones(prev => [...prev, newZone])
		return newZone
	}, [])

	const removeZone = useCallback((id: string) => {
		setZones(prev => prev.filter(z => z.id !== id))
	}, [])

	const startDrawingZone = useCallback(() => {
		setIsDrawingZone(true)
		setDrawingCoordinates([])
	}, [])

	const addDrawingPoint = useCallback((coord: Coordinates) => {
		console.log('[v0] Adding drawing point:', coord)
		setDrawingCoordinates(prev => {
			const newCoords = [...prev, coord]
			console.log('[v0] Drawing coordinates now:', newCoords.length)
			return newCoords
		})
	}, [])

	const finishDrawingZone = useCallback(() => {
		setIsDrawingZone(false)
		const coords = [...drawingCoordinates]
		setDrawingCoordinates([])
		return coords
	}, [drawingCoordinates])

	const cancelDrawingZone = useCallback(() => {
		setIsDrawingZone(false)
		setDrawingCoordinates([])
	}, [])

	const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
		const newNotification: Notification = {
			...notification,
			id: `notif-${Date.now()}`,
			timestamp: new Date(),
			read: false,
		}
		setNotifications(prev => [newNotification, ...prev])
	}, [])

	const markNotificationRead = useCallback((id: string) => {
		setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)))
	}, [])

	const setMapCenterValue = useCallback((center: Coordinates) => {
		setMapCenter(center)
	}, [])

	const setMapTypeValue = useCallback((type: MapType) => {
		setMapType(type)
	}, [])

	return (
		<AppContext.Provider
			value={{
				animals,
				zones,
				notifications,
				selectedAnimalId,
				isDrawingZone,
				drawingCoordinates,
				mapCenter,
				mapType,
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
				setMapCenter: setMapCenterValue,
				setMapType: setMapTypeValue,
			}}
		>
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
