# Sheep Tracker - GPS Tracking System for Livestock

Система дистанционного мониторинга положения сельскохозяйственных животных (овец, коз, крупного рогатого скота) с GPS-трекерами на основе mesh сети LoRa.

## 🎯 Возможности

- **Real-time GPS tracking** - Получение позиций животных в реальном времени на карте
- **Zone monitoring** - Отслеживание выхода животных за пределы определенных зон
- **Connection status** - Мониторинг состояния связи с каждым животным
- **Battery level** - Контроль уровня заряда батареи трекеров
- **Movement history** - История движений животного
- **Notifications** - Уведомления при выходе из зоны, потере связи, низком заряде
- **Multi-device support** - Может быть один микроконтроллер с N животных или N микроконтроллеров

## 🏗️ Архитектура системы

```
┌─────────────────────────────────────────────────────────────────┐
│                     MICROCONTROLLER DEVICES                     │
│  (TTGO Meshtastic LoRa32 ESP32 + GPS Tracker + Battery)         │
│  - Читает GPS координаты                                        │
│  - Передает в mesh сеть Meshtastic                              │
│  - Отправляет HTTP POST на базовую станцию                      │
└──────────────────┬──────────────────────────────────────────────┘
                   │ HTTP POST
                   │ "101;1;"43.2220";2;"76.8512""
                   ↓
┌─────────────────────────────────────────────────────────────────┐
│              BASE STATION (Python Flask Server)                 │
│  - Слушает входящие данные на :5000/log                         │
│  - Парсит данные                                                │
│  - Отправляет в Next.js API                                     │
│  - Интерактивное отправление команд на микроконтроллер          │
└──────────────────┬──────────────────────────────────────────────┘
                   │ HTTP POST
                   │
                   ↓
┌─────────────────────────────────────────────────────────────────┐
│         NEXT.JS API SERVER (Node.js + TypeScript)               │
│  - Получает обновления позиций на /api/animals/update          │
│  - Парсит trackerId и координаты                                │
│  - Рассылает обновления через SSE /api/animals/stream           │
└──────────────────┬──────────────────────────────────────────────┘
                   │ Server-Sent Events
                   │
                   ↓
┌─────────────────────────────────────────────────────────────────┐
│    WEB INTERFACE (React + Next.js + Leaflet + Tailwind)         │
│  - Real-time карта с маркерами животных                         │
│  - Боковая панель с списком животных                            │
│  - Детальная информация о каждом животном                       │
│  - Управление зонами                                            │
│  - Уведомления                                                  │
│  - Статистика                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## 📋 Требования

### Для микроконтроллера

- TTGO Meshtastic LoRa32 (ESP32 с LoRa модулем)
- GPS модуль (встроенный или отдельный)
- Аккумулятор (3.7V Li-Ion, минимум 2000mAh)
- 3D-печатный корпус

### Для базовой станции

- Python 3.8+
- Flask, Requests
- Соединение с интернетом (для доступа к Next.js API)

### Для веб-интерфейса

- Node.js 18+
- npm/pnpm/yarn
- Современный браузер

## 🚀 Быстрый старт

### 1. Клонирование и установка

```bash
git clone <repository-url>
cd sheep_tracker

# Установить зависимости Node.js
npm install

# Установить зависимости Python
pip install flask requests
```

### 2. Запуск приложения

**Терминал 1 - Next.js сервер:**

```bash
npm run dev
# Приложение будет на http://localhost:3000
```

**Терминал 2 - Python базовая станция:**

```bash
python base-station.py
# Сервер запустится на http://0.0.0.0:5000
```

### 3. Отправка тестовых данных

**Терминал 3 - Тестирование:**

```bash
# Использовать тестовый скрипт
python test_api.py

# Или отправить вручную
curl -X POST http://localhost:5000/log \
  -H "Content-Type: text/plain" \
  -d '101;1;"43.2220";2;"76.8512"'
```

### 4. Открыть веб-интерфейс

Перейти на http://localhost:3000/dashboard

## 📁 Структура проекта

```
sheep_tracker/
├── app/
│   ├── api/
│   │   └── animals/
│   │       ├── update/route.ts      # POST endpoint для получения данных
│   │       └── stream/route.ts      # GET endpoint для SSE потока
│   ├── dashboard/
│   │   ├── layout.tsx               # Layout dashboard
│   │   └── page.tsx                 # Dashboard страница
│   ├── login/
│   ├── layout.tsx                   # Root layout
│   └── page.tsx
├── components/
│   ├── map/                         # Компоненты карты
│   ├── animals/                     # Компоненты животных
│   ├── sidebar/                     # Боковая панель
│   ├── notifications/               # Уведомления
│   ├── zones/                       # Управление зонами
│   ├── stats/                       # Статистика
│   └── tracker-sync-initializer.tsx # Инициализация синхронизации
├── lib/
│   ├── context/
│   │   └── app-context.tsx          # Глобальный контекст
│   ├── hooks/
│   │   ├── use-tracker-sync.ts      # Синхронизация позиций
│   │   ├── use-connection-check.ts  # Проверка потери связи
│   │   └── use-zone-check.ts        # Проверка зон
│   ├── types/
│   │   └── index.ts                 # TypeScript типы
│   └── data/
│       └── mock-data.ts             # Mock данные
├── base-station.py                  # Python базовая станция
├── test_api.py                      # Тесты API
├── INTEGRATION_GUIDE.md              # Полное руководство интеграции
├── API_DOCS.md                      # Документация API
└── QUICK_START.md                   # Быстрый старт

```

## 🔌 Интеграция с микроконтроллером

### Формат данных

Микроконтроллер отправляет данные в формате:

```
trackerId;1;"latitude";2;"longitude"
```

**Примеры:**

```
101;1;"43.2220";2;"76.8512"
102;1;"43.2235";2;"76.8535"
TRK-001;1;"43.2225";2;"76.8515"
```

### Пример кода ESP32 (Arduino)

```cpp
#define LOG_SERVER "http://192.168.1.230:5000/log"

void sendTrackerData(String trackerId, float lat, float lng) {
    HTTPClient http;
    String message = trackerId + ";1;\"" + String(lat, 6) + "\";2;\"" + String(lng, 6) + "\"";

    http.begin(LOG_SERVER);
    http.addHeader("Content-Type", "text/plain");
    http.POST(message);
    http.end();
}

void loop() {
    float lat = getGPS_Lat();
    float lng = getGPS_Lng();

    sendTrackerData("101", lat, lng);
    delay(10000); // Отправляем каждые 10 секунд
}
```

## 🐑 Таблица животных

| ID  | Name    | TrackerId | Статус  |
| --- | ------- | --------- | ------- |
| 1   | Барашек | TRK-001   | Online  |
| 2   | Кудряш  | TRK-002   | Online  |
| 3   | Белый   | TRK-003   | Online  |
| 4   | Рогач   | TRK-004   | Alert   |
| 5   | Серый   | TRK-005   | Online  |
| 6   | Пушок   | TRK-006   | Offline |

## 📊 API Endpoints

### GET `/api/animals/stream`

Server-Sent Events поток для получения обновлений в реальном времени

### POST `/api/animals/update`

Получение обновлений позиций животных

```bash
curl -X POST http://localhost:3000/api/animals/update \
  -H "Content-Type: text/plain" \
  -d '101;1;"43.2220";2;"76.8512"'
```

Подробная документация: [API_DOCS.md](API_DOCS.md)

## 🛠️ Разработка

### Установить зависимости

```bash
npm install
```

### Запустить dev сервер

```bash
npm run dev
```

### Собрать для production

```bash
npm run build
npm start
```

### Запустить тесты API

```bash
python test_api.py
```

## 🔒 Безопасность

⚠️ **Текущая версия без аутентификации! Для production добавьте:**

1. API ключи
2. JWT токены
3. HTTPS/TLS
4. Rate limiting
5. Database с user management

## 📚 Документация

- [QUICK_START.md](QUICK_START.md) - Быстрый старт за 5 минут
- [INTEGRATION_GUIDE.md](INTEGRATION_GUIDE.md) - Полное руководство интеграции
- [API_DOCS.md](API_DOCS.md) - Документация API endpoints

## 🚧 Расширения (TODO)

- [ ] Сохранение данных в БД (PostgreSQL/MongoDB)
- [ ] История движений с экспортом в CSV
- [ ] Автоматические отчеты по статистике
- [ ] WebSocket вместо SSE
- [ ] Mobile приложение (React Native)
- [ ] Оффлайн режим
- [ ] Интеграция с SMS/Email уведомлениями
- [ ] Электронная карта с синхронизацией

## 🐛 Диагностика проблем

### Животное не обновляется

1. Проверьте trackerId в данных
2. Убедитесь, что trackerId совпадает с ID животного в приложении
3. Откройте DevTools в браузере (F12) и проверьте консоль

### Python скрипт не отправляет данные

1. Проверьте IP адрес компьютера: `ipconfig` (Windows)
2. Обновите `NEXTJS_API_URL` в `base-station.py`
3. Убедитесь, что Next.js сервер запущен на порту 3000

### Нет подключения к базовой станции

1. Проверьте порт 5000: `netstat -an | grep 5000`
2. Проверьте firewall
3. Убедитесь, что Python сервер запущен

## 📞 Контакты и поддержка

Если возникают вопросы:

1. Проверьте документацию в [INTEGRATION_GUIDE.md](INTEGRATION_GUIDE.md)
2. Используйте тестовый скрипт [test_api.py](test_api.py)
3. Проверьте логи в браузере (DevTools) и в терминале

## 📄 Лицензия

MIT License - см. LICENSE файл

## 🙏 Благодарности

- [Meshtastic](https://meshtastic.org/) - Отличное LoRa ПО с открытым исходным кодом
- [Leaflet.js](https://leafletjs.com/) - Отличная библиотека для карт
- [Next.js](https://nextjs.org/) - React фреймворк
- [shadcn/ui](https://ui.shadcn.com/) - UI компоненты

---

**Версия:** 0.1.0  
**Последнее обновление:** 13 мая 2026  
**Статус:** В разработке 🚀
