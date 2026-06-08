(function () {
    var mobileToggle = document.querySelector('.mobile-toggle');
    var mobilePanel = document.querySelector('.mobile-panel');

    if (mobileToggle && mobilePanel) {
        mobileToggle.addEventListener('click', function () {
            var isOpen = mobilePanel.classList.toggle('open');
            mobileToggle.setAttribute('aria-expanded', String(isOpen));
        });
    }

    var hero = document.querySelector('[data-hero]');
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var current = 0;
        var timer = null;

        function showHero(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === current);
            });
        }

        function startHero() {
            stopHero();
            timer = window.setInterval(function () {
                showHero(current + 1);
            }, 5200);
        }

        function stopHero() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                showHero(Number(dot.getAttribute('data-hero-dot')) || 0);
                startHero();
            });
        });

        hero.addEventListener('mouseenter', stopHero);
        hero.addEventListener('mouseleave', startHero);
        startHero();
    }

    function normalize(value) {
        return String(value || '').toLowerCase().replace(/\s+/g, '');
    }

    document.querySelectorAll('[data-filter-bar]').forEach(function (bar) {
        var scope = bar.closest('section') || document;
        var grid = scope.querySelector('[data-filter-grid]');
        var searchInput = bar.querySelector('[data-grid-search]');
        var yearButtons = Array.prototype.slice.call(bar.querySelectorAll('[data-filter-year]'));
        var selectedYear = 'all';

        function applyFilter() {
            if (!grid) {
                return;
            }
            var keyword = normalize(searchInput ? searchInput.value : '');
            var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));
            cards.forEach(function (card) {
                var text = normalize((card.getAttribute('data-title') || '') + ' ' + (card.getAttribute('data-meta') || ''));
                var year = card.getAttribute('data-year') || '';
                var matchedKeyword = !keyword || text.indexOf(keyword) !== -1;
                var matchedYear = selectedYear === 'all' || year === selectedYear;
                card.classList.toggle('is-filtered-out', !(matchedKeyword && matchedYear));
            });
        }

        if (searchInput) {
            searchInput.addEventListener('input', applyFilter);
        }

        yearButtons.forEach(function (button) {
            button.addEventListener('click', function () {
                selectedYear = button.getAttribute('data-filter-year') || 'all';
                yearButtons.forEach(function (item) {
                    item.classList.toggle('active', item === button);
                });
                applyFilter();
            });
        });
    });

    var pageSearch = document.querySelector('[data-page-search]');
    var clearSearch = document.querySelector('[data-clear-search]');
    var searchResults = document.querySelector('[data-search-results]');

    function applyPageSearch() {
        if (!pageSearch || !searchResults) {
            return;
        }
        var keyword = normalize(pageSearch.value);
        Array.prototype.slice.call(searchResults.querySelectorAll('.movie-card')).forEach(function (card) {
            var text = normalize((card.getAttribute('data-title') || '') + ' ' + (card.getAttribute('data-meta') || ''));
            card.classList.toggle('is-search-hidden', keyword && text.indexOf(keyword) === -1);
        });
    }

    if (pageSearch) {
        var params = new URLSearchParams(window.location.search);
        var q = params.get('q') || '';
        pageSearch.value = q;
        pageSearch.addEventListener('input', applyPageSearch);
        applyPageSearch();
    }

    if (clearSearch && pageSearch) {
        clearSearch.addEventListener('click', function () {
            pageSearch.value = '';
            applyPageSearch();
            pageSearch.focus();
        });
    }
})();
