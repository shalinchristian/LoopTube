// Runs in YouTube's own page context (manifest "world": "MAIN") on mobile YouTube only.
// While background play is on, it reports the page as visible so YouTube doesn't pause
// when the screen locks or the tab is switched. The content script sets data-bg-play.
(() => {
    const isActive = () => document.documentElement.dataset.bgPlay === 'true';
    // Only page-level blur means "user left"; blur on a search or comment box must reach YouTube.
    const isPageTarget = (t) => t === window || t === document;

    const props = [
        { prop: 'hidden', activeVal: false },
        { prop: 'webkitHidden', activeVal: false },
        { prop: 'visibilityState', activeVal: 'visible' },
        { prop: 'webkitVisibilityState', activeVal: 'visible' }
    ];

    props.forEach(({ prop, activeVal }) => {
        const orig = Object.getOwnPropertyDescriptor(Document.prototype, prop);
        if (!orig) return;

        Object.defineProperty(document, prop, {
            configurable: true,
            enumerable: true,
            get() {
                if (isActive()) return activeVal;
                return orig.get ? orig.get.call(this) : orig.value;
            }
        });
    });

    const stopEvt = (e) => {
        if (e.isTrusted && isPageTarget(e.target) && isActive()) {
            e.stopImmediatePropagation();
        }
    };

    // pagehide is left alone on purpose, so closing Firefox really stops playback.
    ['visibilitychange', 'webkitvisibilitychange', 'blur'].forEach((evt) => {
        document.addEventListener(evt, stopEvt, true);
        window.addEventListener(evt, stopEvt, true);
    });
})();
