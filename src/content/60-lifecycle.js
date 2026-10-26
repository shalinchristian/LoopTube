function handleAds() {
    const adShowing = isAdShowing();

    if (adShowing && state.video && state.video.loop) {
        setLoop(false, false);
    }

    if (state.wasAdShowing && !adShowing && state.video) {
        setLoop(getSavedLoop(state.videoId), false);
    }

    state.wasAdShowing = adShowing;
}

function run() {
    state.scheduled = false;
    if (!state.enabled) return;

    observeDom();
    refreshVideo();
    ensureButton();
    handleAds();
}

function scheduleRun() {
    if (!state.enabled || state.scheduled) return;

    state.scheduled = true;
    // requestAnimationFrame callbacks can be dropped (hidden tabs, mobile YouTube page swaps).
    // If that happens, `scheduled` stays true and the button never comes back, so a timeout backs it up.
    const fire = () => { if (state.scheduled) run(); };
    requestAnimationFrame(fire);
    setTimeout(fire, 250);
}

function observeDom() {
    const target = getPlayer() || document.body;
    if (!target || target === state.observedTarget) return;

    if (state.domObserver) state.domObserver.disconnect();
    if (state.adObserver) state.adObserver.disconnect();

    state.observedTarget = target;

    state.domObserver = new MutationObserver(scheduleRun);
    state.domObserver.observe(target, { childList: true, subtree: true });

    if (target === state.player) {
        state.adObserver = new MutationObserver(scheduleRun);
        state.adObserver.observe(target, { attributes: true, attributeFilter: ['class', 'style'] });
    }
}

function isTyping(e) {
    const tag = e.target && e.target.tagName ? e.target.tagName.toLowerCase() : '';
    return e.target && (e.target.isContentEditable || tag === 'input' || tag === 'textarea' || tag === 'select');
}

function handleKeydown(e) {
    if (isTyping(e) || e.ctrlKey || e.altKey || e.metaKey) return;

    // Plain L is YouTube's own "forward 10 seconds", so LoopTube uses Shift+L.
    if (e.shiftKey && e.key.toLowerCase() === 'l') {
        e.preventDefault();
        e.stopPropagation();
        toggleLoop();
    }
}

function resetCache() {
    if (isMobile) bgPlay.detachVideoListeners();

    state.player = null;
    state.video = null;
    state.controls = null;
    state.videoId = '';
    state.wasAdShowing = false;
    clearTimeout(state.retryTimeout);

    if (state.adObserver) {
        state.adObserver.disconnect();
        state.adObserver = null;
    }

    if (state.fullscreenHandler) {
        document.removeEventListener('fullscreenchange', state.fullscreenHandler);
        document.removeEventListener('webkitfullscreenchange', state.fullscreenHandler);
        state.fullscreenHandler = null;
    }
}
