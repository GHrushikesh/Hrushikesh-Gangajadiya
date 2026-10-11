/**
 * React Bits — DecryptedText Component Controller
 *
 * Cycles random glyphs with futuristic cyberpunk decryption
 * Applied selectively to user name & contact/about headings.
 */
(function () {
    'use strict';

    var CHARACTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';

    function decryptElement(el, options) {
        if (el.dataset.decrypting === 'true') return;
        el.dataset.decrypting = 'true';

        var originalText = el.dataset.originalText || el.textContent.trim();
        el.dataset.originalText = originalText;

        options = options || {};
        var speed = options.speed || 35; // ms per frame
        var maxIterations = options.maxIterations || 14;
        var iteration = 0;

        var interval = setInterval(function () {
            var displayed = '';
            for (var i = 0; i < originalText.length; i++) {
                if (originalText[i] === ' ' || originalText[i] === '\n') {
                    displayed += originalText[i];
                    continue;
                }

                if (i < Math.floor((iteration / maxIterations) * originalText.length)) {
                    displayed += originalText[i];
                } else {
                    displayed += CHARACTERS[Math.floor(Math.random() * CHARACTERS.length)];
                }
            }

            el.textContent = displayed;
            iteration++;

            if (iteration > maxIterations) {
                clearInterval(interval);
                el.textContent = originalText;
                el.dataset.decrypting = 'false';
            }
        }, speed);
    }

    function initDecryptedText() {
        // Specific selectors: User Name in Hero, Motto Author, Contact Label, About Label
        var targets = [
            '.hero_content_inner_subtitle',
            '.motto_content_inner .desc',
            '.contact_label',
            '.about_content_label',
            '.client_content_label',
            '.js-decrypted-text'
        ];

        targets.forEach(function (sel) {
            var els = document.querySelectorAll(sel);
            els.forEach(function (el) {
                if (!el.dataset.originalText) {
                    el.dataset.originalText = el.textContent.trim();
                }

                // Decrypt on hover
                el.addEventListener('mouseenter', function () {
                    decryptElement(el, { speed: 30, maxIterations: 12 });
                });

                // Decrypt on intersection (when scrolled into view)
                if ('IntersectionObserver' in window) {
                    var observer = new IntersectionObserver(function (entries) {
                        entries.forEach(function (entry) {
                            if (entry.isIntersecting) {
                                decryptElement(el, { speed: 35, maxIterations: 14 });
                            }
                        });
                    }, { threshold: 0.5 });
                    observer.observe(el);
                }
            });
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initDecryptedText);
    } else {
        setTimeout(initDecryptedText, 300);
    }

    window.DecryptedText = {
        decrypt: decryptElement,
        init: initDecryptedText
    };

})();
