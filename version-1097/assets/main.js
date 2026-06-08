(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  ready(function () {
    var menuToggle = document.querySelector('[data-menu-toggle]');
    var mobileMenu = document.querySelector('[data-mobile-menu]');
    if (menuToggle && mobileMenu) {
      menuToggle.addEventListener('click', function () {
        mobileMenu.classList.toggle('is-open');
      });
    }

    var hero = document.querySelector('[data-hero]');
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
      var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
      var index = 0;
      var timer = null;
      var show = function (next) {
        if (!slides.length) return;
        index = (next + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle('is-active', i === index);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle('is-active', i === index);
        });
      };
      var start = function () {
        timer = window.setInterval(function () {
          show(index + 1);
        }, 5200);
      };
      dots.forEach(function (dot) {
        dot.addEventListener('click', function () {
          window.clearInterval(timer);
          show(Number(dot.getAttribute('data-hero-dot')) || 0);
          start();
        });
      });
      start();
    }

    document.querySelectorAll('[data-scroll]').forEach(function (button) {
      button.addEventListener('click', function () {
        var target = document.getElementById(button.getAttribute('data-scroll'));
        if (!target) return;
        var direction = Number(button.getAttribute('data-dir')) || 1;
        target.scrollBy({ left: direction * Math.round(target.clientWidth * 0.82), behavior: 'smooth' });
      });
    });

    document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
      var input = scope.querySelector('[data-search-input]');
      var clear = scope.querySelector('[data-clear-filter]');
      var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card'));
      if (!input || !cards.length) return;
      var apply = function () {
        var query = input.value.trim().toLowerCase();
        cards.forEach(function (card) {
          var haystack = [
            card.getAttribute('data-title') || '',
            card.getAttribute('data-tags') || '',
            card.getAttribute('data-year') || '',
            card.getAttribute('data-region') || ''
          ].join(' ').toLowerCase();
          card.classList.toggle('is-hidden', query && haystack.indexOf(query) === -1);
        });
      };
      input.addEventListener('input', apply);
      if (clear) {
        clear.addEventListener('click', function () {
          input.value = '';
          apply();
          input.focus();
        });
      }
      if (input.hasAttribute('data-query-sync')) {
        var params = new URLSearchParams(window.location.search);
        var q = params.get('q');
        if (q) {
          input.value = q;
          apply();
        }
      }
    });
  });
})();
