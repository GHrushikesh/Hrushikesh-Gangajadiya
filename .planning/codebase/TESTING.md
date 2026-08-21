# Testing & Verification Patterns

**Analysis Date:** 2026-08-21  
**Project:** Hrushikesh Gangajadiya — Spider-Man / Miles Morales Developer Portfolio

---

## 1. Automated Headless Chrome Testing

- **Engine**: Headless Google Chrome (`chrome.exe --headless --disable-gpu`).
- **Target Resolutions Tested**:
  - **Mobile**: `360x800`, `375x812`, `390x844`, `430x932`
  - **Tablet**: `768x1024`
  - **Desktop**: `1024x768`, `1280x720`, `1440x900`, `1920x1080`

---

## 2. Verification Checklist per Phase

1. **Preloader Lifecycle**:
   - `page-loading` initiates at 00%, increments to 100%, and reveals the `Start` button.
   - Clicking `Start` unlocks Lenis scroll and starts entrance animations (`lenis-stopped` removed from `html`).
2. **3D WebGL Rendering**:
   - `spider_tech.gltf` and `spider_core.gltf` load with HTTP 200.
   - Zero GLTF fetch attempts for deprecated models (`coffee`, `mouse`, `globe`).
3. **Scroll & Momentum**:
   - Smooth Lenis scrolling responds to mousewheel, trackpad, and keyboard arrows.
4. **Dual Layer Mask Synchronization**:
   - Cursor movement updates `.js-masker` clip-path with 1:1 alignment over dark layer.
5. **Mobile Navigation**:
   - Hamburger toggle opens/closes drawer, outside clicks dismiss, link clicks smoothly navigate.
6. **Console Health**:
   - `0` JavaScript runtime errors, `0` unhandled promise rejections.
