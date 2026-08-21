# Directory & File Structure

**Analysis Date:** 2026-08-21  
**Project:** Hrushikesh Gangajadiya — Spider-Man / Miles Morales Developer Portfolio

---

## 1. Directory Tree

```
├── index.html                   # Main single-page application entry point
├── app.css                      # Master stylesheet (global variables, resets, layout)
├── app.bundle.js                # Core application runtime (scenes, mask, preloader, GSAP)
├── vendor.bundle.js             # Bundled vendor dependencies (Three.js, Lenis, GSAP, Draco)
├── vercel.json                  # Vercel deployment and MIME configuration
├── PRD.md                       # Product Requirements Document & Project Roadmap
├── assets/
│   ├── draco/                   # Draco 3D mesh decompression WASM and wrappers
│   │   ├── draco_decoder.wasm
│   │   └── draco_wasm_wrapper.js
│   ├── glb/                     # 3D GLTF / GLB assets
│   │   ├── spider_tech.gltf     # Focus Areas 3D Sci-Fi Drone model (10.2 KB)
│   │   ├── spider_core.gltf     # Projects 3D Spider-Web Core model (18.5 KB)
│   │   ├── coffee.min.gltf      # Legacy template model (archived / unused)
│   │   ├── mouse.min.gltf       # Legacy template model (archived / unused)
│   │   └── globe.min.gltf       # Legacy template model (archived / unused)
│   ├── icons/                   # Vector SVGs, favicon, profile badge
│   ├── images/                  # Project thumbnails, certificate scans, background graphics
│   ├── js/                      # Service worker and caching runtime scripts
│   ├── mp3/                     # Background audio assets
│   └── video/                   # Hero background video assets
└── .planning/                   # GSD planning & project intelligence repository
    └── codebase/                # Codebase intelligence maps (7 docs)
```

---

## 2. Key Entry Points & DOM Selectors

- **Preloader**: `#js-page-loading_start`, `.js-page-loading`, `.js-loading_text`
- **Navigation**: `.js-header`, `#js-header_toggle`, `#js-header_menu`
- **Particle Web Canvas**: `#web-canvas`
- **Interactive 3D Sub-scenes**:
  - Focus Areas: `.js-about_ido_coffee` / `.about_ido_inner`
  - Projects: `.js-client_list_3d` / `.client_list_3d_inner`
- **Dual Layer Mask**: `.layer__dark`, `.layer__red`, `.js-masker`
