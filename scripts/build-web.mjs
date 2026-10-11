import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const projectDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const expoCli = path.join(projectDir, 'node_modules', 'expo', 'bin', 'cli');
const result = spawnSync(process.execPath, [expoCli, 'export', '--platform', 'web'], {
  cwd: projectDir,
  stdio: 'inherit',
});
if (result.status !== 0) process.exit(result.status || 1);

// Vercel CLI excludes node_modules directories, including exported icon fonts.
const dist = path.join(projectDir, 'dist');
const originalAssets = path.resolve(dist, 'assets', 'node_modules');
const vendorAssets = path.resolve(dist, 'assets', 'vendor');
for (const target of [originalAssets, vendorAssets]) {
  if (!target.startsWith(dist + path.sep)) throw new Error('Asset path is outside dist');
}
if (fs.existsSync(originalAssets)) {
  fs.renameSync(originalAssets, vendorAssets);
}

function updateAssetPaths(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      updateAssetPaths(file);
    } else if (/\.(js|css|html|json)$/.test(entry.name)) {
      const text = fs.readFileSync(file, 'utf8');
      const updated = text.replaceAll('assets/node_modules/', 'assets/vendor/');
      if (updated !== text) fs.writeFileSync(file, updated);
    }
  }
}
updateAssetPaths(dist);
