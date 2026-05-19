import type { Animal, Notification, Zone } from '@/lib/types'

// Центр карты по умолчанию — Ульяновск
// Координаты: 54.305, 48.375 (широта, долгота)
const CENTER = { lat: 54.305, lng: 48.375 }

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
