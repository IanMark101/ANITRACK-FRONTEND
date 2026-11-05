**AniTrack system completion plan — website, backend and Android**

Updated: 5 November 2026, Asia/Taipei. Status: planning complete; implementation tasks have not been started by this planning request.

This is the main task plan for finishing the existing AniTrack system and meeting the supplied Final Examination and Final Project instructions. It supersedes the earlier decision to defer Android. Both the functional website and the functional installed Android application are required. The [progress tracker](C:/Users/Lenovo/Desktop/ANITRACK/ANITRACK-FRONTEND/docs/PROJECT-PROGRESS.md) records execution status and evidence; the [web deployment appendix](C:/Users/Lenovo/Desktop/ANITRACK/ANITRACK-FRONTEND/docs/WEB-RELEASE-PLAN.md) contains the optional Vercel/Railway deployment details.

The project reuses the existing Vue/Quasar frontend, Express backend and PostgreSQL database. Completion means the agreed features work through the real clients and API, the Android APK is installed and tested on a physical phone, and the required submission evidence is ready. Installing Capacitor, generating folders, compiling web assets or passing mocked tests alone does not establish that result.

**1. Required outputs and acceptance**

| Requirement from the supplied assignment | Planned output | Completion check |
| --- | --- | --- |
| Web application, 50 points | Completed AniTrack website, locally hosted or deployed | All scoped web features pass their checks against the backend; no unresolved defect prevents a core journey. |
| Local website evidence | At least three screenshots: main/dashboard, a working core feature and another functional module | Capture Overview, Watchlist after saving/updating a title, and Collections with saved entries. Additional Discover/Assistant images can strengthen the evidence. |
| Deployed website alternative | Working accessible website link, if deployment is selected | Open the submitted URL from a separate browser/device; verify access, registration/login and private features. Capture backup screenshots even if using the link. |
| Android application, 50 points | An installable APK built with Capacitor and running on a real Android phone | Install the actual built APK, cold-launch it and use the backend-backed features. A mobile browser screenshot or emulator alone does not satisfy the requested phone evidence. |
| Installed/running mobile evidence | Phone screenshots showing installation and the running app | Capture the AniTrack launcher/App Info identity and the actual running dashboard separately for clarity. |
| At least two mobile feature screenshots | Working Watchlist and Collections, or two other demonstrated core features | Perform real actions and confirm saved results persist before capturing. Do not use mocked browser screens as phone evidence. |
| Capacitor setup evidence | Actual dependency/setup output and the existing Android project folder | Capture successful Capacitor package verification/setup and the real native project structure, following the separate class guide if provided. |
| Optional APK attachment/link | Tested APK and build/version information | Keep the same installable APK that passed phone checks; verify any shared download link. APK upload is optional in the supplied instructions, but building an APK is needed to install/test it. |
| Submission identification | Project title, section, group name/number if applicable, leader and complete member names | Obtain the real details; do not invent names or submit blanks as final information. |
| Individual submissions | One shared evidence package that each member can submit from their own Classroom account | Provide handoff instructions. Each member must turn it in individually. No presentation or automated Classroom submission is planned. |
| Submission window | November 16–20, 2026 | Target a tested build and complete package by November 15, leaving the submission window for access checks and individual turn-in. |

Online deployment is optional under these instructions. A reachable backend is still necessary for the Android app wherever it is tested or reviewed. A local-only build must state its PC/network requirements accurately; it must not be described as working from arbitrary networks.

**2. Existing implementation and remaining proof**

Baseline inventory checked on 5 November:

- Frontend repository: C:/Users/Lenovo/Desktop/ANITRACK/ANITRACK-FRONTEND. Latest local commit observed: f26b4ae. Backend repository: C:/Users/Lenovo/Desktop/ANITRACK/ANITRACK-BACKEND. Latest local commit observed: f114eaf. New email-verification/recovery work and tests remain uncommitted. Recheck both working trees before later execution.
- Existing web modules include landing/authentication, Overview, Watchlist, custom/imported titles, Collections, Discover, anime details, Anime Assistant, Calendar and Account. Email verification and private API enforcement are implemented locally.
- Recorded checks from November 2: 107 backend unit tests, 21 frontend unit tests, six isolated database integration cases and 15 browser journeys passed. See [required-verification evidence](C:/Users/Lenovo/Desktop/ANITRACK/ANITRACK-FRONTEND/docs/REQUIRED-VERIFICATION.md). These are historical results, not tests run during planning.
- Current browser suites include mocked API journeys. The optional captured-mail real-backend browser account journey still needs execution after the verification changes.
- Gmail SMTP authentication was checked without sending mail. Actual inbox receipt and complete real verification/reset flows are not yet established by that check.
- Capacitor packages, native HTTP transport and the Android source project already exist. App name is AniTrack; application ID is org.anitrack.app. Do not initialize another project or create a duplicate Android folder.
- The native project currently uses SDK 36 for compile/target and minimum API 24, Android Gradle Plugin 8.13.0 and Gradle wrapper 8.14.3. Preserve compatible versions unless a demonstrated incompatibility requires a reviewed change.
- Java/adb were not found on PATH in the planning check; Android Studio and the SDK were not found in the standard paths checked. Discover any alternate installation before installing anything. A current native build, installable APK, physical-phone test and native session persistence remain unverified.
- The current native entry point is a Capacitor BridgeActivity and the UI uses hash routing in Capacitor mode. Test Quasar/Capacitor navigation defaults on the phone before adding custom Back handling.
- App icon/splash resources exist; their final appearance and startup behavior require device review. Prior web asset compilation does not verify those native behaviors.

Do not attach an invented percentage to overall completion. Existing source, automated evidence, real web acceptance and physical Android acceptance are tracked separately.

**3. Product and architecture rules**

| Component | Role and boundary |
| --- | --- |
| Public website | Explain AniTrack and link to registration/login. No usable public Discover, Assistant or catalog feature. |
| Vue/Quasar application | Shared feature code and design for browser and Android; browser history routes, native hash routes. |
| Capacitor Android shell | Package built web assets, native HTTP/cookies, Android navigation/lifecycle and installable application. It does not package the Express server or Neon database. |
| Express/Prisma API | Validate inputs, authenticate sessions, enforce verified email and ownership, persist changes and call external providers. Both clients use the same API contract. |
| PostgreSQL/Neon | Accounts, sessions/tokens, shared anime metadata, private titles, Collections/memberships and AI usage accounting. Do not move credentials/database access into the APK. |
| Kitsu/Gemini/email | Backend-managed integrations. Keep keys and SMTP credentials out of public frontend variables and native assets. |

Access policy is unchanged across web and native: guests may read the informational landing page and use account entry/recovery pages. Authenticated unverified accounts stay in the verification flow and may use the existing restricted session/verification/recovery/deletion endpoints. All workspace features require authenticated, verified accounts. Administrative handlers require the correct role as well. A password reset does not verify an email.

Preserve the current AniTrack identity and the user's Collections reference: charcoal surfaces, centered collection titles, fanned/overlapping covers and white primary actions for that screen. Apply the installed [Taste Skill](C:/Users/Lenovo/.codex/skills/taste-skill/SKILL.md) whenever implementing or reviewing UI changes. Keep the existing stack rather than starting a new system.

Android is now required. New social/public-collection features, push notifications, offline database synchronization, iOS, Play Store publication and a new framework are outside this assignment scope. Calendar remains a view of available episode dates; do not claim notifications. Reconcile any additional original Activity 1 commitments if the group supplies them.

**4. Inputs to settle early**

| Input | Why it matters | Handling while unknown |
| --- | --- | --- |
| Physical Android phone access, Android version and connection method | Required installation/feature evidence and native testing | Prepare/build independently; mark phone-only checks pending until a real phone is available. Record model/OS/WebView version, without publishing device serials. |
| Android Studio/SDK installation location and available storage | Gradle builds, SDK 36, platform-tools and device detection | Discover existing tools first, then install missing compatible components during execution. |
| Backend/verification-page reachability for the phone and reviewer | A phone cannot use the PC's localhost, and emailed links must open a reachable page | Choose the route below before freezing an APK. Do not defer this choice until screenshot day. |
| Hosting plan and budget, if deploying | Railway SMTP eligibility and provider costs affect mandatory verification | Prepare a concrete choice; no paid action is implied by this plan. |
| Separate Classroom Capacitor guide | May specify evidence or build details not present in the supplied assignment text | Reconcile it if provided. Do not claim it was read or blindly replace the existing Capacitor 8 project. |
| Activity 1 scope and group identification | Ensures the final project matches the original commitments and required submission fields | Use the existing known features as the working scope; record any additional supplied requirements explicitly. |

Do not ask for secrets or another confirmation of already-authorized routine work. During execution, request only missing information that blocks a dependent task, while completing independent work.

**5. Backend/network choices for both clients**

Choose one final review configuration and document it. Use a reachable development configuration for early phone tests while a hosted configuration is prepared.

| Route | Website and Android behavior | Acceptance and limitations |
| --- | --- | --- |
| Local submission | Website and API run on the PC; bundled debug APK connects to the PC's reachable LAN API. The phone must have network access to that PC. | Permitted local website submission; capture real working phone features. Document server startup, LAN address and review-network requirements. Localhost on the phone refers to the phone itself. A local APK cannot be advertised as remotely usable. |
| Hosted submission | Vercel serves the website and forwards browser /api requests to Railway; the native client uses the selected HTTPS API ending in /api; Neon remains server-side. | Preferred when members/instructor need access independently of the development PC. Deploy only after the selected costs, credentials, email path and configuration are settled. |

For local physical-phone work, use a current reachable PC LAN address in VITE_MOBILE_API_URL, bind the needed development services to the intended private network and configure exact allowed origins. Permit only the needed private-network access; do not require internet port forwarding. If mail links open the local website on the phone, its host binding and CLIENT_ORIGIN must also be reachable from that phone.

The current debug configuration permits HTTP for development. The current release configuration requires an HTTPS mobile API and rejects a missing/invalid URL. Keep that guard. The emulator fallback 10.0.2.2 is for the Android emulator, not a physical phone. Do not put a temporary LAN URL or live-reload server URL into a purported portable release APK.

For hosted work, retain the browser's same-origin API proxy for the existing Strict refresh cookie. Test real native HTTP/cookie behavior separately; a passing browser cookie test cannot prove native persistence. Test the API's origin/CSRF checks with the actual native request headers, and make narrow changes only if required. Do not enable wildcard production origins or weaken account verification to make a phone connect.

Railway Free/Trial/Hobby currently require HTTPS email APIs because outbound SMTP is available only on Pro and above. If selecting Pro with Gmail, retain and validate SMTP. If selecting an affected plan, choose an HTTPS transactional provider and implement it through the existing AccountMailer interface, preserving the verification/reset semantics. Local Gmail success does not prove Railway delivery. [Railway outbound networking](https://docs.railway.com/networking/outbound-networking).

Email confirmation/reset can initially complete in the phone's external browser using a reachable frontend link; the app can then recheck verification or sign in with the new password. Custom Android deep links are not mandatory in the supplied assignment. Add them only if an agreed workflow requires them, and test token handling explicitly if added.

**6. Execution tasks**

The tracker uses the same task IDs. Dependencies refer to required inputs or completed behavior; independent tasks can progress while waiting for an inbox or device. T08 is a continuing fix/retest activity, not a reason to delay a known correction.

| ID | Work | Dependencies | Output and completion evidence |
| --- | --- | --- | --- |
| T00 | Inspect requirements and create the master plan/tracker | Supplied instructions and existing source | This plan and tracker; Android included; deployment optional; no implementation claimed. |
| T01 | Establish execution baseline and acceptance scope | T00 | Recheck instructions/status/runtime, preserve unrelated changes, reconcile Activity 1/class guide when available, record versions and initial issue list. |
| T02 | Prepare Android tools/device access and choose network route | T01 | Discover/install compatible tools, SDK/platform-tools; detect an authorized phone; choose reachable API/email-page configuration and identify hosting/email decisions. |
| T03 | Finish real account-flow acceptance and backend security checks | T01; working development servers | Real verification/reset receipt; restricted pending accounts; token use/expiry/replay tests; session revocation and ownership/admin checks. |
| T04 | Finish real web/full-stack feature acceptance | T01; existing account flow; T03 issues addressed as found | Execute captured-mail browser/API/database journey, feature matrix and bounded live-provider checks; record passing evidence and demonstrated defects. |
| T05 | Produce the first bundled APK and boot it on a phone | T02 toolchain/device | Sync built assets, Gradle build, install, cold-launch and inspect startup. Do early, without waiting for every web polish task. |
| T06 | Verify native backend access, account flows and session lifecycle | T03, T05; reachable API from T02 | Native signup/check-email/verify/login/recovery, refresh, close/reopen, logout/account switching and unavailable-network checks. Recheck after changing final hosts. |
| T07 | Verify every scoped feature and native interaction on the phone | T04, T06 | Shared feature matrix passes on actual Android; safe areas, keyboard, Back, dialogs, links, navigation and persistence checked. |
| T08 | Fix demonstrated defects and review changed UI | Findings from T03–T07 or hosting | Focused code changes, relevant regression tests, production UI inspection and native retest. Close blockers before candidate acceptance. |
| T09 | Prepare/deploy hosted services if that route is selected | T02 decision; validated secure backend/candidate | Concrete Vercel/Railway/environment/migration setup, working HTTPS endpoints/mail and hosted smoke checks. Use the deployment appendix. Not required for a local submission. |
| T10 | Freeze, validate, build and publish the final candidate | T03–T08; T09 if chosen | Passing final checks, coordinated repository commits/pushes, actual final APK installed/retested, documented versions/endpoints/build hash. |
| T11 | Capture submission evidence, package it and clean temporary data | T10 | Genuine web/physical-phone/setup screenshots, accurate submission details, tested optional links/APK, sanitized validation record and confirmed cleanup. |
| T12 | Hand off and verify individual submission readiness | T11 | Each member has the same accessible final package and their own identification/turn-in instructions for November 16–20. Classroom submission is performed individually by members. |

**T03–T04: account and web acceptance details**

1. Confirm local frontend/API health and consistent host configuration without printing environment values. The development proxy is not a production proxy.
2. Register using the user's replacement account only when the user is performing their own signup. Keep that account. For assistant-led testing use uniquely identified disposable accounts.
3. Verify /check-email appears before workspace access. Direct routes, reload and refresh/login must not bypass the gate. Anonymous private API calls return 401; pending authenticated private calls return the verification-required 403.
4. Confirm actual Gmail verification delivery, explicit confirmation, safe intended destination and recoverable resend/cooldown behavior. A link for another account must not verify the currently signed-in account.
5. Confirm actual forgot-password delivery and reset: matching passwords, old password rejected, old sessions revoked, new password accepted. Test invalid, expired and reused tokens with isolated fixtures. Never paste raw tokens or passwords into reports.
6. Run the existing optional live-account browser journey using an isolated migrated schema and injected fake mailer. The current conditional test requires ANITRACK_LIVE_SMOKE_URL and ANITRACK_TEST_MAILBOX_FILE. Add a small test-only captured-mail runner if needed; no production token-return endpoint or real SMTP to fabricated addresses.
7. Use two disposable accounts for ownership tests: another user's IDs must not permit access to private titles, groups, memberships or deletions. Check member versus admin access.
8. Use bounded real Kitsu/Gemini samples in addition to deterministic provider tests. Validate the currently available Gemini models and prices before changing provider settings; retain reasonable usage limits and useful failure states.
9. Review input validation, unsafe redirects, untrusted content rendering, token/session handling, rate limits, uploads and secrets in the touched code. Fix demonstrated vulnerabilities and record the actual scope of coverage.

**T02, T05–T07: native engineering details**

1. Use the existing Android project. Install root and src-capacitor dependencies from their lockfiles; verify compatible Capacitor packages rather than reinstalling a different major version. Verify Android Studio, its compatible JDK, SDK 36, build tools, platform-tools and Gradle wrapper. Do not accept automatic Gradle/AGP upgrades without checking compatibility. Current Capacitor 8 environment guidance specifies Android Studio 2025.2.1 or newer. [Capacitor environment setup](https://capacitorjs.com/docs/getting-started/environment-setup).
2. Identify the available physical phone, authorize its development connection when needed, and record OS/WebView details. The app's frontend browser targets also matter; the project's minimum Android API alone does not prove every old WebView can execute the UI.
3. Run npm run prepare:android to compile/sync bundled debug assets. This intentionally skips APK packaging. Then build the installable debug APK through the existing Android project using the compatible toolchain. A live-reload-only app is insufficient as the final installed build.
4. Install that APK and cold-launch it with the web development asset server stopped. Bundled UI must load; its backend remains a separate required service. Verify the actual generated native configuration has no stale live-reload server URL. [Quasar Capacitor builds](https://quasar.dev/quasar-cli-vite/developing-capacitor-apps/build-commands/).
5. Check API health through the configured native transport, then run signup/verification/login using the real backend. Verify external-browser mail confirmation and return-to-app status check; keep native hash routing separate from web token fragments.
6. Test native refresh cookies and in-memory access-token restoration after close/reopen, force-stop/relaunch, background/resume and logout. Check account switching clears private state. Password reset/change must revoke native sessions too. Never store backend secrets or work around persistence by exposing refresh credentials.
7. Test all features below against the same backend and saved data. A change made in the phone should be visible after a fresh read in the website, and vice versa. Check duplicate imports and collection/progress consistency.
8. Check Android hardware/system Back, navigation from detail screens, modal dismissal, keyboard appearance/dismissal, input visibility, scrolling, bottom navigation, gesture/status/navigation insets, rotation where supported, touch targets and accessible text. Verify framework defaults before adding native listeners.
9. Test lost connectivity, slow requests, provider failures, cancellation and retry. The app must show recoverable states, avoid false success and keep drafts where intended. Check stale replies cannot repopulate another account's UI.
10. Review app name, launcher identity and splash/startup using existing AniTrack assets, without redesigning the product. Check external trailer links open appropriately and returning to the app preserves the intended state.
11. Choose and document the final build variant and signing identity. The assignment does not specify Play Store release/signing; do not add a Play Store task. Prefer a portable signed HTTPS release when hosting is selected. For a local/debug submission, document its network/build limitations and confirm any extra requirements in the class guide.
12. For a release build use the existing npm run build:android with a valid HTTPS VITE_MOBILE_API_URL and proper signing configuration. Do not label unsigned/uninstallable output as the final APK. Reinstall and repeat critical checks on the exact candidate file; record its real filename/version/hash.

Capacitor HTTP is the existing native networking path; it needs actual device verification along with server authorization. [Capacitor HTTP documentation](https://capacitorjs.com/docs/apis/http).

**7. Feature acceptance matrix — required on web and Android**

Implementation is already present for these modules. Each row still needs final real-client evidence, and the Android column must be exercised in the APK rather than a resized browser.

| Feature | User purpose and required result | Native-specific check |
| --- | --- | --- |
| Landing/access | Explain the product; login/register work; no public workspace features | Entry screens fit; guest navigation does not expose private views. |
| Registration/verification | Create an account, receive/confirm email, resend and enter the correct private destination | Reachable phone-browser link; returning to the app updates verification status. |
| Login/session/logout | Enter the account, restore a valid session and remove access on logout | Native cookie lifecycle, cold start/resume and Back do not restore logged-out private content. |
| Password recovery/change | Recover an account or change a password; revoke previous sessions | Email link opens correctly; the phone signs in with the new password and rejects the revoked session. |
| Overview | Show accurate saved counts/content and working first-use/add actions | Cards, carousels, buttons and navigation work with touch and small screens. |
| Watchlist | Search/filter/sort saved anime; edit status, favorite, rating and progress; persist changes | Exact-count editor/keyboard work; +/- and completion transitions persist after relaunch. |
| Catalog import/custom titles | Find/import a title, prevent duplicates, create/remove a custom title | Native API actions and cover/file input, where exposed, work without losing saved entries. |
| Collections | Create/rename/describe/search/page groups; add/remove/reorder saved titles; delete group while preserving watchlist | Fanned-cover design, selection, touch reordering and dialogs fit and work. |
| Discover | Search, genres, popular/top-rated/season/upcoming views and save state | Search keyboard, tabs/filters, image loading and paging work through the real native connection. |
| Anime details | Show known synopsis/episodes/related/similar/trailer data, import and update progress | Back navigation, episode paging and external trailer behavior work; missing metadata is handled honestly. |
| Anime Assistant | Identify titles, recommend/refine, hide saved titles, import results and retry/cancel | Real native timeout/cancel/error behavior; draft/state preserved as intended and cleared on account change. |
| Calendar | Show available provider episode dates for Watching titles and open details | Calendar layout/taps and empty/missing-date states work; no invented release dates or notification claim. |
| Account | Update name, display verification status, change password and confirm deletion | Keyboard/dialog validation work; deleting a disposable account clears native state and removes only its data. |
| Shared persistence/ownership | Both clients read consistent saved state and cannot access another user's private data | Change on one client, refresh on the other; run two-account negative API checks. |

Current limits (500 saved titles by default, 20 Collections and 100 memberships per group), upload bounds, API paging and AI budget enforcement should retain their existing behavior. Exercise relevant boundary cases in deterministic tests rather than filling the user's account to capacity.

**8. Quality checks and defect handling**

Use a short issue record for each demonstrated problem: ID, affected task/feature/platform, reproduction, expected/observed result, priority, fix, regression check and outcome. A failing access gate, data ownership issue, data loss, broken required journey, unusable APK or missing mandatory evidence blocks completion. Address those before decorative polish.

| Layer | Checks and evidence |
| --- | --- |
| Backend | Lint, typecheck, unit tests, isolated PostgreSQL integration, compiled build/start and direct authorization checks. Test runners must not target production tables. |
| Web | Lint, unit tests, production build/typecheck, browser journeys, real API/database account/feature flow and keyboard/responsive checks. |
| Native | Successful Gradle/APK build/install, real phone account/feature/session tests, lifecycle/network/navigation checks and final-APK retest. Web tests cannot substitute for these. |
| Integrations | Real mail receipt plus bounded real metadata/AI checks; fake providers for deterministic failure/limit tests. Record outages and incomplete coverage accurately. |
| UI/design | Apply Taste Skill source checks and production browser inspection at desktop 1440, tablet 768 and phone 390px; open screenshots, fix failures and document justified exceptions. Also inspect actual Android WebView/screens with real insets and keyboard. |
| Dependencies/source | Review advisories, changed code/lockfiles, git diff checks, and staged secrets without printing sensitive values. Add behavior/security regression tests where meaningful; small CSS fixes need appropriate visual checks. |

Run Quasar web/native builds and Playwright servers sequentially in the same checkout because generated files are shared. Restore normal development servers if testing stops them. Identify current process commands before stopping anything; do not reuse old process IDs.

Full production backup/PITR/restore and monitoring settings belong to the optional hosted-release work. Preserve data regardless of route: use isolated test storage and take an appropriate recovery backup before migration/data operations that affect valuable existing records. No reset/seed command is a substitute for deploying additive migrations.

**9. Candidate, repository and hosting handoff**

For T10, validate the actual final revisions. Backend: npm run db:generate, lint, typecheck, unit tests, isolated integration tests and build. Frontend: both dependency installs, lint, unit tests, build and browser journeys, including the previously conditional real-backend journey. Native: final variant compilation, APK installation and critical physical-phone retest. Record date, command/scope, pass/fail/skip and practical limits.

Push the reviewed frontend and backend changes, tests and setup documentation as coordinated commits after execution is authorized. Review staged paths for credentials, temporary mailboxes, logs, archives, signing keys and generated files. Preserve unrelated user work; never force-push it away. Verify the remote commit pair. GitHub Actions configuration is not a required task.

For the hosted route, use the [deployment appendix](C:/Users/Lenovo/Desktop/ANITRACK/ANITRACK-FRONTEND/docs/WEB-RELEASE-PLAN.md): Quasar SPA output dist/spa, ordered API rewrite/history fallback, compatible Railway email transport, production secrets/origin, Prisma migration pre-deploy, compiled API start, database health and real proxy/native cookie tests. Verify exact proxy trust/rate-limit behavior rather than assuming a one-hop setting fits every route.

Keep the API and verification frontend reachable through the intended review period if submitting hosted links/APK. If local, provide accurate server startup and network instructions instead. Do not count deploying or pushing as proof that the features work.

**10. Schedule targets and priorities**

These are planning targets based on November 5, not claims of completed work or automatic schedules. Adjust the tracker if device/provider access delays a dependency, and state the actual impact promptly.

| Target dates | Focus and checkpoint |
| --- | --- |
| November 5–6 | Finalize scope/tracker; discover Android tools and phone access; choose network/email route; begin real account-flow checks. |
| November 6–8 | Complete secure web/full-stack checks and start fixes. Build/install the first bundled APK and prove API reachability on a physical phone by this stage. |
| November 9–11 | Complete native authentication/session/feature parity and integration checks; stabilize shared defects. If hosting, establish final reachable endpoints and compatible email. |
| November 12–14 | Final candidate checks, responsive/Taste/native review, tested APK/signing, coordinated repository updates and genuine evidence capture. |
| November 15 | Freeze the candidate; finish cleanup, submission metadata, package/link access checks and group handoff. |
| November 16–20 | Each member submits through their own Classroom account and checks attachments/links. Avoid unvalidated feature additions during submission. |

Physical-phone access, a working account-email flow and a backend accessible to that phone are early critical dependencies. Optional hosting/operations polish must not displace the two functional outputs and required evidence. If independent review requires hosted access, establish that route before claiming the mobile output is complete.

**11. Evidence package and submission preparation**

Planned durable output folder: C:/Users/Lenovo/Desktop/ANITRACK/SUBMISSION. It is outside both source repositories. Create it during execution after authentic evidence is ready; it has not been created by this plan.

| Planned file/group | Content |
| --- | --- |
| SUBMISSION-DETAILS.md or teacher-requested equivalent | Project Title: AniTrack; real Section; Group Name/Number if applicable; real Group Leader; complete member names; web screenshot/link references; mobile/setup evidence references; optional APK link; short run/access instructions. |
| web/01-dashboard.png | Real main dashboard with meaningful account data. |
| web/02-watchlist.png | Saved titles and a demonstrated status/progress/favorite/rating state. |
| web/03-collections.png | Another working module with saved collection content. |
| android/01-installed.png | Actual AniTrack installation identity on the physical phone. |
| android/02-running-dashboard.png | App running on that phone after a real backend/session read. |
| android/03-watchlist.png | First working mobile feature after a saved action. |
| android/04-collections.png | Second distinct working mobile feature after a saved action. |
| setup/01-capacitor-installed.png | Genuine successful setup/dependency verification output for this project; no fabricated terminal history. |
| setup/02-android-project.png | Real src-capacitor/android project and relevant native folders visible. |
| apk/ and BUILD-INFO.md | Optional shared tested APK; actual build/version/variant/hash, tested device/OS and backend/network requirements. Never include a signing key. |
| VALIDATION.md | Concise genuine web/native check results, known limits, evidence mapping, final commit pair and cleanup confirmation. No credentials, raw tokens or personal database dumps. |

Choose screenshots from the final tested version. Keep them legible, free of secrets and clearly attributable to AniTrack. Preserve the required evidence even when the test account is subsequently removed. Do not edit screenshots to imply an unperformed action. If screenshots alone are submitted for local work, include the run/network description so the setup is not misrepresented.

If using Drive or hosted links, verify accessibility for the intended reviewer, using actual permissions chosen by the user. Do not publish unrelated files or change account sharing broadly. Every member may use the same project evidence, but each must supply the required identity details and turn it in individually. No live presentation is required by the supplied notice.

**12. Cleanup rules**

Use per-run identifiers and a cleanup record. Remove only that run's temporary accounts, private data, sessions/tokens, test schemas/databases, captured mail, helper servers, browser profiles, raw traces and throwaway review captures. Verify exact ownership and resolved path containment before deletion, including on failures.

The user's previously requested account deletion is already complete. Preserve any new replacement account. Remove imported shared metadata only if it was created by the test and is proven unreferenced; preserve other users' data and legitimate usage accounting.

Keep source/regression tests, normal dependencies, the Android project, intentional recovery backups, private signing material, the final tested APK and required submission evidence. Required deliverables are durable outputs, distinct from disposable QA files. Restore normal servers if they were temporarily stopped; do not remove tools or app data belonging to the user.

**13. Progress protocol and completion gates**

At the end of each execution session, update PROJECT-PROGRESS.md with task status, the date, actual changes, evidence/check results, unresolved blockers and the next actionable task. Record whether a result came from mocks, a real API/database, a browser or a physical phone. Keep one current issue/task status rather than repeating stale completion claims.

Use Pending, In progress, Blocked, Done and Not required. A task moves to Done only after its listed output/checks exist; plans, package installations and successful compilation are intermediate evidence. Mark a conditional hosting task Not required only when the local review route is deliberately chosen and its network limitations are documented. Do not turn unknowns into approvals or passing results.

The system is ready for this submission when:

1. All scoped website and shared-backend journeys work, access/ownership rules hold and the required web evidence or working link exists.
2. The final APK is actually installed and functional on a physical Android phone, with working backend access, native account/session/feature checks and all required mobile/setup screenshots.
3. The selected local/hosted review environment is reproducible and honestly documented; any submitted links/files are accessible.
4. Core blockers are closed, evidence identifies the tested candidate, temporary test data is removed, the user's data is retained and all real submission details are complete.
5. Every group member has the final package and understands their individual Classroom turn-in obligation.

Stop after completing this planning update. Do not install tools, implement changes, create/delete accounts, push repositories, provision hosting, build APKs or submit assignments during this planning request. The next execution session starts from the tracker after reconciling newer user instructions.
