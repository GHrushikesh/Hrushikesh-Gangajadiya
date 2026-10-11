/**
 * React Bits — Spider Lanyard Component (Placed in Marked Zone)
 *
 * Positions the hanging 3D spider in the upper-left open hero area (marked zone).
 * Full-screen 360-degree dragging with Catmull-Rom silk rope physics.
 * Active in Light Mode; smoothly hidden and culled in Dark Mode.
 */
(function () {
    'use strict';

    function initSpiderLanyard() {
        if (typeof THREE === 'undefined' || typeof THREE.GLTFLoader === 'undefined') {
            setTimeout(initSpiderLanyard, 80);
            return;
        }

        var host = document.getElementById('spider-lanyard-wrap');
        if (!host) {
            host = document.createElement('div');
            host.id = 'spider-lanyard-wrap';
            document.body.appendChild(host);
        }

        host.style.cssText = [
            'position: fixed',
            'top: 0',
            'left: 0',
            'width: 100vw',
            'height: 100vh',
            'z-index: 50',
            'pointer-events: none',
            'display: block',
            'transition: opacity 0.4s ease'
        ].join(';');

        var w = window.innerWidth;
        var h = window.innerHeight;

        var isMobile = /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent) || window.innerWidth < 768;

        var scene = new THREE.Scene();
        var camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 1000);
        camera.position.set(0, 0, 10);

        var renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
        renderer.setPixelRatio(isMobile ? 1.0 : Math.min(window.devicePixelRatio || 1, 1.5));
        renderer.setSize(w, h);
        renderer.outputEncoding = THREE.sRGBEncoding;
        renderer.domElement.style.cssText = 'width: 100%; height: 100%; display: block; pointer-events: none;';
        host.innerHTML = '';
        host.appendChild(renderer.domElement);

        // Lighting
        var ambLight = new THREE.AmbientLight(0xffffff, 2.8);
        scene.add(ambLight);

        var dirLight = new THREE.DirectionalLight(0xffffff, 3.6);
        dirLight.position.set(5, 8, 7);
        scene.add(dirLight);

        var fillLight = new THREE.DirectionalLight(0xe2e8f0, 2.2);
        fillLight.position.set(-5, 2, 3);
        scene.add(fillLight);

        function screenToWorld(px, py) {
            var normX = (px / w) * 2 - 1;
            var normY = -(py / h) * 2 + 1;
            var vec = new THREE.Vector3(normX, normY, 0.5);
            vec.unproject(camera);
            var dir = vec.sub(camera.position).normalize();
            var dist = -camera.position.z / dir.z;
            return camera.position.clone().add(dir.multiplyScalar(dist));
        }

        function getHomePos() {
            var isMob = w < 768;
            var targetX = isMob ? Math.max(65, w * 0.22) : Math.max(170, w * 0.23);
            var targetY = isMob ? Math.max(105, h * 0.22) : Math.max(170, h * 0.32);

            return {
                anchor: screenToWorld(targetX, 0),
                spider: screenToWorld(targetX, targetY)
            };
        }

        var home = getHomePos();

        // Silk Web Thread Line
        var lineGeo = new THREE.BufferGeometry();
        var lineMat = new THREE.LineBasicMaterial({
            color: 0x14161D,
            transparent: true,
            opacity: 0.92,
            linewidth: 2.5
        });
        var threadLine = new THREE.Line(lineGeo, lineMat);
        scene.add(threadLine);

        // Spider Mesh Container
        var spiderGroup = new THREE.Group();
        spiderGroup.position.copy(home.spider);
        scene.add(spiderGroup);

        var isModelReady = false;
        threadLine.visible = false;
        spiderGroup.visible = false;

        function isLight() {
            return document.documentElement.getAttribute('data-theme') === 'light';
        }

        var spiderLoaded = false;
        function loadSpiderModel() {
            if (!isLight() || spiderLoaded) return;
            spiderLoaded = true;

            var loadPromise = window.PortfolioGLBLoader
                ? window.PortfolioGLBLoader.load('assets/glb/spider.glb')
                : new Promise(function (resolve, reject) {
                    var l = new THREE.GLTFLoader();
                    if (typeof MeshoptDecoder !== 'undefined') l.setMeshoptDecoder(MeshoptDecoder);
                    l.load('assets/glb/spider.glb', function (gltf) { resolve(gltf.scene); }, undefined, function () {
                        l.load('spider.glb', function (gltf2) { resolve(gltf2.scene); }, undefined, reject);
                    });
                });

            loadPromise.then(function (model) {
                model.traverse(function (c) {
                    if (c.isMesh && c.material) {
                        c.material.color = new THREE.Color(0x11131a);
                        c.material.metalness = 0.88;
                        c.material.roughness = 0.22;
                        c.material.transparent = false;
                    }
                });

                var box = new THREE.Box3().setFromObject(model);
                var center = box.getCenter(new THREE.Vector3());
                var size = box.getSize(new THREE.Vector3());
                var maxDim = Math.max(size.x, size.y, size.z) || 1;
                var targetWorldSize = 1.1;
                var sc = targetWorldSize / maxDim;

                model.scale.setScalar(sc);
                model.position.set(-center.x * sc, -center.y * sc - 0.15, -center.z * sc);
                model.rotation.x = Math.PI * 0.45;
                spiderGroup.add(model);

                isModelReady = true;
                threadLine.visible = true;
                spiderGroup.visible = true;
                if (isLight()) {
                    host.style.opacity = '1';
                }
            }).catch(function (err) {
                console.warn('[SpiderLanyard] Error loading spider.glb:', err);
            });
        }

        if (isLight()) {
            loadSpiderModel();
        }
        window.addEventListener('themechange', loadSpiderModel);

        // ── Physics Simulation State ──
        var spiderPos = home.spider.clone();
        var spiderVel = new THREE.Vector3();
        var isDragging = false;
        var mouseScreenX = w * 0.23, mouseScreenY = h * 0.32;
        var dragOffset = new THREE.Vector3();

        function updateVisibility() {
            if (isLight() && isModelReady) {
                host.style.opacity = '1';
                loadSpiderModel();
            } else {
                host.style.opacity = '0';
            }
        }
        window.addEventListener('themechange', updateVisibility);
        updateVisibility();

        function resize() {
            w = window.innerWidth;
            h = window.innerHeight;
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            renderer.setSize(w, h);
            home = getHomePos();
        }
        window.addEventListener('resize', resize, { passive: true });

        // Hit Detection Helper (in screen pixel radius)
        function isPointerOverSpider(clientX, clientY) {
            if (!isModelReady) return false;
            var screenPos = spiderPos.clone().project(camera);
            var sx = (screenPos.x * 0.5 + 0.5) * w;
            var sy = (-(screenPos.y * 0.5) + 0.5) * h;
            var dist = Math.hypot(clientX - sx, clientY - sy);
            var hitRadius = isMobile ? 105 : 85;
            return dist < hitRadius;
        }

        // Pointer Events for 360-degree dragging across entire window
        window.addEventListener('mousemove', function (e) {
            if (!isLight() || !isModelReady) return;
            mouseScreenX = e.clientX;
            mouseScreenY = e.clientY;

            if (isDragging) {
                document.body.style.cursor = 'grabbing';
            } else {
                if (isPointerOverSpider(e.clientX, e.clientY)) {
                    document.body.style.cursor = 'grab';
                }
            }
        }, { passive: true });

        window.addEventListener('mousedown', function (e) {
            if (!isLight() || !isModelReady) return;
            if (isPointerOverSpider(e.clientX, e.clientY)) {
                isDragging = true;
                document.body.style.cursor = 'grabbing';
                var curWorld = screenToWorld(e.clientX, e.clientY);
                dragOffset.copy(spiderPos).sub(curWorld);
            }
        });

        window.addEventListener('mouseup', function () {
            if (isDragging) {
                isDragging = false;
                document.body.style.cursor = 'auto';
            }
        });

        // Touch events for mobile drag
        window.addEventListener('touchstart', function (e) {
            if (!isLight() || !isModelReady || !e.touches || !e.touches[0]) return;
            var t = e.touches[0];
            if (isPointerOverSpider(t.clientX, t.clientY)) {
                isDragging = true;
                mouseScreenX = t.clientX;
                mouseScreenY = t.clientY;
                var curWorld = screenToWorld(t.clientX, t.clientY);
                dragOffset.copy(spiderPos).sub(curWorld);
                if (e.cancelable) e.preventDefault();
            }
        }, { passive: false });

        window.addEventListener('touchmove', function (e) {
            if (!isLight() || !isDragging || !e.touches || !e.touches[0]) return;
            mouseScreenX = e.touches[0].clientX;
            mouseScreenY = e.touches[0].clientY;
            if (e.cancelable) e.preventDefault();
        }, { passive: false });

        window.addEventListener('touchend', function () {
            isDragging = false;
        });

        // ── Main Physics & Render Loop ──
        var clock = new THREE.Clock();
        var springStiffness = 28.0;
        var damping = 0.93;

        (function animate() {
            requestAnimationFrame(animate);

            // Complete culling if Dark Mode is active or model not ready
            if (!isLight() || !isModelReady) {
                host.style.opacity = '0';
                return;
            }

            var scrollY = window.pageYOffset || document.documentElement.scrollTop || 0;
            var heroFade = Math.max(0, 1 - scrollY / 450);
            host.style.opacity = heroFade.toFixed(2);
            if (heroFade <= 0.02) return; // Complete culling when scrolled past hero

            var dt = Math.min(clock.getDelta(), 0.032);
            var time = clock.getElapsedTime();

            home = getHomePos();

            if (isDragging) {
                var targetPos = screenToWorld(mouseScreenX, mouseScreenY).add(dragOffset);
                spiderVel.copy(targetPos).sub(spiderPos).multiplyScalar(22);
                spiderPos.copy(targetPos);
            } else {
                var breeze = new THREE.Vector3(
                    Math.sin(time * 1.6) * 0.07 + Math.cos(time * 2.5) * 0.03,
                    Math.cos(time * 1.3) * 0.04,
                    Math.sin(time * 2.0) * 0.05
                );

                var displacement = spiderPos.clone().sub(home.spider);
                var springForce = displacement.multiplyScalar(-springStiffness);
                var gravityForce = new THREE.Vector3(0, -6.5, 0);

                spiderVel.addScaledVector(springForce.add(gravityForce).add(breeze), dt);
                spiderVel.multiplyScalar(damping);
                spiderPos.addScaledVector(spiderVel, dt);
            }

            spiderGroup.position.copy(spiderPos);

            var anchor = home.anchor;
            var mid = anchor.clone().add(spiderPos).multiplyScalar(0.5);
            mid.y -= 0.18;
            mid.x += (spiderPos.x - anchor.x) * 0.12;

            var threadCurve = new THREE.CatmullRomCurve3([anchor, mid, spiderPos]);
            var points = threadCurve.getPoints(24);
            lineGeo.setFromPoints(points);

            var tiltZ = (spiderVel.x * 0.12);
            var tiltX = (spiderVel.y * 0.08);
            spiderGroup.rotation.z = Math.max(-0.6, Math.min(0.6, tiltZ));
            spiderGroup.rotation.x = Math.max(-0.4, Math.min(0.8, Math.PI * 0.45 + tiltX));
            spiderGroup.rotation.y = Math.sin(time * 2.2) * 0.14;

            renderer.render(scene, camera);
        })();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initSpiderLanyard);
    } else {
        initSpiderLanyard();
    }
})();
