const fs = require('fs');
const path = require('path');
function walk(d, cb) {
  const items = fs.readdirSync(d);
  for (let i=0; i<items.length; i++) {
    const name = items[i];
    const full = path.join(d, name);
    try {
      const st = fs.statSync(full);
      if (st.isDirectory()) {
        if (name === 'node_modules' || name === '.next' || name === '.git') continue;
        walk(full, cb);
      } else if (/\.(tsx|ts|jsx|js)$/.test(name)) {
        cb(full);
      }
    } catch(e) {}
  }
}
const used = new Map();
walk('app', (file) => {
  try {
    const c = fs.readFileSync(file, 'utf8');
    // find namespace
    const nsRe = /useTranslations\(['\"]([^'\"]+)['\"]\)/g;
    let nsM;
    while ((nsM = nsRe.exec(c)) !== null) {
      const ns = nsM[1];
      // find all t calls in this file that use this namespace? Or just all t calls - but t might be from different namespace
      // look for t( followed by string literal
      const tRe = /t\(\s*['\"]([^'\"]+)['\"]\s*[\),]/g;
      let tM;
      while ((tM = tRe.exec(c)) !== null) {
        const key = tM[1];
        const k = ns + '::' + key;
        if (!used.has(k)) used.set(k, {ns, key, file});
      }
    }
  } catch(e) {}
});
console.log(used.size);
const list = Array.from(used.values());
list.slice(0, 80).forEach(x => console.log(x.ns + '.' + x.key));
