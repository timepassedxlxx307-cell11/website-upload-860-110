document.addEventListener("DOMContentLoaded", function () {
  var params = new URLSearchParams(window.location.search);
  var query = (params.get("q") || "").trim();
  var input = document.querySelector("[data-search-input]");
  var title = document.querySelector("[data-search-title]");
  var subtitle = document.querySelector("[data-search-subtitle]");
  var results = document.querySelector("[data-search-results]");

  if (input) {
    input.value = query;
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function matchMovie(movie, keyword) {
    if (!keyword) {
      return true;
    }

    var text = [
      movie.title,
      movie.year,
      movie.region,
      movie.genre,
      movie.type,
      (movie.tags || []).join(" "),
      movie.summary
    ].join(" ").toLowerCase();

    return text.indexOf(keyword.toLowerCase()) !== -1;
  }

  function renderCard(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return "<span>" + escapeHtml(tag) + "</span>";
    }).join("");

    return "" +
      "<article class=\"movie-card\" data-movie-card>" +
        "<a class=\"movie-poster\" href=\"" + escapeHtml(movie.href) + "\">" +
          "<img src=\"" + escapeHtml(movie.cover) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">" +
          "<span class=\"poster-shade\"></span>" +
          "<span class=\"poster-play\">▶</span>" +
          "<span class=\"poster-badge\">" + escapeHtml(movie.type) + "</span>" +
        "</a>" +
        "<div class=\"movie-card-body\">" +
          "<div class=\"movie-meta\">" + escapeHtml(movie.year) + " · " + escapeHtml(movie.region) + " · " + escapeHtml(movie.genre) + "</div>" +
          "<h3><a href=\"" + escapeHtml(movie.href) + "\">" + escapeHtml(movie.title) + "</a></h3>" +
          "<p>" + escapeHtml(movie.summary) + "</p>" +
          "<div class=\"tag-row\">" + tags + "</div>" +
        "</div>" +
      "</article>";
  }

  if (!results || !Array.isArray(MOVIE_INDEX)) {
    return;
  }

  var matches = MOVIE_INDEX.filter(function (movie) {
    return matchMovie(movie, query);
  }).slice(0, 120);

  if (title) {
    title.textContent = query ? "搜索结果" : "热门视频";
  }

  if (subtitle) {
    subtitle.textContent = query ? "与“" + query + "”相关的影视作品" : "可直接浏览精选内容，或输入关键词继续搜索。";
  }

  if (!matches.length) {
    results.innerHTML = "<div class=\"empty-state\">暂无匹配影片</div>";
    return;
  }

  results.innerHTML = matches.map(renderCard).join("");
});
