import type { Animal, Notification, Zone } from '@/lib/types'

// Центр пастбища - примерные координаты сельской местности
const CENTER = { lat: 43.222, lng: 76.8512 }

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
		history: [],
	},
]

export const mockZones: Zone[] = []

export const mockNotifications: Notification[] = []

export const MAP_CENTER = CENTER
