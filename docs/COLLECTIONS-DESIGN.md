# Collections design

The screen answers: which private themes have I saved, and how do I arrange the anime in one?

The user's Kurosaw reference sets the composition: charcoal peer cards, centered names, three overlapping real covers, and a white Create new action. The desktop grid has three columns, tablet two and phone one. Detail screens show saved titles with explicit, keyboard-accessible ordering and removal controls. Collections are private; the same saved title may appear in several. Removing a group preserves the watchlist and episode progress.

Taste Skill is installed as `design-taste-frontend`. The app draw selected True-black flat, seed 1654859792, retaining AniTrack's Outfit and Plus Jakarta Sans typography. The reference card grid replaces the draw's generic table pattern; the existing desktop sidebar stays because AniTrack has seven destinations. Mobile has four direct destinations plus a More menu. These choices preserve the user's reference and working navigation.

The existing torii logo is a brand asset. The inspector's `emoji` allowance applies to this mark only; collection copy and controls contain no decorative emoji. Cover art comes from saved anime. Visual QA uses a temporary account and the packaged catalog's actual posters, then deletes the account and all associated data. No example collections are seeded into real user accounts.

Review uses the production build, the unmodified Taste inspector in app mode at 1440, 768 and 390 pixels, and visual critique of list, detail and account screens. Authentication and database loading complete before measurements begin. Test captures and browser profiles are disposable and are removed after review.

## Verified review, 30 October 2026

All nine rendered screen/width combinations passed with zero inspector failures. All 18 fold and page-sheet images were opened for visual review. Source checks of Collections, its stylesheet and the two account views passed with zero failures. The account headings were reduced from the framework's oversized defaults to 28px for the page and 22px for sections after the first review.

The app critique:

1. The list's cover grid answers which collections are saved; the detail's posters answer what belongs to one. Account forms answer how to change profile/security settings. Each screen has a named primary action.
2. List cards share a three/two/one-column frame. The detail keeps fixed poster proportions and space for future titles rather than stretching three covers to fill four slots. Forms share their panel edges; no sideways scrolling was measured.
3. Anime art carries the list's color; white actions and charcoal surfaces keep chrome quiet. The established red torii mark and account actions retain AniTrack identity. Outfit titles and Plus Jakarta Sans labels remain loaded.
4. Each temporary collection had exactly three memberships and displayed three titles. Detail order and cover previews came from those same rows. No activity or popularity figures were invented.
5. No collection count or episode progress was fabricated. Zero watched episodes remain zero; an unknown episode total is marked with a question mark. Empty collections have a real add action.
6. There are no charts or legends. Titles, metadata and controls remain separated from the cover fan; long anime names wrap without clipping.
7. Phone navigation folds secondary destinations into More. Touch controls are at least 44px, the list becomes one column and detail uses two poster columns. The More menu and deletion confirmation passed browser checks.

Reviewed warnings: `panel-void` flags the intentional space between centered card titles and fanned covers from the user's reference. `micro-label` flags the existing sidebar scope label, retained with the established shell. `mixed-font-headline` flags the branded wordmark/torii combination; actual page titles use one face. Source `glass`/`shadow` warnings match explicit `backdrop-filter: none` and `box-shadow: none` overrides, not visual effects. These are documented allowances, not unresolved failures.
