const api = globalThis.browser || chrome;
const usingBrowserApi = typeof globalThis.browser !== 'undefined';

const ENABLED_KEY = 'looptubeEnabled';
const BOOST_KEY = 'looptubeBoostEnabled';

const checkbox = document.getElementById('enabled');
const boostCheckbox = document.getElementById('boost');

function storageGet(defaults) {
    if (usingBrowserApi) {
        return api.storage.local.get(defaults);
    }

    return new Promise((resolve) => {
        api.storage.local.get(defaults, resolve);
    });
}

function storageSet(values) {
    if (usingBrowserApi) {
        return api.storage.local.set(values);
    }

    return new Promise((resolve) => {
        api.storage.local.set(values, resolve);
    });
}

function queryActiveTab() {
    const query = { active: true, currentWindow: true };

    if (usingBrowserApi) {
        return api.tabs.query(query);
    }

    return new Promise((resolve) => {
        api.tabs.query(query, resolve);
    });
}

function sendMessage(tabId, message) {
    if (usingBrowserApi) {
        return api.tabs.sendMessage(tabId, message);
    }

    return new Promise((resolve, reject) => {
        api.tabs.sendMessage(tabId, message, () => {
            const error = api.runtime.lastError;

            if (error) {
                reject(error);
            } else {
                resolve();
            }
        });
    });
}

async function notifyCurrentTab(messagePayload) {
    const tabs = await queryActiveTab();
    const tab = tabs[0];

    if (!tab || !tab.id) return;

    try {
        await sendMessage(tab.id, messagePayload);
    } catch {
    }
}

async function loadState() {
    const data = await storageGet({ [ENABLED_KEY]: true, [BOOST_KEY]: false });
    checkbox.checked = Boolean(data[ENABLED_KEY]);
    boostCheckbox.checked = Boolean(data[BOOST_KEY]);
}

// Original Loop Toggle
checkbox.addEventListener('change', async () => {
    const enabled = checkbox.checked;

    await storageSet({ [ENABLED_KEY]: enabled });
    await notifyCurrentTab({
        action: 'toggleExtension',
        enabled: enabled
    });
});

// New 200% Volume Boost Toggle
boostCheckbox.addEventListener('change', async () => {
    const boostEnabled = boostCheckbox.checked;

    await storageSet({ [BOOST_KEY]: boostEnabled });
    await notifyCurrentTab({
        action: 'toggleVolumeBoost',
        boostEnabled: boostEnabled
    });
});

loadState();
