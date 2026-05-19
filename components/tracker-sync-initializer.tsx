'use client'

import { useConnectionCheck } from '@/lib/hooks/use-connection-check'
import { useTrackerSync } from '@/lib/hooks/use-tracker-sync'
import { useZoneCheck } from '@/lib/hooks/use-zone-check'

/**
 * Компонент инициализирует синхронизацию с трекерами животных
 * Включает:
 * - Синхронизацию позиций (SSE)
 * - Проверку потери связи
 * - Проверку выхода за пределы зон
 *
 * Должен быть размещен внутри AppProvider
 */
export function TrackerSyncInitializer() {
	// Инициализируем синхронизацию позиций
	useTrackerSync()

	// Инициализируем проверку потери связи (5 минут таймаут)
	useConnectionCheck({
		timeoutMs: 60 * 1000, // 1 минута
		checkIntervalMs: 15000, // Проверяем каждые 15 секунд
		notificationDelayMs: 60 * 1000, // Уведомляем через 1 минуту
	})

	// Инициализируем проверку зон
	useZoneCheck({
		checkIntervalMs: 10000, // Проверяем каждые 10 секунд
	})

	return null
}
