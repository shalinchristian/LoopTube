// Runs in YouTube's own page context (manifest "world": "MAIN") on mobile YouTube only.
// While background play is on, it reports the page as visible and focused so YouTube doesn't
// pause, suspend or drop quality when the screen locks or the tab is switched. The content
// script sets data-bg-play.
//
// What YouTube's mobile player actually checks (player-plasma base.js):
// - isBackground() reads document.visibilityState fresh on every timeupdate/playing/visibilitychange;
//   when it is not "visible" and the video isn't backgroundable it logs "bgmobile suspend" and pauses.
// - getVisibilityState() also treats a page without document.hasFocus() as background
//   (experiment "log_foreground_not_focused_as_background").
// - The 360p background quality cap and several stall/retry paths use the same isBackground().
// - It listens for visibilitychange on document, and the m.youtube app also listens for window blur.
// - The dropped-frames quality downgrade is skipped only when isBackground() is true, so with the
//   page reported visible YouTube itself never lowers quality on hide.
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

    const origHasFocus = Document.prototype.hasFocus;
    if (typeof origHasFocus === 'function') {
        Object.defineProperty(document, 'hasFocus', {
            configurable: true,
            writable: true,
            value: function hasFocus() {
                return isActive() ? true : origHasFocus.call(this);
            }
        });
    }

    const origHidden = Object.getOwnPropertyDescriptor(Document.prototype, 'hidden');
    const reallyHidden = () => Boolean(origHidden && origHidden.get && origHidden.get.call(document));
    let missedResize = false;

    const stopEvt = (e) => {
        if (e.isTrusted && isPageTarget(e.target) && isActive()) {
            e.stopImmediatePropagation();
            if (e.type === 'blur') return;
            // The page never sees the real change, and neither would LoopTube's own content
            // script (same event). Pass a private signal on so it can pause its menu timers.
            document.dispatchEvent(new Event('looptube-visibility'));
            // Back on screen: let YouTube lay out once for any resize it missed while hidden.
            if (!reallyHidden() && missedResize) {
                missedResize = false;
                setTimeout(() => window.dispatchEvent(new Event('resize')), 0);
            }
        }
    };

    // Turning the screen off can resize the viewport (surface torn down, or a portrait lock
    // screen over a landscape video). YouTube answers a resize by re-laying out the player and
    // re-picking the video quality for the new size, which switches streams mid-play. While the
    // screen is really off and background play is on, hold resizes back until it comes back.
    window.addEventListener('resize', (e) => {
        if (e.isTrusted && e.target === window && isActive() && reallyHidden()) {
            e.stopImmediatePropagation();
            missedResize = true;
        }
    }, true);

    // pagehide and freeze are left alone on purpose, so closing Firefox really stops playback.
    // These are added at document_start, before any YouTube script, so they run first.
    ['visibilitychange', 'webkitvisibilitychange', 'blur'].forEach((evt) => {
        window.addEventListener(evt, stopEvt, true);
        document.addEventListener(evt, stopEvt, true);
    });
})();
