/**
 * React Bits — Magnet Component Controller
 *
 * Implements magnetic attraction for buttons & interactive elements.
 */
(function () {
    'use strict';

    function makeMagnetic(el, strength) {
        strength = strength || 0.35;

        var bounds = null;

        el.addEventListener('mouseenter', function () {
            bounds = el.getBoundingClientRect();
            el.style.transition = 'transform 0.1s cubic-bezier(0.25, 1, 0.5, 1)';
        });

        el.addEventListener('mousemove', function (e) {
            if (!bounds) bounds = el.getBoundingClientRect();
            var centerX = bounds.left + bounds.width / 2;
            var centerY = bounds.top + bounds.height / 2;

            var deltaX = (e.clientX - centerX) * strength;
            var deltaY = (e.clientY - centerY) * strength;

            el.style.transform = 'translate(' + deltaX + 'px, ' + deltaY + 'px)';
        });

        el.addEventListener('mouseleave', function () {
            bounds = null;
            el.style.transition = 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)';
            el.style.transform = 'translate(0px, 0px)';
        });
    }

    function initMagneticButtons() {
        if (window.matchMedia && window.matchMedia('(hover: none) and (pointer: coarse)').matches) {
            return;
        }

        var targets = [
            '#js-theme_toggle',
            '#js-music_toggle',
            '#js-page-loading_start',
            '.cert-btn-prev',
            '.cert-btn-next',
            '.cert-btn-prev-red',
            '.cert-btn-next-red',
            '.js-magnetic'
        ];

        targets.forEach(function (sel) {
            var els = document.querySelectorAll(sel);
            els.forEach(function (el) {
                makeMagnetic(el, 0.35);
            });
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initMagneticButtons);
    } else {
        setTimeout(initMagneticButtons, 300);
    }

    window.Magnet = {
        attach: makeMagnetic,
        init: initMagneticButtons
    };

})();
