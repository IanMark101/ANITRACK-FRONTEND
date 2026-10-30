import { existsSync, readFileSync } from 'node:fs';
import { delimiter, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const [tool, ...args] = process.argv.slice(2);
const packages = { quasar: '@quasar/app-vite', 'vue-tsc': 'vue-tsc', vitest: 'vitest', vite: 'vite' };
if (!packages[tool]) throw new Error(`Unsupported project tool: ${tool}`);
const [major, minor] = process.versions.node.split('.').map(Number);
const supported = major >= 24 || (major === 22 && minor >= 22);
const localNode = resolve(root, '.tools/node/node.exe');
const executable = supported ? process.execPath : existsSync(localNode) ? localNode : null;
if (!executable) {
  console.error('AniTrack requires Node 24 LTS (or Node 22.22+). Install it, reopen your terminal, then run npm install.');
  process.exit(1);
}
const packageDir = resolve(root, 'node_modules', packages[tool]);
const pkg = JSON.parse(readFileSync(resolve(packageDir, 'package.json'), 'utf8'));
const bin = typeof pkg.bin === 'string' ? pkg.bin : pkg.bin[tool];
const child = spawn(executable, [resolve(packageDir, bin), ...args], {
  cwd: root, stdio: 'inherit',
  env: { ...process.env, PATH: `${dirname(executable)}${delimiter}${process.env.PATH ?? ''}` }
});
child.on('error', (error) => { console.error(error.message); process.exitCode = 1; });
child.on('exit', (code) => { process.exitCode = code ?? 1; });
