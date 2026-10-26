// Floating LoopTube button: a see-through glass button on video pages that opens the same
// controls as the toolbar popup, so people don't have to open the extensions menu.
const FAB_KEY = 'looptubeFab';
const FAB_POS_KEY = 'looptubeFabPos';
const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.5, 3];
const SLEEPS = [[0, 'Off'], [15, '15m'], [30, '30m'], [45, '45m'], [60, '1h'], [90, '1.5h']];

const FAB_LOGO = 'data:image/png;base64,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';

const FAB_CSS = `
:host { all: initial; }
* { box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", Inter, system-ui, "Segoe UI", Roboto, sans-serif; -webkit-font-smoothing: antialiased; }
.glass {
  background: rgba(18,18,20,0.8);
  -webkit-backdrop-filter: blur(18px) saturate(160%);
  backdrop-filter: blur(18px) saturate(160%);
  border: 1px solid rgba(255,255,255,0.14);
  box-shadow: 0 8px 28px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.18);
  color: #fff;
}
.fab {
  position: fixed; width: 52px; height: 52px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; touch-action: none; user-select: none; z-index: 2147483000;
  opacity: 0.9; transition: opacity .25s, transform .2s;
}
.fab:hover, .fab.open, .fab:focus-visible { opacity: 1; }
.fab:active { transform: scale(0.94); }
.fab.glass { background: rgba(20,20,24,0.55); border-color: rgba(255,255,255,0.28); }
.fab.hidden { display: none; }
.fab.looping { border-color: rgba(255,255,255,0.75); }
.fab img { width: 36px; height: 36px; filter: drop-shadow(0 1px 2px rgba(0,0,0,0.45)); pointer-events: none; -webkit-user-drag: none; }
.panel {
  position: fixed; z-index: 2147483001; width: 280px; padding: 14px; border-radius: 18px;
  display: none; flex-direction: column; gap: 12px; font-size: 13px;
}
.panel.show { display: flex; animation: pop .18s ease-out; }
.panel.sheet { left: 8px; right: 8px; bottom: 8px; width: auto; border-radius: 22px; padding: 18px 16px 20px; }
@keyframes pop { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
.row { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.label { opacity: .6; font-weight: 600; font-size: 11.5px; letter-spacing: .04em; text-transform: uppercase; }
.value { font-variant-numeric: tabular-nums; opacity: .9; }
.chips { display: flex; flex-wrap: wrap; gap: 6px; }
button.chip {
  border: 0; background: rgba(255,255,255,0.12); color: rgba(255,255,255,0.92);
  border-radius: 999px; padding: 7px 12px; font-size: 12.5px; font-weight: 500; cursor: pointer;
  transition: background .15s, color .15s, transform .1s;
}
button.chip:active { transform: scale(0.96); }
button.chip.on { background: rgba(255,255,255,0.95); color: #000; font-weight: 600; }
input[type=range] { width: 100%; accent-color: #fff; }
.note { font-size: 11px; opacity: .75; min-height: 14px; }
.title { font-weight: 700; font-size: 16px; letter-spacing: -.01em; }

/* Light version, used when YouTube is in light mode. */
:host(.light) .glass {
  background: rgba(255,255,255,0.78); color: #1d1d1f;
  border-color: rgba(0,0,0,0.08);
  box-shadow: 0 10px 30px rgba(0,0,0,0.16), inset 0 1px 0 rgba(255,255,255,0.9);
}
:host(.light) .fab.glass { background: rgba(255,255,255,0.72); border-color: rgba(0,0,0,0.1); }
:host(.light) .fab.looping { border-color: rgba(0,0,0,0.45); }
:host(.light) .fab img { filter: drop-shadow(0 1px 1px rgba(0,0,0,0.15)); }
:host(.light) button.chip { background: rgba(0,0,0,0.06); color: #1d1d1f; }
:host(.light) button.chip.on { background: #1d1d1f; color: #fff; }
:host(.light) input[type=range] { accent-color: #1d1d1f; }
:host(.light) .label, :host(.light) .note { color: #1d1d1f; }
`;

const fab = {
    host: null, root: null, btn: null, panel: null, els: {},
    enabled: true, pos: null, ticker: null, sleepEndsAt: 0,

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
        this.btn.appendChild(this.icon());
        this.root.appendChild(this.btn);

        const p = this.panel = this.h('div', 'panel glass');
        const e = this.els;
        const head = this.h('div', 'row');
        head.append(this.h('span', 'title', 'LoopTube'));
        e.loop = this.h('button', 'chip', 'Loop');
        head.append(e.loop);
        p.append(head);

        const vol = this.h('div');
        const vr = this.h('div', 'row');
        e.volLabel = this.h('span', 'value', '100%');
        vr.append(this.h('span', 'label', 'Volume boost'), e.volLabel);
        e.vol = this.h('input');
        Object.assign(e.vol, { type: 'range', min: 100, max: 350, step: 10, value: 100 });
        vol.append(vr, e.vol);
        p.append(vol);

        const ab = this.h('div');
        const ar = this.h('div', 'row');
        ar.append(this.h('span', 'label', 'A–B loop'));
        const abChips = this.h('div', 'chips');
        e.a = this.h('button', 'chip', 'Set A');
        e.b = this.h('button', 'chip', 'Set B');
        e.clear = this.h('button', 'chip', 'Clear');
        abChips.append(e.a, e.b, e.clear);
        ar.append(abChips);
        e.abNote = this.h('div', 'note');
        ab.append(ar, e.abNote);
        p.append(ab);

        p.append(this.h('span', 'label', 'Speed'));
        e.speeds = this.h('div', 'chips');
        for (const s of SPEEDS) {
            const c = this.h('button', 'chip', s + '×');
            c.dataset.v = s;
            e.speeds.append(c);
        }
        p.append(e.speeds);

        const sl = this.h('div', 'row');
        sl.append(this.h('span', 'label', 'Sleep timer'));
        e.sleepNote = this.h('span', 'value');
        sl.append(e.sleepNote);
        p.append(sl);
        e.sleeps = this.h('div', 'chips');
        for (const [m, t] of SLEEPS) {
            const c = this.h('button', 'chip', t);
            c.dataset.v = m;
            e.sleeps.append(c);
        }
        p.append(e.sleeps);
        this.root.appendChild(p);

        this.bind();
    },

    bind() {
        const e = this.els;
        e.loop.addEventListener('click', () => { toggleLoop(); this.refresh(); });
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

        // Pointer events only handle dragging. Opening uses the click event, which
        // still fires if YouTube redraws or grabs focus mid-tap and the pointer is lost.
        let start = null, moved = false, draggedAt = 0;
        const endDrag = () => {
            if (start && moved) {
                const r = this.btn.getBoundingClientRect();
                this.pos = { x: r.left / innerWidth, y: r.top / innerHeight };
                api.storage.local.set({ [FAB_POS_KEY]: this.pos });
                draggedAt = Date.now();
            }
            start = null;
        };
        this.btn.addEventListener('pointerdown', (ev) => {
            const r = this.btn.getBoundingClientRect();
            start = { x: ev.clientX, y: ev.clientY, left: r.left, top: r.top, slop: ev.pointerType === 'mouse' ? 4 : 12 };
            moved = false;
            try { this.btn.setPointerCapture(ev.pointerId); } catch (_) { /* pointer already gone */ }
        });
        this.btn.addEventListener('pointermove', (ev) => {
            if (!start) return;
            const dx = ev.clientX - start.x, dy = ev.clientY - start.y;
            if (!moved && Math.hypot(dx, dy) < start.slop) return;
            moved = true;
            this.place(start.left + dx, start.top + dy);
        });
        this.btn.addEventListener('pointerup', endDrag);
        this.btn.addEventListener('pointercancel', endDrag);
        this.btn.addEventListener('lostpointercapture', endDrag);
        this.btn.addEventListener('click', (ev) => {
            ev.stopPropagation();
            if (Date.now() - draggedAt < 400) return; // the click that ends a drag
            this.toggle();
        });
        this.btn.addEventListener('keydown', (ev) => {
            if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); this.toggle(); }
        });
        // Close when tapping anywhere else on the page.
        document.addEventListener('pointerdown', (ev) => {
            if (this.panel.classList.contains('show') && !ev.composedPath().includes(this.host)) this.close();
        }, true);
        document.addEventListener('fullscreenchange', () => this.sync());
        window.addEventListener('resize', () => this.applyPos());
        new MutationObserver(() => this.applyTheme())
            .observe(document.documentElement, { attributes: true, attributeFilter: ['dark', 'darker-dark-theme'] });
        matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => this.applyTheme());
    },

    defaultPos() {
        // Bottom right, clear of YouTube's bottom menu bar on mobile.
        return { left: innerWidth - 52 - 16, top: innerHeight - 52 - (isMobile ? 72 : 24) };
    },

    place(left, top) {
        const x = Math.min(Math.max(8, left), innerWidth - 56);
        const y = Math.min(Math.max(8, top), innerHeight - 56);
        this.btn.style.left = x + 'px';
        this.btn.style.top = y + 'px';
    },

    applyPos() {
        if (!this.btn) return;
        if (this.pos) this.place(this.pos.x * innerWidth, this.pos.y * innerHeight);
        else { const d = this.defaultPos(); this.place(d.left, d.top); }
        if (this.panel.classList.contains('show')) this.placePanel();
    },

    placePanel() {
        const small = innerWidth < 560;
        this.panel.classList.toggle('sheet', small);
        if (small) { this.panel.style.left = this.panel.style.top = ''; return; }
        const r = this.btn.getBoundingClientRect();
        const pw = 280, ph = this.panel.offsetHeight || 320;
        let left = r.right - pw, top = r.top - ph - 10;
        if (top < 8) top = r.bottom + 10;
        left = Math.min(Math.max(8, left), innerWidth - pw - 8);
        this.panel.style.left = left + 'px';
        this.panel.style.top = top + 'px';
    },

    toggle() {
        if (this.panel.classList.contains('show')) this.close();
        else this.open();
    },

    open() {
        this.refresh();
        this.panel.classList.add('show');
        this.btn.classList.add('open');
        this.placePanel();
        this.btn.classList.toggle('hidden', this.panel.classList.contains('sheet'));
        this.ticker = setInterval(() => this.tickSleep(), 1000);
    },

    close() {
        this.panel.classList.remove('show');
        this.btn.classList.remove('open', 'hidden');
        clearInterval(this.ticker);
        this.ticker = null;
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
        const looping = Boolean(state.enabled && vid && vid.loop);
        e.loop.classList.toggle('on', looping);
        e.loop.disabled = !state.enabled;
        e.loop.title = state.enabled ? '' : 'Turn on the loop button in the LoopTube popup';
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
        const show = this.enabled && onVideo && !document.fullscreenElement;
        if (show && !this.host) { this.build(); }
        if (!this.host) return;
        if (show && !this.host.isConnected) document.documentElement.appendChild(this.host);
        this.host.style.display = show ? '' : 'none';
        if (show) this.applyTheme();
        if (!show) this.close();
        else this.applyPos();
    }
};

function formatClock(sec) {
    const t = Math.floor(sec), h = Math.floor(t / 3600), m = Math.floor((t % 3600) / 60), s = t % 60;
    return (h ? h + ':' + String(m).padStart(2, '0') : m) + ':' + String(s).padStart(2, '0');
}

storageGet({ [FAB_KEY]: true, [FAB_POS_KEY]: null }).then((d) => {
    fab.enabled = Boolean(d[FAB_KEY]);
    fab.pos = d[FAB_POS_KEY];
    if (document.body) fab.sync();
    else window.addEventListener('DOMContentLoaded', () => fab.sync(), { once: true });
});

// Navigation listeners live here, not in bind(): bind() only runs once the button is built,
// and the button is only built on a video page. Starting on search or home would never hook them.

const fabOnNav = () => fab.sync();
window.addEventListener('yt-navigate-finish', fabOnNav);
window.addEventListener('state-navigateend', fabOnNav);
window.addEventListener('popstate', fabOnNav);
// m.youtube.com doesn't reliably fire a navigation event, so also catch path changes directly.

api.storage.onChanged.addListener((changes, area) => {
    if (area !== 'local' || !changes[FAB_KEY]) return;
    fab.enabled = Boolean(changes[FAB_KEY].newValue);
    fab.sync();
});
