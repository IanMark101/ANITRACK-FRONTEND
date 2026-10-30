# Run AniTrack on another device

AniTrack uses two repositories: [frontend](https://github.com/IanMark101/ANITRACK-FRONTEND) and [backend](https://github.com/IanMark101/ANITRACK-BACKEND). Clone both into the same parent folder. These instructions use Windows PowerShell.

## 1. Install prerequisites

Install Git and Node.js **24 LTS**, which includes npm. Reopen your terminal after installation, then check:

```powershell
git --version
node --version
npm --version
```

Node should report `v24.x`. The frontend requires Node 22.22+ or a supported newer version; the old Node 22.17 installation on the original PC is not sufficient by itself. The original PC's ignored `.tools/node/` runtime is not uploaded to GitHub.

## 2. Clone both repositories

Open PowerShell in the folder where you want to keep the project:

```powershell
mkdir ANITRACK-PLATFORM
cd ANITRACK-PLATFORM
git clone https://github.com/IanMark101/ANITRACK-BACKEND.git
git clone https://github.com/IanMark101/ANITRACK-FRONTEND.git
```

If GitHub asks you to sign in, use the account with access to these repositories.

## 3. Configure the backend

In this terminal:

```powershell
cd ANITRACK-BACKEND
npm ci
Copy-Item .env.example .env
```

Edit `ANITRACK-BACKEND/.env`. Transfer the existing backend `.env` privately from your original PC, or fill in these values:

```dotenv
DATABASE_URL=YOUR_POOLED_NEON_CONNECTION_STRING
DIRECT_URL=YOUR_DIRECT_NEON_CONNECTION_STRING
JWT_SECRET=YOUR_PRIVATE_SECRET_WITH_AT_LEAST_32_CHARACTERS
CLIENT_ORIGIN=http://localhost:5173
PORT=3001
NODE_ENV=development
TRUST_PROXY=0
GEMINI_API_KEY=YOUR_EXISTING_GOOGLE_AI_STUDIO_KEY
```

Keep the TLS parameters in both Neon URLs. Reusing the same Neon database keeps the existing accounts, watchlists, and progress available on the new device. GitHub stores the source code; it does not copy the database. `GEMINI_API_KEY` is required for the AI Assistant; ordinary discovery and watchlists can work without it. The example file also documents the optional model settings and starter-account settings; the latter can remain blank.

Never commit the real `.env`, database passwords, JWT secret, or AI key. They are intentionally excluded from Git. On a later update, keep your existing `.env` rather than replacing it with the example.

After saving the environment file:

```powershell
npm run db:generate
npm run db:deploy
npm run dev
```

Leave this terminal running. The API uses `http://localhost:3001`; `http://localhost:3001/api/health` checks database connectivity. `db:deploy` applies any pending committed migrations without resetting your database. Do not use `db push --force-reset` or `migrate reset` to set up the existing database.

Only if you chose a completely new database and want the ten starter catalog titles, run `npm run db:seed` once after deploying migrations. This is unnecessary for the existing Neon database.

## 4. Start the frontend in a second terminal

Open another PowerShell window in the same parent folder where you created `ANITRACK-PLATFORM`:

```powershell
cd ANITRACK-PLATFORM\ANITRACK-FRONTEND
npm ci
npm ci --prefix src-capacitor
Copy-Item .env.example .env
npm run dev
```

Install both sets of frontend dependencies, including when running only the website. Quasar resolves shared Capacitor imports through `src-capacitor/node_modules` in SPA mode too. Android Studio and the Android SDK are not needed for this JavaScript dependency install.

Leave `VITE_API_URL` blank in the frontend `.env` for local development. Requests use the configured proxy to the local backend. No database URL or AI key belongs in this file. `VITE_MOBILE_API_URL` can also remain blank for the website.

Open **http://localhost:5173**. The backend must keep running in the first terminal. Use `localhost` consistently with the `CLIENT_ORIGIN` above. If either required port is already occupied, stop the other process using that port before starting AniTrack.

## 5. Get future changes

First stop each dev server with Ctrl+C. In the backend folder:

```powershell
git pull --ff-only
npm ci
npm run db:generate
npm run db:deploy
npm run dev
```

In the frontend folder, in its separate terminal:

```powershell
git pull --ff-only
npm ci
npm ci --prefix src-capacitor
npm run dev
```

If you also edit code on the new device, commit and push those changes before switching devices. Pull on the other device before starting new edits. If Git reports local changes or divergent branches, resolve them before pulling; do not force-push to overwrite the other device's work.

## Optional: checks and Android

In either repository, `npm test`, `npm run lint`, and `npm run build` run its automated checks/build. These commands do not replace starting the two dev servers above.

For the Android project, from the frontend folder:

```powershell
npm run prepare:android
```

This compiles and syncs web assets; it does not produce an APK. Android Studio, a compatible Java toolchain, and the Android SDK are separate requirements. See the frontend README for device/emulator networking and release configuration. None of these Android tools is needed just to run the website.
