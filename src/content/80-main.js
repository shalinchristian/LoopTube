function start() {
    if (state.started) return;

    state.started = true;
    state.enabled = true;
    if (isMobile) {
        bgPlay.init();
    }
    document.addEventListener('keydown', handleKeydown, true);
    window.addEventListener('yt-navigate-finish', handleNavigation);
    window.addEventListener('yt-page-data-updated', handleNavigation);
    window.addEventListener('state-navigateend', handleNavigation); // m.youtube.com

    observeDom();
    run();
}

function stop() {
    state.enabled = false;
    state.started = false;
    state.scheduled = false;
    // Background play is not stopped here: disabling the loop button only removes the button.

    document.removeEventListener('keydown', handleKeydown, true);
    window.removeEventListener('yt-navigate-finish', handleNavigation);
    window.removeEventListener('yt-page-data-updated', handleNavigation);
    window.removeEventListener('state-navigateend', handleNavigation);
    removeMobileInputHandlers();

    if (state.domObserver) state.domObserver.disconnect();
    if (state.videoObserver) state.videoObserver.disconnect();
    if (state.adObserver) state.adObserver.disconnect();

    state.domObserver = null;
    state.videoObserver = null;
    state.adObserver = null;
    state.observedTarget = null;

    // Volume boost is not reset here: disabling the loop button only removes the button.

    getButton()?.remove();
    resetCache();
}

function handleNavigation() {
    if (state.videoObserver) {
        state.videoObserver.disconnect();
        state.videoObserver = null;
    }

    resetCache();
    observeDom();
    scheduleRun();
}

function setEnabled(val) {
    if (val) start();
    else stop();
}

function handleMessage(msg, sender, sendRes) {
    if (!msg) return false;

    const extraResult = extras.handle(msg);
    if (extraResult) {
        extraResult.then(sendRes);
        return true;
    }

    if (msg.action === 'toggleExtension') {
        setEnabled(Boolean(msg.enabled));
        sendRes({ ok: true });
        return false;
    }

    if (msg.action === 'updateVolume') {
        state.volumeLevel = parseInt(msg.volume, 10);
        applyVolumeBoost();
        if (msg.remember) extras.rememberVolume(true);
        sendRes({ ok: true });
        return false;
    }

    return false;
}

function handleStorageChange(changes, area) {
    if (area !== 'local') return;
    if (changes[ENABLED_KEY]) {
        setEnabled(Boolean(changes[ENABLED_KEY].newValue));
    }
    if (changes[VOLUME_KEY]) {
        state.volumeLevel = parseInt(changes[VOLUME_KEY].newValue, 10);
        applyVolumeBoost();
    }
}

api.runtime.onMessage.addListener(handleMessage);
api.storage.onChanged.addListener(handleStorageChange);

storageGet({ [ENABLED_KEY]: true, [VOLUME_KEY]: 100 }).then((data) => {
    state.enabled = Boolean(data[ENABLED_KEY]);
    state.volumeLevel = parseInt(data[VOLUME_KEY], 10);
    if (isMobile) bgPlay.init();
    if (state.enabled) {
        if (document.body) start();
        else window.addEventListener('DOMContentLoaded', start, { once: true });
    }
});
