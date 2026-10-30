# AniTrack product experience redesign

Brief: 2026-10-29. Reorganize the entire signed-in experience, improve loading/error/empty states, move collection creation to a dialog, provide useful dashboard shelves, and investigate unexpected logout / backend service failures.

## Audit before implementation

- Existing brand: near-black background, red accent (#e50914), Outfit headings, Plus Jakarta Sans body, anime editorial artwork and Kitsu cover imagery. Preserve the AniTrack wordmark and identity.
- Stack: Vue 3, Quasar 2, Pinia, Vue Router, custom CSS. Keep this stack and the existing metadata/auth/watchlist services.
- Navigation mixes public marketing Features with member tools. Dashboard is styled as a header action rather than a clear home destination; signed-in users can land back on marketing sections.
- Dashboard combines overview, full collection management, a long creation form, and reset controls on one page. Duplicate links compete for attention, while the real task hierarchy is unclear.
- Empty accounts show five zero-value statistic cards, filter controls, and a large empty panel asking users to reset filters. This confuses a first-time empty collection with a search that has no results.
- Creation exposes image paths and internal poster choices. It takes substantial vertical space even when unused.
- Numerous 10-12px labels, emoji controls, inconsistent spacing, and repeated bordered panels make the interface dense despite large blank regions.
- Loading is mostly a text placeholder, so zero counts and empty states can flash before data arrives. Errors need clear retry actions and must preserve saved data.
- Existing useful behaviors to retain: watchlist import/custom titles, exact/+1/-1 progress, status, rating, favorite, spotlight, removal/reset confirmation, metadata details, AI refinement, calendar, authentication redirects, keyboard focus, responsive pages.
- Terminal evidence: repeated Prisma P2028 errors. Refresh uses a transaction without explicit timing options; the refresh controller clears cookies on every error, including temporary database failures. This turns an outage into a lost login credential.

## Design direction and structure

Reading this as an anime library product for everyday viewers: calm dark surfaces, red reserved for primary actions, clear type hierarchy, practical motion, and content-led cover shelves. Design variance 5 / motion 3 / density 4. Existing public landing content remains for guests.

- Signed-in shell: persistent desktop navigation and compact mobile navigation for Overview, My watchlist, Discover, Anime Assistant, and Calendar. The logo returns to the overview; public marketing navigation is absent.
- Overview: greeting, a focused featured title or welcome panel, continue-watching shelf, saved-for-later shelf, and real discovery suggestions. Horizontal shelves have buttons and touch scrolling; they do not auto-advance.
- My watchlist: a dedicated full collection page with one creation action, status/search/sort controls, compact useful counts, and separate first-use/no-results/error states.
- Add anime dialog: catalog search first, with a clearly labeled custom-entry option. Plain user-facing labels, image selection/upload, and validation. Use Quasar dialog focus/escape/scroll behavior.
- Shared feedback: stable skeletons while loading, inline retries on failure, preserved data during refresh, actionable empty states, and confirmation for destructive collection changes.
- Session recovery: temporary backend errors retain refresh cookies and allow retry on the current page. Real expired/invalid sessions still require login.

## Verification

Completed on 2026-10-29 against the local website and configured Neon database, using a separate temporary account.

| Journey | Result |
| --- | --- |
| Signed-in root and logo destination | Restores the session and opens Overview; no marketing navigation flash |
| Empty overview and empty collection | Useful first-title actions; no zero-stat/filter clutter |
| Add from catalog | Search, import, saved state, and duplicate protection passed |
| Create a custom title | Genre, rating, status, total, synopsis, and default cover saved successfully |
| Search, status, sorting, and favorites | Correct matches; distinct no-results state and working clear action |
| Episode progress | +1, exact count, persistence, and automatic completion passed |
| Rating and favorites | Saved values persisted after reload |
| Feature on overview | Selected title appeared first; previous/next controls worked |
| Shelves | Desktop popular shelf and phone continue-watching shelf scrolled with their controls |
| Remove and reset | Confirmation text and cancellation verified; no real collection was reset in browser QA |
| Dialog keyboard behavior | Focus stays inside, Escape closes, and focus returns to the trigger |
| Narrow custom form | Actions stack at 320px; form content has no horizontal overflow |
| Session recovery | Temporary disruption offered retry and recovered the same account without a password |
| Two tabs restoring the shared session | Both remained signed in and retained the seven saved entries |
| Discover and details | Live Frieren search, saved-title protection, details, and progress visible |
| Anime Assistant | Live pirate description returned One Piece; loading, result focus, and detail link worked |
| Calendar | Loading, known-date explanation, no-releases state, and week navigation worked |
| Responsive layout | Overview, watchlist, Discover, Assistant, details, and Calendar fit the checked 320px, 390px, 768px, and desktop layouts |
| Final browser console | No captured warnings or errors |

The two real PostgreSQL integration scenarios passed in a fresh isolated schema, which the runner removed afterward. Backend 95 unit tests and frontend 15 unit tests passed. TypeScript, ESLint, the Quasar SPA build, backend compilation, and Capacitor debug asset compilation/sync passed. No Android APK or device behavior is claimed.

Browser QA was signed out afterward. The exact temporary test user and six newly imported records unused by other accounts were removed; existing user records were preserved.

The P2028 failure was reproduced during a custom collection write. Authentication and collection transactions now explicitly use bounded time allowances suitable for hosted PostgreSQL; creation avoids reading a large poster twice. A regression test also proves that a temporary refresh failure does not clear the cookie, and the same cookie can succeed on retry. Collection load failures preserve existing cards. Initial loads show skeletons or a retry state instead of false empty content.

Screenshot evidence: `ux-before-desktop.png`, `ux-overview-desktop.png`, `ux-overview-mobile.png`, `ux-watchlist-desktop.png`, `ux-watchlist-mobile.png`, `ux-watchlist-empty.png`, `ux-add-catalog-desktop.png`, `ux-add-custom-mobile.png`, and `ux-session-recovery.png` in the task's verification output folder.

External metadata/AI/database services can still be unavailable. The interface now keeps the draft or session credential where appropriate and provides a useful retry path. Native keyboard, safe-area behavior, and native cookie persistence still require a device or emulator.
