# Technology Stack

**Analysis Date:** 2026-08-21  
**Project:** Hrushikesh Gangajadiya — Spider-Man / Miles Morales Developer Portfolio

---

## 1. Core Runtime & Languages

- **HTML5**: Semantic document structure with dual-layer mask architecture (`.layer__dark` and `.layer__red`).
- **CSS3 / Vanilla CSS**: Custom responsive styling, CSS variables, glassmorphism, keyframe animations (`app.css`, `<style>` overrides in `index.html`).
- **JavaScript (ES6+)**:
  - `vendor.bundle.js`: Three.js WebGL 3D rendering engine, Draco decoder, GSAP animation core, Lenis smooth scrolling engine.
  - `app.bundle.js`: Scene orchestrator, dual-layer radial clip-path mask manager, preloader lifecycle, scroll-triggered character animations.
  - `assets/js/sw.js` & `caching.js`: Progressive Web App (PWA) Service Worker precaching and offline support.

---

## 2. 3D & Graphics Engine

- **Three.js**: Full-screen WebGL canvas (`canvas.three-app`) with scissor-box sub-scene viewports for 3D elements.
- **Draco Compression**: WebAssembly Draco decoder (`assets/draco/draco_decoder.wasm`, `assets/draco/draco_wasm_wrapper.js`).
- **3D Asset Formats**:
  - `assets/glb/spider_tech.gltf`: Custom 3D Sci-Fi Spider-Tech Drone / Emblem (Focus Areas).
  - `assets/glb/spider_core.gltf`: Custom Dimensional 3D Spider-Web Energy Core (Projects).
  - GLTF 2.0 with embedded PBR metallic-roughness and emissive materials.

---

## 3. Animation & Scrolling Systems

- **Lenis Smooth Scroll**: Virtual momentum scroll engine (`rt.lenis`).
- **GSAP (GreenSock)**: Character entrance reveals (`js-anim--chars`), scale transitions (`js-anim--scale`), and line simulations (`js-anim--lines--sim`).
- **ScrollTrigger**: Progress-linked 3D object rotation and parallax.
- **Dynamic Spider-Web Particle Canvas**: Interactive hero canvas (`#web-canvas`) with pointer repulsion physics.

---

## 4. Deployment & Hosting Configuration

- **Platform**: Vercel Static Hosting (`vercel.json`).
- **MIME Type Headers**:
  - `application/wasm` for Draco decoder `.wasm`.
  - `application/json` / `model/gltf+json` for `.gltf` and `.glb`.
  - Proper caching headers for static video and font assets.
