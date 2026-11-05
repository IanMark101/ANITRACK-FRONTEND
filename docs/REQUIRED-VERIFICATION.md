# Required email verification

From 2 November 2026, an authenticated account must also have a verified email before opening any workspace feature. This includes older unverified accounts. No existing user is silently marked verified.

Registration saves the account, creates a restricted session and attempts email delivery. The browser opens /check-email instead of the dashboard. The pending screen explains delivery success/failure, offers a resend and an explicit status check, and lets the user sign out to use another account. A resend has a client countdown and a server-enforced per-user cooldown of one minute, serialized through PostgreSQL. Refreshing or changing the URL does not bypass the gate.

Verification links expire after 24 hours, use a hashed single-use token and require explicit confirmation. Opening the link alone does not consume it. After confirmation, the same signed-in account can continue to its intended internal feature. When the link opens in another browser or host, sign in there after verification or use the status-check button in the original tab. Password resets do not substitute for email verification.

The API checks the database verification timestamp before catalog, discovery, AI, watchlist, Collections or administrator handlers run. Unverified sessions retain only the endpoints needed for their own status, verification, logout, password recovery/change and account deletion. A failed email send cannot grant access. Configure the backend sender and CLIENT_ORIGIN before inviting users.

The new screen extends AniTrack's existing dark account forms, retaining Outfit and Plus Jakarta Sans, flat surfaces and the existing primary accent. It is an extension of the account flow, so no new direction was drawn and no new image assets were introduced. The recipient address and current delivery state provide the context; the screen's question is what the account owner must do before entering their workspace.

## Validation on 2 November 2026

Backend lint, types, build and 107 unit tests passed; frontend lint, types, build and 21 unit tests passed. Six real-PostgreSQL integration cases passed across the isolated run and a targeted discovery rerun. Discovery initially reached its old 60-second test limit against the remote database; its explicit timeout now matches the 120-second limit of the other integration cases and the rerun passed. Both temporary schemas were removed. The isolated runner also accepts an allowlisted test filename for targeted reruns.

Eleven existing account/private-feature browser journeys and four required-verification journeys passed. Coverage includes pending signup, direct private URLs, reload, no private requests before verification, explicit token confirmation, preserved destinations, unavailable delivery, resend cooldown, account switching, and verification completed in another browser. The optional real-server browser journey was not run; it requires an isolated fake-mailbox server. Integration tests capture tokens through a fake mailer and do not contact a real inbox. Gmail SMTP authentication was checked successfully without sending a message; real inbox receipt remains a user check.

The production screen was inspected at 1440, 768 and 390px. All nine pending/unverified-error/delivery-error page captures and all six final inspector images were opened. Each width had one-line headings, 44px controls, no horizontal overflow, no workspace sidebar, no private API calls and no script errors. The panel is capped at 680px; the phone title is 24px. Disabled cooldown text retains full opacity instead of inheriting Quasar's faded state.

Taste Skill source checks returned 0 FAIL / 0 WARN. The rendered component returned 0 FAIL / 1 WARN, with no rule allowances. The remaining hero-void warning describes the unused viewport below a short, focused verification form; the complete page's header/footer and the isolated form were both reviewed. No unrelated content was added to pad an authentication task. An inline shadow-rule comment explains that box-shadow: none explicitly removes inherited button effects; computed rendering was also inspected. This component check does not rate all pre-existing site chrome.

ROUND 3

Seen in one second: the email address to verify and the action for continuing.

Idea (one sentence): keep pending accounts focused on proving ownership before opening their personal anime workspace.

Live thing: check verification, resend with a cooldown, or switch accounts.

Layout words by section: header=brand/logout; verification=centered form; phone=stacked form.

Scores: design 7.5 · usability 8 · creativity 6.5 · content 8 → overall 7.5.

Caps applied: app/form scope; conventional authentication controls intentionally retained; imagery and motion page requirements do not apply.

Top three problems resolved: the prototype's inherited container width stretched the desktop form, corrected by the scoped 680px maximum; inherited disabled opacity dimmed meaningful countdown text, corrected with a scoped override; the phone title and header actions now use a 24px title and right-aligned logout. Final screenshots showed no clipped address, overlapping controls or overflow. The focused-form whitespace warning is justified above.

Temporary QA accounts, schemas, review helpers, profiles and screenshots are disposable and removed after verification; permanent regression tests remain in the repositories.
