(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function setupMenu() {
    var button = document.querySelector('[data-menu-toggle]');
    var panel = document.querySelector('[data-mobile-panel]');
    if (!button || !panel) {
      return;
    }
    button.addEventListener('click', function () {
      panel.classList.toggle('is-open');
      button.setAttribute('aria-expanded', panel.classList.contains('is-open') ? 'true' : 'false');
    });
  }

  function setupCarousel() {
    var carousel = document.querySelector('[data-carousel]');
    if (!carousel) {
      return;
    }
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-slide]'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-slide-dot]'));
    if (!slides.length) {
      return;
    }
    var current = 0;
    var timer = null;
    function show(index) {
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
      }, 5200);
    }
    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }
    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
        start();
      });
    });
    carousel.addEventListener('mouseenter', stop);
    carousel.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function setupLocalFilters() {
    var scopes = Array.prototype.slice.call(document.querySelectorAll('[data-filter-scope]'));
    scopes.forEach(function (scope) {
      var input = scope.querySelector('[data-filter-input]');
      var year = scope.querySelector('[data-filter-year]');
      var type = scope.querySelector('[data-filter-type]');
      var region = scope.querySelector('[data-filter-region]');
      var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-movie-card]'));
      var counter = scope.querySelector('[data-filter-count]');
      var empty = scope.querySelector('[data-empty-state]');
      function apply() {
        var q = input ? input.value.trim().toLowerCase() : '';
        var y = year ? year.value : '';
        var t = type ? type.value : '';
        var r = region ? region.value : '';
        var visible = 0;
        cards.forEach(function (card) {
          var text = (card.getAttribute('data-search') || '').toLowerCase();
          var matched = true;
          if (q && text.indexOf(q) === -1) {
            matched = false;
          }
          if (y && card.getAttribute('data-year') !== y) {
            matched = false;
          }
          if (t && card.getAttribute('data-type') !== t) {
            matched = false;
          }
          if (r && card.getAttribute('data-region') !== r) {
            matched = false;
          }
          card.classList.toggle('is-hidden', !matched);
          if (matched) {
            visible += 1;
          }
        });
        if (counter) {
          counter.textContent = visible ? '当前显示 ' + visible + ' 部影片' : '暂无符合条件的影片';
        }
        if (empty) {
          empty.classList.toggle('is-visible', visible === 0);
        }
      }
      [input, year, type, region].forEach(function (el) {
        if (el) {
          el.addEventListener('input', apply);
          el.addEventListener('change', apply);
        }
      });
      apply();
    });
  }

  function setupSearchPage() {
    var root = document.querySelector('[data-search-page]');
    if (!root || !window.SEARCH_MOVIES) {
      return;
    }
    var input = root.querySelector('[data-search-box]');
    var results = root.querySelector('[data-search-results]');
    var counter = root.querySelector('[data-search-counter]');
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';
    if (input) {
      input.value = initial;
    }
    function render() {
      var q = input ? input.value.trim().toLowerCase() : '';
      var list = window.SEARCH_MOVIES.filter(function (movie) {
        if (!q) {
          return movie.featured;
        }
        return movie.search.indexOf(q) !== -1;
      }).slice(0, 120);
      if (counter) {
        counter.textContent = q ? '搜索到 ' + list.length + ' 条相关影片' : '热门搜索推荐';
      }
      if (!results) {
        return;
      }
      results.innerHTML = list.map(function (movie) {
        return '<article class="movie-card">' +
          '<a href="' + movie.url + '">' +
          '<div class="poster"><img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '"><span class="badge">' + escapeHtml(movie.year) + '</span><span class="type-badge">' + escapeHtml(movie.type) + '</span></div>' +
          '<div class="card-body"><h3 class="line-clamp-1">' + escapeHtml(movie.title) + '</h3><p class="line-clamp-2">' + escapeHtml(movie.oneLine) + '</p><div class="card-meta"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.genre) + '</span></div></div>' +
          '</a>' +
          '</article>';
      }).join('');
      if (!list.length) {
        results.innerHTML = '<div class="empty-state is-visible">暂无符合条件的影片</div>';
      }
    }
    if (input) {
      input.addEventListener('input', render);
    }
    render();
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  window.SitePlayer = {
    mount: function (videoId, buttonId, sourceUrl) {
      var video = document.getElementById(videoId);
      var button = document.getElementById(buttonId);
      if (!video || !button || !sourceUrl) {
        return;
      }
      var attached = false;
      var hls = null;
      function attach() {
        if (attached) {
          return;
        }
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = sourceUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(sourceUrl);
          hls.attachMedia(video);
        } else {
          video.src = sourceUrl;
        }
        attached = true;
      }
      function play() {
        attach();
        button.classList.add('is-hidden');
        var result = video.play();
        if (result && typeof result.catch === 'function') {
          result.catch(function () {
            button.classList.remove('is-hidden');
          });
        }
      }
      button.addEventListener('click', play);
      video.addEventListener('click', function () {
        if (!attached) {
          play();
        }
      });
      window.addEventListener('pagehide', function () {
        if (hls) {
          hls.destroy();
        }
      });
    }
  };

  ready(function () {
    setupMenu();
    setupCarousel();
    setupLocalFilters();
    setupSearchPage();
  });
})();
