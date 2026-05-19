# API Documentation - Sheep Tracker

## Base URL

```
http://localhost:3000/api
```

## Endpoints

### 1. Получение обновлений животных (SSE Stream)

**Endpoint:** `GET /animals/stream`

**Описание:** Server-Sent Events поток для получения обновлений позиций животных в реальном времени

**Заголовки ответа:**

```
Content-Type: text/event-stream
Cache-Control: no-cache, no-transform
Connection: keep-alive
X-Accel-Buffering: no
```

**Формат данных:**

```
data: {"type":"animal_update","animalId":"101","coordinates":{"lat":43.2220,"lng":76.8512},"timestamp":"2026-05-13T10:30:45.123Z"}
```

**Пример использования (JavaScript):**

```javascript
const eventSource = new EventSource('/api/animals/stream')

eventSource.onopen = () => {
	console.log('Connected to stream')
}

eventSource.onmessage = event => {
	const data = JSON.parse(event.data)
	console.log('Received update:', data)
	// {
	//   type: "animal_update",
	//   animalId: "101",
	//   coordinates: { lat: 43.2220, lng: 76.8512 },
	//   timestamp: "2026-05-13T10:30:45.123Z"
	// }
}

eventSource.onerror = () => {
	console.log('Disconnected')
	eventSource.close()
}
```

**Heartbeat:** Сервер отправляет heartbeat каждые 30 секунд для поддержания соединения

---

### 2. Отправка обновления позиции животного

**Endpoint:** `POST /animals/update`

**Описание:** Получает данные позиции животного и рассылает их всем подписчикам SSE

**Content-Type:** `text/plain`

**Body format:** `trackerId;1;"latitude";2;"longitude"`

**Примеры:**

```
101;1;"43.2220";2;"76.8512"
102;1;"43.2235";2;"76.8535"
103;1;"43.2218";2;"76.8510"
```

**Ответ (200 OK):**

```json
{
	"success": true,
	"message": "Data received",
	"subscribers": 1
}
```

**Ошибка (400 Bad Request):**

```json
{
	"error": "Invalid data format"
}
```

**Пример использования (curl):**

```bash
curl -X POST http://localhost:3000/api/animals/update \
  -H "Content-Type: text/plain" \
  -d '101;1;"43.2220";2;"76.8512"'
```

**Пример использования (Python):**

```python
import requests

data = '101;1;"43.2220";2;"76.8512"'
response = requests.post(
  'http://localhost:3000/api/animals/update',
  data=data,
  headers={'Content-Type': 'text/plain'}
)

print(response.json())
# {'success': True, 'message': 'Data received', 'subscribers': 1}
```

**Пример использования (JavaScript):**

```javascript
const data = '101;1;"43.2220";2;"76.8512"'

fetch('/api/animals/update', {
	method: 'POST',
	headers: {
		'Content-Type': 'text/plain',
	},
	body: data,
})
	.then(res => res.json())
	.then(data => console.log(data))
// {success: true, message: "Data received", subscribers: 1}
```

---

## Data Format Specification

### Input Format (Microcontroller → Next.js API)

**Pattern:** `trackerId;1;"latitude";2;"longitude"`

**Fields:**

- `trackerId` - Идентификатор трекера/животного (целое число или строка)
- `1` - Ключ для широты (всегда "1")
- `"latitude"` - Широта в формате строки в двойных кавычках (decimals)
- `2` - Ключ для долготы (всегда "2")
- `"longitude"` - Долгота в формате строки в двойных кавычках (decimals)

**Примеры:**

```
101;1;"43.222000";2;"76.851200"
TRK-001;1;"43.2220";2;"76.8512"
1;1;"43.222";2;"76.851"
```

### Output Format (Next.js → React Frontend via SSE)

**Type:** JSON over SSE

**Fields:**

```typescript
interface AnimalUpdate {
	type: 'animal_update'
	animalId: string // trackerId от микроконтроллера
	coordinates: {
		lat: number // Широта
		lng: number // Долгота
	}
	timestamp: string // ISO 8601 timestamp
}
```

**Пример:**

```json
{
	"type": "animal_update",
	"animalId": "101",
	"coordinates": {
		"lat": 43.222,
		"lng": 76.8512
	},
	"timestamp": "2026-05-13T10:30:45.123Z"
}
```

---

## Architecture Flow

```
Microcontroller (ESP32)
    │
    ├─ Sends: 101;1;"43.2220";2;"76.8512"
    │
    ↓
Python Base Station (localhost:5000)
    │
    ├─ Parses data
    │
    ├─ Forwards to: POST /api/animals/update
    │
    ↓
Next.js API Route (POST /api/animals/update)
    │
    ├─ Parses trackerId and coordinates
    │
    ├─ Creates AnimalUpdate object
    │
    ├─ Notifies all SSE subscribers
    │
    ↓
Next.js API Route (GET /api/animals/stream)
    │
    ├─ Broadcasts update to all connected clients
    │
    ↓
React Frontend (Browser)
    │
    ├─ Receives event via EventSource
    │
    ├─ Updates animal position in state
    │
    ├─ Updates map markers
    │
    ├─ Triggers zone checks
    │
    ├─ Triggers connection checks
    │
    ├─ Shows notifications
    │
    ↓
Map Updates in Real-Time
```

---

## Error Handling

### Parsing Errors

If the data format is invalid:

```json
{
	"error": "Invalid data format",
	"status": 400
}
```

**Common causes:**

- Missing trackerId
- Missing coordinates
- Incorrect delimiter (should be `;`)
- Coordinates not in quotes
- Non-numeric coordinate values

### Server Errors

If there's an internal server error:

```json
{
	"error": "Internal server error",
	"status": 500
}
```

### Connection Errors

If SSE connection drops:

- Browser automatically reconnects with exponential backoff
- Max 5 reconnection attempts
- Backoff time: 3 seconds per attempt

---

## Performance Considerations

### Update Frequency

Recommended update intervals by use case:

- **Real-time tracking:** 5-10 seconds
- **Regular monitoring:** 30 seconds
- **Daily tracking:** 1-5 minutes

### SSE Subscribers

- Limit: No hard limit (depends on server resources)
- Typical: 1-100 concurrent connections
- Each subscriber receives all animal updates

### Data Retention

- **In-memory history:** Last 50 positions per animal
- **Real-time state:** React context (lost on page refresh)
- **Persistence:** Not implemented (add database for production)

---

## Security Considerations

⚠️ **Current implementation has no authentication!**

For production, add:

### 1. API Key Authentication

**Header:** `X-API-Key: your-secret-key`

```typescript
// In API route
const apiKey = request.headers.get('x-api-key')
if (apiKey !== process.env.TRACKER_API_KEY) {
	return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}
```

### 2. JWT Token Authentication

```typescript
// In API route
const token = request.headers.get('authorization')?.split(' ')[1]
if (!token || !verifyJWT(token)) {
	return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}
```

### 3. Rate Limiting

```typescript
// Limit to 100 updates per minute per tracker
import { Ratelimit } from '@upstash/ratelimit'

const ratelimit = new Ratelimit({
	redis: Redis.fromEnv(),
	limiter: Ratelimit.slidingWindow(100, '1 m'),
})

const { success } = await ratelimit.limit(trackerId)
if (!success) {
	return NextResponse.json({ error: 'Rate limited' }, { status: 429 })
}
```

### 4. HTTPS/TLS

Always use HTTPS in production to encrypt data in transit.

---

## Testing

### Using curl

```bash
# Send single update
curl -X POST http://localhost:3000/api/animals/update \
  -H "Content-Type: text/plain" \
  -d '101;1;"43.2220";2;"76.8512"'

# Stream events (in another terminal)
curl -N http://localhost:3000/api/animals/stream

# Send multiple updates
for i in {1..10}; do
  curl -X POST http://localhost:3000/api/animals/update \
    -H "Content-Type: text/plain" \
    -d "101;1;\"$(echo '43.2220 + 0.0001 * $i' | bc)\";2;\"76.8512\""
  sleep 1
done
```

### Using Python

```python
import requests
import time

# Send updates every 5 seconds
for i in range(10):
  lat = 43.2220 + (i * 0.0001)
  lng = 76.8512
  data = f'101;1;"{lat}";2;"{lng}"'

  response = requests.post(
    'http://localhost:3000/api/animals/update',
    data=data,
    headers={'Content-Type': 'text/plain'}
  )

  print(f"Update {i+1}: {response.json()}")
  time.sleep(5)
```

### Using JavaScript

```javascript
// SSE client
const eventSource = new EventSource('/api/animals/stream')
const updates = []

eventSource.onmessage = event => {
	const data = JSON.parse(event.data)
	updates.push(data)
	console.log(`Received update ${updates.length}:`, data)
}

// Sender
async function sendUpdate(trackerId, lat, lng) {
	const response = await fetch('/api/animals/update', {
		method: 'POST',
		headers: { 'Content-Type': 'text/plain' },
		body: `${trackerId};1;"${lat}";2;"${lng}"`,
	})
	return response.json()
}

// Send updates
for (let i = 0; i < 10; i++) {
	await sendUpdate('101', 43.222 + i * 0.0001, 76.8512)
	await new Promise(resolve => setTimeout(resolve, 5000))
}
```

---

## Troubleshooting

| Issue                 | Cause                       | Solution                                  |
| --------------------- | --------------------------- | ----------------------------------------- |
| `Invalid data format` | Wrong delimiter or format   | Check format: `trackerId;1;"lat";2;"lng"` |
| Animal not updating   | trackerId mismatch          | Verify trackerId matches animal in DB     |
| No SSE events         | No subscribers connected    | Open `/dashboard` in browser              |
| Reconnection spam     | Server restart or crash     | Check server logs                         |
| High latency          | Too many concurrent updates | Reduce update frequency                   |

---

## Future Enhancements

1. **Database Integration** - Store updates in PostgreSQL/MongoDB
2. **WebSocket Support** - Replace SSE with bidirectional WebSocket
3. **Batching** - Send multiple updates in single request
4. **Compression** - Compress large datasets
5. **Caching** - Cache recent updates for new subscribers
6. **Filtering** - Filter by animalId, zone, or time range
