function getSavedLoop(id) {
    try {
        return localStorage.getItem(VIDEO_KEY_PREFIX + id) === 'true';
    } catch {
        return false;
    }
}

function saveLoop() {
    if (!state.enabled || state.ignoringLoopChange || !state.video || !state.videoId || isAdShowing()) return;
    try {
        localStorage.setItem(VIDEO_KEY_PREFIX + state.videoId, String(state.video.loop));
    } catch { }
}

function updateButton() {
    const btn = getButton();
    const active = Boolean(state.enabled && state.video && state.video.loop && !isAdShowing());

    if (!btn) return;

    btn.classList.toggle('active', active);
    btn.setAttribute('aria-pressed', String(active));

    if (isMobile) {
        btn.style.color = active ? '#3ea6ff' : '#ffffff';
    }
}

function setLoop(val, shouldSave) {
    if (!state.video) return;

    state.ignoringLoopChange = !shouldSave;
    state.video.loop = val;

    if (shouldSave) saveLoop();
    updateButton();

    if (!shouldSave) {
        requestAnimationFrame(() => {
            state.ignoringLoopChange = false;
        });
    }
}

function toggleLoop() {
    // Force re-fetch of the video element just in case YouTube swapped it
    const vid = getVideo();
    if (vid) {
        watchVideo(vid);
    } else {
        state.video = null;
        state.videoId = '';
        if (isMobile) bgPlay.detachVideoListeners();
    }

    if (!state.enabled || !state.video || isAdShowing()) return;

    setLoop(!state.video.loop, true);
}

