# AniTrack execution audit - 5 November 2026

## Verified results

- Backend ESLint, TypeScript build and 123 unit tests passed, including verified access, empty-guest 204, invalid-session 401, recovery, exact account origins and owned-schema cleanup boundaries.
- Frontend ESLint, typecheck, SPA production build and 22 unit tests passed.
- Six real isolated PostgreSQL integration cases passed. Provider responses/mail are deterministic fixtures in those cases; the owned schema was removed.
- Seventeen browser regressions passed. The optional real journey was skipped in that mocked suite and run separately with real compiled API and isolated PostgreSQL.
- The final real journey passed in approximately two minutes: registration, captured verification, custom anime, Collections create/add/rename/delete, profile change and account deletion. Zero test users remained; the schema and captured mail were removed.
- Seventeen production routes were measured at six widths (320/330/360/390/768/1440), with no page overflow, small mobile controls, tiny mobile copy, decorative text underlines or page runtime errors in the saved checks. Dialogs, More navigation and focus behavior were additionally reviewed. Final hero/header changes were separately rendered and checked, including the actual Android build.
- Native Gradle assembleDebug passed; the app was installed wirelessly on an Infinix Note 30 / X6833B, Android 14. Startup, real native HTTP, signup, required verification, shared persistence, process restart, status/favorite/rating/progress, collection membership/rename/order, discovery import/details/episode pagination/related titles, profile, password change/reset/revocation/logout and retry after API disconnection were exercised.
- A bounded live Gemini identification returned two real Fullmetal Alchemist variants; a suggestion was saved. Real Kitsu metadata and episode pages were loaded. This is evidence of a working provider journey, not a guarantee about all future provider availability.
- Guest refresh without a cookie returns 204. Invalid cookies and private unauthorized requests still return 401. No console suppression was added.
- All three installed package trees reported zero known npm advisories. Scoped minimatch and compatible native tool patches passed lint/build/runtime checks.
- Verification/reset emails can use a separately configured exact web origin for local phone access; localhost remains supported. Production links require HTTPS.

## Visual review

The user's Collections reference and AniTrack brand were retained. A shared mobile stylesheet replaces inconsistent page sizes. Account screens have a focused header, compact headings and no repeated landing menu/footer. Small-screen grids, 44px controls, 16px inputs, scrolling dialogs, safe-area bottom navigation and error/retry states were checked. The trailer now opens from the title actions before the synopsis and has a responsive dialog, close control and external YouTube fallback. The mobile hero uses an integrated, subdued poster backdrop rather than a second stacked image section.

Taste source checks for the new mobile stylesheet/components/detail work reported zero failures (an anime type/year/status metadata line was a reviewed eyebrow warning). The final landing inspection was rerun after its body copy was raised to 16px. Retained warning exceptions: existing brand type scale, no autoplay video to reduce mobile bandwidth, and restrained motion. Long real anime names are allowed to wrap; they are never truncated into a different title. Screenshots were opened and reviewed; generated framework/vendor files are excluded from owned-source lint scope.

## Deliverables and limits

Original web and actual-phone evidence, the locally signed debug APK, SHA-256 manifest, submission PDF and individual Classroom instructions are in SUBMISSION. Group identification is BSIT 4-B, Group 2, leader Ian Mark Buenaflor, with Kenji Agustine Caayohan, Rochelle Andales and Kent Jeced Alcantara.

Actual Gmail receipt is still unconfirmed by the user. The required genuine desktop setup screenshot remains a manual capture because the Windows capture helper returned frame timeouts. CAPACITOR-INSTALLATION.txt is explicitly a generated verification record, not a fabricated terminal image. Online deployment/production signing are not claimed.

## Cleanup

The disposable native review account was deleted through the app. The fixture schemas anitrack_browser_9094b79d97f24c52af9b6f400bdd1692 and anitrack_browser_89d0ee6c7eae4a368b7f38c253a51451 were removed by their owning runners with captured mail/temp directories. Earlier owned-schema disconnect cleanup was retried and verified absent. Main user records were preserved. Test proxies and review browser profiles were closed, and temporary local QA files are removed after their durable results are recorded. The normal frontend/API remain running.
