const fs = require('fs');
const path = require('path');

function findFiles(dir, pattern, results = []) {
  if (!fs.existsSync(dir)) return results;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      // skip node_modules traversal depth for performance if already inside node_modules
      findFiles(full, pattern, results);
    } else if (e.isFile() && pattern.test(e.name)) {
      results.push(full);
    }
  }
  return results;
}

try {
  const root = process.cwd();
  const candidates = new Set();
  // Check common locations
  const searchDirs = [root, path.join(root, 'node_modules'), path.join(root, 'node_modules_old')];
  const patterns = [/tailwind.*oxide/i, /tailwind-oxide/i, /oxide.*tailwind/i];
  for (const d of searchDirs) {
    if (!fs.existsSync(d)) continue;
    // find matching files
    for (const pat of patterns) {
      const found = findFiles(d, pat, []);
      for (const f of found) candidates.add(f);
    }

    // Also check for directories under @tailwindcss that may contain oxide packages
    try {
      const tailwindDir = path.join(d, '@tailwindcss');
      if (fs.existsSync(tailwindDir)) {
        const children = fs.readdirSync(tailwindDir, { withFileTypes: true });
        for (const c of children) {
          if (c.isDirectory() && /oxide/i.test(c.name)) {
            candidates.add(path.join(tailwindDir, c.name));
          }
        }
      }
    } catch (e) {
      // ignore
    }
  }

  if (candidates.size === 0) {
    // no-op: nothing to remove
    process.exit(0);
  }

  for (const fileOrDir of candidates) {
    try {
      if (fs.existsSync(fileOrDir)) {
        const stat = fs.statSync(fileOrDir);
        if (stat.isFile()) {
          try { fs.unlinkSync(fileOrDir); console.log('[preinstall-clean] removed file', fileOrDir); } catch (err) { 
            try { fs.rmSync(fileOrDir, { force: true }); console.log('[preinstall-clean] rmSync removed', fileOrDir); } catch (e) { console.warn('[preinstall-clean] could not remove file', fileOrDir, e && e.message ? e.message : e); }
          }
        } else if (stat.isDirectory()) {
          try { fs.rmSync(fileOrDir, { recursive: true, force: true }); console.log('[preinstall-clean] removed dir', fileOrDir); } catch (err) { console.warn('[preinstall-clean] could not remove dir', fileOrDir, err && err.message ? err.message : err); }
        }
      }
    } catch (err) {
      // best-effort: log and continue
      console.warn('[preinstall-clean] could not remove', fileOrDir, err && err.message ? err.message : err);
    }
  }
} catch (err) {
  // do not fail install if cleanup script itself errors
  console.warn('[preinstall-clean] error', err && err.message ? err.message : err);
}
