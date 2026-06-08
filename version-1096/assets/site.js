(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function setupMenu() {
    var toggle = qs('.menu-toggle');
    var nav = qs('.mobile-nav');
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function setupHero() {
    var hero = qs('.hero-carousel');
    if (!hero) {
      return;
    }
    var slides = qsa('.hero-slide', hero);
    var dots = qsa('.hero-dot', hero);
    var prev = qs('.hero-prev', hero);
    var next = qs('.hero-next', hero);
    var index = 0;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-target') || 0));
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
      });
    }

    window.setInterval(function () {
      show(index + 1);
    }, 6200);
  }

  function setupLocalFilter() {
    var input = qs('.local-filter-input');
    var scopes = qsa('.local-filter-scope');
    if (!input || scopes.length === 0) {
      return;
    }
    input.addEventListener('input', function () {
      var keyword = input.value.trim().toLowerCase();
      scopes.forEach(function (scope) {
        qsa('.movie-card', scope).forEach(function (card) {
          var text = card.textContent.toLowerCase() + ' ' + (card.getAttribute('data-tags') || '').toLowerCase();
          card.hidden = keyword.length > 0 && text.indexOf(keyword) === -1;
        });
      });
    });
  }

  function setupGlobalSearch() {
    var inputs = qsa('.global-search-input');
    var items = window.SITE_SEARCH_ITEMS || [];
    if (!inputs.length || !items.length) {
      return;
    }

    inputs.forEach(function (input) {
      var panel = input.parentNode.querySelector('.global-search-panel');

      function closePanel() {
        if (panel) {
          panel.innerHTML = '';
          panel.classList.remove('is-open');
        }
      }

      function render() {
        var keyword = input.value.trim().toLowerCase();
        if (!keyword) {
          closePanel();
          return;
        }
        var result = items.filter(function (item) {
          var text = [item.title, item.year, item.region, item.category, (item.tags || []).join(' '), item.summary].join(' ').toLowerCase();
          return text.indexOf(keyword) !== -1;
        }).slice(0, 10);

        if (!result.length) {
          panel.innerHTML = '<div class="search-empty">未找到相关影片</div>';
          panel.classList.add('is-open');
          return;
        }

        panel.innerHTML = result.map(function (item) {
          return [
            '<a class="search-result" href="' + item.url + '">',
            '<img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '">',
            '<span><strong>' + escapeHtml(item.title) + '</strong><em>' + escapeHtml(item.year + ' · ' + item.region + ' · ' + item.category) + '</em></span>',
            '</a>'
          ].join('');
        }).join('');
        panel.classList.add('is-open');
      }

      input.addEventListener('input', render);
      input.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
          var first = panel && panel.querySelector('a');
          if (first) {
            window.location.href = first.getAttribute('href');
          }
        }
        if (event.key === 'Escape') {
          closePanel();
        }
      });
      document.addEventListener('click', function (event) {
        if (!input.parentNode.contains(event.target)) {
          closePanel();
        }
      });
    });
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"]/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;'
      }[char];
    });
  }

  function setupImages() {
    qsa('img').forEach(function (img) {
      img.addEventListener('error', function () {
        img.classList.add('is-missing');
      });
    });
  }

  function setupPlayers() {
    qsa('.js-player').forEach(function (player) {
      var video = qs('video', player);
      var button = qs('.player-button', player);
      var stream = player.getAttribute('data-stream');
      var ready = false;
      var hls = null;

      function start(event) {
        if (event) {
          event.preventDefault();
        }
        if (!video || !stream) {
          return;
        }
        if (!ready) {
          if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({
              enableWorker: true,
              lowLatencyMode: false,
              backBufferLength: 60
            });
            hls.loadSource(stream);
            hls.attachMedia(video);
          } else {
            video.src = stream;
          }
          ready = true;
        }
        video.controls = true;
        player.classList.add('is-playing');
        if (button) {
          button.setAttribute('hidden', 'hidden');
        }
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(function () {});
        }
      }

      if (button) {
        button.addEventListener('click', start);
      }
      if (video) {
        video.addEventListener('click', start);
      }
      player.addEventListener('dblclick', function () {
        if (!document.fullscreenElement && player.requestFullscreen) {
          player.requestFullscreen();
        }
      });
      window.addEventListener('beforeunload', function () {
        if (hls && typeof hls.destroy === 'function') {
          hls.destroy();
        }
      });
    });
  }

  setupMenu();
  setupHero();
  setupLocalFilter();
  setupGlobalSearch();
  setupImages();
  setupPlayers();
})();
