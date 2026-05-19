# Sheep Tracker

## Data flow overview

1. **ESP device / base station**
   - `base-station.py` receives raw ESP log lines and forwards them to the Next.js backend.

2. **Update API endpoint**
   - `app/api/animals/update/route.ts` receives POST updates in `id;lat;lng;satellites;battery` format.
   - It stores the latest animal state and notifies any event subscribers.

3. **SSE stream**
   - `app/api/animals/stream/route.ts` opens a server-sent event connection for browser clients.
   - It sends updates and keeps the socket alive with heartbeat events.

4. **Client sync hook**
   - `lib/hooks/use-tracker-sync.ts` opens an `EventSource` to `/api/animals/stream`.
   - It parses messages and calls `updateAnimal()` plus notification helpers.

5. **Global app state**
   - `lib/context/app-context.tsx` provides the shared `AppContext`.
   - It manages `animals`, `zones`, and `notifications`.
   - It persists state into `localStorage` under keys: `sa:animals`, `sa:zones`, `sa:notifications`.

6. **UI rendering**
   - Map markers: `components/map/animal-marker.tsx`
   - Side list: `components/sidebar/animals-list.tsx`
   - Details panel: `components/animals/animal-details-panel.tsx`
   - Notification panel: `components/notifications/notifications-panel.tsx`

## Key files

- `lib/context/app-context.tsx` — core shared state and persistence.
- `lib/hooks/use-tracker-sync.ts` — SSE subscriber and live update processor.
- `app/api/animals/update/route.ts` — telemetry ingest API.
- `app/api/animals/stream/route.ts` — SSE broadcast endpoint.
- `base-station.py` — optional ESP log forwarder.

## Why `updateAnimal()` matters

`updateAnimal()` is the central state mutation used when live telemetry arrives. The main file chain is:

- `lib/hooks/use-tracker-sync.ts`
  → `useApp()`
  → `updateAnimal()` in `lib/context/app-context.tsx`

That means any file calling `useApp()` can indirectly trigger live animal updates.

## Diagnostic script

Use the helper script to list all files referencing `updateAnimal` and inspect the import dependency tree.

```bash
python scripts/trace_updateflow.py
```

If you use pnpm, the package script is also available:

```bash
pnpm run trace:update
```

## Notes

- The app uses client-side storage to preserve animals, zones, and notifications.
- `localStorage` is loaded in `AppProvider` during initialization.
- The notification panel has a clear action in `components/notifications/notifications-panel.tsx`.
