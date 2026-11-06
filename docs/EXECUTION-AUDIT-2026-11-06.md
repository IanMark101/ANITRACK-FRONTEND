# Mobile layout and connection audit - 6 November 2026

## Changes

The phone landing page now uses one header row with a labelled, keyboard-accessible navigation menu. A small fan of existing anime covers sits beside a two-line heading. Copy and actions use a plain background; there is no separate poster section or collage behind the words. Mobile section headings are 28px, feature headings 22px, and account fields retain accessible input and touch sizes. A conflicting tablet header rule was corrected. Decorative art cannot intercept pointer events.

Public navigation and account forms no longer wait for session restoration. A pending or unreachable API therefore cannot freeze the landing, registration, login or recovery links. Session refresh has an eight-second deadline, including browser lock acquisition; native requests respect cancellation even when the platform plugin has not returned. Connection failures retain existing account state and offer an explicit retry. The local Android build explains its laptop/network requirement. Private routes and APIs still require authenticated, verified accounts.

## Verification

- Frontend ESLint, TypeScript checking, 25 unit tests and production SPA compilation passed.
- Twenty browser regressions passed against the compiled SPA. One optional live-database test was skipped in this mocked suite; the separate real database/browser journey passed on 5 November and is recorded in that day's audit.
- Regression cases cover the original account/private-access/verification/trailer behavior plus 320/360/390px header/hero geometry, keyboard/menu dismissal, stalled session requests, and reconnecting after an unavailable API. The retry test caught a decorative artwork hit target; it passed after that layer was fixed.
- Backend health returned 200. An empty guest refresh returned 204 through the compiled-site proxy on the configured origin. An unconfigured preview origin was correctly rejected; the visual review used the configured origin without weakening backend origin checks.
- Android asset compilation and Gradle assembleDebug passed (1m 11s, 123 tasks). The updated APK was installed with existing app data retained on the paired Infinix Note 30 / Android 14.
- The installed WebView loaded its bundled home route. At its actual 360px viewport and retained 1.15 system font scale, scroll width was 360px, the title remained two lines, and the primary control measured approximately 50px high. Fresh foreground-only phone captures of landing, login and recovery were saved and visually reviewed. No other phone app was captured.
- A real native outage check briefly stopped only the verified local API process. Registration opened in approximately 1.15 seconds; registration, login and recovery navigation together took approximately 1.63 seconds. The recovery title measured 27.6px after the user's text scaling, without horizontal overflow. After restoring the API, the explicit retry cleared the connection notice in approximately 0.25 seconds. The app remained installed with existing data retained. The normal API and frontend were restored afterward.
- Taste source checks for the changed public/mobile components reported zero findings, with explicit neutral-photo-mask exceptions in the retained desktop artwork. Production inspection at 1440/768/390px reported zero failures and three reviewed warnings. Every final fold/contact sheet was opened. See MOBILE-VISUAL-REVIEW-2026-11-06.md.

## Local operation and remaining handoff

The APK currently addresses http://192.168.254.142:3001/api. It needs the laptop awake, the backend running and that address reachable. A different Wi-Fi network or laptop IP can break this connection. Capacitor packages the frontend, not the Express server or PostgreSQL database. Hosting the backend and rebuilding with its HTTPS address is later release work, as requested; no deployment was performed.

The submission includes genuine web and previously captured physical-phone feature evidence, the latest debug APK and a checksum manifest. Actual Gmail verification/reset receipt remains the user's check. The Windows setup screenshot helper was retried on 6 November and returned "FrameArrived timed out: timed out waiting on channel"; the required genuine setup capture remains manual. The recorded installation text is explicitly not a fabricated terminal screenshot.

No live test account was created during this follow-up. Disposable accounts/schemas from the earlier real journeys were removed on 5 November. Permanent regression tests and required submission evidence are retained; temporary local review files are removed after their results are recorded. Normal local servers are restored after production review.
