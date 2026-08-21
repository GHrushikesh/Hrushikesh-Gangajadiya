# Hrushikesh Gangajadiya — Developer Portfolio

## What This Is

A premium, interactive developer portfolio website combining Apple's refined, minimal aesthetic with a futuristic, subtle Spider-Man / Miles Morales-inspired visual identity. It features full-screen 3D WebGL scenes, smooth Lenis scrolling, GSAP character and line animations, and a synchronized dual-layer cursor reveal.

## Core Value

Showcase engineering projects, technical focus areas, certifications, and contact information with stunning visual polish and rock-solid responsiveness on all devices.

## Requirements

### Validated

- ✓ [PWA & Caching Pipeline] — Service Worker registration with relative paths (`assets/js/sw.js`, `js/caching.js`)
- ✓ [Vercel Deployment Compatibility] — Static deployment config with Draco WASM and GLTF MIME types (`vercel.json`)
- ✓ [Mobile Header & Navigation] — Interactive neon glassmorphism hamburger toggle and fullscreen navigation drawer (`#js-header_toggle`, `#js-header_menu`)
- ✓ [Template 3D Artwork Decommission] — Clean removal of old template coffee cup, mouse, and globe models
- ✓ [Spider-Man Themed 3D Art Engine] — Integration of custom 3D Sci-Fi Spider-Tech Drone (`spider_tech.gltf`) and Spider-Web Energy Core (`spider_core.gltf`) with WebGL scissor clipping and ScrollTrigger parallax
- ✓ [Responsive Viewport Support] — Zero horizontal overflow verified across 360px to 1920px viewports

### Active

- [ ] [UI/UX Polish & Typography Hierarchy] — Refine typography, generous whitespace, and Apple-inspired visual clarity across all sections
- [ ] [Project Showcase Enhancements] — Add live demo links, GitHub buttons, tech badges, and interactive preview modals
- [ ] [Skills & Focus Areas Visual Refinement] — Enhance visual presentation of technical skills and competencies
- [ ] [Contact & Social Portals] — Polish email links, copy-to-clipboard actions, and social contact cards
- [ ] [Performance & Accessibility Auditing] — Final pass on Lighthouse scores, contrast ratios, and keyboard accessibility

### Out of Scope

- [Copyrighted Marvel / Movie Renders] — Must use original geometric sci-fi spider-tech graphics and animations only
- [Heavy Third-Party Frameworks] — Maintain lightweight Vanilla HTML/CSS/JS architecture without React/Next/Tailwind overhead
- [Synthetic Scroll Hijacking] — Scrolling must remain naturally managed by Lenis

## Context

- **Source Baseline**: Heavily customized creative portfolio inspired by Minh Pham, now refactored to an Apple + Spider-Man design language.
- **Key Files**:
  - `index.html`: Main single-page markup with dual-layer dark/red registration.
  - `app.css`: Design tokens and responsive layout rules.
  - `app.bundle.js`: Scene orchestrator, Lenis scroll controller, GSAP animations, and Three.js hooks.
  - `assets/glb/`: Custom PBR 3D models (`spider_tech.gltf`, `spider_core.gltf`).
  - `PRD.md`: Full product requirements and visual direction document.

## Constraints

- **Tech Stack**: Vanilla HTML5, CSS3, ES6 JavaScript, Three.js, GSAP, Lenis
- **Asset Sizing**: Keep 3D assets under 50KB to preserve instant loading
- **Mobile First**: All decorative 3D and canvas elements must carry `pointer-events: none` on touch devices

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Scissor-box WebGL Canvas | Single WebGL context renders multiple 3D sub-scenes efficiently without duplicating contexts | ✓ Good |
| PWA Service Worker | Instant offline caching and faster repeat visits | ✓ Good |
| Apple + Spider-Man Theme | Balanced professional minimalism with unique creative identity | ✓ Good |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-08-21 after initialization*
