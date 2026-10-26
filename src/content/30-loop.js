function getSavedLoop(id) {
    try {
        return localStorage.getItem(VIDEO_KEY_PREFIX + id) === 'true';
    } catch {
        return false;
    }
}

// Only videos with loop turned on are stored, and the list is capped so it can't grow forever.
function saveLoop() {
    if (!state.enabled || state.ignoringLoopChange || !state.video || !state.videoId || isAdShowing()) return;
    // On mobile the same <video> is reused, and YouTube can reset loop after the URL changes but before
    // LoopTube catches up. Don't write that reset under the previous video's ID.
    if (getVideoId() !== state.videoId) return;
    try {
        const key = VIDEO_KEY_PREFIX + state.videoId;
        let index = JSON.parse(localStorage.getItem(LOOP_INDEX_KEY) || '[]').filter((id) => id !== state.videoId);

        if (state.video.loop) {
            localStorage.setItem(key, 'true');
            index.push(state.videoId);
        } else {
            localStorage.removeItem(key);
        }

        while (index.length > MAX_SAVED_LOOPS) {
            localStorage.removeItem(VIDEO_KEY_PREFIX + index.shift());
        }

        localStorage.setItem(LOOP_INDEX_KEY, JSON.stringify(index));
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

