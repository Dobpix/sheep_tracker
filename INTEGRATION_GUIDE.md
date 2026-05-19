# Интеграция Sheep Tracker с микроконтроллером

## Архитектура

```
Микроконтроллер (ESP32)
    ↓ HTTP POST
    ↓ "101;1;"43.2220";2;"76.8512""
    ↓
Python Base Station (192.168.1.230:5000)
    ↓ HTTP POST
    ↓
Next.js API (http://192.168.1.230:3000/api/animals/update)
    ↓
Server-Sent Events Stream
    ↓
React Frontend (Real-time map updates)
```

## Установка и запуск

### 1. Подготовка базовой станции (Python сервер)

**Требования:**

- Python 3.8+
- Flask
- Requests

**Установка зависимостей:**

```bash
pip install flask requests
```

**Запуск сервера:**

```bash
python base-station.py
```

**Ожидаемый вывод:**

```
[INFO] ============================================================
[INFO] Sheep Tracker - Base Station Server
[INFO] ============================================================
[INFO] Listening for ESP logs on: http://0.0.0.0:5000/log
[INFO] Forwarding data to Next.js: http://192.168.1.230:3000/api/animals/update
[INFO] ESP command endpoint: http://192.168.1.170/msg
[INFO] ============================================================
[INFO] Server started successfully!
```

### 2. Запуск Next.js приложения

```bash
npm install
npm run dev
```

Приложение будет доступно на `http://192.168.1.230:3000`

### 3. Конфигурация микроконтроллера

На микроконтроллере (ESP32) необходимо установить:

- IP адрес базовой станции: `192.168.1.230`
- Порт: `5000`
- Endpoint: `/log`

Пример для Arduino/PlatformIO:

```cpp
#define LOG_SERVER "http://192.168.1.230:5000/log"

void sendLog(String message)
{
    HTTPClient http;
    http.begin(LOG_SERVER);
    http.addHeader("Content-Type", "text/plain");
    http.POST(message);
    http.end();
}

// Отправка данных в формате: trackerId;1;"lat";2;"lng"
void sendTrackerData(String trackerId, float lat, float lng)
{
    String message = trackerId + ";1;\"" + String(lat, 6) + "\";2;\"" + String(lng, 6) + "\"";
    sendLog(message);
}

// Пример использования
void setup() {
    Serial.begin(115200);
    WiFi.begin(SSID, PASSWORD);
    // ... подключение к WiFi ...
}

void loop() {
    // Получаем GPS координаты
    float lat = getGPS_Lat();
    float lng = getGPS_Lng();

    // Отправляем на сервер
    sendTrackerData("101", lat, lng);  // 101 - ID трекера/животного

    delay(10000);  // Отправляем каждые 10 секунд
}
```

## Формат данных

### От микроконтроллера к базовой станции

**Формат:** `trackerId;1;"latitude";2;"longitude"`

**Примеры:**

```
101;1;"43.2220";2;"76.8512"
102;1;"43.2225";2;"76.8515"
103;1;"43.2218";2;"76.8510"
```

Где:

- `101`, `102`, `103` - ID трекеров (соответствуют trackerId животных в приложении)
- `1` - ключ для широты
- `2` - ключ для долготы
- Координаты в формате строк в двойных кавычках

### От базовой станции к Next.js

Python сервер автоматически парсит данные и отправляет их в Next.js API.

### От Next.js к React фронтенду

Используется Server-Sent Events (SSE) для отправки обновлений в реальном времени:

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

## Таблица соответствия trackerId и Animal

В приложении животные хранятся с полями:

- `id` - уникальный ID в приложении (например, "1", "2", "3")
- `trackerId` - ID физического трекера (например, "TRK-001", "101", "102")

Сервер ищет животное по `trackerId`, поэтому **важно совпадение trackerId с ID отправляемым с микроконтроллера**!

**Текущие животные в приложении:**

```
ID | Name  | TrackerId
---|-------|----------
1  | Барашек | TRK-001
2  | Кудряш  | TRK-002
3  | Белый   | TRK-003
4  | Рогач   | TRK-004
5  | Серый   | TRK-005
6  | Пушок   | TRK-006
```

**Как настроить:**

Если микроконтроллер отправляет `101;1;"43.2220";2;"76.8512"`, то в приложении нужно иметь животное с `trackerId = "101"`.

Вы можете изменить это в `/lib/data/mock-data.ts`:

```typescript
export const mockAnimals: Animal[] = [
	{
		id: '1',
		name: 'Барашек',
		trackerId: '101', // <- Это должно совпадать с ID трекера!
		// ...
	},
]
```

Или добавить нового через пользовательский интерфейс приложения.

## Диагностика

### 1. Проверка получения данных на базовой станции

```bash
python base-station.py
```

Вы должны видеть логи вроде:

```
[INFO] [ESP] Received: 101;1;"43.2220";2;"76.8512"
[INFO] [API] Data sent successfully
```

### 2. Проверка API endpoint Next.js

```bash
curl -X POST http://192.168.1.230:3000/api/animals/update \
  -H "Content-Type: text/plain" \
  -d '101;1;"43.2220";2;"76.8512"'
```

Ожидаемый ответ:

```json
{
	"success": true,
	"message": "Data received",
	"subscribers": 1
}
```

### 3. Проверка SSE stream

```bash
curl http://192.168.1.230:3000/api/animals/stream
```

Вы должны видеть входящие события вроде:

```
data: {"type":"animal_update","animalId":"101","coordinates":{"lat":43.2220,"lng":76.8512},"timestamp":"2026-05-13T10:30:45.123Z"}
```

### 4. Проверка в браузере

1. Откройте приложение: http://192.168.1.230:3000
2. Откройте DevTools (F12)
3. Перейдите на вкладку Console
4. Отправьте данные с микроконтроллера
5. Вы должны увидеть логи вроде:
   ```
   [TrackerSync] Connected
   [TrackerSync] Received update: {type: "animal_update", ...}
   [TrackerSync] Updating animal: 1
   ```

## Возможные проблемы

### 1. "Animal not found" в консоли

**Причина:** trackerId в данных не совпадает с trackerId в приложении

**Решение:**

- Убедитесь, что trackerId совпадает
- Или измените trackerId животного в приложении

### 2. Соединение выключается после 30 секунд

**Причина:** Браузер закрыл SSE соединение

**Решение:**

- Приложение автоматически переподключается
- Проверьте консоль браузера на ошибки

### 3. Python скрипт не отправляет данные в Next.js

**Причина:** Неправильный IP адрес или порт

**Решение:**

- Проверьте IP адрес компа: `ipconfig` (Windows) или `ifconfig` (Linux/Mac)
- Обновите `NEXTJS_API_URL` в `base-station.py`
- Убедитесь, что Next.js запущен на порту 3000

## Безопасность

⚠️ **Текущая реализация не имеет аутентификации!**

Для production используйте:

- API ключи
- JWT токены
- HTTPS
- CORS политика

Пример с API ключом в Python:

```python
headers = {
    "Content-Type": "text/plain",
    "X-API-Key": "your-secret-api-key"
}
response = requests.post(NEXTJS_API_URL, data=log, headers=headers, timeout=5)
```

Пример в Next.js (`/api/animals/update`):

```typescript
const apiKey = request.headers.get('x-api-key')
if (apiKey !== process.env.TRACKER_API_KEY) {
	return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}
```

## Расширения и улучшения

### 1. История движения животных

История автоматически сохраняется в контексте приложения (последние 50 позиций).
Визуализируется линией на карте (если настроено в компоненте AnimalMarker).

### 2. Автоматическое обнаружение выхода из зоны

Нужно реализовать функцию проверки точки внутри полигона (point-in-polygon).
Добавить сравнение с зонами при получении обновления.

### 3. Обнаружение потери связи

Если животное не отправляет данные в течение N минут:

```typescript
const TIMEOUT_MS = 5 * 60 * 1000 // 5 минут

// В useTrackerSync:
const checkConnectionStatus = setInterval(() => {
	animals.forEach(animal => {
		if (animal.status === 'online') {
			const timeSinceLastSeen = Date.now() - animal.lastSeen.getTime()
			if (timeSinceLastSeen > TIMEOUT_MS) {
				updateAnimal(animal.id, { status: 'offline' })
				addNotification({
					type: 'connection_lost',
					animalId: animal.id,
					animalName: animal.name,
					message: `Потеряна связь с ${animal.name}`,
				})
			}
		}
	})
}, 30000) // Проверяем каждые 30 секунд
```

### 4. Сохранение данных в БД

Текущее приложение хранит только в памяти (React state).
Для persistence добавьте:

- PostgreSQL / MongoDB
- API endpoints для CRUD операций
- Миграция контекста приложения на сервер

## Контакт и поддержка

Если возникают проблемы:

1. Проверьте логи (`console.log` в браузере и Python)
2. Убедитесь, что все IP адреса и порты корректны
3. Проверьте формат данных
4. Используйте curl для тестирования API endpoints
