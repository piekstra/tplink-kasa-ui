# tplink-kasa-ui

A modern, mobile-first web app to **see, monitor, and control** TP-Link Kasa smart
devices — device toggles, live wattage, and daily/monthly energy charts. Installable
as a PWA so it works like an app on your phone.

Built with Vite, React 19, TypeScript, Tailwind CSS 4, shadcn/ui, TanStack Query,
and Recharts.

## Backend

The API is [tplinkcloud-service](https://github.com/piekstra/tplinkcloud-service),
which wraps [tplink-cloud-api](https://github.com/piekstra/tplink-cloud-api). Auth is
stateless pass-through: your TP-Link cloud session token (wrapped in an opaque service
token) is the bearer token; nothing is stored server-side.

## Running the stack

```sh
docker compose up -d --build
```

Then open http://localhost and sign in with your TP-Link (Kasa) account.

## Development

```sh
nvm use            # Node 22
npm install
npm run dev        # http://localhost:5173, proxies /api to :8000
```

Run the API locally alongside it (from the tplinkcloud-service repo):

```sh
uv run uvicorn app.main:app --port 8000
```

Other scripts: `npm test` (vitest), `npm run lint`, `npm run format`, `npm run build`.

## Architecture notes (home-ui seams)

This app is deliberately structured so a future multi-vendor **home-ui**
(govee, roomba, samsung, …) can grow out of it:

- `src/api/types.ts` — vendor-neutral `Device` / `DeviceProvider` interfaces.
  Components only import these.
- `src/api/tplink.ts` — the sole `DeviceProvider` implementation. home-ui adds a
  provider registry keyed by `vendor` and aggregates `listDevices()` across
  providers; components don't change.
- `src/features/auth/auth.ts` — the single-token auth module; the only file that
  changes when a future home-api owns one login → N vendor tokens.
- The backend's REST shape (`/devices`, `POST /devices/{id}/power`,
  `/power/devices/*`) is the vendor-service convention documented in the
  tplinkcloud-service README.

## PWA / phone use

The app registers a service worker (app shell only — device data is never cached)
and is installable. Note: service workers require HTTPS (or localhost), so for
LAN access from a phone put the compose stack behind Tailscale Serve or a local
TLS proxy to get the install prompt.
