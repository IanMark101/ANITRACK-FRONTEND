# AniTrack Frontend

Vue 3, Vue Router, and Pinia application with landing, authentication, and private watchlist pages. This folder can be the root of the `anitrack-frontend` GitHub repository.

Use Node.js 22.12 or newer. Run commands from this folder:

```sh
npm install
cp .env.example .env
npm run dev
```

In PowerShell, use `Copy-Item .env.example .env` instead of `cp` if preferred. Leave `VITE_API_URL` empty for the development proxy to `http://localhost:3001`. Start the backend separately and open `http://localhost:5173`; its origin must match the backend's `CLIENT_ORIGIN`.

For separate deployments, set `VITE_API_URL` to the API URL ending in `/api`, rebuild, and configure the backend frontend origin. Use same-site hosts or a frontend `/api` reverse proxy for refresh cookies. Never put database credentials or JWT secrets in frontend variables.

```sh
npm run lint
npm run typecheck
npm test
npm run build
```

Deploy `dist/` with SPA fallback to `index.html`. Commit this folder's package manifest, lockfile, source, assets, and configuration. `.env`, `node_modules/`, and `dist/` are ignored.
