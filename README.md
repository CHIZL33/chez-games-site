# Chez Games Site

A starter Roblox studio site for Chez Games with:

- Responsive layout and mobile navigation
- Accessible structure (skip link, semantic sections, focus states)
- Launch-ready content sections for a studio with no released games yet
- Lightweight interactive behaviors (menu toggle and editable content links)
- Git-backed visual editing with Decap CMS

## Run locally

Open `/home/runner/work/chez-games-site/chez-games-site/index.html` in your browser.

## Visual editor (no coding)

Open `/home/runner/work/chez-games-site/chez-games-site/admin` on your deployed site to edit content visually:

- Main site copy, hero, navigation, and footer contact settings
- Community/social links
- Reusable "coming soon" cards

### CMS files

- `/home/runner/work/chez-games-site/chez-games-site/admin/index.html`
- `/home/runner/work/chez-games-site/chez-games-site/admin/config.yml`
- `/home/runner/work/chez-games-site/chez-games-site/content/site.json`
- `/home/runner/work/chez-games-site/chez-games-site/content/coming-soon.json`

### First-time setup

1. In `/home/runner/work/chez-games-site/chez-games-site/admin/config.yml`, confirm:
   - `backend.repo` is `CHIZL33/chez-games-site`
   - `backend.branch` matches your default deployment branch
2. Configure Decap CMS GitHub authentication for your deployment environment.
3. Deploy the site, then open `/admin`.
4. Make edits in CMS and publish. Content updates commit back to the repo automatically.

## Project files

- `index.html` — page structure and CMS targets
- `styles.css` — design system and responsive styles
- `script.js` — navigation and CMS content rendering
- `content/site.json` — editable site content
- `content/coming-soon.json` — reusable "coming soon" cards
