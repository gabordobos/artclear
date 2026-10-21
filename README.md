# ArtClear – homepage prototype

Static HTML/CSS prototype of the ArtClear GmbH homepage, built from the Figma file
[ArtClear](https://www.figma.com/design/gyRflBV0f5CiKVDB14iyfb/ArtClear) —
desktop frame `Main - DESKTOP` (node 123:329) and mobile frame `Main - MOBILE` (node 115:682).

- `index.html` – the page
- `css/styles.css` – styles (desktop ≥ 901px, tablet ≤ 1200px, mobile ≤ 900px)
- `js/main.js` – mobile menu toggle and section scrolling
- `assets/` – images exported from Figma and the footer background video

The menu items smooth-scroll to their sections. The contact form and the EN/DE switch are
not wired up yet. Trajan Pro (used in the design) is substituted with Cinzel from Google Fonts.

Run locally: `python3 -m http.server` and open http://localhost:8000.
