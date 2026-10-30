# AniTrack UI work

All application features, including Discover, Anime Assistant and anime details, are for authenticated users only. The public landing page is informational: describe capabilities and link to login/registration, without live catalog previews or usable feature forms. Enforce this on the backend as well as in navigation and router guards.

Use the installed Taste Skill (`design-taste-frontend`, from https://github.com/Leonxlnx/taste-skill/tree/main/skills/taste-skill) for UI/UX implementation and review. Read its SKILL.md and app-screen workflow before applying it. The user's Collections reference takes precedence over a randomly drawn layout: charcoal surfaces, a grid of centered collection titles and fanned anime covers, and white primary actions. Keep AniTrack's existing Vue/Quasar stack and identity.

Run the skill's app source checks and inspect the production build at desktop, tablet and phone widths. Open the resulting images, fix failures and document any justified exceptions before claiming the UI passed. Preserve functional, accessible loading, empty, error, focus and mobile states.

Use uniquely identified temporary accounts for live testing. Remove only the test accounts/data/files created for that work; retain permanent regression tests. Never expose .env credentials.
