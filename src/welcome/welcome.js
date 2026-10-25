document.documentElement.classList.add('js');
// Show the installed version from the manifest.
const api = globalThis.browser || globalThis.chrome;
const ver = document.getElementById('ver');
if (ver && api && api.runtime) ver.textContent = 'LoopTube ' + api.runtime.getManifest().version + ' is installed';
// Fade sections in as they scroll into view.
const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
}, { threshold: 0.15 });
document.querySelectorAll('.reveal').forEach((el) => io.observe(el));
