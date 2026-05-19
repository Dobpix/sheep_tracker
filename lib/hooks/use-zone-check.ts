'use client'

import { useApp } from '@/lib/context/app-context'
import type { Coordinates } from '@/lib/types'
import { useEffect, useRef } from 'react'

/**
 * Проверяет, находится ли точка внутри полигона (алгоритм ray casting)
 */
function isPointInPolygon(point: Coordinates, polygon: Coordinates[]): boolean {
	let isInside = false
	let j = polygon.length - 1

	for (let i = 0; i < polygon.length; j = i++) {
		const xi = polygon[i].lng
		const yi = polygon[i].lat
		const xj = polygon[j].lng
		const yj = polygon[j].lat

		const intersect = yi > point.lat !== yj > point.lat && point.lng < ((xj - xi) * (point.lat - yi)) / (yj - yi) + xi
		if (intersect) {
			isInside = !isInside
		}
	}

	return isInside
}

interface ZoneCheckConfig {
	/** Интервал проверки (мс) */
	checkIntervalMs?: number
}

/**
 * Хук для обнаружения выхода животных за пределы зон
 * Если животное пересекает границу зоны, отправляется уведомление
 */
export function useZoneCheck({ checkIntervalMs = 30000 }: ZoneCheckConfig = {}) {
	const { animals, zones, addNotification } = useApp()

	// Храним информацию о том, какое животное уже вышло из какой зоны
	const exitedZonesRef = useRef<Map<string, Set<string>>>(new Map())

	useEffect(() => {
		const checkZones = () => {
			animals.forEach(animal => {
				const coordinates = animal.coordinates

				if (!coordinates || animal.status === 'offline') {
					return
				}

				zones.forEach(zone => {
					const isInside = isPointInPolygon(coordinates, zone.coordinates)

					// Инициализируем, если нужно
					if (!exitedZonesRef.current.has(animal.id)) {
						exitedZonesRef.current.set(animal.id, new Set())
					}

					const exitedZones = exitedZonesRef.current.get(animal.id)!

					if (!isInside && !exitedZones.has(zone.id)) {
						// Животное вышло из зоны
						exitedZones.add(zone.id)
						console.log(`[ZoneCheck] ${animal.name} left zone: ${zone.name}`)

						addNotification({
							type: 'zone_exit',
							animalId: animal.id,
							animalName: animal.name,
							message: `${animal.name} вышел за пределы зоны "${zone.name}"`,
						})
					} else if (isInside && exitedZones.has(zone.id)) {
						// Животное вернулось в зону
						exitedZones.delete(zone.id)
						console.log(`[ZoneCheck] ${animal.name} returned to zone: ${zone.name}`)
					}
				})
			})
		}

		const interval = setInterval(checkZones, checkIntervalMs)

		return () => clearInterval(interval)
	}, [animals, zones, addNotification, checkIntervalMs])
}
