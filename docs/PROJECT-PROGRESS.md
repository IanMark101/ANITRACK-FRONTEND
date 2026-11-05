# AniTrack completion progress

Updated: 5 November 2026, Asia/Taipei.

The website and bundled Android debug application are implemented, built and tested locally. The final APK is installed on the Infinix Note 30 (X6833B, Android 14). Both normal servers are restored. This is a local submission route; no public deployment is claimed.

| Task | Current result |
| --- | --- |
| Requirements and plan | Completed for the web and Android outputs. |
| Android toolchain/device | Studio 2026.2.2.8, JDK 21, SDK 36 and wireless physical phone tested. |
| Authentication/security | Mandatory verification, private APIs, token consumption, revocation, ownership and origin restrictions tested. Actual Gmail receipt awaits the user's check. |
| Web feature acceptance | 123 backend units, 22 frontend units, six isolated database cases, 17 mocked browser regressions and separate real browser/API/database journeys passed. |
| Android runtime | Native signup, pending gate, verification through browser token, login, process restart persistence, shared web/mobile data, watchlist, collection ordering, catalog/episode/related pages, live AI save, profile/password/reset/revocation/logout and network retry exercised. |
| Responsive UI | Shared mobile scale, focused account shell, real 44px controls, accessible input sizes, safe-area navigation, compact dialogs and top-level trailer action. 17 production pages checked at 320/330/360/390/768/1440; no overflow or runtime errors. Final public hero restored as one integrated art backdrop; header collision also checked. |
| Branding | Canonical website torii SVG drives Android icons and splash. |
| Dependencies | Frontend, native and backend audits each reported zero known vulnerabilities at this check. |
| Local network | Normal API port 3001 and website port 5173 work over Wi-Fi. ACCOUNT_LINK_ORIGIN selects the phone-reachable email page and trusts only that exact additional origin. HTTPS required in production. |
| Submission | Group 2, BSIT 4-B; leader Ian Mark Buenaflor. PDF, original web/phone screenshots, optional local APK, hashes and instructions in ../SUBMISSION. |
| Cleanup | Disposable schemas, captured mail and review accounts removed; only required evidence, source tests, build tools and intentional outputs retained. |

## Remaining before turn-in

1. Confirm actual Gmail verification and reset receipt/links using the user's own account. Captured email tests do not establish real inbox delivery.
2. Take the required genuine Capacitor installation/Android folder screenshot. The Windows UI capture returned frame timeouts; no generated report is presented as a real terminal screenshot. See SUBMISSION/setup/CAPTURE-INSTRUCTIONS.md.
3. Each member uploads the package under their own Classroom account during November 16-20, 2026 and checks attachment/link access.

Optional hosting and production signing remain separate release work; online deployment is not required by the assignment. The local debug APK requires the laptop awake, the same Wi-Fi and running backend. A changed laptop IP requires an APK rebuild or a hosted HTTPS endpoint.
