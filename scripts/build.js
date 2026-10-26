// Bundles src/ into dist/ with the exact layout the published extension uses.
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..'), src = path.join(root, 'src'), dist = path.join(root, 'dist');
fs.rmSync(dist, { recursive: true, force: true }); fs.mkdirSync(dist);
const dir = path.join(src, 'content');
const parts = fs.readdirSync(dir).filter(f => f.endsWith('.js')).sort();
fs.writeFileSync(path.join(dist, 'content.js'), parts.map(f => fs.readFileSync(path.join(dir, f), 'utf8')).join(''));
for (const [from, to] of [['content/style.css','style.css'],['popup/popup.html','popup.html'],['popup/popup.js','popup.js'],['popup/popup.css','popup.css'],['background.js','background.js'],['page/background-play.js','page-background-play.js'],['welcome/welcome.html','welcome.html'],['welcome/welcome.css','welcome.css'],['welcome/welcome.js','welcome.js']])
  fs.copyFileSync(path.join(src, from), path.join(dist, to));
// package.json is the only place the version lives.
const { version } = require(path.join(root, 'package.json'));
const manifest = JSON.parse(fs.readFileSync(path.join(src, 'manifest.json'), 'utf8'));
manifest.version = version;
fs.writeFileSync(path.join(dist, 'manifest.json'), JSON.stringify(manifest, null, 4));
// Only the sizes the extension uses. icons/icon.png is the large source artwork and stays out of the package.
fs.mkdirSync(path.join(dist, 'icons'));
for (const f of fs.readdirSync(path.join(root, 'icons')).filter(f => /^icon\d+\.png$/.test(f)))
  fs.copyFileSync(path.join(root, 'icons', f), path.join(dist, 'icons', f));
console.log('Built dist/ from ' + parts.length + ' content modules');
