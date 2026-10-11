const bgPlay = {
    inited: false,
    interval: null,
    wasPlaying: false,
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

        this.injectSpoofer();
        this.bindEvents();
        this.startKeepAlive();
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
    injectSpoofer() {
        if (document.getElementById('looptube-spoofer')) return;

        const script = document.createElement('script');
        script.id = 'looptube-spoofer';
        script.textContent = `
            (() => {
                const isActive = () => document.documentElement.dataset.bgPlay === 'true';

                // 1. Preserve and override descriptors safely
                const props = [
                    { obj: Document.prototype, prop: 'hidden', trueVal: false },
                    { obj: Document.prototype, prop: 'webkitHidden', trueVal: false },
                    { obj: Document.prototype, prop: 'visibilityState', trueVal: 'visible' },
                    { obj: Document.prototype, prop: 'webkitVisibilityState', trueVal: 'visible' }
                ];

                props.forEach(({ obj, prop, trueVal }) => {
                    const orig = Object.getOwnPropertyDescriptor(obj, prop);
                    if (!orig) return;

                    Object.defineProperty(document, prop, {
                        configurable: true,
                        enumerable: true,
                        get() {
                            if (isActive()) return trueVal;
                            return orig.get ? orig.get.call(this) : orig.value;
                        }
                    });
                });

                // 2. Main-world event blocking
                const stopEvt = (e) => {
                    if (isActive() && e.isTrusted) {
                        e.stopImmediatePropagation();
                        e.stopPropagation();
                    }
                };

                ['visibilitychange', 'webkitvisibilitychange', 'pagehide', 'blur'].forEach(evt => {
                    document.addEventListener(evt, stopEvt, true);
                    window.addEventListener(evt, stopEvt, true);
                });
            })();
        `;
        (document.head || document.documentElement).appendChild(script);
        script.remove();
    },

    handleEvent(e) {
        if (state.bgPlayEnabled && e.isTrusted) {
            e.stopImmediatePropagation();
            e.stopPropagation();
        }
    },

    bindEvents() {
        if (this.eventsBound) return;
        const evts = ['visibilitychange', 'webkitvisibilitychange', 'pagehide', 'blur'];

        // Bind functions directly to preserve references
        this.boundHandleEvent = this.handleEvent.bind(this);
        this.boundVisibilitySync = () => {
            if (document.hidden) {
                this.suspendByVisibility = true;

                if (this.visibilityTimer) {
                    clearTimeout(this.visibilityTimer);
                }

                this.visibilityTimer = setTimeout(() => {
                    this.suspendByVisibility = false;
                    this.visibilityTimer = null;
                }, 1200);
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

        const evts = ['visibilitychange', 'webkitvisibilitychange', 'pagehide', 'blur'];

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
            if (!state.bgPlayEnabled) return;
            // Background play is independent of the loop button toggle, so
            // find the video ourselves when the loop feature is switched off.
            const video = state.video || getVideo();
            if (!video) return;
            this.attachVideoListeners(video);

            const isReallyHidden = document.hidden;

            if (!isReallyHidden) {
                this.wasPlaying = !video.paused;
                return;
            }

            if (
                isReallyHidden &&
                this.wasPlaying &&
                video.paused &&
                !video.ended &&
                this.userPaused === false
            ) {
                const p = video.play();

                if (p && typeof p.catch === 'function') {
                    p.catch(() => { });
                }
            }
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
