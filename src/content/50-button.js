function createIcon() {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');

    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
    svg.setAttribute('aria-hidden', 'true');
    path.setAttribute('fill', 'currentColor');
    path.setAttribute('d', 'M7 7h11v3l4-4-4-4v3H5v6h2zm10 10H6v-3l-4 4 4 4v-3h13v-6h-2z');

    svg.appendChild(path);
    return svg;
}

function createButton() {
    const btn = document.createElement('button');
    btn.id = BUTTON_ID;
    btn.type = 'button';
    btn.className = 'ytp-button looptube-button';
    btn.title = 'Loop (Shift+L)';
    btn.setAttribute('aria-label', 'Loop (Shift+L)');
    btn.setAttribute('aria-pressed', 'false');

    // Custom JS property to track authenticity
    btn._isLoopTubeBtn = true;

    btn.appendChild(createIcon());

    btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleLoop();
    });

    // Prevent YouTube from stealing the click via mousedown
    btn.addEventListener('mousedown', (e) => e.stopPropagation());

    return btn;
}

function createMobileButton() {
    const btn = document.createElement('button');
    const icon = createIcon();

    btn.id = BUTTON_ID;
    btn.type = 'button';
    btn.className = 'icon-button looptube-mobile-button';
    btn.title = 'Loop';
    btn.setAttribute('aria-label', 'Loop');
    btn.setAttribute('aria-pressed', 'false');

    btn._isLoopTubeBtn = true;

    btn.style.setProperty('position', 'absolute', 'important');
    btn.style.setProperty('top', '50%', 'important');
    btn.style.setProperty('right', '15px', 'important');
    btn.style.setProperty('transform', 'translateY(-50%)', 'important');
    btn.style.setProperty('margin', '0', 'important');
    btn.style.setProperty('z-index', '2147483647', 'important');
    btn.style.setProperty('pointer-events', 'auto', 'important');
    btn.style.setProperty('touch-action', 'manipulation', 'important');

    btn.style.background = 'rgba(0, 0, 0, 0.4)';
    btn.style.borderRadius = '50%';
    btn.style.color = '#ffffff';
    btn.style.border = 'none';
    btn.style.padding = '8px';
    btn.style.cursor = 'pointer';
    btn.style.transition = 'opacity 0.25s cubic-bezier(0,0,0.2,1), color 0.2s';

    icon.style.width = '24px';
    icon.style.height = '24px';
    icon.style.fill = 'currentColor';

    btn.appendChild(icon);

    btn.addEventListener('pointerdown', absorbMobileButtonEvent);
    btn.addEventListener('pointerup', activateMobileButton);
    btn.addEventListener('touchstart', absorbMobileButtonEvent, { passive: false });
    btn.addEventListener('touchend', activateMobileButton, { passive: false });
    btn.addEventListener('click', activateMobileButton);

    return btn;
}

function placeButton(btn, controls) {
    const ccBtn = controls.querySelector('.ytp-subtitles-button') || controls.querySelector('.ytp-settings-button');

    try {
        if (ccBtn && ccBtn.parentNode === controls) {
            ccBtn.before(btn);
        } else {
            controls.appendChild(btn);
        }
    } catch {
        try {
            if (controls.isConnected) controls.appendChild(btn);
        } catch {
            btn.remove();
        }
    }
}

function ensureButton() {
    if (isMobile) {
        ensureMobileButton();
    } else {
        const controls = getControls();
        const oldBtn = getButton();

        if (!controls) return;

        // Ensure the button exists AND is not a dead YouTube clone
        if (oldBtn && oldBtn.parentNode === controls && oldBtn._isLoopTubeBtn) {
            updateButton();
            return;
        }

        // If it's a dead clone, destroy it
        if (oldBtn) oldBtn.remove();

        try {
            placeButton(createButton(), controls);
        } catch {
            getButton()?.remove();
        }

        updateButton();
    }
}

function ensureMobileButton() {
    installMobileInputHandlers();

    let btn = document.getElementById(BUTTON_ID);

    // Destroy dead clones
    if (btn && !btn._isLoopTubeBtn) {
        btn.remove();
        btn = null;
    }

    if (!btn) btn = createMobileButton();

    const player = document.querySelector('.html5-video-player') || document.querySelector('ytm-mobile-video-player-ui')?.parentElement;

    if (!player) {
        clearTimeout(state.retryTimeout);
        state.retryTimeout = setTimeout(ensureMobileButton, 500);
        return;
    }

    if (btn.parentNode !== player) {
        player.appendChild(btn);
    }

    updateButton();

    syncMobileFullscreen();

    if (!state.fullscreenHandler) {
        state.fullscreenHandler = syncMobileFullscreen;
        document.addEventListener('fullscreenchange', syncMobileFullscreen);
        document.addEventListener('webkitfullscreenchange', syncMobileFullscreen);
    }
}

function syncMobileFullscreen() {
    const btn = getButton();
    if (!btn) return;
    const isFull = !!document.fullscreenElement || !!document.webkitFullscreenElement;
    btn.style.opacity = isFull ? '0' : '1';
    btn.style.setProperty('pointer-events', isFull ? 'none' : 'auto', 'important');
}

function watchVideo(vid) {
    const id = getVideoId();

    if (vid === state.video && id === state.videoId) {
        // Enforce volume engine matching current state even if elements remain identical
        applyVolumeBoost();
        return;
    }
    if (isMobile) bgPlay.detachVideoListeners();
    if (state.videoObserver) state.videoObserver.disconnect();

    state.video = vid;
    state.videoId = id;

    if (isMobile) bgPlay.attachVideoListeners(vid);

    // On mobile the same <video> is reused, and YouTube resets `loop` when it loads the next
    // source, sometimes well after the URL changed. Each time a source starts loading, the
    // switch window starts again, and the saved value is put back as the video gets going.
    state.switchedAt = Date.now();
    if (state.loopRestoreVideo && state.loopRestoreHandler) {
        for (const t of LOOP_RESTORE_EVENTS) state.loopRestoreVideo.removeEventListener(t, state.loopRestoreHandler);
    }
    state.loopRestoreVideo = vid;
    state.loopRestoreHandler = (ev) => {
        if (!state.enabled || (state.video && state.video !== vid)) return;
        // Going back can load the previous video before LoopTube's own check notices the new URL
        // (or while a navigation has just cleared the cache), so catch up here.
        if (!state.video || getVideoId() !== state.videoId) {
            if (getVideo() === vid) watchVideo(vid);
            return;
        }
        if (ev.type === 'loadstart' || ev.type === 'loadedmetadata') state.switchedAt = Date.now();
        if (!isAdShowing() && vid.loop !== getSavedLoop(id)) setLoop(getSavedLoop(id), false);
    };
    for (const t of LOOP_RESTORE_EVENTS) vid.addEventListener(t, state.loopRestoreHandler);

    state.videoObserver = new MutationObserver(() => {
        if (Date.now() - state.switchedAt < LOOP_SWITCH_WINDOW_MS && !isAdShowing()) {
            const saved = getSavedLoop(id);
            if (vid.loop !== saved) setLoop(saved, false);
            updateButton();
            return;
        }
        saveLoop();
        updateButton();
    });

    state.videoObserver.observe(vid, {
        attributes: true,
        attributeFilter: ['loop']
    });

    if (!isAdShowing()) {
        setLoop(getSavedLoop(id), false);
    }

    // Auto-apply volume parameters to newly caught tracking target
    applyVolumeBoost();
    updateButton();
}

function refreshVideo() {
    const vid = getVideo();

    if (vid) {
        watchVideo(vid);
    } else {
        if (isMobile) bgPlay.detachVideoListeners();
        state.video = null;
        state.videoId = '';
        updateButton();
    }
}

