/**
 * Dual-Theme 3D Model Controller (Performance, Hero-First & Separated Web/Spider)
 *
 * DUAL-THEME 3D SCENES:
 *
 * 1. HERO SCREEN (#sp3d-hero):
 *    - Dark Mode ONLY: Thor's Stormbreaker Battle Axe (storm_breaker.glb)
 *    - Light Mode: Controlled by spider_lanyard.js (Hanging Draggable Spider in upper-left)
 *    - Priority 1: Loads immediately when Dark Mode is active.
 *
 * 2. FOCUS AREAS (.about_ido):
 *    - Upper-Left (.about_ido_coffee):
 *        - Light Mode: 3D Spider (spider.glb)
 *        - Dark Mode: Thor's Mjolnir Hammer (mjolnir_thors_hammer.glb)
 *    - Bottom-Right (.about_ido_web / .about_ido_mouse) [TASK 1]:
 *        - Light Mode ONLY: 3D Web (web.glb) in bottom-right decorative zone
 *    - Lazy loaded via IntersectionObserver.
 *
 * 3. PROJECTS SECTION (.client_list_3d):
 *    - Light Mode: Web Shooter (shooter.glb)
 *    - Dark Mode: Avengers Thor Hammer (avengers_-_thor_hammer.glb)
 *    - Lazy loaded via IntersectionObserver.
 */
(function () {
    'use strict';

    /* ── Poll until THREE + GLTFLoader + MeshoptDecoder are all present ── */
    function boot() {
        if (typeof THREE === 'undefined' ||
            typeof THREE.GLTFLoader === 'undefined' ||
            typeof MeshoptDecoder === 'undefined') {
            setTimeout(boot, 60);
            return;
        }
        initController();
    }

    /* ── Shared GLB Loader with Promise Caching & Fallback ── */
    var gltfLoader = null;
    var promiseCache = {};
    var sceneCache = {};

    function getGltfLoader() {
        if (!gltfLoader) {
            gltfLoader = new THREE.GLTFLoader();
            if (typeof MeshoptDecoder !== 'undefined') {
                gltfLoader.setMeshoptDecoder(MeshoptDecoder);
            }
        }
        return gltfLoader;
    }

    function loadGLB(url) {
        if (sceneCache[url]) {
            return Promise.resolve(sceneCache[url].clone(true));
        }
        if (promiseCache[url]) {
            return promiseCache[url].then(function (scene) {
                return scene.clone(true);
            });
        }

        var loader = getGltfLoader();

        promiseCache[url] = new Promise(function (resolve, reject) {
            loader.load(
                url,
                function (gltf) {
                    sceneCache[url] = gltf.scene;
                    resolve(gltf.scene);
                },
                undefined,
                function (err) {
                    var fallback = url.replace('assets/glb/', '');
                    if (fallback !== url) {
                        loader.load(
                            fallback,
                            function (gltf) {
                                sceneCache[url] = gltf.scene;
                                resolve(gltf.scene);
                            },
                            undefined,
                            function (e2) { reject(err); }
                        );
                    } else {
                        reject(err);
                    }
                }
            );
        });

        return promiseCache[url].then(function (scene) {
            return scene.clone(true);
        });
    }

    // Expose loader for other components (e.g. spider_lanyard)
    window.PortfolioGLBLoader = { load: loadGLB };

    /* ── Helper: Center + Scale model to targetSize ── */
    function fitModel(model, targetSize) {
        model.updateMatrixWorld(true);
        var box    = new THREE.Box3().setFromObject(model);
        var center = box.getCenter(new THREE.Vector3());
        var size   = box.getSize(new THREE.Vector3());
        var maxDim = Math.max(size.x, size.y, size.z) || 1;
        var sc     = targetSize / maxDim;

        model.scale.setScalar(sc);
        model.position.set(-center.x * sc, -center.y * sc, -center.z * sc);

        var g = new THREE.Group();
        g.add(model);
        return g;
    }

    /* ── Helper: Scroll Progress [0..1] of element in viewport ── */
    function scrollProg(selector) {
        var el = document.querySelector(selector);
        if (!el) return 0.5;
        var r = el.getBoundingClientRect();
        return (window.innerHeight - r.top) / (window.innerHeight + r.height);
    }

    function isLightMode() {
        return document.documentElement.getAttribute('data-theme') === 'light';
    }

    var isMobileDevice = /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent) || window.innerWidth < 768;

    /* ── Helper: WebGL Renderer Factory with DPR Clamping & Low-Overhead Mobile Config ── */
    function makeRenderer(hostEl) {
        var w = hostEl.clientWidth  || hostEl.offsetWidth  || 320;
        var h = hostEl.clientHeight || hostEl.offsetHeight || 320;
        if (w < 10) w = 320;
        if (h < 10) h = 320;

        var isMob = isMobileDevice || window.innerWidth < 768;
        var renderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: !isMob, // Disable costly multisampling on mobile
            powerPreference: 'high-performance',
            precision: isMob ? 'mediump' : 'highp'
        });
        renderer.setPixelRatio(isMob ? 1.0 : Math.min(window.devicePixelRatio || 1, 1.5));
        renderer.setSize(w, h);
        renderer.outputEncoding      = THREE.sRGBEncoding;
        renderer.toneMapping         = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.0;

        var canvas = renderer.domElement;
        canvas.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;display:block;transition:opacity 0.4s ease;z-index:0;';

        hostEl.style.position = 'relative';
        hostEl.insertBefore(canvas, hostEl.firstChild);

        return renderer;
    }

    /* ── Dynamic Dual-Theme Studio Lighting ── */
    function createDualLights(scene) {
        var group = new THREE.Group();

        // Light Theme Lights (Daylight Studio)
        var lightGroup = new THREE.Group();
        var lightAmb = new THREE.AmbientLight(0xffffff, 2.6);
        var lightKey = new THREE.DirectionalLight(0xffffff, 3.4);
        lightKey.position.set(4, 6, 5);
        var lightFill = new THREE.DirectionalLight(0xe2e8f0, 2.0);
        lightFill.position.set(-4, 2, -2);
        lightGroup.add(lightAmb, lightKey, lightFill);
        group.add(lightGroup);

        // Dark Theme Lights (Thor Thunder Cyan Accent)
        var darkGroup = new THREE.Group();
        var darkAmb = new THREE.AmbientLight(0xffffff, 0.9);
        var darkKey = new THREE.DirectionalLight(0xffffff, 1.4);
        darkKey.position.set(3, 5, 4);
        var darkFill = new THREE.DirectionalLight(0x64748b, 0.6);
        darkFill.position.set(-3, 1, -2);
        var darkCyan = new THREE.DirectionalLight(0x00D2FF, 0.9);
        darkCyan.position.set(-5, 2, -1);
        var darkRim = new THREE.DirectionalLight(0x0077FE, 0.7);
        darkRim.position.set(0, -3, -3);
        var thunderPoint = new THREE.PointLight(0x00D2FF, 1.0, 12);
        thunderPoint.position.set(1, 2, 2);
        darkGroup.add(darkAmb, darkKey, darkFill, darkCyan, darkRim, thunderPoint);
        group.add(darkGroup);

        scene.add(group);

        return {
            group: group,
            lightGroup: lightGroup,
            darkGroup: darkGroup,
            thunderPoint: thunderPoint,
            update: function () {
                var light = isLightMode();
                lightGroup.visible = light;
                darkGroup.visible = !light;
            }
        };
    }

    // Shared global pointer tracking with passive listeners
    var mouseX = 0, mouseY = 0;
    window.addEventListener('mousemove', function (e) {
        mouseX = (e.clientX / window.innerWidth  - 0.5);
        mouseY = (e.clientY / window.innerHeight - 0.5);
    }, { passive: true });

    window.addEventListener('touchmove', function (e) {
        if (!e.touches || !e.touches[0]) return;
        mouseX = (e.touches[0].clientX / window.innerWidth  - 0.5);
        mouseY = (e.touches[0].clientY / window.innerHeight - 0.5);
    }, { passive: true });

    /* ================================================================
       SCENE 1 — HERO SCREEN (#sp3d-hero) [PRIORITY 1 - HERO FIRST]
       Dark Mode ONLY: Thor's Stormbreaker Axe (storm_breaker.glb)
       ================================================================ */
    function sceneHero() {
        var wrap = document.getElementById('sp3d-hero');
        if (!wrap) {
            wrap = document.createElement('div');
            wrap.id = 'sp3d-hero';
            wrap.style.cssText = [
                'position:fixed',
                'top:80px',
                'right:0',
                'width:44vw',
                'max-width:540px',
                'height:calc(100vh - 80px)',
                'pointer-events:none',
                'z-index:9999',
                'opacity:1',
                'display:block',
                'transition:opacity 0.3s ease',
                'overflow:visible'
            ].join(';');
            document.body.appendChild(wrap);
        }

        var wW = Math.round(window.innerWidth * 0.44);
        var wH = Math.max(300, window.innerHeight - 80);

        var isMob = isMobileDevice || window.innerWidth < 768;
        var renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
        renderer.setPixelRatio(isMob ? 1.0 : Math.min(window.devicePixelRatio || 1, 1.5));
        renderer.setSize(wW, wH);
        renderer.outputEncoding = THREE.sRGBEncoding;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.0;
        renderer.domElement.style.cssText = 'width:100%;height:100%;pointer-events:none;display:block;';
        wrap.appendChild(renderer.domElement);

        var scene    = new THREE.Scene();
        var camera   = new THREE.PerspectiveCamera(40, wW / wH, 0.1, 100);
        camera.position.set(0, 0, 5.0);

        var lights = createDualLights(scene);
        var darkRoot  = new THREE.Group();
        scene.add(darkRoot);

        var stormbreakerLoaded = false;

        function loadHeroModels() {
            var light = isLightMode();

            // Hero 3D container is for Thor Stormbreaker in Dark Mode
            if (light) {
                wrap.style.display = 'none';
                return;
            } else {
                wrap.style.display = 'block';
            }

            if (!stormbreakerLoaded) {
                stormbreakerLoaded = true;
                loadGLB('assets/glb/storm_breaker.glb').then(function (m) {
                    m.traverse(function (c) {
                        if (c.isMesh && c.material) {
                            c.material.side = THREE.DoubleSide;
                            var matName = (c.material.name || '').toLowerCase();
                            if (matName.indexOf('bark') !== -1 || matName.indexOf('wood') !== -1 || matName.indexOf('material') !== -1) {
                                c.material.roughness = 0.85;
                                c.material.metalness = 0.05;
                                if (c.material.color) {
                                    c.material.color.setHex(0x5a4338);
                                }
                            } else {
                                c.material.roughness = 0.45;
                                c.material.metalness = 0.85;
                                if (c.material.color) {
                                    c.material.color.setHex(0x333b47);
                                }
                            }
                            c.material.needsUpdate = true;
                        }
                    });
                    var g = fitModel(m, 2.75);
                    g.position.set(0.1, -0.15, 0);
                    g.rotation.set(0.25, -0.45, 0.16);
                    darkRoot.add(g);
                }).catch(function (e) {
                    console.warn('[SP3D] Error loading storm_breaker.glb:', e);
                });
            }
        }

        loadHeroModels();
        window.addEventListener('themechange', loadHeroModels);

        window.addEventListener('resize', function () {
            var nw = Math.round(window.innerWidth * 0.44);
            var nh = Math.max(300, window.innerHeight - 80);
            camera.aspect = nw / nh;
            camera.updateProjectionMatrix();
            renderer.setSize(nw, nh);
        }, { passive: true });

        var clock = new THREE.Clock();
        var baseRY = -0.3;

        (function tick() {
            requestAnimationFrame(tick);
            if (isLightMode()) return; // Skip in Light Mode

            var scrollY = window.pageYOffset || document.documentElement.scrollTop || 0;
            var heroFade = Math.max(0, 1 - scrollY / 650);
            wrap.style.opacity = heroFade.toFixed(3);

            if (heroFade <= 0.01) return; // WebGL Culling when scrolled away

            lights.update();
            var t = clock.getElapsedTime();
            var mX = mouseX * 0.40;
            var mY = mouseY * 0.30;

            darkRoot.rotation.y += (baseRY + mX * 1.1 - darkRoot.rotation.y) * 0.06;
            darkRoot.rotation.x += (0.25 + mY * 0.8 - darkRoot.rotation.x) * 0.06;
            darkRoot.rotation.z  = 0.16 + Math.sin(t * 1.5) * 0.05;
            darkRoot.position.y  = -0.15 + Math.sin(t * 1.4) * 0.07;
            lights.thunderPoint.intensity = 1.0 + Math.sin(t * 6.0) * 0.3;

            renderer.render(scene, camera);
        }());
    }

    /* ================================================================
       SCENE 2 — Focus Areas Upper-Left (.about_ido_coffee) [LAZY LOADED]
       Light Mode: 3D Spider (spider.glb)
       Dark Mode:  Thor's Mjolnir Hammer (mjolnir_thors_hammer.glb)
       ================================================================ */
    var isAboutSceneActive = false;
    function initAboutScene() {
        if (isAboutSceneActive) return;
        var host = document.querySelector('.about_ido_coffee');
        if (!host) return;
        isAboutSceneActive = true;

        var renderer = makeRenderer(host);
        var w = host.clientWidth || 360, h = host.clientHeight || 360;
        var scene  = new THREE.Scene();
        var camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100);
        camera.position.z = 5.2;

        var lights = createDualLights(scene);
        var lightRoot = new THREE.Group();
        var darkRoot  = new THREE.Group();
        scene.add(lightRoot, darkRoot);

        var spiderLoaded = false;
        var mjolnirLoaded = false;
        var isVisible = true;

        function loadAboutModels() {
            var light = isLightMode();

            // Light: 3D Spider in upper-left
            if (light && !spiderLoaded) {
                spiderLoaded = true;
                loadGLB('assets/glb/spider.glb').then(function (m) {
                    m.traverse(function (c) {
                        if (c.isMesh && c.material) {
                            c.material.color = new THREE.Color(0x11131a);
                            c.material.metalness = 0.88;
                            c.material.roughness = 0.22;
                        }
                    });
                    var spiderMesh = fitModel(m, 3.6);
                    spiderMesh.position.set(0, 0, 0.2);
                    spiderMesh.rotation.set(0.3, 0.2, 0.1);
                    lightRoot.add(spiderMesh);
                }).catch(function (e) {
                    console.warn('[SP3D] Error loading spider in about section:', e);
                });
            }

            // Dark: Thor's Mjolnir Hammer behind text
            if (!light && !mjolnirLoaded) {
                mjolnirLoaded = true;
                loadGLB('assets/glb/mjolnir_thors_hammer.glb').then(function (m) {
                    m.traverse(function (c) {
                        if (c.isMesh && c.material) {
                            c.material.side = THREE.DoubleSide;
                        }
                    });
                    var mjolnir = fitModel(m, 3.6);
                    mjolnir.rotation.set(0.35, -0.4, 0.2);
                    darkRoot.add(mjolnir);
                }).catch(function (e) {
                    console.warn('[SP3D] Error loading mjolnir:', e);
                });
            }
        }

        loadAboutModels();
        window.addEventListener('themechange', loadAboutModels);

        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                isVisible = entry.isIntersecting;
            });
        }, { threshold: 0.05, rootMargin: '100px 0px' });
        observer.observe(host);

        window.addEventListener('resize', function () {
            var nw = host.clientWidth || 360, nh = host.clientHeight || 360;
            camera.aspect = nw / nh;
            camera.updateProjectionMatrix();
            renderer.setSize(nw, nh);
        }, { passive: true });

        var clock = new THREE.Clock();
        (function tick() {
            requestAnimationFrame(tick);
            if (!isVisible) return; // Skip offscreen frames

            var light = isLightMode();
            lights.update();
            lightRoot.visible = light;
            darkRoot.visible  = !light;

            var t    = clock.getElapsedTime();
            var prog = scrollProg('.about_ido');
            var mX   = mouseX * 0.55;
            var mY   = mouseY * 0.40;

            if (light) {
                lightRoot.rotation.y += (prog * Math.PI * 2.0 + mX - lightRoot.rotation.y) * 0.07;
                lightRoot.rotation.x += (0.3 + Math.sin(prog * Math.PI) * 0.4 + mY - lightRoot.rotation.x) * 0.07;
                lightRoot.position.y  += ((prog - 0.5) * 0.8 + Math.sin(t * 1.4) * 0.05 - lightRoot.position.y) * 0.07;
            } else {
                darkRoot.rotation.y += (prog * Math.PI * 2.5 + mX * 1.2 - darkRoot.rotation.y) * 0.08;
                darkRoot.rotation.x += (0.35 + Math.sin(prog * Math.PI) * 0.5 + mY * 0.8 - darkRoot.rotation.x) * 0.08;
                darkRoot.rotation.z = Math.sin(t * 1.8) * 0.12;
                darkRoot.position.y = Math.sin(t * 2.0) * 0.14;
                lights.thunderPoint.intensity = 1.0 + Math.sin(t * 8.0) * 0.3;
            }

            renderer.render(scene, camera);
        }());
    }

    /* ================================================================
       SCENE 3 — Focus Areas Bottom-Right (.about_ido_web / .about_ido_mouse) [TASK 1]
       Light Mode ONLY: 3D Web (web.glb) positioned in the bottom-right decorative zone
       ================================================================ */
    var isFocusWebSceneActive = false;
    function initFocusWebScene() {
        if (isFocusWebSceneActive) return;
        var host = document.querySelector('.about_ido_web') || document.querySelector('.about_ido_mouse');
        if (!host) return;
        isFocusWebSceneActive = true;

        var renderer = makeRenderer(host);
        var w = host.clientWidth || 440, h = host.clientHeight || 440;
        var scene  = new THREE.Scene();
        var camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100);
        camera.position.z = 5.0;

        var lights = createDualLights(scene);
        var webRoot = new THREE.Group();
        scene.add(webRoot);

        var webLoaded = false;
        var isVisible = true;

        function loadWebModel() {
            if (!isLightMode() || webLoaded) return;
            webLoaded = true;

            loadGLB('assets/glb/web.glb').then(function (m) {
                m.traverse(function (c) {
                    if (c.isMesh && c.material) {
                        c.material.transparent = true;
                        c.material.opacity = 0.95;
                        c.material.color = new THREE.Color(0x11131a);
                        c.material.metalness = 0.88;
                        c.material.roughness = 0.22;
                        c.material.side = THREE.DoubleSide;
                    }
                });
                var webMesh = fitModel(m, 4.4);
                webMesh.position.set(0.1, -0.1, 0);
                webMesh.rotation.set(0.35, -0.3, 0.15);
                webRoot.add(webMesh);
            }).catch(function (e) {
                console.warn('[SP3D] Error loading web.glb:', e);
            });
        }

        if (isLightMode()) {
            loadWebModel();
        }
        window.addEventListener('themechange', loadWebModel);

        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                isVisible = entry.isIntersecting;
            });
        }, { threshold: 0.05, rootMargin: '100px 0px' });
        observer.observe(host);

        window.addEventListener('resize', function () {
            var nw = host.clientWidth || 440, nh = host.clientHeight || 440;
            camera.aspect = nw / nh;
            camera.updateProjectionMatrix();
            renderer.setSize(nw, nh);
        }, { passive: true });

        var clock = new THREE.Clock();
        (function tick() {
            requestAnimationFrame(tick);
            var light = isLightMode();
            host.style.display = light ? 'block' : 'none';
            if (!light || !isVisible) return; // Skip rendering when in dark mode or offscreen

            lights.update();
            var t    = clock.getElapsedTime();
            var prog = scrollProg('.about_ido');
            var mX   = mouseX * 0.45;
            var mY   = mouseY * 0.35;

            webRoot.rotation.y += (-0.3 + prog * Math.PI * 1.5 + mX - webRoot.rotation.y) * 0.06;
            webRoot.rotation.x += (0.35 + Math.sin(prog * Math.PI) * 0.3 + mY - webRoot.rotation.x) * 0.06;
            webRoot.position.y  = Math.sin(t * 1.3) * 0.08;

            renderer.render(scene, camera);
        }());
    }

    /* ================================================================
       SCENE 4 — Projects Section (.client_list_3d) [LAZY LOADED]
       Light Mode: Web Shooter (shooter.glb)
       Dark Mode:  Avengers Thor Hammer (avengers_-_thor_hammer.glb)
       ================================================================ */
    var isProjectsSceneActive = false;
    function initProjectsScene() {
        if (isProjectsSceneActive) return;
        var host = document.querySelector('.client_list_3d');
        if (!host) return;
        isProjectsSceneActive = true;

        var renderer = makeRenderer(host);
        var w = host.clientWidth || 480, h = host.clientHeight || 480;
        var scene  = new THREE.Scene();
        var camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100);
        camera.position.z = 4.8;

        var lights = createDualLights(scene);
        var lightRoot = new THREE.Group();
        var darkRoot  = new THREE.Group();
        scene.add(lightRoot, darkRoot);

        var shooterLoaded = false;
        var avengersHammerLoaded = false;
        var isVisible = true;

        function loadProjectModels() {
            var light = isLightMode();

            // Light: Web Shooter
            if (light && !shooterLoaded) {
                shooterLoaded = true;
                loadGLB('assets/glb/shooter.glb').then(function (m) {
                    m.traverse(function (c) {
                        if (c.isMesh && c.material) {
                            c.material.color = new THREE.Color(0x181a24);
                            c.material.metalness = 0.9;
                            c.material.roughness = 0.22;
                            c.material.transparent = true;
                            c.material.opacity = 0.9;
                        }
                    });
                    var g = fitModel(m, 3.2);
                    g.rotation.set(0.3, -0.6, 0.2);
                    lightRoot.add(g);
                }).catch(function (e) {});
            }

            // Dark: Thor's Hammer (Optimized: Uses 20MB Mjolnir on mobile, 98MB Avengers Hammer on Desktop)
            if (!light && !avengersHammerLoaded) {
                avengersHammerLoaded = true;
                var isMob = isMobileDevice || window.innerWidth < 768;
                var darkModelPath = isMob ? 'assets/glb/mjolnir_thors_hammer.glb' : 'assets/glb/avengers_-_thor_hammer.glb';
                var targetScale = isMob ? 4.0 : 4.6;

                loadGLB(darkModelPath).then(function (m) {
                    m.traverse(function (c) {
                        if (c.isMesh && c.material) {
                            c.material.side = THREE.DoubleSide;
                        }
                    });
                    var g = fitModel(m, targetScale);
                    g.rotation.set(0.35, -0.5, 0.2);
                    darkRoot.add(g);
                }).catch(function (e) {
                    console.warn('[SP3D] Error loading project hammer model:', e);
                });
            }
        }

        loadProjectModels();
        window.addEventListener('themechange', loadProjectModels);

        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                isVisible = entry.isIntersecting;
            });
        }, { threshold: 0.05, rootMargin: '100px 0px' });
        observer.observe(host);

        window.addEventListener('resize', function () {
            var nw = host.clientWidth || 480, nh = host.clientHeight || 480;
            camera.aspect = nw / nh;
            camera.updateProjectionMatrix();
            renderer.setSize(nw, nh);
        }, { passive: true });

        var clock = new THREE.Clock();
        (function tick() {
            requestAnimationFrame(tick);
            if (!isVisible) return; // Skip offscreen frames

            var light = isLightMode();
            lights.update();
            lightRoot.visible = light;
            darkRoot.visible  = !light;

            var t    = clock.getElapsedTime();
            var prog = scrollProg('.client');
            var mX   = mouseX * 0.7;
            var mY   = mouseY * 0.45;

            if (light) {
                lightRoot.rotation.y += (-0.6 + prog * Math.PI * 2.4 + mX - lightRoot.rotation.y) * 0.08;
                lightRoot.rotation.x += ( 0.3 + Math.sin(prog * Math.PI) * 0.5 + mY - lightRoot.rotation.x) * 0.08;
                lightRoot.rotation.z += ( 0.2 + (prog - 0.5) * 0.6 - lightRoot.rotation.z) * 0.08;
                lightRoot.position.y  = Math.sin(t * 1.8) * 0.09;
            } else {
                darkRoot.rotation.y += (-0.5 + prog * Math.PI * 2.6 + mX * 1.3 - darkRoot.rotation.y) * 0.08;
                darkRoot.rotation.x += ( 0.35 + Math.sin(prog * Math.PI) * 0.6 + mY * 0.9 - darkRoot.rotation.x) * 0.08;
                darkRoot.rotation.z += ( 0.2 + Math.sin(t * 1.5) * 0.15 - darkRoot.rotation.z) * 0.08;
                darkRoot.position.y  = Math.sin(t * 2.2) * 0.12;
                lights.thunderPoint.intensity = 1.0 + Math.cos(t * 6.0) * 0.3;
            }

            renderer.render(scene, camera);
        }());
    }

    /* ── Setup Lazy Intersection Observers for Below-the-Fold Scenes ── */
    function setupLazyScenes() {
        // Observer for Focus Areas (.about_ido) with wide anticipatory margin
        var aboutTarget = document.querySelector('.about_ido');
        if (aboutTarget) {
            var aboutObs = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        initAboutScene();
                        initFocusWebScene();
                        aboutObs.disconnect();
                    }
                });
            }, { rootMargin: '1200px 0px 1200px 0px' });
            aboutObs.observe(aboutTarget);
        }

        // Observer for Projects Section (.client_list_3d or #work) with wide margin
        var projectsTarget = document.querySelector('.client_list_3d') || document.querySelector('#work');
        if (projectsTarget) {
            var projectsObs = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        initProjectsScene();
                        projectsObs.disconnect();
                    }
                });
            }, { rootMargin: '1200px 0px 1200px 0px' });
            projectsObs.observe(projectsTarget);
        }
    }

    /* ── Main Boot Sequence: Hero Immediately, Pre-cache Active Theme ── */
    function initController() {
        console.log('[SP3D] High-Performance Dual-Theme 3D Controller initialized.');
        // Priority 1: Hero Section immediate load
        sceneHero();

        // Priority 2: Pre-fetch active theme models so they appear instantly on scroll
        if (isLightMode()) {
            loadGLB('assets/glb/spider.glb');
            loadGLB('assets/glb/web.glb');
        } else {
            loadGLB('assets/glb/storm_breaker.glb');
            loadGLB('assets/glb/mjolnir_thors_hammer.glb');
        }

        // Priority 3: Below-the-fold scenes registered for smooth anticipatory loading
        setupLazyScenes();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }
})();
