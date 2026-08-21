# Code & Design Conventions

**Analysis Date:** 2026-08-21  
**Project:** Hrushikesh Gangajadiya — Spider-Man / Miles Morales Developer Portfolio

---

## 1. Visual Design & Theme Palette

The visual identity follows a refined **Spider-Man / Miles Morales** comic & sci-fi theme:

| Element | Color Code | Role |
| :--- | :--- | :--- |
| **Dark Void (Base)** | `#050505` / `rgba(5, 5, 5, 0.97)` | Background canvas & mobile drawer |
| **Crimson / Web Glow** | `#E60012` / `rgba(230, 0, 18, 0.85)` | Neon borders, active states, 3D emissive channels |
| **Electric Cyan** | `#00FFFF` | Cyber accent nodes, secondary points |
| **Venom Gold** | `#FFD700` | Header hover glow & active highlight |
| **Pure White** | `#FFFFFF` | Primary headings, display text |
| **Silver / Muted Grey** | `#888888` / `#AAAAAA` | Subtitles, descriptions, metadata |

---

## 2. CSS Conventions

- **Scoped Overrides**: Responsive mobile and theme enhancements are contained in scoped `<style>` tags with strict media queries (`@media (max-width: 767.98px)` and `@media (min-width: 768px)`).
- **Glassmorphism**: `backdrop-filter: blur(20px)` with semi-transparent obsidian backdrops.
- **Pointer Events**: All decorative 3D canvases, SVG webs, and background overlays must have `pointer-events: none` to prevent touch-blocking on mobile.
- **Overflow Protection**: `overflow-x: hidden` enforced on `html` and `body`.

---

## 3. DOM & JavaScript Conventions

- **JS Hook Class Naming**: All interactive DOM elements use the `js-` prefix (e.g., `js-header`, `js-masker`, `js-about_ido_coffee`).
- **Null Safety**: All modules verify element presence (`el && ...`) before initializing Three.js or GSAP bindings.
- **Scroll Hijacking Prohibition**: Scrolling must remain natively managed by Lenis — no `preventDefault()`, manual wheel listeners, or synthetic scroll increments.
