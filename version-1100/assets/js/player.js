(function () {
    function attachPlayer(shell) {
        var video = shell.querySelector('video');
        var button = shell.querySelector('.play-layer');
        var source = shell.getAttribute('data-stream');
        var loaded = false;
        var hls = null;

        function load() {
            if (!video || !source) {
                return;
            }
            if (loaded) {
                video.play().catch(function () {});
                return;
            }
            loaded = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(source);
                hls.attachMedia(video);
            } else {
                video.src = source;
            }
            video.play().catch(function () {
                loaded = false;
                if (button) {
                    button.classList.remove('is-hidden');
                }
            });
        }

        function play() {
            if (button) {
                button.classList.add('is-hidden');
            }
            load();
        }

        if (button) {
            button.addEventListener('click', play);
        }

        if (video) {
            video.addEventListener('click', function () {
                if (video.paused) {
                    play();
                } else {
                    video.pause();
                }
            });
            video.addEventListener('play', function () {
                if (button) {
                    button.classList.add('is-hidden');
                }
            });
            video.addEventListener('pause', function () {
                if (button && video.currentTime === 0) {
                    button.classList.remove('is-hidden');
                }
            });
            video.addEventListener('ended', function () {
                if (button) {
                    button.classList.remove('is-hidden');
                }
            });
        }

        window.addEventListener('beforeunload', function () {
            if (hls && hls.destroy) {
                hls.destroy();
            }
        });
    }

    document.querySelectorAll('.player-shell').forEach(attachPlayer);
})();
