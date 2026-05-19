# 🎯 SHEEP TRACKER - Интеграция завершена

## ✅ Что было сделано

### 1. **API Endpoints**

- ✅ `POST /api/animals/update` - Получение данных от микроконтроллера
  - Парсит формат: `trackerId;1;"lat";2;"lng"`
  - Уведомляет всех SSE подписчиков
- ✅ `GET /api/animals/stream` - Server-Sent Events поток
  - Real-time обновления позиций животных
  - Автоматический heartbeat для поддержания соединения
  - Автоматическое переподключение при разрыве

### 2. **React Хуки**

- ✅ `useTrackerSync()` - Синхронизация позиций
  - Подписывается на SSE поток
  - Обновляет позиции животных на карте
  - Сохраняет историю движений (последние 50 позиций)
  - Обработка ошибок и переподключение
- ✅ `useConnectionCheck()` - Обнаружение потери связи
  - Таймаут 5 минут (настраивается)
  - Изменение статуса на "offline"
  - Уведомления при потере связи
- ✅ `useZoneCheck()` - Проверка зон
  - Алгоритм ray-casting для определения точки в полигоне
  - Уведомления при выходе из зоны
  - Отслеживание возврата в зону

### 3. **Python Базовая станция**

- ✅ `base-station.py` - Flask сервер
  - Слушает HTTP POST на :5000/log
  - Парсит данные с микроконтроллера
  - Отправляет в Next.js API
  - Интерактивная отправка команд на микроконтроллер
  - Полное логирование

### 4. **Инициализация**

- ✅ `TrackerSyncInitializer` - Компонент инициализации
  - Запускает все хуки синхронизации
  - Размещен в dashboard layout
  - Работает автоматически при загрузке dashboard

### 5. **Документация**

- ✅ `INTEGRATION_GUIDE.md` - Полное руководство интеграции
- ✅ `API_DOCS.md` - Документация API endpoints
- ✅ `QUICK_START.md` - Быстрый старт за 5 минут
- ✅ `README_INTEGRATION.md` - Общая информация о проекте
- ✅ `test_api.py` - Тестовые скрипты

---

## 🚀 Как использовать

### Шаг 1: Запустить Next.js приложение

```bash
cd c:\Users\dobrs\Desktop\sheep_tracker
npm install  # Если еще не установлены зависимости
npm run dev
```

**Ожидаемый вывод:**

```
> my-project@0.1.0 dev
> next dev

  ▲ Next.js 15.x.x
  - Local:        http://localhost:3000
  - Network:      use `--hostname` to expose

✓ Ready in XXXms
```

### Шаг 2: Запустить Python базовую станцию

```bash
# В отдельном терминале
python c:\Users\dobrs\Desktop\sheep_tracker\base-station.py
```

**Ожидаемый вывод:**

```
============================================================
Sheep Tracker - Base Station Server
============================================================
Listening for ESP logs on: http://0.0.0.0:5000/log
Forwarding data to Next.js: http://192.168.1.230:3000/api/animals/update
ESP command endpoint: http://192.168.1.170/msg
============================================================
Server started successfully!
```

### Шаг 3: Открыть веб-интерфейс

```
http://localhost:3000/dashboard
```

**В браузере DevTools (F12) консоль должна показать:**

```
[TrackerSync] Connected
```

### Шаг 4: Отправить тестовые данные

#### Вариант A: Используя Python тестовый скрипт

```bash
python c:\Users\dobrs\Desktop\sheep_tracker\test_api.py

# Выберите:
# 1. Single update
# 7. Continuous updates (5 min)
```

#### Вариант B: Используя curl

```bash
curl -X POST http://localhost:5000/log ^
  -H "Content-Type: text/plain" ^
  -d "101;1;\"43.2220\";2;\"76.8512\""
```

#### Вариант C: Используя Python requests

```python
import requests

data = '101;1;"43.2220";2;"76.8512"'
requests.post('http://localhost:5000/log', data=data)
```

### Шаг 5: Проверить результат

1. На карте должен обновиться маркер животного
2. В браузере DevTools (Console) должны быть логи:

```
[TrackerSync] Received update: {type: "animal_update", animalId: "101", ...}
[TrackerSync] Updating animal: 1
```

---

## 📋 Таблица соответствия trackerId и Animal

**ВАЖНО:** trackerId в данных должен совпадать с trackerId животного в приложении!

| ID  | Name    | TrackerId | Текущие координаты |
| --- | ------- | --------- | ------------------ |
| 1   | Барашек | TRK-001   | 43.224, 76.854     |
| 2   | Кудряш  | TRK-002   | 43.221, 76.853     |
| 3   | Белый   | TRK-003   | 43.223, 76.850     |
| 4   | Рогач   | TRK-004   | 43.230, 76.861     |
| 5   | Серый   | TRK-005   | 43.219, 76.849     |
| 6   | Пушок   | TRK-006   | 43.2225, 76.8522   |

**Примеры отправки данных:**

```
# Обновить Барашека (TRK-001)
101;1;"43.230";2;"76.860"

# Обновить Кудряша (TRK-002)
102;1;"43.2235";2;"76.8535"

# Обновить Белого (TRK-003)
103;1;"43.2225";2;"76.8505"
```

---

## 🔧 Конфигурация микроконтроллера

### IP адреса и порты

**Текущие значения для локальной сети:**

- Базовая станция: `http://192.168.1.230:5000/log`
- Next.js API: `http://192.168.1.230:3000/api/animals/update`
- ESP микроконтроллер: `http://192.168.1.170/msg`

### Как изменить в Python скрипте

**base-station.py:**

```python
LOG_SERVER = "http://192.168.1.170/msg"  # адрес ESP
NEXTJS_API_URL = "http://192.168.1.230:3000/api/animals/update"  # адрес Next.js
```

**Код ESP32:**

```cpp
#define LOG_SERVER "http://192.168.1.230:5000/log"
```

---

## 📊 Примеры данных

### От микроконтроллера → Python базовая станция

```
POST http://192.168.1.230:5000/log
Content-Type: text/plain

101;1;"43.2220";2;"76.8512"
```

### От Python → Next.js API

```
POST http://192.168.1.230:3000/api/animals/update
Content-Type: text/plain

101;1;"43.2220";2;"76.8512"
```

**Ответ:**

```json
{
	"success": true,
	"message": "Data received",
	"subscribers": 1
}
```

### От Next.js → React (SSE)

```
GET http://192.168.1.230:3000/api/animals/stream

data: {"type":"animal_update","animalId":"101","coordinates":{"lat":43.2220,"lng":76.8512},"timestamp":"2026-05-13T10:30:45.123Z"}
```

---

## 🧪 Тестирование

### Быстрый тест

```bash
# Запустить все в отдельных терминалах:

# Терминал 1: Next.js
npm run dev

# Терминал 2: Python базовая станция
python base-station.py

# Терминал 3: Отправить тестовые данные
python test_api.py
# Выбрать тест: 1 (Single update) или 7 (Continuous updates)
```

### Полный тест с curl

```bash
# Отправить одно обновление
curl -X POST http://localhost:5000/log ^
  -H "Content-Type: text/plain" ^
  -d "101;1;\"43.2220\";2;\"76.8512\""

# Проверить SSE поток (в отдельном терминале)
curl -N http://localhost:3000/api/animals/stream
```

### Проверить API endpoint

```bash
# Напрямую в Next.js API
curl -X POST http://localhost:3000/api/animals/update ^
  -H "Content-Type: text/plain" ^
  -d "101;1;\"43.2220\";2;\"76.8512\""

# Ответ:
# {"success":true,"message":"Data received","subscribers":1}
```

---

## 🐛 Диагностика

| Проблема                         | Решение                                                               |
| -------------------------------- | --------------------------------------------------------------------- |
| **Животное не обновляется**      | Проверьте trackerId в данных (должен совпадать с trackerId животного) |
| **"Animal not found" в консоли** | trackerId не совпадает - обновите mock-data.ts или данные             |
| **Нет подключения к серверу**    | Проверьте IP адреса, порты и firewall                                 |
| **Red ошибка в Python**          | Проверьте формат данных: `trackerId;1;"lat";2;"lng"`                  |
| **SSE соединение закрывается**   | Нормально - приложение автоматически переподключается                 |
| **Высокая задержка обновлений**  | Снизьте частоту отправки на микроконтроллере                          |

---

## 📁 Новые файлы и изменения

### Новые файлы:

- `/app/api/animals/update/route.ts` - API endpoint для получения данных
- `/app/api/animals/stream/route.ts` - SSE stream endpoint
- `/lib/hooks/use-tracker-sync.ts` - Хук синхронизации
- `/lib/hooks/use-connection-check.ts` - Хук проверки потери связи
- `/lib/hooks/use-zone-check.ts` - Хук проверки зон
- `/components/tracker-sync-initializer.tsx` - Инициализатор
- `/base-station.py` - Python базовая станция
- `/test_api.py` - Тестовые скрипты
- `/INTEGRATION_GUIDE.md` - Полное руководство
- `/API_DOCS.md` - Документация API
- `/QUICK_START.md` - Быстрый старт
- `/README_INTEGRATION.md` - README про интеграцию

### Измененные файлы:

- `/app/dashboard/layout.tsx` - Добавлен TrackerSyncInitializer

---

## 🎓 Как это работает

### 1. Микроконтроллер отправляет данные

```cpp
void loop() {
    float lat = getGPS_Lat();
    float lng = getGPS_Lng();
    String data = "101;1;\"" + String(lat, 6) + "\";2;\"" + String(lng, 6) + "\"";
    http.POST(data);  // Отправляет на базовую станцию
}
```

### 2. Python базовая станция парсит и перенаправляет

```python
# Получает от микроконтроллера
data = "101;1;\"43.2220\";2;\"76.8512\""

# Отправляет в Next.js
requests.post("http://localhost:3000/api/animals/update", data=data)
```

### 3. Next.js API обрабатывает и уведомляет подписчиков

```typescript
// Парсит trackerId и координаты
const parsed = parseTrackerData('101;1;"43.2220";2;"76.8512"')

// Создает объект обновления
const update = {
	type: 'animal_update',
	animalId: '101',
	coordinates: { lat: 43.222, lng: 76.8512 },
}

// Отправляет всем подписчикам SSE
notifySubscribers(update)
```

### 4. React фронтенд получает и обновляет UI

```typescript
// SSE слушатель получает событие
const update = JSON.parse(event.data)

// Обновляет животное в контексте
updateAnimal(animal.id, {
	coordinates: update.coordinates,
	lastSeen: new Date(),
	status: 'online',
})

// Карта автоматически обновляется!
```

---

## ⚠️ Важные замечания

1. **trackerId** - Должен совпадать в:
   - Данных от микроконтроллера
   - trackerId животного в приложении
   - Можно изменить в `/lib/data/mock-data.ts`

2. **IP адреса** - Текущие адреса для локальной сети:
   - Обновите в `base-station.py` если другая сеть
   - Обновите в коде ESP32

3. **Безопасность** - Текущая версия БЕЗ аутентификации:
   - Для production добавьте API ключи
   - Используйте HTTPS/TLS
   - Добавьте rate limiting

4. **История** - Хранится в памяти:
   - Последние 50 позиций на животное
   - Теряется при перезагрузке
   - Добавьте БД для persistence

---

## 🚀 Что дальше?

1. **Для разработки:**
   - Добавить PostgreSQL/MongoDB для сохранения данных
   - Добавить аутентификацию и авторизацию
   - Добавить экспорт данных в CSV
   - Добавить расширенную аналитику

2. **Для микроконтроллера:**
   - Оптимизировать потребление энергии
   - Добавить более частые GPS обновления
   - Добавить отправку батареи и других метрик
   - Добавить OTA обновления

3. **Для интерфейса:**
   - Добавить визуализацию траектории
   - Добавить фильтры и поиск
   - Добавить экспорт отчетов
   - Добавить мобильное приложение

---

## 📞 Контакт

Если возникают проблемы:

1. Проверьте [INTEGRATION_GUIDE.md](INTEGRATION_GUIDE.md)
2. Проверьте [QUICK_START.md](QUICK_START.md)
3. Используйте [test_api.py](test_api.py) для диагностики
4. Проверьте логи в консоли браузера (F12)

---

**✅ Интеграция готова к использованию!**

Открыте http://localhost:3000/dashboard и смотрите как животные обновляют свои позиции в реальном времени! 🐑🗺️
