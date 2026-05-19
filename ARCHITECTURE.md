# System Architecture - Sheep Tracker GPS Tracking System

## 🏗️ High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         MICROCONTROLLER LAYER                       │
│  (TTGO LoRa32 ESP32 + GPS Tracker + Battery)                        │
│                                                                     │
│  • Reads GPS coordinates every 10s                                  │
│  • Sends via HTTP POST to Base Station                              │
│  • Mesh networking via LoRa (optional)                              │
│  • Monitors battery level                                           │
└──────────────────────┬──────────────────────────────────────────────┘
                       │
                       │ HTTP POST
                       │ "101;1;"43.2220";2;"76.8512""
                       │ Port: 5000/log
                       │
┌──────────────────────▼──────────────────────────────────────────────┐
│                    BASE STATION LAYER (Python)                      │
│  (Flask Server on Laptop/PC)                                        │
│                                                                     │
│  • Listens on 0.0.0.0:5000/log                                      │
│  • Parses tracker data                                              │
│  • Forwards to Next.js API                                          │
│  • Interactive command interface                                    │
│  • Full logging and debugging                                       │
└──────────────────────┬──────────────────────────────────────────────┘
                       │
                       │ HTTP POST
                       │ Content-Type: text/plain
                       │ Port: 3000/api/animals/update
                       │
┌──────────────────────▼──────────────────────────────────────────────┐
│                 BACKEND API LAYER (Next.js)                         │
│  (TypeScript + Node.js Runtime)                                     │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────┐       │
│  │ POST /api/animals/update                                │       │
│  │ - Receives: "101;1;"43.2220";2;"76.8512""             │       │
│  │ - Parses trackerId and coordinates                      │       │
│  │ - Creates AnimalUpdate event                            │       │
│  │ - Notifies all SSE subscribers                          │       │
│  └─────────────────────────────────────────────────────────┘       │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────┐       │
│  │ GET /api/animals/stream (Server-Sent Events)           │       │
│  │ - Broadcasts real-time updates to all clients           │       │
│  │ - Heartbeat every 30 seconds                            │       │
│  │ - Multiple concurrent subscribers supported             │       │
│  └─────────────────────────────────────────────────────────┘       │
│                                                                     │
│  Internal:                                                          │
│  • In-memory subscriber management                                  │
│  • Data parsing and validation                                      │
│  • Event broadcasting                                               │
└──────────────────────┬──────────────────────────────────────────────┘
                       │
                       │ Server-Sent Events
                       │ data: {type, animalId, coordinates, ...}
                       │ Port: 3000
                       │
┌──────────────────────▼──────────────────────────────────────────────┐
│                  FRONTEND LAYER (React + TypeScript)                │
│  (Next.js Client-Side + Leaflet.js Maps)                           │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────┐       │
│  │ useTrackerSync Hook                                     │       │
│  │ - Connects to SSE /api/animals/stream                   │       │
│  │ - Updates animal positions in App Context               │       │
│  │ - Maintains movement history (50 positions)             │       │
│  │ - Auto-reconnects on disconnect                         │       │
│  └─────────────────────────────────────────────────────────┘       │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────┐       │
│  │ useConnectionCheck Hook                                 │       │
│  │ - Monitors last seen timestamp                          │       │
│  │ - Detects 5-minute timeout                              │       │
│  │ - Updates animal status to 'offline'                    │       │
│  │ - Sends notifications                                   │       │
│  └─────────────────────────────────────────────────────────┘       │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────┐       │
│  │ useZoneCheck Hook                                       │       │
│  │ - Point-in-polygon collision detection                  │       │
│  │ - Monitors zone boundaries                              │       │
│  │ - Sends notifications on zone exit                      │       │
│  └─────────────────────────────────────────────────────────┘       │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────┐       │
│  │ React Components                                        │       │
│  │ - MapContainer: Leaflet map with real-time markers     │       │
│  │ - AnimalMarker: Individual animal markers               │       │
│  │ - AnimalsList: Sidebar with animal list                 │       │
│  │ - NotificationsPanel: System notifications              │       │
│  │ - ZoneLayer: Zone visualization                         │       │
│  │ - StatsOverlay: Real-time statistics                    │       │
│  └─────────────────────────────────────────────────────────┘       │
│                                                                     │
│  State Management:                                                  │
│  • AppContext: Global state (animals, zones, notifications)        │
│  • React Hooks: Local state management                              │
│  • In-memory: No persistence (add DB for production)               │
└─────────────────────────────────────────────────────────────────────┘
```

## 🔄 Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         DATA FLOW                                    │
└─────────────────────────────────────────────────────────────────────┘

TIME SEQUENCE:
───────────────────────────────────────────────────────────────────────

T+0s: ESP32 reads GPS
     gps.location.lat() = 43.2220
     gps.location.lng() = 76.8512

T+1s: ESP32 formats data
     data = "101;1;"43.2220";2;"76.8512""

T+2s: ESP32 sends HTTP POST
     POST http://192.168.1.230:5000/log
     Content-Type: text/plain
     Body: 101;1;"43.2220";2;"76.8512"

T+3s: Python receives and forwards
     request.data = "101;1;"43.2220";2;"76.8512""
     Forwards to: http://192.168.1.230:3000/api/animals/update

T+4s: Next.js API processes
     Parses: animalId="101", lat=43.2220, lng=76.8512
     Creates: AnimalUpdate object
     Notifies: All SSE subscribers

T+5s: React receives SSE update
     EventSource triggers onmessage
     Parses: {type, animalId, coordinates, timestamp}
     Calls: updateAnimal(id, {coordinates, lastSeen, status})

T+6s: React Context updates
     animals[0].coordinates = {lat: 43.2220, lng: 76.8512}
     animals[0].lastSeen = new Date()
     animals[0].status = 'online'

T+7s: React re-renders
     MapView updates markers
     Animal marker moves to new position

T+8s: UI shows result
     Marker appears on map at new coordinates
     History contains movement path
     Timestamp shows when it was last updated
```

## 📦 Component Architecture

```
Frontend Components:
├── Layouts
│   ├── app/layout.tsx (Root)
│   └── app/dashboard/layout.tsx (Dashboard + AppProvider)
│
├── Pages
│   ├── app/page.tsx (Redirect to login)
│   ├── app/login/page.tsx (Login page)
│   └── app/dashboard/page.tsx (Main dashboard)
│
├── Map Components
│   ├── MapContainer (Dynamic wrapper)
│   ├── MapView (Main Leaflet map)
│   ├── AnimalMarker (Individual markers)
│   ├── ZoneLayer (Zone polygons)
│   ├── DrawingLayer (Zone drawing)
│   └── MapTypeToggle (Satellite/Streets)
│
├── Animal Components
│   ├── AnimalsList (Sidebar list)
│   ├── AnimalItem (Individual item)
│   ├── AnimalDetailsPanel (Details popup)
│   └── AnimalStatusBadge (Status indicator)
│
├── Zone Components
│   ├── ZoneList
│   ├── ZoneDrawingControls
│   └── ZoneLayer
│
├── UI Components
│   ├── Sidebar
│   ├── NotificationsPanel
│   ├── StatsOverlay
│   └── Various shadcn/ui components
│
└── Initialization
    └── TrackerSyncInitializer (Starts all syncing)

State Management:
└── AppContext
    ├── animals: Animal[]
    ├── zones: Zone[]
    ├── notifications: Notification[]
    ├── updateAnimal()
    ├── addNotification()
    └── ...

Hooks:
├── useTrackerSync (SSE subscription)
├── useConnectionCheck (Timeout detection)
├── useZoneCheck (Zone boundary detection)
├── useAnimals (Legacy hook)
├── useZones (Legacy hook)
└── useApp (Context consumer)
```

## 🔌 API Endpoints

```
RESTful API:
├── POST /api/animals/update
│   ├── Input: String (trackerId;1;"lat";2;"lng")
│   ├── Processing: Parse, validate, broadcast
│   └── Output: JSON {success, message, subscribers}
│
└── GET /api/animals/stream (Server-Sent Events)
    ├── Protocol: HTTP/1.1 with Transfer-Encoding: chunked
    ├── Content-Type: text/event-stream
    ├── Events:
    │   ├── data: {type, animalId, coordinates, timestamp}
    │   └── : heartbeat (every 30s)
    └── Reconnect: Automatic with exponential backoff

WebSocket Alternative (Future):
└── WS /ws/animals
    ├── Bidirectional communication
    ├── Lower latency than SSE
    └── Better for mobile clients
```

## 🗄️ Data Structures

```
Animal (TypeScript)
├── id: string (app-generated: "animal-1234567890")
├── name: string (display name: "Барашек")
├── trackerId: string (hardware ID: "TRK-001" or "101")
├── coordinates: {lat: number, lng: number}
├── status: 'online' | 'offline' | 'alert'
├── batteryLevel: number (0-100)
├── lastSeen: Date
└── history: [
    ├── coordinates: {lat, lng}
    └── timestamp: Date
][]

Zone (TypeScript)
├── id: string
├── name: string
├── coordinates: {lat, lng}[] (polygon points)
└── color: string (hex)

Notification (TypeScript)
├── id: string
├── type: 'zone_exit' | 'connection_lost' | 'low_battery'
├── animalId: string
├── animalName: string
├── message: string
├── timestamp: Date
└── read: boolean

AnimalUpdate (JSON over SSE)
├── type: "animal_update"
├── animalId: string (matches trackerId)
├── coordinates: {lat: number, lng: number}
└── timestamp: ISO8601 string
```

## 🔐 Security Architecture

### Current (Development)

```
No authentication ⚠️
├── Anyone can POST to /api/animals/update
├── Anyone can subscribe to /api/animals/stream
└── Anyone can access /dashboard
```

### Recommended (Production)

```
Layered Security:
├── API Authentication
│   ├── API Keys (X-API-Key header)
│   └── JWT Tokens (Authorization header)
│
├── Network Security
│   ├── HTTPS/TLS encryption
│   ├── Firewall rules
│   └── IP whitelisting
│
├── Rate Limiting
│   ├── Per tracker: 100 updates/minute
│   ├── Per IP: 1000 requests/minute
│   └── Per user: 10 concurrent connections
│
└── Database Security
    ├── Encrypted passwords
    ├── User permissions/roles
    └── Audit logging
```

## 📊 Performance Considerations

```
Scalability Factors:
├── Concurrent Users
│   ├── Single Next.js instance: ~100-500
│   ├── With load balancing: 1000+
│   └── With clustering: 10,000+
│
├── Animals Tracked
│   ├── Per instance: unlimited
│   └── Limited by database capacity
│
├── Update Frequency
│   ├── Per tracker: typically 1-30 seconds
│   ├── System-wide: depends on infrastructure
│   └── Recommended: 10-30 seconds
│
├── History Retention
│   ├── In-memory: 50 positions per animal
│   ├── With database: millions possible
│   └── Retention period: configurable
│
└── Network Bandwidth
    ├── Per update: ~100 bytes
    ├── Per animal/min: ~600 bytes
    ├── 100 animals at 10s: ~60KB/min
    └── 1000 animals at 10s: ~600KB/min
```

## 🚀 Deployment Architecture

```
Development Setup (Current):
├── Laptop: Next.js dev server (localhost:3000)
├── Laptop: Python Base Station (localhost:5000)
└── Network: ESP32 microcontrollers

Production Setup (Recommended):
├── Cloud Server (AWS/GCP/Azure)
│   ├── Next.js production build
│   ├── PostgreSQL database
│   ├── Redis cache
│   └── SSL/TLS certificates
│
├── Base Station (On-premise)
│   ├── Python server with systemd/supervisor
│   ├── Redundancy: 2+ instances
│   └── Docker container (optional)
│
└── Microcontrollers
    ├── Stable firmware
    ├── Remote OTA updates
    └── Monitoring and alerting
```

## 🔄 State Management Flow

```
Redux-like Flow (Context API):

1. Action: New GPS data arrives
   ├── Event: SSE message received
   └── Trigger: useTrackerSync hook

2. Reducer: Parse and validate
   ├── Extract: animalId, coordinates
   ├── Validate: check trackerId matches animal
   └── Create: update object

3. Update State: App Context
   ├── Find: animal by id
   ├── Update: coordinates, lastSeen, status
   ├── Add: to history (max 50)
   └── Trigger: connection check, zone check

4. Side Effects:
   ├── useConnectionCheck: update timeout timers
   ├── useZoneCheck: check zone boundaries
   └── Notify: subscribers if needed

5. Render: React components
   ├── MapView: re-render markers
   ├── AnimalsList: update status badges
   ├── StatsOverlay: refresh statistics
   └── Browser: visual update (map animation)
```

## 📈 Monitoring & Logging

```
Log Levels:
├── [TRACE] Detailed debug info
├── [DEBUG] Development debugging
├── [INFO] General information
├── [WARN] Warning conditions
├── [ERROR] Error conditions
└── [FATAL] Fatal errors

Log Sources:
├── Backend
│   ├── Next.js: /api/animals/update, /api/animals/stream
│   └── Python: base-station.py
│
├── Frontend
│   ├── Browser Console: useTrackerSync, hooks
│   └── React DevTools: component state
│
└── Infrastructure
    ├── Network: HTTP requests/responses
    ├── Database: queries (if added)
    └── System: CPU, memory, disk usage
```

## 🎯 Architecture Design Principles

```
✅ APPLIED:
├── Real-time updates (SSE streaming)
├── Scalable event broadcasting (pub/sub pattern)
├── Decoupled components (no tight coupling)
├── Type safety (TypeScript everywhere)
├── Error handling (auto-reconnect logic)
├── Performance (SSE over polling)
└── User experience (responsive UI updates)

🚀 FOR FUTURE:
├── Persistence (add database)
├── Clustering (multiple instances)
├── Load balancing (nginx reverse proxy)
├── Caching (Redis)
├── API versioning (v1, v2, etc.)
├── Webhooks (external integrations)
└── Analytics (user behavior tracking)
```

---

This architecture provides a solid foundation for a scalable, real-time GPS tracking system while remaining simple enough for development and testing.
