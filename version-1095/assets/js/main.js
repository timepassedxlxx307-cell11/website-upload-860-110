(function () {
  const toggle = document.querySelector(".nav-toggle");
  const mobileNav = document.querySelector(".mobile-nav");

  if (toggle && mobileNav) {
    toggle.addEventListener("click", function () {
      const opened = mobileNav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", opened ? "true" : "false");
    });
  }

  const hero = document.querySelector("[data-hero]");

  if (hero) {
    const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
    const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
    const next = hero.querySelector("[data-hero-next]");
    const prev = hero.querySelector("[data-hero-prev]");
    let current = 0;
    let timer = null;

    const show = function (index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, itemIndex) {
        slide.classList.toggle("is-active", itemIndex === current);
      });
      dots.forEach(function (dot, itemIndex) {
        dot.classList.toggle("is-active", itemIndex === current);
      });
    };

    const restart = function () {
      if (timer) {
        clearInterval(timer);
      }
      timer = setInterval(function () {
        show(current + 1);
      }, 5000);
    };

    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        restart();
      });
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
        restart();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        restart();
      });
    });

    show(0);
    restart();
  }

  const params = new URLSearchParams(window.location.search);
  const initialQuery = params.get("q") || "";
  const filterAreas = Array.from(document.querySelectorAll("[data-filter-area]"));

  filterAreas.forEach(function (area) {
    const input = area.querySelector("[data-search-input]");
    const cards = Array.from(area.querySelectorAll("[data-card]"));
    const chips = Array.from(area.querySelectorAll("[data-filter-chip]"));
    const categorySelect = area.querySelector("[data-category-select]");
    const yearSelect = area.querySelector("[data-year-select]");
    const typeSelect = area.querySelector("[data-type-select]");
    let activeChip = "";

    if (input && initialQuery) {
      input.value = initialQuery;
    }

    const apply = function () {
      const query = input ? input.value.trim().toLowerCase() : "";
      const categoryValue = categorySelect ? categorySelect.value : "";
      const yearValue = yearSelect ? yearSelect.value : "";
      const typeValue = typeSelect ? typeSelect.value : "";

      cards.forEach(function (card) {
        const text = (card.getAttribute("data-text") || "").toLowerCase();
        const category = card.getAttribute("data-category") || "";
        const year = card.getAttribute("data-year") || "";
        const type = card.getAttribute("data-type") || "";
        const queryMatch = !query || text.indexOf(query) !== -1;
        const chipMatch = !activeChip || text.indexOf(activeChip.toLowerCase()) !== -1;
        const categoryMatch = !categoryValue || category === categoryValue;
        const yearMatch = !yearValue || year === yearValue;
        const typeMatch = !typeValue || type === typeValue;
        card.classList.toggle("is-hidden", !(queryMatch && chipMatch && categoryMatch && yearMatch && typeMatch));
      });
    };

    if (input) {
      input.addEventListener("input", apply);
    }

    [categorySelect, yearSelect, typeSelect].forEach(function (select) {
      if (select) {
        select.addEventListener("change", apply);
      }
    });

    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        chips.forEach(function (item) {
          item.classList.remove("is-active");
        });
        chip.classList.add("is-active");
        activeChip = chip.getAttribute("data-filter-chip") || "";
        apply();
      });
    });

    apply();
  });

  const players = Array.from(document.querySelectorAll("[data-player-root]"));

  players.forEach(function (player) {
    const video = player.querySelector("[data-player-video]");
    const overlay = player.querySelector("[data-player-overlay]");
    const trigger = player.querySelector("[data-player-start]");
    const stream = player.getAttribute("data-stream") || "";
    let prepared = false;
    let engine = null;

    const prepare = function () {
      if (prepared || !video || !stream) {
        return;
      }

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        engine = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        engine.loadSource(stream);
        engine.attachMedia(video);
      } else {
        video.src = stream;
      }

      prepared = true;
    };

    const play = function () {
      prepare();
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
      if (video) {
        video.play().catch(function () {});
      }
    };

    if (overlay) {
      overlay.addEventListener("click", play);
    }

    if (trigger) {
      trigger.addEventListener("click", play);
    }

    if (video) {
      video.addEventListener("click", function () {
        if (!prepared || video.paused) {
          play();
        }
      });
    }

    window.addEventListener("pagehide", function () {
      if (engine) {
        engine.destroy();
      }
    });
  });
})();
