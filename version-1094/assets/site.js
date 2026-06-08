(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function setupMobileMenu() {
    var button = document.querySelector('[data-mobile-menu-button]');
    var menu = document.querySelector('[data-mobile-menu]');
    if (!button || !menu) {
      return;
    }
    button.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  function setupHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dots] button'));
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        start();
      });
    }
    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
        start();
      });
    });
    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function getText(card) {
    return normalize([
      card.dataset.title,
      card.dataset.category,
      card.dataset.region,
      card.dataset.year,
      card.textContent
    ].join(' '));
  }

  function setupCardFiltering() {
    document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
      var grid = scope.parentElement.querySelector('[data-card-grid]');
      if (!grid) {
        return;
      }
      var search = scope.querySelector('[data-card-search]');
      var category = scope.querySelector('[data-card-category]');
      var sort = scope.querySelector('[data-card-sort]');
      var count = scope.querySelector('[data-card-count]');
      var cards = Array.prototype.slice.call(grid.querySelectorAll('[data-movie-card]'));
      var original = cards.slice();

      function compareCards(a, b, mode) {
        if (mode === 'views') {
          return Number(b.dataset.views || 0) - Number(a.dataset.views || 0);
        }
        if (mode === 'rating') {
          return Number(b.dataset.rating || 0) - Number(a.dataset.rating || 0);
        }
        if (mode === 'year') {
          return Number(b.dataset.year || 0) - Number(a.dataset.year || 0);
        }
        if (mode === 'title') {
          return String(a.dataset.title || '').localeCompare(String(b.dataset.title || ''), 'zh-Hans-CN');
        }
        return original.indexOf(a) - original.indexOf(b);
      }

      function update() {
        var query = search ? normalize(search.value) : '';
        var categoryValue = category ? normalize(category.value) : '';
        var sortMode = sort ? sort.value : 'default';
        var visible = [];

        cards.forEach(function (card) {
          var matchesQuery = !query || getText(card).indexOf(query) !== -1;
          var matchesCategory = !categoryValue || normalize(card.dataset.category) === categoryValue;
          var shouldShow = matchesQuery && matchesCategory;
          card.classList.toggle('hidden-by-filter', !shouldShow);
          if (shouldShow) {
            visible.push(card);
          }
        });

        visible.sort(function (a, b) {
          return compareCards(a, b, sortMode);
        });
        visible.forEach(function (card) {
          grid.appendChild(card);
        });
        if (count) {
          count.textContent = visible.length + ' 部影片';
        }
      }

      if (search) {
        search.addEventListener('input', update);
      }
      if (category) {
        category.addEventListener('change', update);
      }
      if (sort) {
        sort.addEventListener('change', update);
      }
      update();
    });
  }

  function setupSearchPage() {
    var panel = document.querySelector('[data-search-page]');
    if (!panel || !window.MOVIE_DATA) {
      return;
    }
    var input = panel.querySelector('[data-search-input]');
    var category = panel.querySelector('[data-search-category]');
    var sort = panel.querySelector('[data-search-sort]');
    var count = panel.querySelector('[data-search-count]');
    var results = panel.querySelector('[data-search-results]');
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';

    if (input) {
      input.value = initialQuery;
    }

    function movieMatches(movie, query, categoryValue) {
      var haystack = normalize([
        movie.title,
        movie.one_line,
        movie.summary,
        movie.region,
        movie.type,
        movie.year,
        movie.genre,
        movie.category_name,
        (movie.tags || []).join(' ')
      ].join(' '));
      var matchesQuery = !query || haystack.indexOf(query) !== -1;
      var matchesCategory = !categoryValue || normalize(movie.category_name) === categoryValue;
      return matchesQuery && matchesCategory;
    }

    function movieCard(movie) {
      var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
        return '<span class="tag">' + escapeHtml(tag) + '</span>';
      }).join('');
      return '' +
        '<article class="movie-card" data-movie-card>' +
        '  <a class="movie-cover" href="' + escapeHtml(movie.page) + '" aria-label="' + escapeHtml(movie.title) + ' 在线观看">' +
        '    <img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
        '    <span class="cover-gradient"></span>' +
        '    <span class="duration">' + escapeHtml(movie.duration) + '</span>' +
        '  </a>' +
        '  <div class="movie-info">' +
        '    <h3><a href="' + escapeHtml(movie.page) + '">' + escapeHtml(movie.title) + '</a></h3>' +
        '    <p class="movie-desc">' + escapeHtml(movie.one_line) + '</p>' +
        '    <div class="movie-meta">' +
        '      <a href="categories/' + escapeHtml(movie.category_slug) + '.html">' + escapeHtml(movie.category_name) + '</a>' +
        '      <span>' + escapeHtml(movie.region) + '</span>' +
        '      <span>' + escapeHtml(movie.year) + '</span>' +
        '    </div>' +
        '    <div class="movie-tags">' + tags + '</div>' +
        '    <div class="movie-stats"><span>评分 ' + escapeHtml(movie.rating) + '</span><span>' + Number(movie.views).toLocaleString() + ' 次观看</span></div>' +
        '  </div>' +
        '</article>';
    }

    function escapeHtml(value) {
      return String(value == null ? '' : value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }

    function sortMovies(items, mode) {
      return items.sort(function (a, b) {
        if (mode === 'rating') {
          return Number(b.rating || 0) - Number(a.rating || 0);
        }
        if (mode === 'year') {
          return Number(b.year || 0) - Number(a.year || 0);
        }
        if (mode === 'title') {
          return String(a.title || '').localeCompare(String(b.title || ''), 'zh-Hans-CN');
        }
        return Number(b.views || 0) - Number(a.views || 0);
      });
    }

    function update() {
      var query = normalize(input ? input.value : '');
      var categoryValue = normalize(category ? category.value : '');
      var sortMode = sort ? sort.value : 'views';
      var items = window.MOVIE_DATA.filter(function (movie) {
        return movieMatches(movie, query, categoryValue);
      });
      sortMovies(items, sortMode);
      var limited = items.slice(0, 120);
      results.innerHTML = limited.map(movieCard).join('');
      count.textContent = '共找到 ' + items.length + ' 部影片，当前显示前 ' + limited.length + ' 部';
    }

    if (input) {
      input.addEventListener('input', update);
    }
    if (category) {
      category.addEventListener('change', update);
    }
    if (sort) {
      sort.addEventListener('change', update);
    }
    update();
  }

  function setupPlayers() {
    document.querySelectorAll('[data-player]').forEach(function (player) {
      var video = player.querySelector('video[data-hls-src]');
      var button = player.querySelector('[data-play-button]');
      if (!video || !button) {
        return;
      }
      var source = video.getAttribute('data-hls-src');
      var initialized = false;

      function initialize() {
        if (initialized) {
          return Promise.resolve();
        }
        initialized = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
          return Promise.resolve();
        }
        if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(source);
          hls.attachMedia(video);
          window.addEventListener('beforeunload', function () {
            hls.destroy();
          });
          return Promise.resolve();
        }
        video.src = source;
        return Promise.resolve();
      }

      button.addEventListener('click', function () {
        initialize().then(function () {
          button.classList.add('is-hidden');
          var playPromise = video.play();
          if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(function () {
              button.classList.remove('is-hidden');
            });
          }
        });
      });
    });
  }

  function setupShareButtons() {
    document.querySelectorAll('[data-share-button]').forEach(function (button) {
      button.addEventListener('click', function () {
        var url = window.location.href;
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(url).then(function () {
            button.textContent = '已复制链接';
          });
        } else {
          button.textContent = url;
        }
      });
    });
  }

  ready(function () {
    setupMobileMenu();
    setupHero();
    setupCardFiltering();
    setupSearchPage();
    setupPlayers();
    setupShareButtons();
  });
})();
