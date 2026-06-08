(function () {
  var hlsUrl = 'https://cdn.jsdelivr.net/npm/hls.js@latest';
  var hlsPromise = null;

  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  function loadHls() {
    if (window.Hls) {
      return Promise.resolve(window.Hls);
    }
    if (hlsPromise) {
      return hlsPromise;
    }
    hlsPromise = new Promise(function (resolve, reject) {
      var script = document.createElement('script');
      script.src = hlsUrl;
      script.async = true;
      script.onload = function () {
        resolve(window.Hls);
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
    return hlsPromise;
  }

  function bindPlayer(box) {
    var video = box.querySelector('video');
    var cover = box.querySelector('.player-cover');
    var stream = box.getAttribute('data-stream');
    var prepared = false;

    if (!video || !stream) return;

    function prepare() {
      if (prepared) {
        return Promise.resolve();
      }
      prepared = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
        video.load();
        return Promise.resolve();
      }
      return loadHls().then(function (Hls) {
        if (Hls && Hls.isSupported()) {
          var hls = new Hls({ enableWorker: true, lowLatencyMode: true });
          hls.loadSource(stream);
          hls.attachMedia(video);
          box.hlsInstance = hls;
        } else {
          video.src = stream;
          video.load();
        }
      }).catch(function () {
        video.src = stream;
        video.load();
      });
    }

    function play() {
      prepare().then(function () {
        box.classList.add('is-playing');
        var started = video.play();
        if (started && started.catch) {
          started.catch(function () {});
        }
      });
    }

    if (cover) {
      cover.addEventListener('click', play);
    }
    video.addEventListener('play', function () {
      box.classList.add('is-playing');
    });
    video.addEventListener('click', function () {
      if (video.paused) {
        play();
      }
    });
  }

  ready(function () {
    document.querySelectorAll('.site-player').forEach(bindPlayer);
  });
})();
