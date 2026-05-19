import { NextRequest, NextResponse } from 'next/server'

// Хранилище для подписчиков WebSocket
const subscribers = new Set<(data: any) => void>()

interface ParsedTrackerData {
	animalId: string
	coordinates: { lat: number; lng: number } | null
	satellites: number
	batteryLevel: number
	hasGpsSignal: boolean
}

// Парсер данных из формата: id;lat;lng;satellites;battery
function parseTrackerData(data: string): ParsedTrackerData | null {
	try {
		const cleanData = data.trim().replace(/^\[ESP LOG\]\s*/i, '')
		const parts = cleanData.split(';').map(part => part.trim())
		if (parts.length < 5) return null

		const animalId = parts[0]
		const lat = parseFloat(parts[1])
		const lng = parseFloat(parts[2])
		const satellites = Number.isNaN(parseInt(parts[3], 10)) ? 0 : parseInt(parts[3], 10)
		const batteryLevel = Number.isNaN(parseInt(parts[4], 10)) ? 0 : parseInt(parts[4], 10)

		const hasGpsSignal = !Number.isNaN(lat) && !Number.isNaN(lng) && !(lat === 0 && lng === 0) && satellites > 0

		return {
			animalId,
			coordinates: hasGpsSignal ? { lat, lng } : null,
			satellites,
			batteryLevel,
			hasGpsSignal,
		}
	} catch (error) {
		console.error('[API] Error parsing tracker data:', error)
		return null
	}
}

// Функция для уведомления всех подписчиков
export function notifySubscribers(data: any) {
	subscribers.forEach(subscriber => {
		try {
			subscriber(data)
		} catch (error) {
			console.error('[WebSocket] Error notifying subscriber:', error)
		}
	})
}

// Регистрация подписчика
export function addSubscriber(callback: (data: any) => void) {
	subscribers.add(callback)
	return () => subscribers.delete(callback)
}

// Получить количество подписчиков
export function getSubscriberCount() {
	return subscribers.size
}

export async function POST(request: NextRequest) {
	try {
		const text = await request.text()
		console.log('[API] Received tracker data:', text)

		const parsed = parseTrackerData(text)

		if (!parsed) {
			return NextResponse.json({ error: 'Invalid data format' }, { status: 400 })
		}

		console.log('[API] Parsed:', parsed)

		// Уведомляем всех подписчиков о новых данных
		notifySubscribers({
			type: 'animal_update',
			animalId: parsed.animalId,
			coordinates: parsed.coordinates,
			satellites: parsed.satellites,
			batteryLevel: parsed.batteryLevel,
			hasGpsSignal: parsed.hasGpsSignal,
			timestamp: new Date().toISOString(),
		})

		return NextResponse.json({
			success: true,
			message: 'Data received',
			subscribers: getSubscriberCount(),
		})
	} catch (error) {
		console.error('[API] Error:', error)
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
	}
}
