# Location Guide Website – Presentation Plan

## Scope & Constraints
- Desktop-only, not responsive.
- Style in `index.css`.
- JavaScript in `index.js`.
- Static iframe `src`.
- Dropdown/city click invokes a function in `index.js`.
- Simple, attractive, and clear for demonstration.
- Use plain HTML, CSS, vanilla JS, and jQuery CDN.
- Populate UI from a hardcoded array of 10 city objects.
- Centered layout, clear color and border cues.
- Comments in code for clarity.
- Update `plan.md` as tasks are completed.
- Use Windsurf Memories to retain context.
- Test only in Chrome.

---

## Tasks & Steps

### 1. HTML Structure
- Refactored to use semantic tags: `<header>`, `<main>`, `<aside>`.
- Header: "Location Guide" in `#285c7e`.
- Main content: map container (75%) + sidebar (25%).
- Map container: contains the iframe (static src, red border).
- Sidebar: dropdown (green border) and data list (yellow border).
- All inline CSS removed; linked to `index.css`.
- Linked to jQuery CDN and `index.js`.
- Comments added for clarity.

### 2. CSS Styling (`index.css`)
- All styles moved from HTML to `index.css`.
- Centered, fixed-width layout.
- Font: `Rubik, sans-serif`, color: `#000`.
- 20px horizontal padding.
- Header: large, bold, `#285c7e`.
- Map container: 75% width, 600px height, centered.
- Iframe: 75% width of map container, red border.
- Sidebar: 25% width, vertical alignment.
- Dropdown: green border.
- Data list: yellow border.
- Simple, clean look for demonstration.

### 3. JavaScript Functionality (`index.js`)
- To be implemented: hardcoded array of 10 cities, populate dropdown and data list, handle selection.

### 4. Documentation & Progress
- This plan is stored in `plan.md`.
- Will update as tasks are completed.

---

## Progress Log

- [x] Initial HTML structure refactored, inline CSS removed, semantic tags and comments added, external CSS/JS linked. (2025-07-07)
- [x] All styles moved to `index.css`. (2025-07-07)
- [ ] JavaScript functionality to be implemented next.
