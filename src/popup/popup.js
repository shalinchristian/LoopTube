const api = globalThis.browser || chrome;
const usingBrowserApi = typeof globalThis.browser !== 'undefined';

const ENABLED_KEY = 'looptubeEnabled';
const VOLUME_KEY = 'looptubeVolume';
const FAB_KEY = 'looptubeFab';

const checkbox = document.getElementById('enabled');
const volumeSlider = document.getElementById('volumeSlider');
const volumeLabel = document.getElementById('volumeLabel');

function storageGet(defaults) {
    if (usingBrowserApi) return api.storage.local.get(defaults);
    return new Promise((resolve) => api.storage.local.get(defaults, resolve));
}

function storageSet(values) {
    if (usingBrowserApi) return api.storage.local.set(values);
    return new Promise((resolve) => api.storage.local.set(values, resolve));
}

function queryActiveTab() {
    const query = { active: true, currentWindow: true };
    if (usingBrowserApi) return api.tabs.query(query);
    return new Promise((resolve) => api.tabs.query(query, resolve));
}

function sendMessage(tabId, message) {
    if (usingBrowserApi) return api.tabs.sendMessage(tabId, message);
    return new Promise((resolve, reject) => {
        api.tabs.sendMessage(tabId, message, (response) => {
            const error = api.runtime.lastError;
            if (error) reject(error);
            else resolve(response);
        });
    });
}

async function notifyCurrentTab(messagePayload) {
    const tabs = await queryActiveTab();
    const tab = tabs[0];

    if (!tab || !tab.id) return;

    try {
        return await sendMessage(tab.id, messagePayload);
    } catch {
        return null;
    }
}

async function loadState() {
    const data = await storageGet({ [ENABLED_KEY]: true, [VOLUME_KEY]: 100 });
    checkbox.checked = Boolean(data[ENABLED_KEY]);
    volumeSlider.value = data[VOLUME_KEY];
    volumeLabel.textContent = `${data[VOLUME_KEY]}%`;
}

// Loop Toggle
checkbox.addEventListener('change', async () => {
    const enabled = checkbox.checked;

    await storageSet({ [ENABLED_KEY]: enabled });
    await notifyCurrentTab({ action: 'toggleExtension', enabled: enabled });
});

// Live UI update while dragging
volumeSlider.addEventListener('input', (e) => {
    volumeLabel.textContent = `${e.target.value}%`;
});

// Save and apply when dragging stops
volumeSlider.addEventListener('change', async (e) => {
    const vol = parseInt(e.target.value, 10);
    const remember = rememberBox.checked;
    // A remembered volume belongs to this video only, so it doesn't change the global level.
    if (!remember) await storageSet({ [VOLUME_KEY]: vol });
    await notifyCurrentTab({ action: 'updateVolume', volume: vol, remember });
});

const rememberBox = document.getElementById('rememberVolume');
const abLabel = document.getElementById('abLabel');
const speedSelect = document.getElementById('speed');
const sleepSelect = document.getElementById('sleep');
const sleepLabel = document.getElementById('sleepLabel');

function formatTime(sec) {
    const t = Math.floor(sec);
    const h = Math.floor(t / 3600), m = Math.floor((t % 3600) / 60), r = t % 60;
    const mm = h ? String(m).padStart(2, '0') : String(m);
    return (h ? h + ':' : '') + mm + ':' + String(r).padStart(2, '0');
}

function render(status) {
    if (!status || !status.ok) {
        abLabel.textContent = 'Open a YouTube video to use these tools.';
        return;
    }
    const a = status.abStart, b = status.abEnd;
    if (a === null && b === null) abLabel.textContent = 'Set A and B to repeat part of the video.';
    else abLabel.textContent = 'A ' + (a === null ? '--' : formatTime(a)) + '   B ' + (b === null ? '--' : formatTime(b)) + (a !== null && b !== null ? '   Looping' : '');

    const speed = String(status.speed);
    if (![...speedSelect.options].some((o) => o.value === speed)) speedSelect.add(new Option(speed + '\u00d7', speed));
    speedSelect.value = speed;

    rememberBox.checked = status.volumeRemembered;
    volumeSlider.value = status.volume;
    volumeLabel.textContent = status.volume + '%';

    sleepEndsAt = status.sleepEndsAt || 0;
    sleepSelect.value = sleepEndsAt ? String(status.sleepMinutes) : '0';
    tickSleep();
}

// Live countdown for the sleep timer, updated every second while the popup is open.
let sleepEndsAt = 0;
function tickSleep() {
    const left = Math.round((sleepEndsAt - Date.now()) / 1000);
    if (!sleepEndsAt || left <= 0) {
        sleepLabel.textContent = '';
        if (sleepEndsAt) { sleepEndsAt = 0; sleepSelect.value = '0'; }
        return;
    }
    sleepLabel.textContent = 'Pausing in ' + formatTime(left);
}
setInterval(tickSleep, 1000);

async function send(payload) {
    render(await notifyCurrentTab(payload));
}

document.getElementById('setA').addEventListener('click', () => send({ action: 'setAB', point: 'a' }));
document.getElementById('setB').addEventListener('click', () => send({ action: 'setAB', point: 'b' }));
document.getElementById('clearAB').addEventListener('click', () => send({ action: 'setAB', point: 'clear' }));
speedSelect.addEventListener('change', () => send({ action: 'setSpeed', rate: speedSelect.value }));
sleepSelect.addEventListener('change', () => send({ action: 'setSleep', minutes: sleepSelect.value }));
rememberBox.addEventListener('change', () => send({ action: 'rememberVolume', on: rememberBox.checked }));

// Floating button on/off (on by default)
const fabBox = document.getElementById('fab');
const fabOptions = document.getElementById('fabOptions');
function renderFab(on) {
    fabBox.checked = on;
    fabOptions.hidden = !on;
}
storageGet({ [FAB_KEY]: true }).then((d) => renderFab(Boolean(d[FAB_KEY])));
fabBox.addEventListener('change', () => {
    renderFab(fabBox.checked);
    storageSet({ [FAB_KEY]: fabBox.checked });
});

// Floating button size: 40, 52 or 64 px (52 by default). The content script reads it from storage.
const FAB_SIZE_KEY = 'fabSize';
const FAB_SIZES = [40, 52, 64];
const sizeButtons = [...document.querySelectorAll('#fabSize button')];
function renderSize(size) {
    if (!FAB_SIZES.includes(size)) size = 52;
    for (const b of sizeButtons) b.setAttribute('aria-pressed', String(Number(b.dataset.size) === size));
}
storageGet({ [FAB_SIZE_KEY]: 52 }).then((d) => renderSize(Number(d[FAB_SIZE_KEY])));
for (const b of sizeButtons) {
    b.addEventListener('click', () => {
        const size = Number(b.dataset.size);
        renderSize(size);
        storageSet({ [FAB_SIZE_KEY]: size });
    });
}

// Which tools appear in the floating menu. A missing item counts as on.
const MENU_ITEMS_KEY = 'menuItems';
const MENU_ITEM_IDS = ['loop', 'volume', 'ab', 'speed', 'sleep'];
const menuToggle = document.getElementById('menuToggle');
const menuPanel = document.getElementById('menuPanel');
const menuCount = document.getElementById('menuCount');
const menuNote = document.getElementById('menuNote');
const itemButtons = [...document.querySelectorAll('#menuList button')];
let menuItems = {};

function normalizeMenuItems(value) {
    const src = value && typeof value === 'object' ? value : {};
    const out = {};
    for (const id of MENU_ITEM_IDS) out[id] = src[id] !== false;
    return out;
}

function renderMenuItems(value) {
    menuItems = normalizeMenuItems(value);
    let on = 0;
    for (const b of itemButtons) {
        const checked = menuItems[b.dataset.item];
        if (checked) on++;
        b.setAttribute('aria-pressed', String(checked));
    }
    menuCount.textContent = '\u00b7 ' + on + ' of ' + MENU_ITEM_IDS.length;
    menuNote.textContent = on ? '' : 'Floating button hidden \u2014 no items selected';
}

storageGet({ [MENU_ITEMS_KEY]: {} }).then((d) => renderMenuItems(d[MENU_ITEMS_KEY]));
for (const b of itemButtons) {
    b.addEventListener('click', () => {
        const next = { ...menuItems, [b.dataset.item]: !menuItems[b.dataset.item] };
        renderMenuItems(next);
        storageSet({ [MENU_ITEMS_KEY]: menuItems });
    });
}

menuToggle.addEventListener('click', () => {
    const open = menuToggle.getAttribute('aria-expanded') !== 'true';
    menuToggle.setAttribute('aria-expanded', String(open));
    menuPanel.classList.toggle('open', open);
    menuPanel.inert = !open;
});

// The uBlock tip only shows once the content script has seen an ad (it sets adSeen).
const AD_SEEN_KEY = 'adSeen';
const ublockNote = document.getElementById('ublockNote');
function renderAdSeen(seen) { ublockNote.hidden = seen !== true; }
storageGet({ [AD_SEEN_KEY]: false }).then((d) => renderAdSeen(d[AD_SEEN_KEY]));

// Keep the popup in sync if storage changes while it is open.
api.storage.onChanged.addListener((changes, area) => {
    if (area !== 'local') return;
    if (changes[AD_SEEN_KEY]) renderAdSeen(changes[AD_SEEN_KEY].newValue);
    if (changes[MENU_ITEMS_KEY]) renderMenuItems(changes[MENU_ITEMS_KEY].newValue);
    if (changes[FAB_SIZE_KEY]) renderSize(Number(changes[FAB_SIZE_KEY].newValue));
    if (changes[FAB_KEY]) renderFab(changes[FAB_KEY].newValue !== false);
});

// Footer links open in a new tab; links inside a popup don't always open on their own.
function openTab(url) {
    const done = () => window.close();
    if (usingBrowserApi) return api.tabs.create({ url }).then(done, done);
    api.tabs.create({ url }, done);
}
for (const link of document.querySelectorAll('footer a')) {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        openTab(link.href);
    });
}

loadState().then(() => send({ action: 'getStatus' }));
