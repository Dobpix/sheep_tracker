# Быстрый старт интеграции Sheep Tracker

## За 5 минут

### Шаг 1: Запустить Next.js приложение

```bash
npm install
npm run dev
```

Приложение будет на: `http://localhost:3000`

### Шаг 2: Запустить Python базовую станцию

```bash
python base-station.py
```

### Шаг 3: Отправить тестовые данные

**Вариант A: Используя curl**

```bash
curl -X POST http://localhost:5000/log \
  -H "Content-Type: text/plain" \
  -d '101;1;"43.2220";2;"76.8512"'
```

**Вариант B: Используя Python**

```python
import requests

data = '101;1;"43.2220";2;"76.8512"'
response = requests.post('http://localhost:5000/log', data=data)
print(response.text)
```

**Вариант C: Используя Node.js/JavaScript**

```javascript
fetch('http://localhost:5000/log', {
	method: 'POST',
	body: '101;1;"43.2220";2;"76.8512"',
})
```

### Шаг 4: Проверить результат

1. Откройте браузер: `http://localhost:3000/dashboard`
2. Откройте DevTools (F12)
3. На карте должен обновиться маркер животного с trackerId "101"
4. В консоли браузера должны быть логи типа:

```
[TrackerSync] Connected
[TrackerSync] Received update: {type: "animal_update", animalId: "101", ...}
[TrackerSync] Updating animal: 1
```

## Таблица животных и их trackerId

| ID  | Name    | TrackerId | текущие координаты |
| --- | ------- | --------- | ------------------ |
| 1   | Барашек | TRK-001   | 43.224, 76.854     |
| 2   | Кудряш  | TRK-002   | 43.221, 76.853     |
| 3   | Белый   | TRK-003   | 43.223, 76.850     |
| 4   | Рогач   | TRK-004   | 43.230, 76.861     |
| 5   | Серый   | TRK-005   | 43.219, 76.849     |
| 6   | Пушок   | TRK-006   | 43.2225, 76.8522   |

**Важно:** trackerId в данных должен совпадать с trackerId животного в таблице выше!

## Примеры отправки данных

### Обновить положение Барашека (TRK-001)

```
101;1;"43.230";2;"76.860"
```

### Обновить положение Кудряша (TRK-002)

```
102;1;"43.2235";2;"76.8535"
```

### Обновить положение Белого (TRK-003)

```
103;1;"43.2225";2;"76.8505"
```

## Структура API

### POST `/api/animals/update`

Принимает: `trackerId;1;"latitude";2;"longitude"`

Ответ:

```json
{
	"success": true,
	"message": "Data received",
	"subscribers": 1
}
```

### GET `/api/animals/stream`

Server-Sent Events соединение для получения обновлений в реальном времени

Формат данных:

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

## Логирование

### Next.js сервер

Открыть консоль, где запущен `npm run dev`:

```
[API] Received tracker data: 101;1;"43.2220";2;"76.8512"
[API] Parsed: {animalId: "101", coordinates: {lat: 43.222, lng: 76.8512}}
[API] Updated subscribers: 1
```

### Python сервер

```
[INFO] [ESP] Received: 101;1;"43.2220";2;"76.8512"
[INFO] [API] Data sent successfully
[INFO] [API] Response: {'success': True, 'message': 'Data received', 'subscribers': 1}
```

### React фронт

DevTools → Console:

```
[TrackerSync] Connected
[TrackerSync] Received update: {type: "animal_update", animalId: "101", ...}
[TrackerSync] Updating animal: 1
```

## Диагностика проблем

| Проблема                     | Решение                       |
| ---------------------------- | ----------------------------- |
| Животное не обновляется      | Проверьте trackerId в данных  |
| "Animal not found" в консоли | Убедитесь trackerId совпадает |
| Красная ошибка в Python      | Проверьте формат данных       |
| Нет подключения к серверу    | Проверьте IP адреса и порты   |

## Команды для разработки

```bash
# Установить зависимости Next.js
npm install

# Запустить dev сервер
npm run dev

# Собрать production версию
npm run build

# Запустить production версию
npm start

# Запустить Python сервер
python base-station.py

# Тестировать API
curl -X POST http://localhost:5000/log -d '101;1;"43.2220";2;"76.8512"'
```

## Важные файлы

- `/app/api/animals/update/route.ts` - API endpoint для приема данных
- `/app/api/animals/stream/route.ts` - SSE stream для real-time обновлений
- `/lib/hooks/use-tracker-sync.ts` - React хук для синхронизации
- `/components/tracker-sync-initializer.tsx` - Инициализатор синхронизации
- `/base-station.py` - Python базовая станция
- `/lib/data/mock-data.ts` - Данные животных (можно менять trackerId здесь)

## Что дальше?

1. **Добавить автоматическое обнаружение выхода из зоны**
   - Реализовать point-in-polygon алгоритм
   - Создать уведомления при выходе

2. **Добавить обнаружение потери связи**
   - Таймауты для каждого животного
   - Изменение статуса на "offline"

3. **Добавить историю движения**
   - Визуализировать траекторию на карте
   - Сохранять в БД

4. **Добавить аутентификацию**
   - API ключи
   - JWT токены

5. **Развернуть на production**
   - Облако (AWS, Google Cloud, DigitalOcean)
   - БД (PostgreSQL, MongoDB)
   - HTTPS
