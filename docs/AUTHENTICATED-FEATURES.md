# Authenticated feature access

Discover, Anime Assistant, catalog browsing and anime details belong to the signed-in workspace. Watchlists, Collections, Calendar and Account remain private. The landing page explains the product and provides login/registration links; it does not fetch a catalog, run AI, or expose working feature controls. Public navigation scrolls to descriptions, and each feature description has an explicit login action.

The frontend protects feature routes and preserves the requested destination through login or registration. If restoring a session fails temporarily, the recovery screen prevents feature content from mounting. The API independently requires a valid, unrevoked session before catalog, discovery or assistant handlers can access data or external providers. Hiding links alone is not the access-control boundary.

Verification on 30 October 2026: 104 backend unit tests and 20 frontend unit tests passed, together with five isolated PostgreSQL integration tests, seven feature-access browser journeys and four account browser journeys. Direct requests to the running API confirmed anonymous catalog, discovery and assistant calls return 401. A real temporary account opened both features in the production build and was deleted afterward. No email or AI generation was sent during this verification.

The production landing page was checked at 1440, 768 and 390 pixels: no private-data requests, no feature forms, no horizontal overflow. The two new informational sections use existing anime artwork, Outfit headings and Plus Jakarta Sans body text with 44px minimum login links. Their source passed Taste Skill with zero failures and warnings. The rendered sections were extracted from the production page for a component-scoped inspector check and visually compared with the complete page.

Component-scope allowances: `few-pictures` and `still-page` because this fragment has two static illustrations within a larger animated page; `no-title` and `focal-point` because the fragment correctly uses h2 section headings beneath the actual landing-page h1 and hero. The full-page primary CTA already sits in that hero; the section actions are explicit login links. No video was added to these informational sections. These allowances apply to this fragment, not to the whole site's design. Test images, review HTML, browser profiles and helper servers are disposable and removed after checking.

The component-scoped inspector finished with zero failures and two reviewed warnings (`first-action` and `no-footage`, explained above). Headings stayed within two lines, body copy remained 16px, and both bundled typefaces loaded at all three widths. All six inspector fold/page-sheet images and nine complete-page/context captures were opened for review.

ROUND 1

Seen in one second: anime artwork paired with a feature explanation and an explicit login action.

Idea (one sentence): explain what the private workspace offers without making the public page a working version of it.

Live thing: login and registration, with the selected feature preserved as the destination.

Layout words by section: Discover=text/image split; Assistant=mirrored image/text split; phone=copy above image.

Scores: design 7.5 · usability 8 · creativity 7 · content 8 → overall 7.6.

Caps applied: component scope as documented; this review does not rate the entire pre-existing landing page.

The two sections share outer edges, use the existing brand typefaces and real packaged artwork, and retain readable copy and 44px links on phones. No form, live catalog data, invented totals, clipped text or horizontal overflow appeared. The section images and login links were checked together with the actual page header and main registration action.

## Password recovery link review — 31 October 2026

The login recovery link now sits inside the password field group, beside its label and aligned with the input's right edge. Field labels and the secondary recovery link use 13px text. The link has a 44px minimum hit area, visible keyboard focus, and hover/press feedback. Registration omits this link.

This is a component correction within the existing AniTrack dark design, retaining Outfit, Plus Jakarta Sans and the red primary action; no new direction or assets were drawn. The screen's question is how to sign in or recover access. The original form put a default-sized recovery link above the email label, obscuring that relationship.

Taste Skill source checks on Auth.vue and the changed CSS returned 0 FAIL and 0 WARN. Before/after form fragments were extracted from actual production-rendered markup with the production stylesheets, then inspected at 1440, 768 and 390px. The baseline had 0 FAIL / 2 WARN; the final version had 0 FAIL / 1 WARN. `no-title` was allowed only because this fragment preserves the form's h2 while excluding the surrounding page's h1. The remaining `hero-void` warning describes the empty viewport below the isolated narrow form; the complete desktop page pairs that form with the existing anime artwork. This is a component review, not a claim that all existing page styling passes the skill.

All twelve before/final inspector images, three original page captures, and eight final page/state captures were opened. Browser checks confirmed right alignment, label alignment, 44px targets, no horizontal overflow, keyboard activation, recovery/back navigation, registration layout, and a simulated sign-in error at the three widths. Password label focus and visibility toggling were also checked. There were no script errors. Lint, type checking and the production build passed. No real account was created and no email was sent; temporary captures and review files were removed afterward.

ROUND 2

Seen in one second: the login form, with recovery beside the password it concerns.

Idea (one sentence): group recovery with the credential while keeping login the primary action.

Live thing: login, password visibility and recovery navigation.

Layout words by section: desktop=image/form split; form=email/password row/action; phone=stacked form.

Scores: design 7.5 · usability 8 · creativity 6.5 · content 8 → overall 7.5.

Caps applied: app/component scope; familiar authentication conventions intentionally retained.

Top three problems resolved: the detached recovery link in the original desktop/phone captures moved into the password group; its default body-sized text became a secondary 13px link; the original 11px field labels increased to 13px. The final desktop, tablet, phone, focus and error captures showed no remaining placement issue. The isolated-fragment whitespace warning is explained above.
