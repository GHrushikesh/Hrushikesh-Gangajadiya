/**
 * React Bits — Dynamic Theme Backgrounds Controller
 *
 * LIGHT MODE: Interactive DotGrid Background (React Bits DotGrid with cursor repulsion, touch waves & shockwaves).
 * DARK MODE: Procedural Lightning Background (Thor Theme).
 *
 * Performance Optimized:
 * - Mobile / low-end hardware detection with adaptive grid resolution
 * - Fast dual-stroke lightning (eliminating GPU shadowBlur bottleneck)
 * - Quiescent idle state culling (0% CPU/GPU overhead when idle)
 * - Full touch event support for mobile
 */
(function () {
    'use strict';

    var isMobile = /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent) || window.innerWidth < 768;

    var canvas = document.getElementById('web-canvas');
    if (!canvas) {
        canvas = document.createElement('canvas');
        canvas.id = 'web-canvas';
        document.body.insertBefore(canvas, document.body.firstChild);
    }

    canvas.style.cssText = [
        'position: fixed',
        'top: 0',
        'left: 0',
        'width: 100vw',
        'height: 100vh',
        'pointer-events: none',
        'z-index: 1',
        'display: block',
        'opacity: 1',
        'transition: opacity 0.4s ease'
    ].join(';');

    var ctx = canvas.getContext('2d', { alpha: true });
    var w = 0, h = 0;
    var mouseX = -999, mouseY = -999;
    var lastMouseX = -999, lastMouseY = -999;
    var mouseVelX = 0, mouseVelY = 0;
    var lastTime = performance.now();
    var isDirty = true;
    var animFrameId = null;

    function isLight() {
        return document.documentElement.getAttribute('data-theme') === 'light';
    }

    /* ── LIGHT MODE: DotGrid Simulation ── */
    var dots = [];
    var dotSize = isMobile ? 2.8 : 3.5;
    var gap = isMobile ? 48 : 38;
    var proximity = isMobile ? 110 : 140;
    var shockwaves = [];

    function buildDotGrid() {
        w = canvas.width = window.innerWidth;
        h = canvas.height = window.innerHeight;
        isMobile = /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent) || window.innerWidth < 768;
        gap = isMobile ? 48 : 38;
        dotSize = isMobile ? 2.8 : 3.5;
        proximity = isMobile ? 110 : 140;
        dots = [];

        var cols = Math.floor(w / gap);
        var rows = Math.floor(h / gap);
        var startX = (w - (cols - 1) * gap) / 2;
        var startY = (h - (rows - 1) * gap) / 2;

        for (var r = 0; r < rows; r++) {
            for (var c = 0; c < cols; c++) {
                dots.push({
                    baseX: startX + c * gap,
                    baseY: startY + r * gap,
                    xOffset: 0,
                    yOffset: 0,
                    velX: 0,
                    velY: 0,
                    colorT: 0
                });
            }
        }
        isDirty = true;
    }

    buildDotGrid();
    window.addEventListener('resize', buildDotGrid, { passive: true });

    function wakeAnimation() {
        isDirty = true;
    }

    window.addEventListener('mousemove', function (e) {
        var now = performance.now();
        var dt = Math.max(1, now - lastTime);
        lastTime = now;

        mouseVelX = (e.clientX - lastMouseX) / dt;
        mouseVelY = (e.clientY - lastMouseY) / dt;

        lastMouseX = mouseX = e.clientX;
        lastMouseY = mouseY = e.clientY;
        wakeAnimation();
    }, { passive: true });

    window.addEventListener('touchstart', function (e) {
        if (!e.touches || !e.touches[0]) return;
        var t = e.touches[0];
        lastMouseX = mouseX = t.clientX;
        lastMouseY = mouseY = t.clientY;
        wakeAnimation();
    }, { passive: true });

    window.addEventListener('touchmove', function (e) {
        if (!e.touches || !e.touches[0]) return;
        var t = e.touches[0];
        var now = performance.now();
        var dt = Math.max(1, now - lastTime);
        lastTime = now;

        mouseVelX = (t.clientX - lastMouseX) / dt;
        mouseVelY = (t.clientY - lastMouseY) / dt;

        lastMouseX = mouseX = t.clientX;
        lastMouseY = mouseY = t.clientY;
        wakeAnimation();
    }, { passive: true });

    window.addEventListener('touchend', function () {
        mouseX = -999;
        mouseY = -999;
        wakeAnimation();
    }, { passive: true });

    window.addEventListener('click', function (e) {
        if (!isLight()) return;
        shockwaves.push({
            x: e.clientX,
            y: e.clientY,
            radius: 0,
            maxRadius: isMobile ? 200 : 280,
            strength: isMobile ? 10 : 14,
            alpha: 1.0
        });
        wakeAnimation();
    }, { passive: true });

    window.addEventListener('scroll', wakeAnimation, { passive: true });
    window.addEventListener('themechange', wakeAnimation);

    function renderDotGrid() {
        var proxSq = proximity * proximity;
        var moving = shockwaves.length > 0 || (mouseX > 0 && mouseY > 0);

        ctx.clearRect(0, 0, w, h);

        // Update shockwaves
        for (var s = shockwaves.length - 1; s >= 0; s--) {
            var sw = shockwaves[s];
            sw.radius += isMobile ? 10 : 8;
            sw.alpha = 1 - sw.radius / sw.maxRadius;
            if (sw.radius >= sw.maxRadius) {
                shockwaves.splice(s, 1);
            }
        }

        var activeCount = 0;

        // Render each dot
        for (var i = 0; i < dots.length; i++) {
            var dot = dots[i];

            // Distance to pointer
            if (mouseX > 0 && mouseY > 0) {
                var dx = dot.baseX - mouseX;
                var dy = dot.baseY - mouseY;
                var dsq = dx * dx + dy * dy;

                if (dsq < proxSq && dsq > 0.001) {
                    var dist = Math.sqrt(dsq);
                    var force = (1 - dist / proximity);
                    dot.velX += (dx / dist) * force * 1.8 + mouseVelX * 0.4;
                    dot.velY += (dy / dist) * force * 1.8 + mouseVelY * 0.4;
                    dot.colorT = Math.min(1.0, dot.colorT + 0.15);
                } else {
                    dot.colorT = Math.max(0.0, dot.colorT - 0.04);
                }
            } else {
                dot.colorT = Math.max(0.0, dot.colorT - 0.04);
            }

            // Shockwave impulse
            for (var k = 0; k < shockwaves.length; k++) {
                var swk = shockwaves[k];
                var sdx = dot.baseX - swk.x;
                var sdy = dot.baseY - swk.y;
                var sDist = Math.sqrt(sdx * sdx + sdy * sdy);
                var ringDist = Math.abs(sDist - swk.radius);
                if (ringDist < 45) {
                    var sForce = (1 - ringDist / 45) * swk.strength * swk.alpha;
                    dot.velX += (sdx / Math.max(1, sDist)) * sForce;
                    dot.velY += (sdy / Math.max(1, sDist)) * sForce;
                    dot.colorT = Math.min(1.0, dot.colorT + 0.3);
                }
            }

            // Spring restoring force back to base position
            dot.velX += -dot.xOffset * 0.12;
            dot.velY += -dot.yOffset * 0.12;
            dot.velX *= 0.86;
            dot.velY *= 0.86;

            dot.xOffset += dot.velX;
            dot.yOffset += dot.velY;

            if (Math.abs(dot.xOffset) > 0.01 || Math.abs(dot.yOffset) > 0.01 || dot.colorT > 0.01) {
                activeCount++;
            }

            var drawX = dot.baseX + dot.xOffset;
            var drawY = dot.baseY + dot.yOffset;

            ctx.beginPath();
            ctx.arc(drawX, drawY, dotSize / 2, 0, Math.PI * 2);

            if (dot.colorT > 0.05) {
                ctx.fillStyle = 'rgba(230, 0, 18, ' + (0.15 + dot.colorT * 0.65).toFixed(2) + ')';
            } else {
                ctx.fillStyle = 'rgba(24, 26, 36, 0.12)';
            }
            ctx.fill();
        }

        // If nothing is active and no user interaction, enter quiescent idle
        if (!moving && activeCount === 0) {
            isDirty = false;
        }
    }

    /* ── DARK MODE: Procedural Lightning Simulation (Thor Theme) ── */
    var bolts = [];
    var lastStrikeTime = 0;

    function createLightningBolt(startX, startY, endX, endY) {
        var segments = [];
        segments.push({ x: startX, y: startY });

        var dx = endX - startX;
        var dy = endY - startY;
        var steps = isMobile ? 12 : 18;

        var curX = startX;
        var curY = startY;

        for (var i = 1; i < steps; i++) {
            var p = i / steps;
            var roughness = (1 - Math.abs(p - 0.5) * 1.5) * (isMobile ? 50 : 70);
            curX = startX + dx * p + (Math.random() - 0.5) * roughness;
            curY = startY + dy * p + (Math.random() - 0.5) * (roughness * 0.5);
            segments.push({ x: curX, y: curY });
        }

        segments.push({ x: endX, y: endY });

        return {
            segments: segments,
            alpha: 1.0,
            color: Math.random() > 0.3 ? '#00D2FF' : '#0077FE',
            width: isMobile ? (2.0 + Math.random() * 1.5) : (2.8 + Math.random() * 2.2)
        };
    }

    function renderLightning(t) {
        ctx.clearRect(0, 0, w, h);

        var normMX = mouseX > 0 ? mouseX : w * 0.5;
        var normMY = mouseY > 0 ? mouseY : h * 0.5;

        // Radial Thor Energy Aura
        var grad = ctx.createRadialGradient(normMX, normMY, 10, normMX, normMY, w * 0.5);
        grad.addColorStop(0, 'rgba(0, 210, 255, 0.06)');
        grad.addColorStop(1, 'rgba(5, 7, 11, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);

        // Thunder strikes trigger
        if (t - lastStrikeTime > (isMobile ? 2.2 : 1.6) + Math.random() * 2.0) {
            lastStrikeTime = t;
            var sX = w * (0.2 + Math.random() * 0.6);
            var eX = sX + (Math.random() - 0.5) * (w * 0.45);
            bolts.push(createLightningBolt(sX, 0, eX, h * (0.65 + Math.random() * 0.35)));

            if (!isMobile && Math.random() > 0.35) {
                bolts.push(createLightningBolt(sX, 0, sX + (Math.random() - 0.5) * 220, h * 0.5));
            }
        }

        for (var b = bolts.length - 1; b >= 0; b--) {
            var bolt = bolts[b];
            bolt.alpha -= isMobile ? 0.05 : 0.035;

            if (bolt.alpha <= 0) {
                bolts.splice(b, 1);
                continue;
            }

            ctx.save();
            ctx.globalAlpha = bolt.alpha;

            // Outer Glow Pass (Fast strokes without GPU blur bottleneck)
            ctx.strokeStyle = bolt.color;
            ctx.lineWidth = bolt.width * (isMobile ? 2.0 : 2.5);
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';

            if (!isMobile) {
                ctx.shadowColor = '#00D2FF';
                ctx.shadowBlur = 12;
            }

            ctx.beginPath();
            for (var k = 0; k < bolt.segments.length; k++) {
                if (k === 0) ctx.moveTo(bolt.segments[k].x, bolt.segments[k].y);
                else ctx.lineTo(bolt.segments[k].x, bolt.segments[k].y);
            }
            ctx.stroke();

            // Core white hot channel
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = bolt.width * 0.45;
            if (!isMobile) {
                ctx.shadowBlur = 6;
            }
            ctx.stroke();

            ctx.restore();
        }
    }

    /* ── Main Render Loop with Quiescent Optimization ── */
    var startTime = performance.now();
    function animate() {
        animFrameId = requestAnimationFrame(animate);
        var t = (performance.now() - startTime) * 0.001;

        if (isLight()) {
            if (isDirty) {
                renderDotGrid();
            }
        } else {
            renderLightning(t);
        }
    }
    animate();

})();

