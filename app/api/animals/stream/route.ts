import { addSubscriber } from '../update/route'

export const runtime = 'nodejs'

export async function GET() {
	// Используем Server-Sent Events (SSE)
	const encoder = new TextEncoder()

	let controller: ReadableStreamDefaultController<Uint8Array> | null = null

	// Добавляем подписчика на обновления
	const unsubscribe = addSubscriber(data => {
		if (controller) {
			try {
				const message = `data: ${JSON.stringify(data)}\n\n`
				controller.enqueue(encoder.encode(message))
			} catch (error) {
				console.error('[SSE] Error sending data:', error)
			}
		}
	})

	// Отправляем heartbeat каждые 30 секунд
	const heartbeatInterval = setInterval(() => {
		if (controller) {
			try {
				controller.enqueue(encoder.encode(': heartbeat\n\n'))
			} catch (error) {
				console.error('[SSE] Error sending heartbeat:', error)
				clearInterval(heartbeatInterval)
			}
		}
	}, 30000)

	const cleanup = () => {
		clearInterval(heartbeatInterval)
		unsubscribe()
	}

	const stream = new ReadableStream<Uint8Array>({
		start(c) {
			controller = c
		},
		cancel() {
			console.log('[SSE] Stream cancelled')
			cleanup()
		},
	})

	return new Response(stream, {
		headers: {
			'Content-Type': 'text/event-stream',
			'Cache-Control': 'no-cache, no-transform',
			Connection: 'keep-alive',
			'X-Accel-Buffering': 'no',
		},
	})
}
