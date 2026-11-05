**AniTrack web deployment appendix**

Prepared: 5 November 2026. Status: planning only. The [system completion plan](C:/Users/Lenovo/Desktop/ANITRACK/ANITRACK-FRONTEND/docs/PROJECT-COMPLETION-PLAN.md) and [progress tracker](C:/Users/Lenovo/Desktop/ANITRACK/ANITRACK-FRONTEND/docs/PROJECT-PROGRESS.md) now govern the overall work, including required Android completion and submission evidence. This document retains detailed website deployment/operations instructions for the optional hosted route. The supplied assignment accepts local hosting; these production steps must not block the two required outputs when the local route is chosen.

If hosted deployment is selected, the outcome of this appendix is a working web release on Vercel and Railway, with a verified email required for every workspace feature, tested account recovery, preserved private data, and a documented way to recover from a failed release. Native APK/phone acceptance and academic submission completion are covered by the master plan. Creating either document does not start implementation, account operations, GitHub pushes, hosting changes or deployment.

**Instructions carried into every task**

- The public landing page describes AniTrack and links to registration/login. Discover, Anime Assistant, anime details, Watchlist, Collections, Calendar, Overview and Account features require authentication and verified email. Enforce access on the API as well as in the browser.
- Pending accounts may use only the existing session-status, verification, logout and account recovery/deletion capabilities. Never manually verify a real user or make password reset substitute for verification.
- Preserve Vue, Quasar, Pinia, the current AniTrack identity, and the user's Collections reference: charcoal surfaces, centered collection titles, overlapping/fanned covers and white primary actions for that screen. Do not initiate an unrelated redesign.
- Apply the installed [Taste Skill](C:/Users/Lenovo/.codex/skills/taste-skill/SKILL.md) to UI changes and their review. Use its app-screen workflow for working screens. A claimed pass requires source checks, production-rendered inspection, opened screenshots and documented exceptions.
- Android packaging, physical-phone functionality and submission evidence are required in the master plan. This appendix describes web deployment only. Public collections, social features, notifications and new product features remain outside scope. Shared Capacitor JavaScript dependencies still have to install for the web build.
- Use Vercel for the frontend, Railway for the backend and PostgreSQL/Neon for storage. GitHub Actions work is not a prerequisite; use local checks and the hosts' repository deployment integrations.
- Keep secrets in backend environment variables or host secret stores. Never request passwords, app passwords, JWT secrets, database URLs or raw recovery links in chat.
- Use uniquely identified disposable accounts for assistant-led testing. Remove only the temporary accounts, rows, schemas, files and helper processes created by that test run. Keep permanent tests and concise review records.
- The user's previously designated account deletion is complete. A newly registered replacement account belongs to the user and must be retained; the old deletion request is not authorization to delete it again.

**1. Baseline and unresolved decisions**

The following was checked while planning; it is the starting point, not a fresh test run.

| Item | Current evidence | Consequence |
| --- | --- | --- |
| Frontend repository | `C:/Users/Lenovo/Desktop/ANITRACK/ANITRACK-FRONTEND`; latest local commit `f26b4ae` | Recovery-link placement and required-verification changes, tests and documentation remain uncommitted. |
| Backend repository | `C:/Users/Lenovo/Desktop/ANITRACK/ANITRACK-BACKEND`; latest local commit `f114eaf` | Verification middleware, registration mail, resend controls and related tests remain uncommitted. |
| Account gate | Implemented on frontend routes/rendering and backend middleware | Validate and preserve it; do not rebuild the flow from scratch. |
| Registration mail | Configurable SMTP implementation; pending account survives failed delivery | Provider acceptance is distinct from actual inbox receipt. |
| Last recorded verification | 2 November: 107 backend unit tests, 21 frontend unit tests, six isolated PostgreSQL integration cases and 15 browser journeys passed | Historical results are in [REQUIRED-VERIFICATION.md](C:/Users/Lenovo/Desktop/ANITRACK/ANITRACK-FRONTEND/docs/REQUIRED-VERIFICATION.md). Record fresh results for the eventual release candidate. |
| Browser coverage gap | The optional real-backend browser account journey was not run after mandatory verification; normal browser journeys use mocked API responses | Execute a full browser-to-API-to-database journey with captured test mail. |
| Email coverage gap | Gmail SMTP authentication was checked without sending a message | The user must still confirm verification/reset mail receipt and usable links. No current receipt is assumed. |
| External providers | Earlier live Kitsu/Gemini samples exist | The final release and production proxy still need bounded live-provider checks. |
| Recovery operations | Backup helper exists; actual backup/restore drill is not established | Verify database recovery before exposing valuable production data. |
| Hosting | No deployment configuration or completed production deployment established | Prepare the configurations before publishing. |

When work resumes, first recheck repository instructions, branch/status and any new user edits. Record the frontend/backend commit pair and preserve all unrelated changes. Reassess current server state before starting or stopping anything; previous process IDs are not reliable identifiers.

Resolve these decisions early, without blocking independent local verification:

| Decision | Planned handling | Needed before |
| --- | --- | --- |
| Railway plan and email transport | Retain Gmail SMTP if the selected plan supports it; otherwise implement a selected transactional provider's HTTPS API through the existing mailer interface. No provider has been selected for that alternative. | Final mail configuration and deployment |
| Production frontend URL | Choose one canonical HTTPS origin; a Vercel-assigned domain can be used initially. Configure all email links and origin checks for it. | Production configuration |
| Production database target | Confirm whether existing Neon data should become production data or a separate production database/branch should be used. Preserve existing data and keep development test runners away from production. | Migration and backup |
| Hosting accounts and spending | Confirm account access and any paid plan/provider choice when execution reaches that decision. Complete the configuration proposal before any paid action. | Provisioning |

Railway currently permits outbound SMTP only on Pro and above; Free, Trial and Hobby require HTTPS email APIs. The existing Gmail app password cannot be used as an API key for another email provider. This is a deployment constraint, not proof of a local SMTP defect. [Railway outbound networking](https://docs.railway.com/networking/outbound-networking).

**2. Confirm real signup, verification and recovery**

Depends on: the current frontend/backend running with consistent local origins. Owner: assistant for diagnostics and API checks; user for their inbox and personal credentials.

1. Use `http://localhost:5173` consistently. Verify the backend health and local `CLIENT_ORIGIN` without printing environment values. Do not treat the development proxy as a production configuration.
2. The user registers using the account they wanted to recreate. Confirm registration opens `/check-email`, not the workspace, and that a reload or direct `/dashboard`, `/discover` or `/assistant` visit still cannot load private content.
3. The user confirms the verification message arrives, including checking spam. The link should point to the correct host. Opening it alone must not consume the token; explicit verification must unlock only the associated account.
4. Check resending, the one-minute cooldown and recoverable delivery errors. Verification in another browser should work with a subsequent status check/sign-in in the original browser. A link for another account must not appear to verify the current account.
5. Log out and use Forgot password. Confirm an actual reset email arrives, the link opens the password form, matching new passwords are required, and the old password stops working after reset. Existing sessions must be revoked and the new password must permit login. Keep the new password private.
6. Exercise used, invalid and expired links through isolated tests rather than waiting for a real user's token to expire. Resetting an unverified account's password must leave it unverified.
7. If any step fails, capture only a sanitized error code, request ID, host and observed behavior. Inspect relevant logs/configuration and fix the demonstrated cause. Never ask the user to share a token-bearing URL.

Completion evidence: real verification/reset receipt confirmed; the intended transitions work; private access remains denied before verification. The user's account is retained. A failed real email check remains an open release blocker even if fake-mail tests pass.

**3. Close browser, feature and access-control gaps**

Depends on: the local baseline. This can progress while waiting for the user's inbox checks. Owner: assistant; the user can provide product feedback without being assigned all technical testing.

Run the existing `e2e/live-account.spec.ts` against an isolated development backend and a disposable migrated schema/database. Supply `ANITRACK_LIVE_SMOKE_URL` and `ANITRACK_TEST_MAILBOX_FILE` through test-process configuration. The injected fake `AccountMailer` captures deliveries locally; it must not send through Gmail or expose raw tokens through a production route or log.

The repository currently has the conditional test and the injectable mailer, but no standalone captured-mail server runner. If necessary, add a small reusable, test-only runner that starts the isolated API/frontend, captures mail in a per-run ignored directory, runs the test, and cleans up in `finally`. It must reject production configuration, verify ownership of its random schema and use only that schema. Consume a captured verification token through the real verification endpoint before testing private features. Do not directly set a user's verification timestamp to make this journey pass.

Use existing unit/integration coverage where adequate. Add behavioral regression tests for actual uncovered defects, rather than reproducing every implementation detail in a new test.

| Area | Required behavior to check | Main evidence |
| --- | --- | --- |
| Landing and access | Descriptive public sections; no live feature controls or private requests; guest routes lead to login and preserve a safe internal destination | Browser network/route checks and anonymous API calls |
| Pending sessions | No workspace navigation/data before verification; restricted endpoints still usable; session refresh/login cannot bypass verification | Browser journey and direct 401/403 API checks |
| Sessions | Login, refresh after reload, logout, account switching and revocation; temporary backend failure preserves a recoverable session without showing private data for another user | Existing auth tests plus real full-stack checks |
| Overview | Accurate saved counts and saved/continue-watching content; empty first-use state; add-anime actions open the correct workflow | Real account browser checks |
| Watchlist | Search, status filters, sorting, favorites, rating, exact progress and +/- controls; correct completion transitions; changes persist after reload/login | Browser-to-database journey |
| Add/remove titles | Import a catalog title, prevent duplicate saved entries, create/remove a custom title, and preserve unrelated titles | Full-stack journey and isolated API tests |
| Collections | Create, rename/describe, search/page, add/remove saved titles, reorder and delete; one title can belong to several groups; deleting a group preserves the saved title/progress | Full-stack browser journey and ownership/integration tests |
| Discover/details | Search, genres, popular/top-rated/season/upcoming lists; details, trailers, episode pages, related/similar titles and saved-title state | Bounded real Kitsu requests plus deterministic provider tests |
| Anime Assistant | Identification, recommendations, refinement, hide saved titles, import results, cancel/retry and useful unavailable/quota states; navigation keeps in-memory state and account changes clear it | Deterministic tests and a small real Gemini sample |
| Calendar | Known provider episode dates appear for Watching titles; links open details; missing dates show an honest empty state | Known-date fixture and browser check; no notification claim |
| Account | Name changes, password change/revocation, verification status and explicitly confirmed deletion of a disposable account | Real isolated journey and direct API assertions |
| Ownership/admin | A second disposable account cannot read/change/delete another user's private titles, memberships or groups; member/guest/unverified users cannot use admin endpoints | Direct two-account negative tests |
| Limits/failures | Existing title/group/member/upload limits, invalid bodies, resend races, rate limits, provider timeout and persistent AI budget behavior | Focused unit/integration tests and error-state review |

Review secrets handling, unsafe redirects, token expiry/reuse, injection/XSS boundaries and data ownership in the touched flows. Run dependency advisory checks for the final lockfiles; evaluate relevant findings and fix exploitable issues. An advisory or provider outage must be reported with its practical effect, not silently turned into a passing result.

For live AI checks, first verify available models and pricing in current official provider documentation. Set conservative generation/dollar limits and confirm they cover configured fallback models. Avoid repeated paid calls; the persisted estimate is not a provider-wide billing cap.

Completion evidence: the previously skipped full-stack journey executes without skipping, core feature checks have results, two-account isolation passes, and any failure is either fixed or recorded as a blocker. Provider limitations such as missing trailer/date data are distinguished from app defects.

**4. Implement only confirmed fixes and the chosen email transport**

Depends on: findings from steps 2-3 and the hosting/email decision. Owner: assistant.

- Prioritize broken access control, data loss/ownership errors, unusable account recovery and core feature failures. Record each issue's trigger, expected behavior, smallest fix and relevant validation.
- Preserve the existing mandatory-verification implementation. Its enforcement needs no additional database migration at present; create a migration only if an actual later schema change requires it.
- If Railway Pro and Gmail SMTP are chosen, validate that configuration in the deployed environment. Do not add a second transport without a need.
- If an HTTPS provider is chosen, implement it behind `AccountMailer`; add validated backend-only configuration and a safe example, setup documentation and provider-failure tests. Preserve hashed/single-use tokens, expiry, explicit consumption, fixed-origin links, generic reset responses, resend cooldown, and truthful provider-send status. A provider failure must not verify an account or strand it without retry.
- For each UI fix, read the Taste Skill and applicable app-screen guidance, retain AniTrack's design, and check loading, empty, error, success, disabled, focus and mobile states. Inspect the production-rendered change at 1440, 768 and 390px, including its actual surrounding page; open the generated images, correct failures, and document any remaining warning/exception. Keep accessible contrast, password visibility controls, keyboard navigation and usable touch targets.
- Add meaningful regression tests when behavior/security changes. Use appropriate visual/navigation verification for a small reversible CSS-only correction.

Completion evidence: confirmed release-blocking defects are closed with relevant checks. Changed UI has a scoped Taste review; this is not a blanket claim that the entire pre-existing site passes the skill.

**5. Prepare deployment configuration and database recovery**

Depends on: the selected mail transport, canonical URLs and database target. Owner: assistant for the reviewable configuration/runbook; user for account access and provider/domain choices.

Intended request path: browser -> Vercel frontend -> same-origin `/api` rewrite -> Railway Express API -> Neon. The backend alone contacts email, Kitsu and Gemini services. This architecture follows from the current relative `/api` transport and Strict refresh cookie; it still requires deployed cookie/header testing.

| Service | Intended configuration |
| --- | --- |
| Vercel source | Frontend repository root; explicitly configure this Quasar SPA rather than assuming a generic Vite output folder. |
| Frontend runtime/build | Node 24; install with `npm ci` followed by `npm ci --prefix src-capacitor`; build with `npm run build`; output `dist/spa`. Confirm host support when implementing. |
| Frontend environment | Keep `VITE_API_URL` unset or `/api` for this architecture. All `VITE_` values are public build inputs. No backend secrets or mobile release URL is needed for the web release. |
| Vercel routing | Add a reviewable `vercel.json`: forward `/api/:path*` to the Railway HTTPS host while retaining the backend `/api` prefix, then serve SPA history routes from `index.html`. Verify static assets and unknown API requests are not accidentally returned as HTML. |
| Railway source/build | Backend repository root; Node 24; install lockfile dependencies needed for build and pre-deploy, including the Prisma CLI currently in devDependencies. Generate Prisma and run `npm run build`. Do not rely on pruned build tools being available later. |
| Railway pre-deploy | `npm run db:deploy`; configure a finite timeout appropriate to observed migration duration. A failed migration must prevent application rollout. |
| Railway start/health | `npm start` serves compiled `dist/index.js`, not the development watcher. Use Railway's provided `PORT`; `/api/health` checks database readiness and `/api/live` checks the process. |
| Backend environment | Production `NODE_ENV`, canonical HTTPS `CLIENT_ORIGIN`, production `DATABASE_URL`/`DIRECT_URL`, a strong production JWT secret, selected email credentials/sender, Gemini key/models and bounded usage configuration. No seed password is required for normal deployment. |

Vercel supports external rewrites and SPA history fallback; use the documented routing syntax rather than shipping a development-only proxy. [Vercel rewrites](https://vercel.com/docs/routing/rewrites), [Vite SPA routing](https://vercel.com/docs/frameworks/frontend/vite).

Railway executes pre-deploy separately and stops the rollout if it fails. Its image must contain the migration CLI and dependencies; filesystem changes made there do not become application assets. [Railway pre-deploy commands](https://docs.railway.com/deployments/pre-deploy-command).

Before finalizing routing, check the actual Vercel/Railway forwarding chain and the backend's origin/CSRF behavior. The current `TRUST_PROXY` option trusts one hop when enabled; do not assume this is correct for both proxied and direct Railway requests. Validate rate-limit/client-IP behavior and forged forwarding headers; if the topology requires a narrower trust configuration, implement and test that change. Begin with one backend replica because some rate/concurrency controls are process-local, while the AI budget is shared.

Verify the Secure/HttpOnly/Strict refresh cookie is set on the frontend host, kept at `/api/auth`, sent during refresh and cleared on logout. Verify personal API responses remain `no-store` through the CDN. Test the AI path through the proxy against the app's documented request timeout. Keep the canonical production origin exact; use a separate development/preview backend or restrict preview authentication rather than broadening production CORS to every preview domain.

For the database:

1. Inspect migration status and choose the intended production database before applying anything. Existing committed migrations cover the current schema. Preserve real accounts/watchlists; never use reset, `db push` or seed as a substitute for deployment migrations.
2. Check Neon backup/PITR retention available to the selected project/plan. Install compatible PostgreSQL client tools where the backup will run, since a working `pg_dump`/`pg_restore` setup is not yet established.
3. Produce a backup using the existing helper, store it encrypted with access control outside the repository, and verify archive readability.
4. Restore into a separate disposable database. Verify relevant row counts and account/watchlist/collection reads, record recovery time, then remove only the disposable restore target and test copies. Retain the intentional recovery backup.
5. Document forward-compatible migrations and recovery. Rolling back app code does not undo a database migration. Do not roll back to code that reopens unverified/public feature access; use a known compatible release or a focused corrective release.

Completion evidence: deployment settings and environment names are concrete and reviewable, the email path is compatible with the selected plan, and a backup plus separate restore check establishes recoverability. No production provisioning occurs merely because this plan exists.

**6. Validate and publish a release candidate to both repositories**

Depends on: steps 2-5, with no unresolved release blocker. Owner: assistant after the user resumes execution.

Run checks for the actual final revision, and record commands, date, results and scope. Do not repeatedly rerun successful suites without a change or unresolved concern.

| Repository | Required candidate checks |
| --- | --- |
| Backend | Lockfile install in the chosen Node environment; `npm run db:generate`; `npm run lint`; `npm run typecheck`; `npm test`; `npm run test:isolated` against development-only storage; `npm run build`. Verify the candidate can start with production-style configuration. |
| Frontend | Root and `src-capacitor` lockfile installs; `npm run lint`; `npm test`; `npm run build` (includes type checking); `npm run test:e2e`; the captured-mail real-backend browser journey from step 3. |
| Both | Dependency advisory review; `git diff --check`; review source, lockfiles, tests and documentation; scan staged content for secrets without printing them. Do not stage `.env`, mailboxes, logs, database archives, browser profiles, build/test output or credentials. |

Run frontend build and Playwright/Quasar servers sequentially in the same checkout to avoid generated-file conflicts. If normal development servers must stop for a check, identify their exact processes and restore them after testing.

Update the relevant setup/verification/operations documents with actual results, selected transport, host configuration and known limitations. Commit only reviewed work, push the frontend and backend repositories, and verify their remote commit IDs. Report the coordinated commit pair; the previously pushed commits do not contain the new verification enforcement.

Completion evidence: both remotes contain the reviewed candidate, local required checks pass with no unexplained skips for promised coverage, and the configuration/runbook matches the chosen deployment. GitHub Actions success is not asserted or required for this workflow.

**7. Deploy Railway and Vercel in a controlled order**

Depends on: the reviewed candidate, selected accounts/plans/URLs, and an instruction to proceed beyond planning. Owner: assistant within available access; user completes interactive sign-ins and any required purchasing decision.

1. Select/reserve the frontend's canonical production domain before setting `CLIENT_ORIGIN`. Configure the confirmed production database and secrets in Railway.
2. Deploy the backend candidate with migration pre-deploy, compiled start command and database health check. Verify migration output and readiness without disclosing environment values.
3. Put the resulting Railway HTTPS domain into the prepared frontend API rewrite. Deploy the frontend candidate to Vercel using the documented Quasar settings and canonical domain.
4. Reconcile the exact deployed frontend origin in backend configuration; redeploy only if configuration changes require it. Confirm email links use the canonical production address, not localhost or a temporary preview.
5. Record deployment IDs and the frontend/backend commit pair. Inspect failures and correct configuration or demonstrated defects before inviting members.

If build, migration, health or authentication checks fail, keep the release unannounced and resolve the cause. Restore a known safe compatible deployment when available; otherwise correct forward without weakening the verification/access boundary.

**8. Verify production, clean up and hand over**

Depends on: step 7. Owner: assistant for functional checks and cleanup; user for actual inbox delivery and final product acceptance.

Verify these behaviors through the deployed frontend URL, not just the direct Railway host:

- Guest visits to protected routes require login; direct private API calls without credentials return 401. An authenticated unverified account receives the verification-required 403 for workspace APIs.
- Fresh registration, real verification delivery/link confirmation, intended destination and resend work on the production origin. Use an assistant-owned temporary address only if a deliverable test inbox is actually available; otherwise the user performs the real-mail portion with their own account. Never send production test messages to fabricated addresses.
- Login, hard refresh, cross-tab behavior, logout and password reset work with the proxied Secure refresh cookie. Password reset/change revoke old sessions.
- Save a title, change progress/favorite/rating, create/reorder/delete a collection and confirm persistence. Perform destructive checks on a disposable account only. Check another account cannot access its data.
- Discover/details and a bounded real Assistant request succeed through the production proxy, or show a documented provider failure that remains unresolved. Check desktop/mobile navigation, deep-link refresh and browser errors.
- Personal data is not cached publicly; origins, headers and rate limits behave as verified in step 5. Health checks, request IDs, hosting logs, practical usage/billing limits and a chosen health-monitor destination are configured. Do not send alerts to other people without authorization.

After every test run, even a failed one:

1. Maintain a per-run record of exact temporary account IDs, schema/database names, generated paths and child processes. Verify identity and containment before deletion; never clean by broad email prefixes or guessed process IDs.
2. Delete the run's disposable accounts and verify their private titles, memberships, collections, sessions and account tokens are gone. Remove a newly created shared catalog record only if it is proven unreferenced and belongs to the test's cleanup scope; preserve other users' records and legitimate usage accounting.
3. Drop only schemas/databases created by that run. Stop only its helper servers. Remove its mailbox files, raw tokens, browser profiles, screenshots, traces, reports and temporary review fragments after recording sanitized results.
4. Preserve the user's replacement account, normal app dependencies/servers, permanent regression tests, this plan, concise release evidence and intentional encrypted backups. Report any cleanup that could not be completed, with the exact safe target and reason.

Completion evidence: deployed URLs and commit IDs, test results and their limits, real inbox confirmation, cleanup confirmation and recovery/monitoring instructions are handed over in plain language. Update this plan's task status from evidence, not assumptions.

**Execution and release gates**

The critical path is: confirm the account flows -> close full-stack/feature gaps -> fix demonstrated problems and finalize compatible email -> prepare hosting/recovery -> validate and push both candidates -> deploy -> verify production and clean up. Hosting/email decisions and independent local checks can be prepared alongside each other after execution is resumed; their dependencies must still be honored.

Do not call a hosted release complete while there is an authentication/verification bypass, cross-user data access, data-loss defect, broken core journey, undeliverable verification/reset mail, failing migration/build, unusable refresh session, or unverified recovery path for the production data. Document ordinary provider limitations instead of claiming universal feature/provider coverage. Android is required and tracked separately in the master plan; it is no longer deferred.

| Task | Status at the end of this planning request |
| --- | --- |
| Inspect current source, instructions, working trees and recorded evidence | Complete for planning |
| Record requirements, dependencies, tests, deployment paths and cleanup | Complete in this document |
| Real signup/reset inbox acceptance | Pending |
| Captured-mail full-stack browser journey and final feature/security checks | Pending |
| Findings fixes and any selected HTTPS email implementation | Conditional; not started |
| Production hosting/mail/database decisions and deploy configuration | Pending |
| Backup/restore drill | Pending |
| Final release-candidate checks and new GitHub commits/pushes | Pending |
| Production deployment, acceptance and cleanup | Pending |

This appendix does not authorize deployment during planning. When implementation resumes, follow the master plan and tracker first, and use these deployment details only for the selected hosted route.
