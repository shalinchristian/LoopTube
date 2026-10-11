const api = globalThis.browser || chrome;
const usingBrowserApi = typeof globalThis.browser !== 'undefined';

const ENABLED_KEY = 'looptubeEnabled';
const VOLUME_KEY = 'looptubeVolume';

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

    if (status.sleepEndsAt) {
        const mins = Math.max(1, Math.round((status.sleepEndsAt - Date.now()) / 60000));
        sleepLabel.textContent = 'Pausing in about ' + mins + ' min.';
        sleepSelect.value = String(status.sleepMinutes);
    } else {
        sleepLabel.textContent = '';
        sleepSelect.value = '0';
    }
}

async function send(payload) {
    render(await notifyCurrentTab(payload));
}

document.getElementById('setA').addEventListener('click', () => send({ action: 'setAB', point: 'a' }));
document.getElementById('setB').addEventListener('click', () => send({ action: 'setAB', point: 'b' }));
document.getElementById('clearAB').addEventListener('click', () => send({ action: 'setAB', point: 'clear' }));
speedSelect.addEventListener('change', () => send({ action: 'setSpeed', rate: speedSelect.value }));
sleepSelect.addEventListener('change', () => send({ action: 'setSleep', minutes: sleepSelect.value }));
rememberBox.addEventListener('change', () => send({ action: 'rememberVolume', on: rememberBox.checked }));

loadState().then(() => send({ action: 'getStatus' }));
