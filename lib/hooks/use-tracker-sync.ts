'use client'

import { useApp } from '@/lib/context/app-context'
import { useEffect, useRef } from 'react'

interface AnimalUpdate {
	type: string
	animalId: string
	coordinates: { lat: number; lng: number } | null
	satellites: number
	batteryLevel: number
	hasGpsSignal: boolean
	timestamp: string
}

export function useTrackerSync() {
	const { animals, updateAnimal, addNotification } = useApp()
	const animalsRef = useRef(animals)

	useEffect(() => {
		animalsRef.current = animals
	}, [animals])

	useEffect(() => {
		let eventSource: EventSource | null = null
		let reconnectAttempts = 0
		const maxReconnectAttempts = 5
		const reconnectDelay = 3000

		function connect() {
			console.log('[TrackerSync] Connecting to stream...')
			eventSource = new EventSource('/api/animals/stream')

			eventSource.addEventListener('open', () => {
				console.log('[TrackerSync] Connected')
				reconnectAttempts = 0
			})

			eventSource.addEventListener('message', event => {
				try {
					const data: AnimalUpdate = JSON.parse(event.data)
					console.log('[TrackerSync] Received update:', data)

					if (data.type === 'animal_update') {
						const animal = animalsRef.current.find(a => a.trackerId === data.animalId || a.id === data.animalId)

						if (animal) {
							console.log('[TrackerSync] Updating animal:', animal.id)

							const updatePayload: Partial<typeof animal> = {
								lastSeen: new Date(),
								batteryLevel: data.batteryLevel,
								satellites: data.satellites,
								hasGpsSignal: data.hasGpsSignal,
							}

							if (data.hasGpsSignal && data.coordinates) {
								updatePayload.coordinates = data.coordinates
								updatePayload.status = 'online'
								updatePayload.history = animal.coordinates
									? [
											{
												coordinates: animal.coordinates,
												timestamp: new Date(animal.lastSeen),
											},
											...animal.history,
										].slice(0, 50)
									: animal.history
							} else {
								if (animal.status !== 'alert') {
									updatePayload.status = 'alert'
									addNotification({
										type: 'gps_lost',
										animalId: animal.id,
										animalName: animal.name,
										message: `${animal.name}: нет сигнала GPS на трекере`,
									})
								} else {
									updatePayload.status = 'alert'
								}
							}

							updateAnimal(animal.id, updatePayload)
						} else {
							console.warn('[TrackerSync] Animal not found:', data.animalId)
						}
					}
				} catch (error) {
					console.error('[TrackerSync] Error parsing message:', error)
				}
			})

			eventSource.addEventListener('error', () => {
				console.error('[TrackerSync] Connection error')

				if (eventSource) {
					eventSource.close()
					eventSource = null
				}

				// Пытаемся переподключиться
				if (reconnectAttempts < maxReconnectAttempts) {
					reconnectAttempts++
					console.log(
						`[TrackerSync] Reconnecting in ${reconnectDelay}ms (attempt ${reconnectAttempts}/${maxReconnectAttempts})`,
					)
					setTimeout(connect, reconnectDelay)
				} else {
					console.error('[TrackerSync] Max reconnection attempts reached')
					addNotification({
						type: 'connection_lost',
						animalId: 'system',
						animalName: 'Система',
						message: 'Потеряна связь с серверому трекеров',
					})
				}
			})
		}

		connect()

		return () => {
			if (eventSource) {
				eventSource.close()
				eventSource = null
			}
		}
	}, [updateAnimal, addNotification])
}
