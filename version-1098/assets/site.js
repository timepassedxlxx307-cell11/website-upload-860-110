(function () {
    const menuButton = document.querySelector('[data-menu-toggle]');
    const mobileNav = document.querySelector('[data-mobile-nav]');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    const slides = Array.from(document.querySelectorAll('[data-hero-slide]'));
    const dotButtons = Array.from(document.querySelectorAll('[data-hero-dot]'));
    let currentSlide = 0;

    function activateSlide(index) {
        if (!slides.length) {
            return;
        }
        currentSlide = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('is-active', slideIndex === currentSlide);
        });
        dotButtons.forEach(function (button, buttonIndex) {
            button.classList.toggle('is-active', buttonIndex === currentSlide);
        });
    }

    dotButtons.forEach(function (button, index) {
        button.addEventListener('click', function () {
            activateSlide(index);
        });
    });

    if (slides.length > 1) {
        window.setInterval(function () {
            activateSlide(currentSlide + 1);
        }, 5200);
    }

    const forms = Array.from(document.querySelectorAll('[data-search-form]'));

    forms.forEach(function (form) {
        const input = form.querySelector('[data-search-input]');
        const clearButton = form.querySelector('[data-clear-search]');
        const scope = document;
        const cards = Array.from(scope.querySelectorAll('[data-card]'));
        const empty = scope.querySelector('[data-no-results]');

        function filterCards() {
            const keyword = (input.value || '').trim().toLowerCase();
            let visible = 0;

            cards.forEach(function (card) {
                const haystack = ((card.getAttribute('data-title') || '') + ' ' + (card.getAttribute('data-meta') || '') + ' ' + card.textContent).toLowerCase();
                const matched = !keyword || haystack.indexOf(keyword) !== -1;
                card.style.display = matched ? '' : 'none';
                if (matched) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.classList.toggle('is-visible', visible === 0);
            }
        }

        form.addEventListener('submit', function (event) {
            event.preventDefault();
            filterCards();
        });

        if (input) {
            input.addEventListener('input', filterCards);
        }

        if (clearButton && input) {
            clearButton.addEventListener('click', function () {
                input.value = '';
                filterCards();
                input.focus();
            });
        }
    });
})();
