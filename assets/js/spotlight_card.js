/**
 * React Bits — SpotlightCard Component Controller
 *
 * Casts a cursor-following radial spotlight beam across cards.
 * Dark Mode: Electric Cyan beam (#00D2FF)
 * Light Mode: Crimson Red beam (#E60012)
 */
(function () {
    'use strict';

    function initSpotlightCards() {
        var cardSelectors = [
            '.certificate_item',
            '.contact_box',
            '.cert-card',
            '.spotlight-card',
            '.work_item'
        ];

        var cards = document.querySelectorAll(cardSelectors.join(','));

        cards.forEach(function (card) {
            card.classList.add('spotlight-card');

            card.addEventListener('mousemove', function (e) {
                var rect = card.getBoundingClientRect();
                var x = e.clientX - rect.left;
                var y = e.clientY - rect.top;

                card.style.setProperty('--mouse-x', x + 'px');
                card.style.setProperty('--mouse-y', y + 'px');
            });
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initSpotlightCards);
    } else {
        setTimeout(initSpotlightCards, 300);
    }

    window.SpotlightCard = {
        init: initSpotlightCards
    };

})();
