// Bundles src/ into dist/ with the exact layout the published extension uses.
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..'), src = path.join(root, 'src'), dist = path.join(root, 'dist');
fs.rmSync(dist, { recursive: true, force: true }); fs.mkdirSync(dist);
const dir = path.join(src, 'content');
const parts = fs.readdirSync(dir).filter(f => f.endsWith('.js')).sort();
fs.writeFileSync(path.join(dist, 'content.js'), parts.map(f => fs.readFileSync(path.join(dir, f), 'utf8')).join(''));
for (const [from, to] of [['manifest.json','manifest.json'],['content/style.css','style.css'],['popup/popup.html','popup.html'],['popup/popup.js','popup.js'],['popup/popup.css','popup.css'],['background.js','background.js'],['welcome/welcome.html','welcome.html'],['welcome/welcome.css','welcome.css'],['welcome/welcome.js','welcome.js'],['welcome/popup-light.png','popup-light.png'],['welcome/popup-dark.png','popup-dark.png']])
  fs.copyFileSync(path.join(src, from), path.join(dist, to));
fs.cpSync(path.join(root, 'icons'), path.join(dist, 'icons'), { recursive: true });
console.log('Built dist/ from ' + parts.length + ' content modules');
