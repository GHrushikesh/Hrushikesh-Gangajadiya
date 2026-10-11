/**
 * React Bits — <RippleGrid /> Component (Vanilla WebGL Implementation)
 *
 * Renders an animated interactive ripple grid with mouse waves, exponential line glow,
 * radial distance fade, and dual-theme shading (Spidey Red / Charcoal in Light Mode, Electric Cyan in Dark Mode).
 *
 * Integrated into:
 *  - Journey Section (.work_bg)
 *  - My Motto Section (.motto_bg)
 */
(function () {
    'use strict';

    var vertShaderSource = [
        'attribute vec2 position;',
        'varying vec2 vUv;',
        'void main() {',
        '    vUv = position * 0.5 + 0.5;',
        '    gl_Position = vec4(position, 0.0, 1.0);',
        '}'
    ].join('\n');

    var fragShaderSource = [
        'precision highp float;',
        'uniform float iTime;',
        'uniform vec2 iResolution;',
        'uniform vec3 gridColor;',
        'uniform float rippleIntensity;',
        'uniform float gridSize;',
        'uniform float gridThickness;',
        'uniform float fadeDistance;',
        'uniform float vignetteStrength;',
        'uniform float glowIntensity;',
        'uniform float opacity;',
        'uniform float gridRotation;',
        'uniform bool mouseInteraction;',
        'uniform vec2 mousePosition;',
        'uniform float mouseInfluence;',
        'uniform float mouseInteractionRadius;',
        'uniform bool lightMode;',
        'varying vec2 vUv;',
        '',
        'float pi = 3.141592653589793;',
        '',
        'mat2 rotate(float angle) {',
        '    float s = sin(angle);',
        '    float c = cos(angle);',
        '    return mat2(c, -s, s, c);',
        '}',
        '',
        'void main() {',
        '    vec2 uv = vUv * 2.0 - 1.0;',
        '    uv.x *= iResolution.x / iResolution.y;',
        '',
        '    if (gridRotation != 0.0) {',
        '        uv = rotate(gridRotation * pi / 180.0) * uv;',
        '    }',
        '',
        '    float dist = length(uv);',
        '    float func = sin(pi * (iTime * 0.8 - dist * 1.2));',
        '    vec2 rippleUv = uv + uv * func * rippleIntensity;',
        '',
        '    if (mouseInteraction && mouseInfluence > 0.0) {',
        '        vec2 mouseUv = (mousePosition * 2.0 - 1.0);',
        '        mouseUv.x *= iResolution.x / iResolution.y;',
        '        float mouseDist = length(uv - mouseUv);',
        '        float influence = mouseInfluence * exp(-mouseDist * mouseDist / (mouseInteractionRadius * mouseInteractionRadius));',
        '        float mouseWave = sin(pi * (iTime * 2.2 - mouseDist * 3.5)) * influence;',
        '        rippleUv += normalize(uv - mouseUv + 0.0001) * mouseWave * rippleIntensity * 0.4;',
        '    }',
        '',
        '    vec2 a = sin(gridSize * 0.5 * pi * rippleUv - pi / 2.0);',
        '    vec2 b = abs(a);',
        '',
        '    float aaWidth = 0.5;',
        '    vec2 smoothB = vec2(',
        '        smoothstep(0.0, aaWidth, b.x),',
        '        smoothstep(0.0, aaWidth, b.y)',
        '    );',
        '',
        '    vec3 color = vec3(0.0);',
        '    color += exp(-gridThickness * smoothB.x * (0.8 + 0.5 * sin(pi * iTime * 0.5)));',
        '    color += exp(-gridThickness * smoothB.y);',
        '    color += 0.5 * exp(-(gridThickness / 4.0) * sin(smoothB.x));',
        '    color += 0.5 * exp(-(gridThickness / 3.0) * smoothB.y);',
        '',
        '    if (glowIntensity > 0.0) {',
        '        color += glowIntensity * exp(-gridThickness * 0.5 * smoothB.x);',
        '        color += glowIntensity * exp(-gridThickness * 0.5 * smoothB.y);',
        '    }',
        '',
        '    float ddd = exp(-1.8 * clamp(pow(dist, fadeDistance), 0.0, 1.0));',
        '',
        '    vec2 vignetteCoords = vUv - 0.5;',
        '    float vignetteDistance = length(vignetteCoords);',
        '    float vignette = 1.0 - pow(vignetteDistance * 2.0, vignetteStrength);',
        '    vignette = clamp(vignette, 0.0, 1.0);',
        '',
        '    vec3 t = gridColor;',
        '    float finalFade = ddd * vignette;',
        '    float alpha = length(color) * finalFade * opacity;',
        '    vec3 effect = color * t * finalFade * opacity;',
        '',
        '    if (lightMode) {',
        '        float peak = max(effect.r, max(effect.g, effect.b));',
        '        vec3 chroma = pow(clamp(effect / max(peak, 0.0001), 0.0, 1.0), vec3(1.2));',
        '        vec3 baseOffWhite = vec3(1.0, 1.0, 0.894);', // #FFFFE4
        '        gl_FragColor = vec4(mix(baseOffWhite, chroma, clamp(alpha * 0.75, 0.0, 0.85)), alpha * 0.8);',
        '    } else {',
        '        gl_FragColor = vec4(effect, alpha);',
        '    }',
        '}'
    ].join('\n');

    function createShader(gl, type, source) {
        var shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.warn('[RippleGrid] Shader error:', gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
            return null;
        }
        return shader;
    }

    function createProgram(gl, vsSource, fsSource) {
        var vs = createShader(gl, gl.VERTEX_SHADER, vsSource);
        var fs = createShader(gl, gl.FRAGMENT_SHADER, fsSource);
        var program = gl.createProgram();
        gl.attachShader(program, vs);
        gl.attachShader(program, fs);
        gl.linkProgram(program);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.warn('[RippleGrid] Program link error:', gl.getProgramInfoLog(program));
            return null;
        }
        return program;
    }

    function hexToRgb(hex) {
        var m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return m ? [parseInt(m[1], 16) / 255, parseInt(m[2], 16) / 255, parseInt(m[3], 16) / 255] : [1, 1, 1];
    }

    function isLight() {
        return document.documentElement.getAttribute('data-theme') === 'light';
    }

    function createRippleGridInstance(container, options) {
        if (!container) return;

        options = options || {};
        var gridSize = options.gridSize || 10.0;
        var gridThickness = options.gridThickness || 15.0;
        var rippleIntensity = options.rippleIntensity || 0.06;
        var fadeDistance = options.fadeDistance || 1.5;
        var vignetteStrength = options.vignetteStrength || 2.0;
        var glowIntensity = options.glowIntensity || 0.15;
        var opacity = options.opacity || 0.85;
        var gridRotation = options.gridRotation || 0;

        var canvas = document.createElement('canvas');
        canvas.className = 'ripple-grid-canvas';
        canvas.style.cssText = [
            'position: absolute',
            'top: 0',
            'left: 0',
            'width: 100%',
            'height: 100%',
            'pointer-events: none',
            'z-index: 1',
            'display: block'
        ].join(';');

        container.style.position = 'relative';
        container.insertBefore(canvas, container.firstChild);

        var gl = canvas.getContext('webgl', { alpha: true, antialias: true, powerPreference: 'low-power' });
        if (!gl) return;

        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

        var program = createProgram(gl, vertShaderSource, fragShaderSource);
        if (!program) return;

        // Quad geometry
        var positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
            -1, -1,
             1, -1,
            -1,  1,
            -1,  1,
             1, -1,
             1,  1
        ]), gl.STATIC_DRAW);

        var posAttr = gl.getAttribLocation(program, 'position');
        gl.enableVertexAttribArray(posAttr);
        gl.vertexAttribPointer(posAttr, 2, gl.FLOAT, false, 0, 0);

        // Uniform Locations
        var uTime = gl.getUniformLocation(program, 'iTime');
        var uRes = gl.getUniformLocation(program, 'iResolution');
        var uGridColor = gl.getUniformLocation(program, 'gridColor');
        var uRippleIntensity = gl.getUniformLocation(program, 'rippleIntensity');
        var uGridSize = gl.getUniformLocation(program, 'gridSize');
        var uGridThickness = gl.getUniformLocation(program, 'gridThickness');
        var uFadeDistance = gl.getUniformLocation(program, 'fadeDistance');
        var uVignetteStrength = gl.getUniformLocation(program, 'vignetteStrength');
        var uGlowIntensity = gl.getUniformLocation(program, 'glowIntensity');
        var uOpacity = gl.getUniformLocation(program, 'opacity');
        var uGridRotation = gl.getUniformLocation(program, 'gridRotation');
        var uMouseInteraction = gl.getUniformLocation(program, 'mouseInteraction');
        var uMousePosition = gl.getUniformLocation(program, 'mousePosition');
        var uMouseInfluence = gl.getUniformLocation(program, 'mouseInfluence');
        var uMouseInteractionRadius = gl.getUniformLocation(program, 'mouseInteractionRadius');
        var uLightMode = gl.getUniformLocation(program, 'lightMode');

        var mousePos = { x: 0.5, y: 0.5 };
        var targetMouse = { x: 0.5, y: 0.5 };
        var mouseInfluence = 0.0;
        var targetInfluence = 0.0;

        var isMobile = /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent) || window.innerWidth < 768;

        function resize() {
            var w = container.clientWidth || window.innerWidth;
            var h = container.clientHeight || 500;
            var isMob = /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent) || window.innerWidth < 768;
            var dpr = isMob ? 1.0 : Math.min(window.devicePixelRatio || 1, 1.5);
            canvas.width = Math.round(w * dpr);
            canvas.height = Math.round(h * dpr);
            gl.viewport(0, 0, canvas.width, canvas.height);
        }
        resize();
        window.addEventListener('resize', resize, { passive: true });

        // Track mouse / touch over section
        function updatePointer(clientX, clientY) {
            var rect = container.getBoundingClientRect();
            if (clientX >= rect.left && clientX <= rect.right &&
                clientY >= rect.top && clientY <= rect.bottom) {
                targetMouse.x = (clientX - rect.left) / rect.width;
                targetMouse.y = 1.0 - (clientY - rect.top) / rect.height;
                targetInfluence = 1.0;
            } else {
                targetInfluence = 0.0;
            }
        }

        window.addEventListener('mousemove', function (e) {
            updatePointer(e.clientX, e.clientY);
        }, { passive: true });

        window.addEventListener('touchmove', function (e) {
            if (e.touches && e.touches[0]) {
                updatePointer(e.touches[0].clientX, e.touches[0].clientY);
            }
        }, { passive: true });

        window.addEventListener('touchend', function () {
            targetInfluence = 0.0;
        }, { passive: true });

        var startTime = performance.now();
        var isVisible = true;

        var observer = new IntersectionObserver(function (entries) {
            isVisible = entries[0].isIntersecting;
        }, { threshold: 0.05 });
        observer.observe(container);

        function render(t) {
            requestAnimationFrame(render);
            if (!isVisible) return;

            var time = (t - startTime) * 0.001;
            var light = isLight();

            // Lerp mouse
            mousePos.x += (targetMouse.x - mousePos.x) * 0.1;
            mousePos.y += (targetMouse.y - mousePos.y) * 0.1;
            mouseInfluence += (targetInfluence - mouseInfluence) * 0.06;

            gl.useProgram(program);

            var colorHex = light ? '#E60012' : '#00D2FF';
            var rgb = hexToRgb(colorHex);

            gl.uniform1f(uTime, time);
            gl.uniform2f(uRes, canvas.width, canvas.height);
            gl.uniform3f(uGridColor, rgb[0], rgb[1], rgb[2]);
            gl.uniform1f(uRippleIntensity, rippleIntensity);
            gl.uniform1f(uGridSize, gridSize);
            gl.uniform1f(uGridThickness, gridThickness);
            gl.uniform1f(uFadeDistance, fadeDistance);
            gl.uniform1f(uVignetteStrength, vignetteStrength);
            gl.uniform1f(uGlowIntensity, glowIntensity);
            gl.uniform1f(uOpacity, opacity);
            gl.uniform1f(uGridRotation, gridRotation);
            gl.uniform1i(uMouseInteraction, 1);
            gl.uniform2f(uMousePosition, mousePos.x, mousePos.y);
            gl.uniform1f(uMouseInfluence, mouseInfluence);
            gl.uniform1f(uMouseInteractionRadius, 1.0);
            gl.uniform1i(uLightMode, light ? 1 : 0);

            gl.drawArrays(gl.TRIANGLES, 0, 6);
        }

        requestAnimationFrame(render);
    }

    function initAllRippleGrids() {
        // 1. Journey Section Background (.work_bg)
        var journeyBg = document.querySelector('.work_bg') || document.querySelector('.work');
        if (journeyBg) {
            createRippleGridInstance(journeyBg, {
                gridSize: 11.0,
                gridThickness: 14.0,
                rippleIntensity: 0.055,
                glowIntensity: 0.2,
                opacity: 0.85
            });
        }

        // 2. My Motto Section Background (.motto_bg)
        var mottoBg = document.querySelector('.motto_bg') || document.querySelector('.motto');
        if (mottoBg) {
            createRippleGridInstance(mottoBg, {
                gridSize: 10.0,
                gridThickness: 15.0,
                rippleIntensity: 0.06,
                glowIntensity: 0.25,
                opacity: 0.9
            });
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAllRippleGrids);
    } else {
        setTimeout(initAllRippleGrids, 400);
    }

})();
