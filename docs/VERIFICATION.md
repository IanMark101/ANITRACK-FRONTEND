# AniTrack web and Quasar verification

## 2026-10-29 product redesign and reliability checks

The signed-in app now uses separate Overview (`/dashboard`) and collection (`/watchlist`) pages, a desktop sidebar, mobile bottom navigation, manual carousels, and a catalog-first add dialog with a custom form. Loading, first-use, filtered-empty, retry, confirmation, and session-recovery states were verified. See [the redesign audit and walkthrough](UX-REDESIGN.md) for the detailed results.

Current checks: 95 backend unit tests, 15 frontend unit tests, and both real PostgreSQL integration scenarios passed. TypeScript, ESLint, production builds, and Android debug web asset compilation/sync passed. The isolated test schema was removed. Live AI checks include each of the three default Gemini models, real backup generation with simulated primary failures, and a browser identification returning One Piece. Native APK/device verification remains outstanding as described below.

The records below describe the preceding migration and Assistant work on 2026-10-28.

Date: 2026-10-28. Tested against the local frontend and configured Neon backend using a separate temporary QA account.

## Browser walkthrough

| Journey | Result |
| --- | --- |
| Log in and open the private dashboard | Passed |
| Search Kitsu for Frieren and open details | Passed |
| Import from anime details | Passed before migration |
| Import a second anime from a discovery card | Passed after migration |
| Prevent adding an already saved title in discovery | Saved title correctly disabled |
| Increment progress, enter an exact count, and auto-complete at 28/28 | Passed |
| Undo an episode from Completed and return to Watching | Passed after migration |
| Edit personal score to 9.2 and favorite an anime | Passed; values preserved after migration |
| Log out, log in, and retain ratings/favorites/progress | Passed |
| Restore the session after page reload and server restart | Passed after migration; both imported titles retained |
| Browse episode pages 1 and 2, related titles, and similar anime | Passed |
| Calendar empty state and known date | Passed; Frieren episode 28 displayed on March 22, 2024 |
| Open anime details from the calendar | Passed |
| Dashboard, discovery, details, and calendar at 390px width | No horizontal page overflow |
| Browser console after final walkthrough | No captured warnings or errors |

The QA account was provisioned through the API; this does not claim a separate browser test of successful registration. Destructive reset/removal flows were not exercised in this browser walkthrough. The temporary QA user and its unreferenced imported records are removed after testing.

## Automated and build checks

- Frontend: 10 unit tests passed, covering auth refresh coordination, redirects, browser/native transport selection, native response handling, and mobile HTTPS configuration.
- Backend: 45 unit tests passed, including the assistant tests added below. The two isolated PostgreSQL integration tests also passed during the preceding API implementation; those external-metadata scenarios use mocked providers.
- Frontend ESLint, TypeScript, and Quasar SPA production build passed. Output: `dist/spa`.
- Capacitor debug assets compiled and synced to the Android project using `npm run prepare:android`. This skips APK packaging.
- A release build without a deployed HTTPS mobile API was correctly rejected by configuration validation.
- `git diff --check` passed.

## Anime Assistant verification

The new `/assistant` page uses the configured backend Gemini key and live Kitsu metadata. It does not require a catalog database import or a new database migration.

| Journey | Result |
| --- | --- |
| Identify the straw-hat, stretchy pirate description | Returned One Piece, linked to Kitsu record 12 |
| Save as a guest, sign in, and return to the selected title | Passed; One Piece saved to a separate temporary QA account |
| Return to the assistant after viewing details | Search preserved and saved title disabled |
| Request adventure, exploration, and friendships | Returned real catalog suggestions, with synopsis excerpts |
| Exclude saved anime from recommendations | One Piece excluded |
| Refine the same request to finished titles with at most 24 episodes | Returned Dr. STONE (24) and Tower of God (13), retaining prior preferences |
| Switch between identification and recommendations | Separate histories retained |
| Gemini temporary failure | Clear retry message; description retained |
| Vague description followed by a specific clue | Asked a useful question, then returned One Piece after the pirate clue |
| Cancel an in-progress refinement | Draft and previous result preserved; input re-enabled |
| Assistant at 320px, 390px, and 768px widths | No horizontal page overflow |
| Result heading after loading finishes | Visible below the sticky header; corrected loading-layout shift |
| Final browser console | No captured warnings or errors |

Automated checks now include 45 backend and 10 frontend tests. Assistant tests cover input limits, follow-up context, strict recommendation filters, unknown/duplicate result IDs, missing or malformed provider output, synopsis evidence, unavailable services, private key handling, guest access, and rate limiting. ESLint and TypeScript pass for both projects. The Quasar web build and Android debug asset sync also pass; an Android APK and device behavior remain unverified as described below.

Live Gemini requests varied in latency and sometimes returned 503 or timed out. AniTrack allows up to a minute, offers cancellation, and keeps the draft on failure. Passing these samples does not establish identification accuracy for all anime. A finished Kitsu season also does not mean the entire franchise story is complete.

The temporary assistant QA account was signed out and removed after verification, along with its one newly imported, unreferenced anime record. Existing user records were not changed.

## Migration compatibility fixes

Quasar CLI 3 disables Vue Options API by default. AniTrack's existing dashboard uses it, so it is enabled explicitly. The original fonts, styles, API environment prefix, route guards, Pinia state, and watchlist data are preserved. The app uses Quasar's layout container; native routing uses hashes, while web routes retain history mode.

## Still requires Android testing

Android Studio, the SDK, and a Java toolchain were unavailable on this PC during verification. No APK was built or launched. Native cookie persistence, login/logout on a device, hardware Back, keyboard behavior, safe areas, physical-device connectivity, release signing, and installation remain to be verified. The Android scaffold still uses Capacitor's default launcher and splash artwork.

See the README for Android setup and build commands.
