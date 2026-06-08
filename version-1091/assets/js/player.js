(function () {
    var video = document.querySelector('[data-player-video]');
    var trigger = document.querySelector('[data-play-button]');
    var layer = document.querySelector('[data-play-layer]');
    var streamUrl = window.__streamUrl;
    var loaded = false;
    var hlsInstance = null;

    function loadStream() {
        if (!video || !streamUrl || loaded) {
            return;
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = streamUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({ enableWorker: true });
            hlsInstance.loadSource(streamUrl);
            hlsInstance.attachMedia(video);
        } else {
            video.src = streamUrl;
        }

        loaded = true;
    }

    function startPlayback() {
        if (!video) {
            return;
        }

        loadStream();

        if (layer) {
            layer.classList.add('is-hidden');
        }

        var playPromise = video.play();

        if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(function () {});
        }
    }

    if (trigger) {
        trigger.addEventListener('click', startPlayback);
    }

    if (video) {
        video.addEventListener('click', function () {
            if (video.paused) {
                startPlayback();
            }
        });
    }

    window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
})();
