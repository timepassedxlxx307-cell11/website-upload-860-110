(function () {
    function qs(selector, root) {
        return (root || document).querySelector(selector);
    }

    function qsa(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function setupMobileMenu() {
        var button = qs('[data-menu-button]');
        var nav = qs('[data-mobile-nav]');
        if (!button || !nav) {
            return;
        }
        button.addEventListener('click', function () {
            nav.classList.toggle('is-open');
        });
    }

    function setupHero() {
        var hero = qs('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = qsa('[data-hero-slide]', hero);
        var dots = qsa('[data-hero-dot]', hero);
        var prev = qs('[data-hero-prev]', hero);
        var next = qs('[data-hero-next]', hero);
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                restart();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                restart();
            });
        }
        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
                restart();
            });
        });
        show(0);
        restart();
    }

    function setupFiltering() {
        var inputs = qsa('[data-filter-input]');
        inputs.forEach(function (input) {
            var scope = qs('[data-filter-scope]') || document;
            input.addEventListener('input', function () {
                var keyword = input.value.trim().toLowerCase();
                qsa('[data-card]', scope).forEach(function (card) {
                    var haystack = (card.getAttribute('data-search') || card.textContent || '').toLowerCase();
                    card.classList.toggle('is-filter-hidden', keyword && haystack.indexOf(keyword) === -1);
                });
            });
        });
    }

    window.initVideoPlayer = function (videoSource) {
        var video = qs('[data-player-video]');
        var cover = qs('[data-player-cover]');
        var starters = qsa('[data-player-start]');
        var started = false;
        var instance = null;

        if (!video || !videoSource) {
            return;
        }

        function attachSource() {
            if (started) {
                video.play().catch(function () {});
                return;
            }
            started = true;
            if (cover) {
                cover.classList.add('is-hidden');
            }
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = videoSource;
            } else if (window.Hls && window.Hls.isSupported()) {
                instance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                instance.loadSource(videoSource);
                instance.attachMedia(video);
            } else {
                video.src = videoSource;
            }
            video.controls = true;
            video.play().catch(function () {});
        }

        starters.forEach(function (button) {
            button.addEventListener('click', attachSource);
        });
        video.addEventListener('click', function () {
            if (!started) {
                attachSource();
            }
        });
        window.addEventListener('pagehide', function () {
            if (instance) {
                instance.destroy();
                instance = null;
            }
        });
    };

    document.addEventListener('DOMContentLoaded', function () {
        setupMobileMenu();
        setupHero();
        setupFiltering();
    });
}());
