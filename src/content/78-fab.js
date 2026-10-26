// Floating LoopTube button: a see-through glass button on video pages that opens the same
// controls as the toolbar popup, so people don't have to open the extensions menu.
const FAB_KEY = 'looptubeFab';
const FAB_POS_KEY = 'looptubeFabPos';
const FAB_SIZE_KEY = 'fabSize';
const FAB_ITEMS_KEY = 'menuItems';
const FAB_ITEMS = ['loop', 'volume', 'ab', 'speed', 'sleep'];
const FAB_SIZES = [[40, 'Small'], [52, 'Medium'], [64, 'Large']];
const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.5, 3];
const SLEEPS = [[0, 'Off'], [15, '15m'], [30, '30m'], [45, '45m'], [60, '1h'], [90, '1.5h']];
// The row under the title with the like button. The floating button never rests above it.
const FAB_LIKE_ROW = 'ytm-slim-video-action-bar-renderer, ytd-watch-metadata #actions';
const fabReducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const FAB_LOGO = 'data:image/png;base64,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';

const fabClamp = (v, a, b) => (v < a ? a : v > b ? b : v);
// Rubber band: how far past a limit something is pulled, resisted so it never goes past c.
const fabRubber = (d, c) => c * (1 - 1 / (d * 0.55 / c + 1));

// A damped spring, stepped in small substeps so it stays stable when frames are dropped.
class FabSpring {
    constructor(k, c, eps, x = 0) { Object.assign(this, { k, c, eps, x, to: x, v: 0 }); }
    set(to, v) { this.to = to; if (v !== undefined) this.v = v; }
    jump(x) { this.x = this.to = x; this.v = 0; }
    get busy() { return Math.abs(this.x - this.to) > this.eps || Math.abs(this.v) > this.eps * 8; }
    step(dt) {
        if (!this.busy) { this.x = this.to; this.v = 0; return false; }
        const n = Math.max(1, Math.ceil(dt / 0.004)), h = dt / n;
        for (let i = 0; i < n; i++) {
            this.v += (-this.k * (this.x - this.to) - this.c * this.v) * h;
            this.x += this.v * h;
        }
        return true;
    }
}

const FAB_CSS = `
:host { all: initial; }
* { box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", Inter, system-ui, "Segoe UI", Roboto, sans-serif; -webkit-font-smoothing: antialiased; }
.glass {
  background: rgba(18,18,20,0.7);
  -webkit-backdrop-filter: blur(18px) saturate(160%);
  backdrop-filter: blur(18px) saturate(160%);
  border: 1px solid rgba(255,255,255,0.14);
  box-shadow: 0 8px 28px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.18);
  color: #fff;
}
.fab {
  position: fixed; left: 0; top: 0; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; touch-action: none; user-select: none; z-index: 2147483000;
  opacity: 0.75; transition: opacity .2s; will-change: transform;
}
.fab.open, .fab.held, .fab:focus-visible { opacity: 1; }
@media (hover: hover) { .fab:hover { opacity: 1; } }
.fab.glass { background: rgba(20,20,24,0.55); border-color: rgba(255,255,255,0.28); }
.fab.looping { border-color: rgba(255,255,255,0.75); }
.fab img { width: 69%; height: 69%; filter: drop-shadow(0 1px 2px rgba(0,0,0,0.45)); pointer-events: none; -webkit-user-drag: none; }
.fab .lift { position: absolute; inset: 0; border-radius: 50%; box-shadow: 0 14px 32px rgba(0,0,0,0.42); opacity: 0; pointer-events: none; }
.panel {
  position: fixed; z-index: 2147483001; padding: 16px; border-radius: 22px;
  display: none; flex-direction: column; gap: 12px; font-size: 13px;
  overflow-y: auto; overscroll-behavior: contain; will-change: transform, opacity;
}
.panel.show { display: flex; }
.panel > * { flex: none; }
.off { display: none !important; }
.row { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.label { opacity: .6; font-weight: 600; font-size: 11.5px; letter-spacing: .04em; text-transform: uppercase; }
.value { font-variant-numeric: tabular-nums; opacity: .9; }
.chips { display: flex; flex-wrap: wrap; gap: 6px; }
.sec { display: flex; flex-direction: column; gap: 8px; }
button.chip {
  border: 0; background: rgba(255,255,255,0.12); color: rgba(255,255,255,0.92);
  border-radius: 999px; padding: 7px 12px; font-size: 12.5px; font-weight: 500; cursor: pointer;
  transition: background .15s, color .15s, transform .1s;
}
button.chip:active { transform: scale(0.96); }
button.chip.on { background: rgba(255,255,255,0.95); color: #000; font-weight: 600; }
input[type=range] { -moz-appearance: none; appearance: none; width: 100%; height: 4px; margin: 10px 0; border-radius: 2px; background: rgba(255,255,255,0.25); accent-color: #fff; }
input[type=range]::-moz-range-track { height: 4px; border-radius: 2px; background: rgba(255,255,255,0.25); }
input[type=range]::-moz-range-progress { height: 4px; border-radius: 2px; background: #fff; }
input[type=range]::-moz-range-thumb { width: 18px; height: 18px; border: 0; border-radius: 50%; background: #fff; box-shadow: 0 1px 4px rgba(0,0,0,0.35); }
.note { font-size: 11px; opacity: .75; min-height: 14px; }
.brand { display: flex; align-items: center; gap: 8px; }
.brand img { width: 24px; height: 24px; }
.fly { position: fixed; left: 0; top: 0; display: none; z-index: 2147483002; pointer-events: none; transform-origin: 50% 50%; will-change: transform; filter: drop-shadow(0 1px 2px rgba(0,0,0,0.35)); }
.title { font-weight: 700; font-size: 16px; letter-spacing: -.01em; }

/* Light version, used when YouTube is in light mode. */
:host(.light) .glass {
  background: rgba(255,255,255,0.7); color: #1d1d1f;
  border-color: rgba(0,0,0,0.08);
  box-shadow: 0 10px 30px rgba(0,0,0,0.16), inset 0 1px 0 rgba(255,255,255,0.9);
}
:host(.light) .fab.glass { background: rgba(255,255,255,0.72); border-color: rgba(0,0,0,0.1); }
:host(.light) .fab.looping { border-color: rgba(0,0,0,0.45); }
:host(.light) .fab img { filter: drop-shadow(0 1px 1px rgba(0,0,0,0.15)); }
:host(.light) .fab .lift { box-shadow: 0 14px 32px rgba(0,0,0,0.25); }
:host(.light) button.chip { background: rgba(0,0,0,0.06); color: #1d1d1f; }
:host(.light) button.chip.on { background: #1d1d1f; color: #fff; }
:host(.light) input[type=range], :host(.light) input[type=range]::-moz-range-track { background: rgba(0,0,0,0.12); accent-color: #1d1d1f; }
:host(.light) input[type=range]::-moz-range-progress { background: #1d1d1f; }
:host(.light) input[type=range]::-moz-range-thumb { background: #1d1d1f; }
:host(.light) .label, :host(.light) .note { color: #1d1d1f; }
@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
  .panel.glass { background: rgba(18,18,20,0.96); }
  :host(.light) .panel.glass { background: rgba(255,255,255,0.97); }
}
`;

// cubic-bezier(x1, y1, x2, y2) as a function of time, solved by bisection.
function fabBezier(x1, y1, x2, y2) {
    const X = (u) => 3 * (1 - u) * (1 - u) * u * x1 + 3 * (1 - u) * u * u * x2 + u * u * u;
    const Y = (u) => 3 * (1 - u) * (1 - u) * u * y1 + 3 * (1 - u) * u * u * y2 + u * u * u;
    return (t) => {
        if (t <= 0) return 0;
        if (t >= 1) return 1;
        let lo = 0, hi = 1, u = t;
        for (let i = 0; i < 20; i++) { u = (lo + hi) / 2; if (X(u) < t) lo = u; else hi = u; }
        return Y(u);
    };
}
const fabEase = fabBezier(0.2, 0.8, 0.2, 1);
const fabLerp = (a, b, t) => a + (b - a) * t;
// requestAnimationFrame can stop firing on mobile YouTube (see scheduleRun), so a timeout
// backs it up and the animation always finishes. Returns a cancel function.
function fabNextFrame(cb) {
    let live = true;
    const run = () => { if (live) { live = false; cb(performance.now()); } };
    requestAnimationFrame(run);
    setTimeout(run, 40);
    return () => { live = false; };
}

// Open/close animation of the panel: the round button reshapes into the panel card (clip-path
// plus a translate), the logo travels into the header, and the controls fade in over the last
// 40%. Closing runs the same curve backwards, so it is an exact reverse, and a close during an
// open (or the other way round) just turns around. Everything about how the panel appears lives
// here, so the style can be swapped without touching the rest.
// c = { panel, btn: {cx, cy, size}, box: {left, top, w, h}, fly, headIcon, fabIcon, rows }
const fabPanelAnim = {
    OPEN_MS: 280, CLOSE_MS: 220,
    u: 0, dir: 0, raf: null, c: null, done: null,

    open(c) { this.run(c, 1, null); },
    close(c, done) { this.run(c, -1, done); },

    run(c, dir, done) {
        if (this.dir && this.c && this.c.panel === c.panel && !fabReducedMotion.matches) {
            this.c.box = c.box; // turn around from where it is now
        } else {
            this.finish(false);
            this.c = c;
            this.u = dir > 0 ? 0 : 1;
        }
        this.dir = dir;
        this.done = done;
        const p = c.panel;
        if (fabReducedMotion.matches) {
            p.style.transition = 'opacity .16s linear';
            p.style.opacity = dir > 0 ? '0' : '1';
            void p.offsetWidth;
            p.style.opacity = dir > 0 ? '1' : '0';
            const t = setTimeout(() => this.finish(true), 170);
            this.raf = () => clearTimeout(t);
            return;
        }
        const hi = c.headIcon.getBoundingClientRect();
        c.ic = { x1: hi.left + hi.width / 2, y1: hi.top + hi.height / 2, w: hi.width };
        c.headIcon.style.opacity = '0';
        c.fly.style.width = c.fly.style.height = hi.width + 'px';
        c.fly.style.display = 'block';
        if (this.raf) this.raf();
        let last = performance.now();
        const tick = (t) => {
            const dt = Math.max(0, t - last);
            last = t;
            this.u = fabClamp(this.u + this.dir * dt / (this.dir > 0 ? this.OPEN_MS : this.CLOSE_MS), 0, 1);
            this.draw();
            if (this.u === (this.dir > 0 ? 1 : 0)) this.finish(true);
            else this.raf = fabNextFrame(tick);
        };
        this.draw();
        this.raf = fabNextFrame(tick);
    },

    draw() {
        const c = this.c, u = this.u, B = c.box, S = c.btn.size, p = c.panel.style;
        // Button rect relative to the panel, kept inside it; the rest of the gap is a translate.
        const bx = c.btn.cx - S / 2 - B.left, by = c.btn.cy - S / 2 - B.top;
        const x0 = fabClamp(bx, 0, Math.max(0, B.w - S)), y0 = fabClamp(by, 0, Math.max(0, B.h - S));
        const qw = fabEase(fabClamp(u / 0.86, 0, 1)), qh = fabEase(fabClamp((u - 0.12) / 0.88, 0, 1));
        const x = fabLerp(x0, 0, qw), w = fabLerp(S, B.w, qw), y = fabLerp(y0, 0, qh), h = fabLerp(S, B.h, qh);
        const r = Math.min(fabLerp(S / 2, 22, Math.min(qw, qh)), w / 2, h / 2);
        p.transform = 'translate3d(' + ((bx - x0) * (1 - qw)).toFixed(2) + 'px,' + ((by - y0) * (1 - qh)).toFixed(2) + 'px,0)';
        p.clipPath = 'inset(' + y.toFixed(2) + 'px ' + (B.w - x - w).toFixed(2) + 'px ' + (B.h - y - h).toFixed(2) + 'px ' + x.toFixed(2) + 'px round ' + r.toFixed(2) + 'px)';
        p.opacity = '';
        // The logo flies from the button into the header.
        const I = c.ic, k = fabEase(fabClamp(u / 0.9, 0, 1)), s0 = S * 0.69 / Math.max(I.w, 1);
        const ix = fabLerp(c.btn.cx, I.x1, k), iy = fabLerp(c.btn.cy, I.y1, fabEase(fabClamp((u - 0.06) / 0.94, 0, 1)));
        c.fly.style.transform = 'translate3d(' + (ix - I.w / 2).toFixed(2) + 'px,' + (iy - I.w / 2).toFixed(2) + 'px,0) scale(' + fabLerp(s0, 1, k).toFixed(4) + ')';
        c.fabIcon.style.opacity = (1 - Math.min(1, u * 3)).toFixed(3);
        const a = fabEase(fabClamp((u - 0.6) / 0.4, 0, 1)).toFixed(3);
        for (const el of c.rows) el.style.opacity = a;
    },

    // Ends the running animation. `ran` is false when it is cut short (navigation, hiding).
    finish(ran) {
        if (this.raf) this.raf();
        this.raf = null;
        const c = this.c, done = this.done, dir = this.dir;
        this.c = this.done = null;
        this.dir = 0;
        if (!c) return;
        const p = c.panel.style;
        p.transform = p.clipPath = p.opacity = p.transition = '';
        if (c.fly) c.fly.style.display = 'none';
        if (c.headIcon) c.headIcon.style.opacity = '';
        if (c.fabIcon) c.fabIcon.style.opacity = '';
        for (const el of c.rows || []) el.style.opacity = '';
        if (ran && dir < 0 && done) done();
    }
};

const fab = {
    host: null, root: null, btn: null, panel: null, els: {}, sections: {},
    enabled: true, pos: null, size: 52, items: null, ticker: null,
    side: 'right', cyPref: 0, isOpen: false, natH: 0, panelY: 0,
    drag: null, samples: [], draggedAt: 0, running: false, last: 0,
    pushedState: false, ignorePop: false, eatClickUntil: 0,
    fx: new FabSpring(300, 24, 0.3), fy: new FabSpring(300, 26, 0.3),
    lift: new FabSpring(700, 42, 0.002), grow: new FabSpring(380, 24, 0.002, 1),

    h(tag, cls, text) {
        const el = document.createElement(tag);
        if (cls) el.className = cls;
        if (text) el.textContent = text;
        return el;
    },

    icon() {
        // The LoopTube logo, inlined so the page doesn't need access to extension files.
        const img = document.createElement('img');
        img.src = FAB_LOGO;
        img.alt = '';
        img.draggable = false;
        return img;
    },

    chipRow(list, key) {
        const row = this.h('div', 'chips');
        for (const [v, t] of list) {
            const c = this.h('button', 'chip', t);
            c.dataset[key] = v;
            row.append(c);
        }
        return row;
    },

    build() {
        this.host = this.h('div');
        this.host.id = 'looptube-fab-host';
        this.root = this.host.attachShadow({ mode: 'closed' });
        const style = this.h('style');
        style.textContent = FAB_CSS;
        this.root.appendChild(style);

        this.btn = this.h('div', 'fab glass');
        this.btn.setAttribute('role', 'button');
        this.btn.setAttribute('tabindex', '0');
        this.btn.setAttribute('aria-label', 'LoopTube controls');
        this.btn.append(this.h('span', 'lift'), this.icon());
        this.root.appendChild(this.btn);

        const p = this.panel = this.h('div', 'panel glass');
        const e = this.els, s = this.sections;
        const head = this.h('div', 'row');
        const brand = this.h('span', 'brand');
        this.headIcon = this.icon();
        brand.append(this.headIcon, this.h('span', 'title', 'LoopTube'));
        head.append(brand);
        this.headRest = brand.lastChild;
        e.loop = s.loop = this.h('button', 'chip', 'Loop');
        head.append(e.loop);
        p.append(head);

        s.volume = this.h('div');
        const vr = this.h('div', 'row');
        e.volLabel = this.h('span', 'value', '100%');
        vr.append(this.h('span', 'label', 'Volume boost'), e.volLabel);
        e.vol = this.h('input');
        Object.assign(e.vol, { type: 'range', min: 100, max: 350, step: 10, value: 100 });
        s.volume.append(vr, e.vol);
        p.append(s.volume);

        s.ab = this.h('div');
        const ar = this.h('div', 'row');
        ar.append(this.h('span', 'label', 'A–B loop'));
        const abChips = this.h('div', 'chips');
        e.a = this.h('button', 'chip', 'Set A');
        e.b = this.h('button', 'chip', 'Set B');
        e.clear = this.h('button', 'chip', 'Clear');
        abChips.append(e.a, e.b, e.clear);
        ar.append(abChips);
        e.abNote = this.h('div', 'note');
        s.ab.append(ar, e.abNote);
        p.append(s.ab);

        s.speed = this.h('div', 'sec');
        e.speeds = this.chipRow(SPEEDS.map((v) => [v, v + '×']), 'v');
        s.speed.append(this.h('span', 'label', 'Speed'), e.speeds);
        p.append(s.speed);

        s.sleep = this.h('div', 'sec');
        const sl = this.h('div', 'row');
        sl.append(this.h('span', 'label', 'Sleep timer'));
        e.sleepNote = this.h('span', 'value');
        sl.append(e.sleepNote);
        e.sleeps = this.chipRow(SLEEPS, 'v');
        s.sleep.append(sl, e.sleeps);
        p.append(s.sleep);

        const sz = this.h('div', 'sec');
        e.sizes = this.chipRow(FAB_SIZES, 'size');
        sz.append(this.h('span', 'label', 'Button size'), e.sizes);
        p.append(sz);
        this.root.appendChild(p);
        this.fly = this.icon();
        this.fly.className = 'fly';
        this.root.appendChild(this.fly);

        this.applyItems();
        this.applySize(this.size, false);
        this.bind();
        this.restorePos();
    },

    bind() {
        const e = this.els;
        e.loop.addEventListener('click', () => {
            // With the player loop button turned off, the menu still loops the video, just without loop memory.
            if (state.enabled) toggleLoop();
            else { const v = extras.video(); if (v && !isAdShowing()) v.loop = !v.loop; }
            this.refresh();
        });
        e.vol.addEventListener('input', () => { e.volLabel.textContent = e.vol.value + '%'; });
        e.vol.addEventListener('change', () => {
            state.volumeLevel = parseInt(e.vol.value, 10);
            applyVolumeBoost();
            api.storage.local.set({ [VOLUME_KEY]: state.volumeLevel });
        });
        e.a.addEventListener('click', () => { extras.setAB('a'); this.refresh(); });
        e.b.addEventListener('click', () => { extras.setAB('b'); this.refresh(); });
        e.clear.addEventListener('click', () => { extras.setAB('clear'); this.refresh(); });
        e.speeds.addEventListener('click', (ev) => {
            const v = ev.target.dataset && ev.target.dataset.v;
            if (v) { extras.setSpeed(v); this.refresh(); }
        });
        e.sleeps.addEventListener('click', (ev) => {
            const v = ev.target.dataset && ev.target.dataset.v;
            if (v !== undefined) { extras.setSleep(v); this.refresh(); }
        });
        e.sizes.addEventListener('click', (ev) => {
            const v = Number(ev.target.dataset && ev.target.dataset.size);
            if (!v || v === this.size) return;
            this.applySize(v, true);
            api.storage.local.set({ [FAB_SIZE_KEY]: v });
        });

        // Pointer events handle dragging. Opening uses the click event, which still fires
        // if YouTube redraws or grabs focus mid-tap and the pointer is lost.
        const b = this.btn;
        b.addEventListener('pointerdown', (ev) => this.dragStart(ev));
        b.addEventListener('pointermove', (ev) => this.dragMove(ev));
        b.addEventListener('pointerup', (ev) => this.dragEnd(ev));
        b.addEventListener('pointercancel', (ev) => this.dragEnd(ev));
        b.addEventListener('lostpointercapture', (ev) => this.dragEnd(ev));
        b.addEventListener('contextmenu', (ev) => ev.preventDefault());
        b.addEventListener('click', (ev) => {
            ev.stopPropagation();
            if (Date.now() - this.draggedAt < 400) return; // the click that ends a drag
            this.toggle();
        });
        b.addEventListener('keydown', (ev) => {
            if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); this.toggle(); }
        });
        // A tap anywhere else closes the panel, and only closes it: the click that follows
        // is swallowed so the same tap doesn't also pause the video or open a link.
        document.addEventListener('pointerdown', (ev) => {
            if (this.isOpen && !ev.composedPath().includes(this.host)) {
                this.close();
                this.eatClickUntil = Date.now() + 600;
            }
        }, true);
        document.addEventListener('click', (ev) => {
            if (Date.now() < this.eatClickUntil && !ev.composedPath().includes(this.host)) {
                this.eatClickUntil = 0;
                ev.preventDefault();
                ev.stopPropagation();
            }
        }, true);
        document.addEventListener('keydown', (ev) => { if (ev.key === 'Escape' && this.isOpen) this.close(); }, true);
        // Android back gesture: opening pushes a history entry with the same URL and page state,
        // so going back only closes the panel. Registered in the capture phase so it runs before
        // YouTube's own listener, which then never sees this popstate.
        window.addEventListener('popstate', (ev) => {
            if (this.ignorePop) {
                this.ignorePop = false;
                ev.stopImmediatePropagation();
                return;
            }
            if (!this.pushedState) return;
            this.pushedState = false;
            if (this.isOpen && location.href === this.openHref) {
                ev.stopImmediatePropagation();
                this.close(true);
            }
        }, true);
        // Screen off or app in the background: stop the panel's timers and animations so
        // nothing keeps waking the page while audio plays. They pick up again on return.
        // With background play on, the page script swallows the real visibilitychange and
        // sends 'looptube-visibility' instead. document.hidden here is always the real value.
        document.addEventListener('visibilitychange', () => this.onVisibility());
        document.addEventListener('looptube-visibility', () => this.onVisibility());
        document.addEventListener('fullscreenchange', () => this.sync());
        // A screen lock can resize the viewport (landscape video, portrait lock screen). Do the
        // layout at most once a frame, and not at all while hidden; onVisibility catches up.
        let resizeQueued = false;
        window.addEventListener('resize', () => {
            if (resizeQueued || document.hidden) return;
            resizeQueued = true;
            fabNextFrame(() => { resizeQueued = false; if (!document.hidden) { this.dock(true); this.layoutPanel(); } });
        });
        let scrollQueued = false;
        window.addEventListener('scroll', () => {
            if (scrollQueued) return;
            scrollQueued = true;
            fabNextFrame(() => { scrollQueued = false; if (!this.drag && !this.running) this.dock(true); this.layoutPanel(); });
        }, { passive: true });
        new MutationObserver(() => this.applyTheme())
            .observe(document.documentElement, { attributes: true, attributeFilter: ['dark', 'darker-dark-theme'] });
        matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => this.applyTheme());
    },

    // Where the button centre may rest. Below the player and the like row when the button's
    // column overlaps the player (always on phones), otherwise anywhere on screen.
    zone(cx) {
        const W = innerWidth, H = innerHeight, R = this.size / 2, M = 10;
        const z = { minCx: M + R, maxCx: W - M - R, maxCy: H - M - R, playerBottom: 0, minCy: M + R };
        const pl = getPlayer();
        const pr = pl && pl.getBoundingClientRect();
        const x = cx === undefined ? (this.side === 'left' ? z.minCx : z.maxCx) : cx;
        if (pr && pr.height > 0 && pr.bottom > 0 && x + R > pr.left && x - R < pr.right) {
            z.playerBottom = Math.min(pr.bottom, H);
            let top = z.playerBottom;
            const like = document.querySelector(FAB_LIKE_ROW);
            const lr = like && like.getBoundingClientRect();
            if (lr && lr.height > 0 && lr.bottom > top && lr.top < H) top = lr.bottom;
            z.minCy = top + 8 + R;
            // Shorts (and a fullscreen-like player) cover the whole screen, so there is no room
            // below it. Then the button and panel go over the player instead of off the bottom.
            if (z.minCy > z.maxCy - this.size) { z.playerBottom = 0; z.minCy = M + R; }
        }
        if (z.minCy > z.maxCy) z.minCy = z.maxCy;
        return z;
    },

    edgeX(side) {
        const z = this.zone();
        return side === 'left' ? z.minCx : z.maxCx;
    },

    restorePos() {
        const H = innerHeight, W = innerWidth, p = this.pos;
        if (p && (p.side === 'left' || p.side === 'right')) {
            this.side = p.side;
            this.cyPref = Number(p.y) * H;
        } else if (p && typeof p.x === 'number') {
            // 1.4.4 saved a free top-left position. Move it to the nearest side.
            this.side = p.x * W + 26 < W / 2 ? 'left' : 'right';
            this.cyPref = p.y * H + 26;
            this.savePos();
        } else {
            this.side = 'right';
            this.cyPref = H - this.size / 2 - (isMobile ? 72 : 24);
        }
        this.dock(true);
    },

    savePos() {
        this.pos = { side: this.side, y: +(this.cyPref / innerHeight).toFixed(4) };
        api.storage.local.set({ [FAB_POS_KEY]: this.pos });
    },

    // Puts the button back on its side at its preferred height, within the allowed zone.
    dock(instant) {
        if (!this.btn) return;
        const z = this.zone(), x = this.edgeX(this.side), y = fabClamp(this.cyPref, z.minCy, z.maxCy);
        if (instant || fabReducedMotion.matches) { this.fx.jump(x); this.fy.jump(y); this.render(); } else { this.fx.set(x); this.fy.set(y); }
        this.kick();
    },

    dragStart(ev) {
        if (ev.button > 0 || this.drag) return;
        this.drag = { id: ev.pointerId, sx: ev.clientX, sy: ev.clientY, ox: this.fx.x, oy: this.fy.x, tx: this.fx.x, ty: this.fy.x, moved: false };
        this.samples = [[performance.now(), ev.clientX, ev.clientY]];
        this.btn.classList.add('held');
        try { this.btn.setPointerCapture(ev.pointerId); } catch (_) { /* pointer already gone */ }
    },

    dragMove(ev) {
        const d = this.drag;
        if (!d || ev.pointerId !== d.id) return;
        if (!d.moved) {
            // Taps never move the button: it only starts after 8px, and from where it is now.
            if (Math.hypot(ev.clientX - d.sx, ev.clientY - d.sy) < 8) return;
            Object.assign(d, { moved: true, sx: ev.clientX, sy: ev.clientY, ox: this.fx.x, oy: this.fy.x });
            if (!fabReducedMotion.matches) this.lift.set(1);
        }
        let tx = d.ox + ev.clientX - d.sx, ty = d.oy + ev.clientY - d.sy;
        const z = this.zone(tx);
        if (fabReducedMotion.matches) {
            tx = fabClamp(tx, z.minCx, z.maxCx);
            ty = fabClamp(ty, z.minCy, z.maxCy);
        } else {
            // Resist being pulled onto the video, and past the screen edges.
            if (ty < z.minCy) ty = z.minCy - fabRubber(z.minCy - ty, 110);
            if (ty > z.maxCy) ty = z.maxCy + fabRubber(ty - z.maxCy, 40);
            if (tx < z.minCx) tx = z.minCx - fabRubber(z.minCx - tx, 30);
            if (tx > z.maxCx) tx = z.maxCx + fabRubber(tx - z.maxCx, 30);
        }
        d.tx = tx;
        d.ty = ty;
        const t = performance.now();
        this.samples.push([t, ev.clientX, ev.clientY]);
        while (this.samples.length > 2 && t - this.samples[0][0] > 90) this.samples.shift();
        this.kick();
    },

    dragEnd(ev) {
        const d = this.drag;
        if (!d || ev.pointerId !== d.id) return;
        this.drag = null;
        this.btn.classList.remove('held');
        if (!d.moved) return;
        this.draggedAt = Date.now();
        this.lift.set(0);
        // Fling: carry on a little in the direction of travel, then spring to the nearer side.
        let vx = 0, vy = 0;
        const s = this.samples, a = s[0], b = s[s.length - 1];
        if (s.length > 1) {
            const dt = (b[0] - a[0]) / 1000;
            if (dt > 0.008 && performance.now() - b[0] < 60) { vx = (b[1] - a[1]) / dt; vy = (b[2] - a[2]) / dt; }
        }
        const sp = Math.hypot(vx, vy);
        if (sp > 2600) { vx *= 2600 / sp; vy *= 2600 / sp; }
        const projX = this.fx.x + vx * 0.1, mid = innerWidth / 2;
        // Dead centre goes back to the side it came from.
        if (Math.abs(projX - mid) >= 1.5) this.side = projX < mid ? 'left' : 'right';
        const z = this.zone();
        this.cyPref = fabClamp(this.fy.x + vy * 0.12, z.minCy, z.maxCy);
        if (fabReducedMotion.matches) { this.fx.jump(this.edgeX(this.side)); this.fy.jump(this.cyPref); } else {
            this.fx.set(this.edgeX(this.side), vx);
            this.fy.set(this.cyPref, vy * 0.6);
        }
        this.savePos();
        this.kick();
    },

    kick() {
        if (this.running) return;
        this.running = true;
        this.last = performance.now();
        fabNextFrame((t) => this.frame(t));
    },

    frame(t) {
        const dt = Math.min(0.05, Math.max(0, (t - this.last) / 1000));
        this.last = t;
        let busy = false;
        const d = this.drag;
        if (d && d.moved) {
            // Follows the finger with a slight lag, which makes it feel weighted.
            const k = fabReducedMotion.matches ? 1 : 1 - Math.exp(-dt * 22);
            this.fx.x += (d.tx - this.fx.x) * k;
            this.fy.x += (d.ty - this.fy.x) * k;
            this.fx.to = this.fx.x; this.fy.to = this.fy.x; this.fx.v = this.fy.v = 0;
            busy = true;
        } else {
            busy = this.fx.step(dt) | this.fy.step(dt);
        }
        busy = this.lift.step(dt) | this.grow.step(dt) | busy;
        if (this.isOpen) {
            // The panel trails the button up and down while it moves.
            const k = fabReducedMotion.matches ? 1 : 1 - Math.exp(-dt * 14);
            this.panelY += (this.fy.x - this.panelY) * k;
            if (Math.abs(this.fy.x - this.panelY) > 0.3) busy = true;
            else this.panelY = this.fy.x;
            this.layoutPanel(this.panelY);
        }
        this.render();
        if (busy) fabNextFrame((n) => this.frame(n));
        else this.running = false;
    },

    render() {
        if (!this.btn) return;
        const R = this.size / 2, W = innerWidth, H = innerHeight;
        let x = this.fx.x, y = this.fy.x;
        // Never visibly off screen, even mid-fling.
        if (x < R + 2) x = R + 2 - fabRubber(R + 2 - x, R * 0.6);
        if (x > W - R - 2) x = W - R - 2 + fabRubber(x - (W - R - 2), R * 0.6);
        if (y > H - R - 2) y = H - R - 2 + fabRubber(y - (H - R - 2), R * 0.5);
        const lift = fabClamp(this.lift.x, -0.2, 1.3);
        const k = this.grow.x * (1 + 0.1 * lift);
        this.btn.style.transform = 'translate3d(' + (x - R).toFixed(2) + 'px,' + (y - R).toFixed(2) + 'px,0) scale(' + k.toFixed(4) + ')';
        this.btn.firstChild.style.opacity = fabClamp(lift, 0, 1).toFixed(3);
    },

    applySize(px, animate) {
        const old = this.size;
        this.size = px;
        if (!this.btn) return;
        this.btn.style.width = this.btn.style.height = px + 'px';
        for (const c of this.els.sizes.children) c.classList.toggle('on', Number(c.dataset.size) === px);
        if (animate && !fabReducedMotion.matches) { this.grow.jump(old / px); this.grow.set(1); }
        this.dock(!animate);
        if (this.isOpen) this.measure();
    },

    applyItems() {
        if (!this.btn) return;
        for (const k of FAB_ITEMS) this.sections[k].classList.toggle('off', !this.items[k]);
        if (this.isOpen) this.measure();
    },

    anyItem() {
        return FAB_ITEMS.some((k) => this.items[k]);
    },

    // Natural height of the panel with the items that are switched on.
    measure() {
        const p = this.panel;
        p.style.width = Math.min(innerWidth - 16, 300) + 'px';
        p.style.height = 'auto';
        this.natH = p.offsetHeight;
        this.layoutPanel();
    },

    // Up to 300px wide (8px margins on small screens), on the button's side. Above the
    // button in the lower half of the free area, below it in the upper half. It never covers
    // the player, and scrolls if it doesn't fit.
    layoutPanel(cy) {
        if (!this.isOpen) return;
        const z = this.zone(), W = innerWidth, H = innerHeight, R = this.size / 2, GAP = 10, M = 8;
        const y = cy === undefined ? this.fy.x : cy;
        const w = Math.min(W - 2 * M, 300), left = this.side === 'left' ? M : W - M - w;
        const low = y > (z.minCy + z.maxCy) / 2;
        let top, h;
        if (low) {
            const bottom = y - R - GAP;
            top = Math.max(z.playerBottom + 6, M, bottom - this.natH);
            h = bottom - top;
        } else {
            top = y + R + GAP;
            h = Math.min(this.natH, H - M - top);
        }
        h = Math.max(h, 80);
        const s = this.panel.style;
        s.left = left + 'px';
        s.top = top + 'px';
        s.width = w + 'px';
        s.height = h + 'px';
        this.panelBox = { left, top, w, h };
    },

    // What the open/close animation needs: where the button is and where the panel goes.
    animCtx() {
        const rows = [this.headRest, this.els.loop, ...[...this.panel.children].slice(1)];
        return {
            panel: this.panel, box: this.panelBox, fly: this.fly, headIcon: this.headIcon,
            fabIcon: this.btn.lastChild, rows, btn: { cx: this.fx.x, cy: this.fy.x, size: this.size }
        };
    },

    toggle() {
        if (this.isOpen) this.close();
        else this.open();
    },

    open() {
        if (this.isOpen || !this.anyItem()) return;
        this.isOpen = true;
        this.refresh();
        this.panel.classList.add('show');
        this.btn.classList.add('open');
        this.panelY = this.fy.to;
        this.measure();
        this.layoutPanel(this.fy.to);
        this.panel.scrollTop = 0;
        fabPanelAnim.open(this.animCtx());
        clearInterval(this.ticker);
        this.ticker = document.hidden ? null : setInterval(() => this.tickSleep(), 1000);
        try {
            const s = history.state;
            const base = s && typeof s === 'object' ? JSON.parse(JSON.stringify(s)) : {};
            history.pushState(Object.assign(base, { looptubePanel: 1 }), '');
            this.pushedState = true;
            this.openHref = location.href;
        } catch (_) { this.pushedState = false; }
    },

    // fromBack: the back gesture already removed our history entry.
    close(fromBack) {
        if (!this.isOpen) return;
        this.isOpen = false;
        this.btn.classList.remove('open');
        clearInterval(this.ticker);
        this.ticker = null;
        fabPanelAnim.close(this.animCtx(), () => this.panel.classList.remove('show'));
        if (!fromBack && this.pushedState) {
            this.pushedState = false;
            if (history.state && history.state.looptubePanel && location.href === this.openHref) {
                this.ignorePop = true;
                history.back();
            }
        }
    },

    // Closes straight away, for navigation and hiding.
    closeNow() {
        if (!this.isOpen) return;
        this.isOpen = false;
        this.pushedState = false;
        this.btn.classList.remove('open');
        clearInterval(this.ticker);
        this.ticker = null;
        fabPanelAnim.finish(false);
        this.panel.classList.remove('show');
    },

    onVisibility() {
        if (document.hidden) {
            clearInterval(this.ticker);
            this.ticker = null;
            fabPanelAnim.finish(true);
            this.fx.jump(this.fx.to); this.fy.jump(this.fy.to);
            this.lift.jump(0); this.grow.jump(1);
            this.panelY = this.fy.x;
            this.render();
        } else {
            if (!this.drag && !this.running) this.dock(true);
            this.layoutPanel();
            if (this.isOpen && !this.ticker) {
                this.ticker = setInterval(() => this.tickSleep(), 1000);
                this.refresh();
            }
        }
    },

    tickSleep() {
        const left = Math.round((extras.sleepEndsAt - Date.now()) / 1000);
        this.els.sleepNote.textContent = extras.sleepEndsAt && left > 0 ? 'Pausing in ' + formatClock(left) : '';
        for (const c of this.els.sleeps.children) {
            c.classList.toggle('on', Number(c.dataset.v) === (left > 0 ? extras.sleepMinutes : 0));
        }
    },

    refresh() {
        const e = this.els;
        const vid = extras.video();
        const looping = Boolean(vid && vid.loop);
        e.loop.classList.toggle('on', looping);
        this.btn.classList.toggle('looping', looping);
        e.vol.value = state.volumeLevel;
        e.volLabel.textContent = state.volumeLevel + '%';
        const a = extras.abStart, b = extras.abEnd;
        e.a.classList.toggle('on', a !== null);
        e.b.classList.toggle('on', b !== null);
        e.abNote.textContent = a === null && b === null ? 'Set A and B to repeat part of the video.'
            : 'A ' + (a === null ? '--' : formatClock(a)) + '  ·  B ' + (b === null ? '--' : formatClock(b));
        const rate = vid ? vid.playbackRate : 1;
        for (const c of e.speeds.children) c.classList.toggle('on', Number(c.dataset.v) === rate);
        this.tickSleep();
    },

    // YouTube marks dark mode with a "dark" attribute on <html>. Otherwise read the
    // page's actual background colour, then fall back to the system setting.
    isDarkPage() {
        const html = document.documentElement;
        if (html.hasAttribute('dark')) return true;
        const els = [document.querySelector('ytd-app'), document.body, html];
        for (const el of els) {
            if (!el) continue;
            const m = getComputedStyle(el).backgroundColor.match(/[\d.]+/g);
            if (!m || m.length < 3 || (m.length === 4 && Number(m[3]) === 0)) continue;
            return (Number(m[0]) + Number(m[1]) + Number(m[2])) / 3 < 128;
        }
        return matchMedia('(prefers-color-scheme: dark)').matches;
    },

    applyTheme() {
        if (this.host) this.host.classList.toggle('light', !this.isDarkPage());
    },

    sync() {
        const onVideo = /^\/(watch|shorts\/)/.test(location.pathname);
        // With every menu item switched off there's nothing to open, so the button hides.
        const show = this.enabled && onVideo && !document.fullscreenElement && this.anyItem();
        if (show && !this.host) { this.build(); }
        if (!this.host) return;
        if (show && !this.host.isConnected) document.documentElement.appendChild(this.host);
        this.host.style.display = show ? '' : 'none';
        if (!show) { this.closeNow(); return; }
        this.applyTheme();
        this.dock(true);
    }
};

function formatClock(sec) {
    const t = Math.floor(sec), h = Math.floor(t / 3600), m = Math.floor((t % 3600) / 60), s = t % 60;
    return (h ? h + ':' + String(m).padStart(2, '0') : m) + ':' + String(s).padStart(2, '0');
}

function fabReadItems(v) {
    const items = {};
    for (const k of FAB_ITEMS) items[k] = !v || v[k] !== false;
    return items;
}

storageGet({ [FAB_KEY]: true, [FAB_POS_KEY]: null, [FAB_SIZE_KEY]: 52, [FAB_ITEMS_KEY]: null }).then((d) => {
    fab.enabled = Boolean(d[FAB_KEY]);
    fab.pos = d[FAB_POS_KEY];
    fab.size = FAB_SIZES.some(([v]) => v === Number(d[FAB_SIZE_KEY])) ? Number(d[FAB_SIZE_KEY]) : 52;
    fab.items = fabReadItems(d[FAB_ITEMS_KEY]);
    if (document.body) fab.sync();
    else window.addEventListener('DOMContentLoaded', () => fab.sync(), { once: true });
});

// Navigation listeners live here, not in bind(): bind() only runs once the button is built,
// and the button is only built on a video page. Starting on search or home would never hook them.

const fabOnNav = () => fab.sync();
const fabOnNavStart = () => fab.closeNow();
window.addEventListener('yt-navigate-start', fabOnNavStart);
window.addEventListener('state-navigatestart', fabOnNavStart);
window.addEventListener('yt-navigate-finish', fabOnNav);
window.addEventListener('state-navigateend', fabOnNav);
window.addEventListener('popstate', fabOnNav);

api.storage.onChanged.addListener((changes, area) => {
    if (area !== 'local' || !fab.items) return;
    if (changes[FAB_KEY]) fab.enabled = Boolean(changes[FAB_KEY].newValue);
    if (changes[FAB_ITEMS_KEY]) { fab.items = fabReadItems(changes[FAB_ITEMS_KEY].newValue); fab.applyItems(); }
    if (changes[FAB_SIZE_KEY] && Number(changes[FAB_SIZE_KEY].newValue) !== fab.size) fab.applySize(FAB_SIZES.some(([v]) => v === Number(changes[FAB_SIZE_KEY].newValue)) ? Number(changes[FAB_SIZE_KEY].newValue) : 52, true);
    if (changes[FAB_KEY] || changes[FAB_ITEMS_KEY]) fab.sync();
});
