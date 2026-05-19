'use client'

import { MAP_CENTER, mockAnimals, mockNotifications, mockZones } from '@/lib/data/mock-data'
import type { Animal, Coordinates, Notification, Zone } from '@/lib/types'
import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react'

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
	const STORAGE_KEYS = {
		animals: 'sa:animals',
		zones: 'sa:zones',
		notifications: 'sa:notifications',
	}

	const loadFromStorage = <T,>(key: string, fallback: T): T => {
		try {
			if (typeof window === 'undefined') return fallback
			const raw = localStorage.getItem(key)
			if (!raw) return fallback
			const parsed = JSON.parse(raw) as unknown as T
			return parsed
		} catch (e) {
			console.error('Error loading from storage', key, e)
			return fallback
		}
	}

	const [animals, setAnimals] = useState<Animal[]>(() => {
		const stored = loadFromStorage<Animal[]>(STORAGE_KEYS.animals, null as any)
		if (stored && Array.isArray(stored)) {
			return stored.map(a => ({ ...a, lastSeen: a.lastSeen ? new Date(a.lastSeen) : a.lastSeen }))
		}
		return mockAnimals
	})
	const [zones, setZones] = useState<Zone[]>(() => loadFromStorage<Zone[]>(STORAGE_KEYS.zones, mockZones))
	const [notifications, setNotifications] = useState<Notification[]>(() => {
		const stored = loadFromStorage<Notification[]>(STORAGE_KEYS.notifications, null as any)
		if (stored && Array.isArray(stored)) {
			return stored.map(n => ({ ...n, timestamp: n.timestamp ? new Date(n.timestamp) : n.timestamp }))
		}
		return mockNotifications
	})
	const [selectedAnimalId, setSelectedAnimalId] = useState<string | null>(null)
	const [isDrawingZone, setIsDrawingZone] = useState(false)
	const [drawingCoordinates, setDrawingCoordinates] = useState<Coordinates[]>([])
	const [mapCenter, setMapCenter] = useState<Coordinates>(MAP_CENTER)
	const [mapType, setMapType] = useState<MapType>('satellite')

	const addAnimal = useCallback((animal: Omit<Animal, 'id' | 'history' | 'lastSeen'>) => {
		const newAnimal: Animal = {
			...animal,
			id: `animal-${Date.now()}`,
			history: [],
			lastSeen: new Date(),
		}
		setAnimals(prev => [...prev, newAnimal])
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
		setDrawingCoordinates(prev => {
			const newCoords = [...prev, coord]
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

	useEffect(() => {
		try {
			localStorage.setItem(STORAGE_KEYS.animals, JSON.stringify(animals))
		} catch (e) {
			console.error('Failed to save animals to storage', e)
		}
	}, [animals])

	useEffect(() => {
		try {
			localStorage.setItem(STORAGE_KEYS.zones, JSON.stringify(zones))
		} catch (e) {
			console.error('Failed to save zones to storage', e)
		}
	}, [zones])

	useEffect(() => {
		try {
			const serial = notifications.map(n => ({
				...n,
				timestamp: n.timestamp ? new Date(n.timestamp).toISOString() : n.timestamp,
			}))
			localStorage.setItem(STORAGE_KEYS.notifications, JSON.stringify(serial))
		} catch (e) {
			console.error('Failed to save notifications to storage', e)
		}
	}, [notifications])

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
