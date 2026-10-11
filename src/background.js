// Opens the bundled welcome page once, on a fresh install only (not on updates).
const api = globalThis.browser || chrome;

api.runtime.onInstalled.addListener((details) => {
    if (details.reason === 'install') {
        api.tabs.create({ url: api.runtime.getURL('welcome.html') });
    }
});
