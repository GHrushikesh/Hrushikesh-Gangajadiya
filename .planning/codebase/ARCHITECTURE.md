# System Architecture

**Analysis Date:** 2026-08-21  
**Project:** Hrushikesh Gangajadiya — Spider-Man / Miles Morales Developer Portfolio

---

## 1. Dual-Layer Mask Architecture

The visual core of the website is built on a synchronized dual-layer HTML structure:
- **Base Layer (`.layer__dark`)**:
  - Near-black / dark obsidian backdrop (`#050505`).
  - White / silver primary typography, red and cyan cyber accents.
  - Hosts interactive 3D WebGL viewport hooks (`.js-about_ido_coffee`, `.js-client_list_3d`).
- **Reveal Layer (`.layer__red` / `.js-masker`)**:
  - Sits directly over the dark layer with `position: fixed` or absolute registration.
  - Uses CSS `clip-path: circle(r at x y)` updated by cursor coordinates in `app.bundle.js`.
  - Content mirrors the dark layer 1:1 in high-contrast black/dark styling on crimson background.

---

## 2. 3D WebGL Rendering Pipeline

```
[Window Viewport]
       │
  canvas.three-app (Single Global WebGL Renderer, Three.js)
       ├── Sub-scene 1: Focus Areas (.js-about_ido_coffee) ──> spider_tech.gltf (PBR Metallic + Emissive)
       └── Sub-scene 2: Projects (.js-client_list_3d)    ──> spider_core.gltf (Geodesic Web Core)
```

- **Scissor-Box Rendering**: A single WebGL context is shared across the entire page. Sub-scenes calculate their bounding rect in DOM space on each animation frame and render into clipped viewport slices.
- **Scroll-Coupled Animations**: GSAP ScrollTrigger updates Euler rotations (`mesh.rotation.x, y, z`) based on scroll progress.

---

## 3. Smooth Scroll & Lifecycle Management

- **Preloader Flow**:
  - `page-loading` overlay counts to 100%.
  - User clicks `Start` (`#js-page-loading_start`), triggering `Ve.onStart()`.
  - GSAP triggers `PAGE_ENTER_INTRO` entrance animations.
  - Lenis smooth scroll unlocked and started (`rt.lenis.start()`).
- **Mobile Responsive Flow**:
  - On screens $< 768\text{px}$, desktop menu transforms to a circular glassmorphic toggle (`#js-header_toggle`) with a fullscreen dark drawer (`#js-header_menu`).
  - 3D viewports scale down to preserve performance and prevent touch blocking (`pointer-events: none`).
