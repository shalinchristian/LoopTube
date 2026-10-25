const api = globalThis.browser || chrome;
const usingBrowserApi = typeof globalThis.browser !== 'undefined';

const BUTTON_ID = 'looptube-btn';
const ENABLED_KEY = 'looptubeEnabled';
const VIDEO_KEY_PREFIX = 'looptube:video:';
const MOBILE_ACTIVATION_DEDUPE_MS = 350;
const isMobile = location.hostname.includes('m.youtube.com');
const VOLUME_KEY = 'looptubeVolume';
const LOOP_INDEX_KEY = 'looptube:index';
const MAX_SAVED_LOOPS = 200;
const state = {
    enabled: true,
    bgPlayEnabled: true, // background playback stays on even when the loop button is disabled
    volumeLevel: 100,
    player: null,
    video: null,
    controls: null,
    videoId: '',
    wasAdShowing: false,
    ignoringLoopChange: false,
    scheduled: false,
    started: false,
    observedTarget: null,
    domObserver: null,
    videoObserver: null,
    adObserver: null,
    retryTimeout: null,
    fullscreenHandler: null,
    mobileInputHandlersInstalled: false,
    lastMobileActivation: 0
};

function storageGet(defaults) {
    if (usingBrowserApi) {
        return api.storage.local.get(defaults);
    }
    return new Promise((res) => {
        api.storage.local.get(defaults, res);
    });
}

