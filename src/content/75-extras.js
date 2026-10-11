// Extra playback tools: A-B loop, speed control, sleep timer, per-video volume.
// These work through the popup and do not depend on the loop button toggle.
const VOLUME_MEMORY_PREFIX = 'looptube:volume:';
const extras = {
    abStart: null,
    abEnd: null,
    abVideo: null,
    abHandler: null,
    sleepTimer: null,
    sleepEndsAt: 0,
    sleepMinutes: 0,
    volumeVideoId: '',

    video() {
        return state.video || getVideo();
    },

    currentVideoId() {
        return getVideoId() || '';
    },

    setAB(point) {
        const vid = this.video();
        if (!vid) return;
        if (point === 'a') this.abStart = vid.currentTime;
        if (point === 'b') this.abEnd = vid.currentTime;
        if (point === 'clear') { this.abStart = null; this.abEnd = null; }
        if (this.abStart !== null && this.abEnd !== null && this.abEnd < this.abStart) {
            [this.abStart, this.abEnd] = [this.abEnd, this.abStart];
        }
        this.bindAB(vid);
    },

    bindAB(vid) {
        if (this.abVideo && this.abHandler) this.abVideo.removeEventListener('timeupdate', this.abHandler);
        this.abVideo = null;
        this.abHandler = null;
        if (this.abStart === null || this.abEnd === null || this.abEnd - this.abStart < 0.5) return;
        this.abHandler = () => {
            if (isAdShowing()) return;
            if (vid.currentTime >= this.abEnd || vid.currentTime < this.abStart - 1) vid.currentTime = this.abStart;
        };
        vid.addEventListener('timeupdate', this.abHandler);
        this.abVideo = vid;
    },

    resetAB() {
        this.abStart = null;
        this.abEnd = null;
        this.bindAB(null);
    },

    setSpeed(rate) {
        const vid = this.video();
        const r = Number(rate);
        if (vid && r >= 0.25 && r <= 4) vid.playbackRate = r;
    },

    setSleep(minutes) {
        if (this.sleepTimer) clearTimeout(this.sleepTimer);
        this.sleepTimer = null;
        this.sleepEndsAt = 0;
        this.sleepMinutes = 0;
        const m = Number(minutes);
        if (!m || m <= 0) return;
        this.sleepEndsAt = Date.now() + m * 60000;
        this.sleepMinutes = m;
        this.sleepTimer = setTimeout(() => {
            const vid = this.video();
            if (vid) vid.pause();
            this.sleepTimer = null;
            this.sleepEndsAt = 0;
            this.sleepMinutes = 0;
        }, m * 60000);
    },

    async rememberVolume(on) {
        const id = this.currentVideoId();
        if (!id) return;
        const key = VOLUME_MEMORY_PREFIX + id;
        if (on) await api.storage.local.set({ [key]: state.volumeLevel });
        else await api.storage.local.remove(key);
    },

    // Called on navigation: apply a saved volume for this video, or restore the global level.
    async applyVideoVolume() {
        const id = this.currentVideoId();
        if (!id || id === this.volumeVideoId) return;
        this.volumeVideoId = id;
        this.resetAB();
        const key = VOLUME_MEMORY_PREFIX + id;
        const data = await storageGet({ [key]: null, [VOLUME_KEY]: 100 });
        state.volumeLevel = parseInt(data[key] !== null ? data[key] : data[VOLUME_KEY], 10);
        applyVolumeBoost();
    },

    async status() {
        const vid = this.video();
        const id = this.currentVideoId();
        const key = VOLUME_MEMORY_PREFIX + id;
        const data = id ? await storageGet({ [key]: null }) : {};
        return {
            ok: true,
            hasVideo: Boolean(vid),
            speed: vid ? vid.playbackRate : 1,
            abStart: this.abStart,
            abEnd: this.abEnd,
            sleepEndsAt: this.sleepEndsAt,
            sleepMinutes: this.sleepMinutes,
            volume: state.volumeLevel,
            volumeRemembered: Boolean(id && data[key] !== null)
        };
    },

    handle(msg) {
        switch (msg.action) {
            case 'setAB': this.setAB(msg.point); break;
            case 'setSpeed': this.setSpeed(msg.rate); break;
            case 'setSleep': this.setSleep(msg.minutes); break;
            case 'rememberVolume': return this.rememberVolume(Boolean(msg.on)).then(() => this.status());
            case 'getStatus': break;
            default: return null;
        }
        return this.status();
    }
};

setInterval(() => {
    extras.applyVideoVolume();
    // With the loop button off, watchVideo() isn't running, so keep the boost attached to new videos here.
    if (!state.enabled) applyVolumeBoost();
}, 1000);
