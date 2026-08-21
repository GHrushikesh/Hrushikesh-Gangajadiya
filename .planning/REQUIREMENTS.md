# Project Requirements

**Project:** Hrushikesh Gangajadiya — Developer Portfolio  
**Status:** Active  
**Last Updated:** 2026-08-21

---

## 1. Functional Requirements

### FR-1: Hero & Identity
- **FR-1.1**: Display animated glitch and character entrance typography for candidate title and role.
- **FR-1.2**: Interactive background particle web canvas with smooth physics.
- **FR-1.3**: Background mobile cinematic video loop.

### FR-2: 3D Visuals & Focus Areas
- **FR-2.1**: Render 3D Spider-Tech Drone in Focus Areas with continuous multi-axis scroll rotation.
- **FR-2.2**: Highlight core competencies (AI, Web Development, Python, DSA, Problem Solving).

### FR-3: Projects & Portfolio Showcase
- **FR-3.1**: Render 3D Dimensional Spider-Web Core behind project cards.
- **FR-3.2**: Interactive project links with hover feedback and tech stack indicators.

### FR-4: Certifications & Experience
- **FR-4.1**: Horizontal swipe / scroll card view for certified credentials.
- **FR-4.2**: Fluid scaling on touch and mobile devices.

### FR-5: Contact & Social Portals
- **FR-5.1**: One-click email contact with masked hover state ("100% chance I read it").
- **FR-5.2**: GitHub and LinkedIn social portal links.

---

## 2. Non-Functional Requirements

### NFR-1: Performance & Loading
- **NFR-1.1**: Total 3D asset payload under 50 KB.
- **NFR-1.2**: 60 FPS smooth rendering on standard desktop and mobile hardware.
- **NFR-1.3**: Fast initial load via Service Worker precaching.

### NFR-2: Responsiveness & Viewports
- **NFR-2.1**: Verified across 360px, 375px, 390px, 430px, 768px, 1024px, 1280px, 1440px, 1920px.
- **NFR-2.2**: Zero horizontal page overflow (`scrollWidth <= innerWidth`).
- **NFR-2.3**: `pointer-events: none` on all decorative canvases to prevent touch obstruction.

---

## 3. Definition of Done

- Code tested across all 9 target resolutions.
- 0 JavaScript runtime errors.
- 0 broken links or missing asset requests.
- Vercel production build passes with correct MIME headers.
