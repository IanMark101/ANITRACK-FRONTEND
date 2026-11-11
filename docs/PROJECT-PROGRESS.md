# AniTrack completion progress

Updated: 6 November 2026, Asia/Taipei. Follow-up evidence: EXECUTION-AUDIT-2026-11-06.md.

The website and bundled Android debug application are implemented, built and tested locally. The final APK is installed on the Infinix Note 30 (X6833B, Android 14). Both normal servers are restored. This is a local submission route; no public deployment is claimed.

| Task | Current result |
| --- | --- |
| Requirements and plan | Completed for the web and Android outputs. |
| Android toolchain/device | Studio 2026.2.2.8, JDK 21, SDK 36 and wireless physical phone tested. |
| Authentication/security | Mandatory verification, private APIs, token consumption, revocation, ownership and origin restrictions tested. Actual Gmail receipt awaits the user's check. |
| Web feature acceptance | 123 backend units, 25 frontend units, six isolated database cases, 20 mocked browser regressions and separate real browser/API/database journeys passed. The follow-up browser suite used the compiled SPA. |
| Android runtime | Native signup, pending gate, verification through browser token, login, process restart persistence, shared web/mobile data, watchlist, collection ordering, catalog/episode/related pages, live AI save, profile/password/reset/revocation/logout and network retry exercised. |
| Responsive UI | Shared mobile scale, focused account shell, 44px controls, accessible inputs, safe-area navigation, compact dialogs and top-level trailer action. Earlier 17-page/six-width review retained; follow-up public header/hero checks passed at 320/330/360/390px and desktop/tablet. Phone artwork sits beside the title, with plain copy/actions and a single-row menu header. Final production Taste inspection: zero failures, three documented warnings. |
| Connection handling | Public and account links remain usable during a stalled session request. Eight-second refresh deadline, native cancellation, preserved account state and explicit retry are covered by regression tests. Local APK still requires its laptop backend; hosting follows completion, as requested. |
| Branding | Canonical website torii SVG drives Android icons and splash. |
| Dependencies | Frontend, native and backend audits each reported zero known vulnerabilities at this check. |
| Local network | Normal API port 3001 and website port 5173 work over Wi-Fi. ACCOUNT_LINK_ORIGIN selects the phone-reachable email page and trusts only that exact additional origin. HTTPS required in production. |
| Submission | Group 2, BSIT 4-B; leader Ian Mark Buenaflor. The 32-page academic report covers eight chapters, diagrams, feature guides, test evidence, references and two appendices. Original web/phone screenshots, the local APK, hashes and instructions are in ../SUBMISSION. The [report](assessment/AniTrack-Technical-Documentation.pdf) and [eight-step audit](assessment/INSTRUCTOR-COMPLIANCE.md) are also available in this repository. |
| Cleanup | Disposable schemas, captured mail and review accounts removed; only required evidence, source tests, build tools and intentional outputs retained. |

## Remaining before turn-in

1. Confirm actual Gmail verification and reset receipt/links using the user's own account. Captured email tests do not establish real inbox delivery.
2. Take the required genuine Capacitor installation/Android folder screenshot. The Windows UI capture returned frame timeouts; no generated report is presented as a real terminal screenshot. See SUBMISSION/setup/CAPTURE-INSTRUCTIONS.md.
3. Each member uploads the package under their own Classroom account during November 16-20, 2026 and checks attachment/link access.

Optional hosting and production signing remain separate release work; online deployment is not required by the assignment. The local debug APK requires the laptop awake, the same Wi-Fi and running backend. A changed laptop IP requires an APK rebuild or a hosted HTTPS endpoint.

Gmail connectivity update (5 November 2026): port 587 timed out on this network. Port 465 with TLS successfully authenticated; the local backend now uses SMTP_PORT=465 and SMTP_SECURE=1, with app-password display spaces removed. No message was sent during authentication checks. Actual verification/reset inbox receipt remains the user's final check.
