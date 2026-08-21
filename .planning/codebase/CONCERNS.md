# Codebase Concerns & Technical Debt

**Analysis Date:** 2026-08-21  
**Project:** Hrushikesh Gangajadiya — Spider-Man / Miles Morales Developer Portfolio

---

## 1. Minified Bundle Architecture

- **Context**: `app.bundle.js` and `vendor.bundle.js` are pre-compiled production bundles.
- **Risk**: Modifying large sections of minified bundles directly risks syntax regression.
- **Mitigation Pattern**:
  - Prefer declarative DOM hooks and scoped CSS rules in `index.html`.
  - When bundle adjustments are necessary, use surgical replacements with full parameter safety.

---

## 2. Touch & Pointer Adaptation

- **Context**: High-resolution mobile displays may report touch-coarse pointers where custom red cursors and hover effects can cause layout artifacts.
- **Mitigation Pattern**:
  - Media queries `@media (hover: none) and (pointer: coarse)` hide custom cursor `.vj-cursor`.
  - All 3D canvases and decorative elements enforce `pointer-events: none` on mobile.

---

## 3. Legacy Asset Footprint

- **Context**: Original template 3D models (`assets/glb/coffee.min.gltf`, `mouse.min.gltf`, `globe.min.gltf`) remain on disk.
- **Status**: Completely disconnected with 0 runtime requests; preserved for safety and rollback readiness until final project archiving.
