function isVisMobileVid(video) {
    if (!video || !video.isConnected) return false;
    const rect = video.getBoundingClientRect();
    const style = getComputedStyle(video);

    return (
        rect.width > 40 &&
        rect.height > 40 &&
        rect.bottom > 0 &&
        rect.right > 0 &&
        rect.top < window.innerHeight &&
        rect.left < window.innerWidth &&
        style.display !== 'none' &&
        style.visibility !== 'hidden' &&
        style.opacity !== '0'
    );
}

function getMobileVid() {
    const vids = Array.from(document.querySelectorAll('video'));
    return vids.find(isVisMobileVid) || vids[0] || null;
}

function getPlayer() {
    if (state.player && state.player.isConnected) return state.player;

    if (isMobile) {
        const vid = state.video && isVisMobileVid(state.video) ? state.video : getMobileVid();
        state.player = document.querySelector('.html5-video-player') || (vid ? vid.parentElement : null);
        return state.player;
    }

    const players = Array.from(document.querySelectorAll('.html5-video-player'));
    state.player = players.find((p) => p.offsetParent !== null) || players[0] || null;
    return state.player;
}

function getVideo() {
    if (isMobile) return getMobileVid();

    const player = getPlayer();
    return player
        ? player.querySelector('video.html5-main-video') || player.querySelector('video')
        : document.querySelector('video.html5-main-video') || document.querySelector('video');
}

function getControls() {
    if (state.controls && state.controls.isConnected) return state.controls;

    const player = getPlayer();
    state.controls = player
        ? player.querySelector('.ytp-right-controls')
        : document.querySelector('.ytp-right-controls');

    return state.controls;
}

function getButton() {
    return document.getElementById(BUTTON_ID);
}

function isAdShowing() {
    const player = getPlayer();
    return Boolean(player && player.classList.contains('ad-showing'));
}

function getVideoId() {
    const url = new URL(location.href);
    if (url.hostname === 'youtu.be') return url.pathname.slice(1) || 'unknown';
    if (url.pathname.startsWith('/shorts/')) return url.pathname.split('/')[2] || 'unknown';
    return url.searchParams.get('v') || url.pathname;
}

