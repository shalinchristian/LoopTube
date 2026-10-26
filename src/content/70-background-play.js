const bgPlay = {
    inited: false,
    interval: null,
    wasPlaying: false,
    closing: false,
    eventsBound: false,
    userPaused: false,
    suspendByVisibility: false,
    visibilityTimer: null,
    attachedVideo: null,
    videoPauseHandler: null,
    videoPlayHandler: null,

    init() {
        this.syncState();
        if (this.inited) return;
        this.inited = true;

        this.bindEvents();
        this.startKeepAlive();

        // Like Brave: background play only covers a locked screen or a switched app.
        // When Firefox closes the page (quit, tab closed, app removed from recents),
        // pagehide/freeze fire and playback stops instead of being resumed.
        this.boundPageClose = () => this.handlePageClose();
        window.addEventListener('pagehide', this.boundPageClose, true);
        document.addEventListener('freeze', this.boundPageClose, true);
    },

    handlePageClose() {
        this.closing = true;
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
        const video = this.attachedVideo || state.video || getVideo();
        if (video && !video.paused) video.pause();
    },

    syncState() {
        // Pass enabled state to the main world via dataset
        document.documentElement.dataset.bgPlay = String(state.bgPlayEnabled);
    },
    attachVideoListeners(video) {
        if (!video || this.attachedVideo === video) return;

        this.detachVideoListeners();

        this.videoPauseHandler = () => {
            if (!this.suspendByVisibility) {
                this.userPaused = true;
            }
        };

        this.videoPlayHandler = () => {
            this.userPaused = false;
        };

        video.addEventListener('pause', this.videoPauseHandler);
        video.addEventListener('play', this.videoPlayHandler);
        this.attachedVideo = video;
    },
    detachVideoListeners() {
        if (!this.attachedVideo) {
            this.videoPauseHandler = null;
            this.videoPlayHandler = null;
            return;
        }

        if (this.videoPauseHandler) {
            this.attachedVideo.removeEventListener('pause', this.videoPauseHandler);
        }

        if (this.videoPlayHandler) {
            this.attachedVideo.removeEventListener('play', this.videoPlayHandler);
        }

        this.attachedVideo = null;
        this.videoPauseHandler = null;
        this.videoPlayHandler = null;
    },
    handleEvent(e) {
        // Leave element blur alone (search box, comments). Only page-level events while playing.
        if (e.target !== window && e.target !== document) return;
        const video = this.attachedVideo || state.video || getVideo();
        if (!video || video.paused) return;
        if (state.bgPlayEnabled && e.isTrusted) {
            e.stopImmediatePropagation();
            e.stopPropagation();
        }
    },

    bindEvents() {
        if (this.eventsBound) return;
        const evts = ['visibilitychange', 'webkitvisibilitychange', 'blur'];

        // Bind functions directly to preserve references
        this.boundHandleEvent = this.handleEvent.bind(this);
        this.boundVisibilitySync = () => {
            if (document.hidden) {
                this.suspendByVisibility = true;

                if (this.visibilityTimer) {
                    clearTimeout(this.visibilityTimer);
                }

                // Only a pause in the first moment after leaving is YouTube's own visibility pause.
                // A later pause (another app or game taking audio, a call) must be respected.
                this.resumedThisHide = false;
                this.visibilityTimer = setTimeout(() => {
                    this.suspendByVisibility = false;
                    this.visibilityTimer = null;
                }, 400);
            } else {
                this.suspendByVisibility = false;

                if (this.visibilityTimer) {
                    clearTimeout(this.visibilityTimer);
                    this.visibilityTimer = null;
                }
            }
        };

        evts.forEach(evt => {
            document.addEventListener(evt, this.boundVisibilitySync, true);
            window.addEventListener(evt, this.boundVisibilitySync, true);
            document.addEventListener(evt, this.boundHandleEvent, true);
            window.addEventListener(evt, this.boundHandleEvent, true);
        });

        this.boundVisibilitySync();
        this.eventsBound = true;
    },
    unbindEvents() {
        if (!this.eventsBound || !this.boundHandleEvent) return;

        const evts = ['visibilitychange', 'webkitvisibilitychange', 'blur'];

        evts.forEach(evt => {
            if (this.boundVisibilitySync) {
                document.removeEventListener(evt, this.boundVisibilitySync, true);
                window.removeEventListener(evt, this.boundVisibilitySync, true);
            }
            document.removeEventListener(evt, this.boundHandleEvent, true);
            window.removeEventListener(evt, this.boundHandleEvent, true);
        });

        this.boundVisibilitySync = null;
        this.eventsBound = false;
    },
    startKeepAlive() {
        if (this.interval) clearInterval(this.interval);

        this.interval = setInterval(() => {
            if (!state.bgPlayEnabled || this.closing) return;
            // Only work on video pages.
            if (!/^\/(watch|shorts\/)/.test(location.pathname)) { this.wasPlaying = false; return; }
            // Background play is independent of the loop button toggle, so
            // find the video ourselves when the loop feature is switched off.
            const video = state.video || getVideo();
            if (!video) return;
            this.attachVideoListeners(video);

            // While the app is open, just remember whether it was playing; never touch playback.
            if (!document.hidden) {
                this.wasPlaying = !video.paused;
                return;
            }

            // In the background, never call play(): YouTube can't see the page hidden while a video
            // plays, so any pause here comes from the user, a call or another app (a game) and must stick.
        }, 800);
    },

    stop() {
        this.userPaused = false;
        this.suspendByVisibility = false;
        if (this.visibilityTimer) {
            clearTimeout(this.visibilityTimer);
            this.visibilityTimer = null;
        }
        document.documentElement.dataset.bgPlay = 'false';
        this.detachVideoListeners();
        this.unbindEvents();
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
    }
};
