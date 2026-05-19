'use client'

import { useApp } from '@/lib/context/app-context'
import { useEffect, useRef } from 'react'

interface ConnectionCheckConfig {
	/** Таймаут без обновлений (мс) */
	timeoutMs?: number
	/** Интервал проверки (мс) */
	checkIntervalMs?: number
	/** Минимальное время для уведомления (мс) */
	notificationDelayMs?: number
}

/**
 * Хук для обнаружения потери связи с трекерами
 * Если животное не обновляет свою позицию в течение timeout,
 * его статус меняется на 'offline' и отправляется уведомление
 */
export function useConnectionCheck({
	timeoutMs = 60 * 1000, // 1 минута по умолчанию
	checkIntervalMs = 15000, // Проверяем каждые 15 секунд
	notificationDelayMs = 60 * 1000, // Уведомляем через 1 минуту после потери
}: ConnectionCheckConfig = {}) {
	const { animals, updateAnimal, addNotification } = useApp()
	const notifiedAnimalsRef = useRef<Set<string>>(new Set())

	useEffect(() => {
		const checkConnection = () => {
			const now = Date.now()

			animals.forEach(animal => {
				const timeSinceLastSeen = now - animal.lastSeen.getTime()
				const isTimedOut = timeSinceLastSeen > timeoutMs

				if (isTimedOut && animal.status !== 'offline') {
					// Меняем статус на offline
					console.log(`[ConnectionCheck] Animal ${animal.name} timeout detected`)
					updateAnimal(animal.id, { status: 'offline' })

					// Отправляем уведомление если еще не отправляли
					if (timeSinceLastSeen > notificationDelayMs && !notifiedAnimalsRef.current.has(animal.id)) {
						notifiedAnimalsRef.current.add(animal.id)
						console.log(`[ConnectionCheck] Sending notification for ${animal.name}`)
						addNotification({
							type: 'connection_lost',
							animalId: animal.id,
							animalName: animal.name,
							message: `${animal.name} вне сети: нет связи больше ${Math.round(timeSinceLastSeen / 1000)} секунд`,
						})
					}
				} else if (!isTimedOut && animal.status === 'offline') {
					// Восстанавливаем статус если соединение вернулось
					console.log(`[ConnectionCheck] Animal ${animal.name} is online again`)
					updateAnimal(animal.id, { status: animal.hasGpsSignal ? 'online' : 'alert' })
					notifiedAnimalsRef.current.delete(animal.id)
				}
			})
		}

		const interval = setInterval(checkConnection, checkIntervalMs)

		return () => clearInterval(interval)
	}, [animals, updateAnimal, addNotification, timeoutMs, checkIntervalMs, notificationDelayMs])
}
