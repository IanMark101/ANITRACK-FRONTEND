# AniTrack Frontend

The landing page explains AniTrack and links to registration/login. Discover, Anime Assistant, anime details, and all personal workspace pages require authentication and verified email. Guest links explain the features on the landing page; direct feature URLs lead to login and preserve the intended destination. Unverified accounts, including older accounts, go to /check-email without loading workspace pages or navigation. Catalog, discovery, AI and personal APIs independently enforce the same requirement.

`/collections` organizes saved anime into private themed groups, with the reference-inspired charcoal cards and overlapping cover art. Create, rename, describe or delete groups; add saved titles, remove them from a group and change their order. One anime can belong to several collections. Removing a group preserves watchlist progress. Limits are 20 groups and 100 titles per group. [Design and responsive review](docs/COLLECTIONS-DESIGN.md).

Registration attempts to send a verification email and opens /check-email. The screen offers a status check, a rate-limited resend and account switching. Failed delivery leaves the pending account recoverable; it never grants workspace access. Open the emailed /verify-email link, explicitly confirm verification, then continue to the intended page. The Account page (/account) supports profile changes, verification status, password changes and confirmed account deletion. Password recovery starts at /forgot-password; reset links open /reset-password. Backend SMTP configuration is required for real email delivery. Browser journey checks run with npm run test:e2e. See [required verification](docs/REQUIRED-VERIFICATION.md).

Moving to another PC? Follow [the complete clone, environment, database, and run guide](docs/SETUP-ANOTHER-DEVICE.md), which covers both repositories.

Signed-in users open `/dashboard`, a personal overview with a featured anime, continue-watching and saved-for-later carousels, and discovery suggestions. `/watchlist` is the full collection with search, status filters, sorting, favorites, and progress/rating controls. **Add anime** opens a catalog search dialog; **Create a custom entry** provides the manual form inside the same dialog. Desktop navigation stays in a sidebar; phones use a bottom navigation bar.

Temporary server failures keep the session credential and offer reconnection on the current private page. Refreshing the collection preserves existing cards if the request fails. Expired or invalid sessions still require login.

AniTrack includes `/discover` for anime search, genre filtering, popular/top-rated lists, seasonal browsing, and upcoming releases; `/anime/kitsu/:id` for details, trailers, paginated episodes, related titles, and category-based suggestions; and `/calendar` for available recent episode dates from your Watching titles. Existing catalog and custom entries have local detail pages at `/anime/local/:id`. Search results can be imported into the private watchlist in one click. Dashboard cards and detail pages support episode progress, including +1/-1 buttons and an exact count editor.

Open **Anime Assistant** (`/assistant`) after signing in to find a forgotten title from story clues or get recommendations from genres, moods, and preferences. Examples fill the description for editing before submission. Follow-up messages refine the current search; **New search** starts over. Results link to real Kitsu detail pages and support the existing watchlist import. Users can hide saved anime from recommendations. Guests cannot access the assistant or its API.

Configure `GEMINI_API_KEY` only in the backend `.env`; no frontend AI secret is needed. Searches send the description and recent search messages to Google Gemini and can take up to a minute. Search state stays in memory while navigating and clears on reload or account changes. AniTrack does not save assistant conversations to the database. Suggestions are not guaranteed identifications; vague descriptions may need another clue. Temporary Gemini errors preserve the draft for retrying.

No new frontend secret or provider key is required. Requests go through the existing backend `/api` proxy. External metadata failures show retry states while saved watchlists remain available. Calendar dates and trailers depend on provider coverage; unknown dates, totals, and studio credits are not invented. The calendar does not send notifications.

Vue 3, Quasar 2 (Quasar CLI with Vite), Vue Router 5, Pinia, and Capacitor 8. The website keeps its existing design, authentication, and private collection. The same Vue pages now build for the web and Android. The Express/Prisma backend still runs separately.

Use Node.js 24 LTS and npm 11 (Node 22.22+ also works). Run commands from this folder:

```sh
npm install
npm ci --prefix src-capacitor
cp .env.example .env
npm run dev
```

The `src-capacitor` dependency install is required for the website too: Quasar resolves shared Capacitor imports from that folder in every mode. This installs JavaScript packages; Android Studio and the Android SDK are only needed for native Android development.

In PowerShell, use `Copy-Item .env.example .env` instead of `cp` if preferred. Leave `VITE_API_URL` empty for the development proxy to `http://localhost:3001`. Start the backend separately and open `http://localhost:5173`; its origin must match the backend's `CLIENT_ORIGIN`.

For separate deployments, set `VITE_API_URL` to the API URL ending in `/api`, rebuild, and configure the backend frontend origin. Use same-site hosts or a frontend `/api` reverse proxy for refresh cookies. Never put database credentials or JWT secrets in frontend variables.

```sh
npm run lint
npm run typecheck
npm test
npm run build
```

Deploy `dist/spa/` with SPA fallback to `index.html`. Commit the package manifests, lockfiles, source, assets, Quasar configuration, and Android source project. `.env`, `node_modules/`, `.quasar/`, `.tools/`, generated assets, Gradle caches, and signing keys are ignored.

`npm run preview` serves the static build at `http://127.0.0.1:4173`. Authenticated preview also needs the production API routing and a matching backend `CLIENT_ORIGIN`; use `npm run dev` with the included API proxy for everyday local development.

### Android

Install native dependencies once:

```sh
npm install --prefix src-capacitor
npm run prepare:android
```

`prepare:android` compiles debug web assets and syncs them into the native project without producing an APK. In an Android emulator, these debug assets use `http://10.0.2.2:3001/api` by default to reach the backend on this PC. A physical phone needs an explicit reachable `VITE_MOBILE_API_URL`; localhost refers to the phone itself. The debug Android manifest permits HTTP for development; release builds require HTTPS.

To run the synced project, open `src-capacitor/android` in Android Studio and choose a connected device. Use JDK 21 with the checked-in Gradle 8.14.3 wrapper and Android SDK 36. Recent Android Studio releases may bundle JDK 25; select JDK 21 explicitly for this project. These tools are not installed automatically by npm. The current project targets Android API 36, minimum API 24. [Physical-phone setup and local Wi-Fi operation](docs/ANDROID-LOCAL-SETUP.md).

For live reload, `npm run dev:android` starts Quasar's native development mode. With the default loopback server, run `adb reverse tcp:5173 tcp:5173` for the selected Android device first. A remote phone also needs a reachable backend URL. Stop the regular web dev server first because both modes use port 5173.

Before a release build, deploy the backend and set `VITE_MOBILE_API_URL` in `.env` to its **HTTPS** address ending in `/api`. Then:

```sh
npm run build:android
```

Configure signing in Android Studio before distributing a production release. Native API calls use Capacitor HTTP and its platform cookie handling; browser calls retain fetch and the same-site proxy. The debug APK has been built, installed and exercised on an Infinix Note 30 running Android 14. Current results and limits are recorded in [the execution audit](docs/EXECUTION-AUDIT-2026-11-05.md). A successful asset sync alone does not verify native behavior.

On this PC Node 26.13.0 is installed. On another PC, install a supported Node version normally; ignored local runtimes are not part of the repository.

References: [Quasar Capacitor configuration](https://quasar.dev/quasar-cli-vite/developing-capacitor-apps/configuring-capacitor/), [supported native tool versions](https://quasar.dev/quasar-cli-vite/developing-capacitor-apps/capacitor-version-support/), [Capacitor HTTP](https://capacitorjs.com/docs/apis/http).
