# Mobile visual review - 6 November 2026

Direction: retain AniTrack's charcoal/red identity, Outfit/Plus Jakarta Sans and existing artwork. This is a correction of the public header and hero, with no new random direction or replacement imagery. The user's informational-only landing and private feature access remain in place.

ROUND 1
Seen in one second: a busy poster background competing with the mobile title.
Idea (one sentence): the user's anime shelf should accompany the introduction without sitting behind its words.
Live thing: real account links and informational section navigation; catalog and assistant tools stay private.
Layout words by section: hero=background collage / features=editorial tiles / journey=gallery / member features=stories / footer=close.
Scores: design 5 · usability 5 · creativity 6 · content 7 -> overall 5.4.
Caps applied: weak hierarchy and excessive header/hero space.
Top three problems:
1. The 360px header occupied 108px across two rows. Fold links into one accessible menu.
2. The mobile hero was 580px tall. Size it to its actual content.
3. The poster backdrop crossed the reading area. Put a compact cover fan beside the title, above the paragraph and actions.

ROUND 2
Seen in one second: AniTrack's introduction with a small anime shelf and one main action.
Idea (one sentence): three existing anime covers form a compact personal shelf alongside the mobile heading.
Live thing: functional account destinations and a dismissible menu; no public feature controls.
Layout words by section: hero=title plus shelf / features=editorial tiles / journey=gallery / member features=stories / footer=close.
Scores: design 7 · usability 8 · creativity 6 · content 7 -> overall 7.1.
Caps applied: restrained motion caps design at 7; this established media composition is not a novel concept.
Top three problems addressed:
1. Phone header is now one 64px row in browser checks. Brand, login and menu do not collide at 320/330/360/390px; the tablet action group also stays aligned.
2. Browser hero height is approximately 416.5px, with the primary action visible on a short 562px phone viewport. The actual Android text-scaled hero measures approximately 430px.
3. Artwork and text have separate positions; the paragraph and buttons use plain ground. Decorative artwork has no pointer hit target.

Final production inspection: zero FAIL, three WARN. All seven final fold/contact-sheet images were opened at desktop, tablet and mobile. Source checks on App.vue, mobile.css, LandingFeatures.vue and Landing.vue reported zero findings after documenting retained neutral photo masks.

Reviewed warning exceptions:
- size-count: the existing desktop promotional components retain their display scale; the corrected phone section headings use a consistent 28px size.
- no-footage: no new autoplay video was added to a local mobile assessment build; existing bundled anime artwork remains the imagery.
- still-page: thirteen elements moved during inspection; restrained motion is retained, with the existing reduced-motion fallback.

Remaining visual limitations: the existing desktop marketing page uses several typography sizes and repeated feature tiles. This audit establishes the corrected layout and measured checks, not an award-level redesign of every older promotional section. No new stock assets, sample claims or invented statistics were added.
