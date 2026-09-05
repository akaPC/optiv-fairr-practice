/**
 * Builds a self-contained local copy of the app that opens from disk (file://).
 * - Runs `vite build` with a relative base.
 * - Inlines the CSS and JS bundles into index.html (module scripts loaded from
 *   file:// are blocked by browsers; inline module scripts are not).
 * - Copies the plan, workbook, CSV, and assumptions next to it and zips the set.
 *
 * Output: local/optiv-fairr-practice-local/  and  local/optiv-fairr-practice-local.zip
 */
import { execSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(new URL('..', import.meta.url).pathname);
const dist = resolve(root, 'dist-local');
const outDir = resolve(root, 'local/optiv-fairr-practice-local');
const zipPath = resolve(root, 'local/optiv-fairr-practice-local.zip');

execSync('npx vite build --outDir dist-local --emptyOutDir', { cwd: root, stdio: 'inherit', env: { ...process.env, VITE_BASE: './' } });

let html = readFileSync(resolve(dist, 'index.html'), 'utf8');
const assets = readdirSync(resolve(dist, 'assets'));
for (const file of assets) {
  const content = readFileSync(resolve(dist, 'assets', file), 'utf8');
  if (file.endsWith('.css')) {
    html = html.replace(new RegExp(`<link[^>]*href="\\./assets/${file.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"[^>]*>`), () => `<style>${content}</style>`);
  } else if (file.endsWith('.js')) {
    const safe = content.replace(/<\/script/gi, '<\\/script');
    html = html.replace(new RegExp(`<script[^>]*src="\\./assets/${file.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"[^>]*></script>`), () => `<script type="module">${safe}</script>`);
  }
}
if (/assets\//.test(html)) throw new Error('Asset reference left in index.html; inlining failed');

rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });
writeFileSync(resolve(outDir, 'index.html'), html);
cpSync(resolve(root, 'docs/business-plan.md'), resolve(outDir, 'business-plan.md'));
cpSync(resolve(root, 'docs/DECISIONS.md'), resolve(outDir, 'DECISIONS.md'));
cpSync(resolve(root, 'model/fairr-model.xlsx'), resolve(outDir, 'fairr-model.xlsx'));
cpSync(resolve(root, 'model/fairr-model.csv'), resolve(outDir, 'fairr-model.csv'));
cpSync(resolve(root, 'model/ASSUMPTIONS.md'), resolve(outDir, 'ASSUMPTIONS.md'));
cpSync(resolve(root, 'model/VALIDATION.md'), resolve(outDir, 'VALIDATION.md'));
cpSync(resolve(root, 'research/SOURCES.md'), resolve(outDir, 'SOURCES.md'));
writeFileSync(
  resolve(outDir, 'README-LOCAL.txt'),
  [
    'Optiv FAIRR Practice - local copy',
    '',
    'index.html          Open in any modern browser (double-click). Runs entirely offline;',
    '                    the financial model computes in the browser. Web fonts load only when',
    '                    online, otherwise system fallbacks are used.',
    'business-plan.md    The full business plan (also rendered inside the app under Business Plan).',
    'fairr-model.xlsx    Excel workbook with live formulas (edit the Inputs sheet).',
    'fairr-model.csv     Base-case 36-month snapshot.',
    'ASSUMPTIONS.md      Every model input with its basis and sensitivity rank.',
    'VALIDATION.md       Validation results, including the Excel reconciliation.',
    'SOURCES.md          Every source with URL and retrieval date.',
    'DECISIONS.md        Decisions made during the build.',
    '',
    'Live version: https://akapc.github.io/optiv-fairr-practice/',
    'Repository:   https://github.com/akaPC/optiv-fairr-practice',
  ].join('\n') + '\n',
);
rmSync(zipPath, { force: true });
execSync(`cd "${resolve(root, 'local')}" && zip -qr "${zipPath}" optiv-fairr-practice-local`, { stdio: 'inherit' });
rmSync(dist, { recursive: true, force: true });
console.log(`Wrote ${outDir}\nWrote ${zipPath} (${(readFileSync(zipPath).length / 1024).toFixed(0)} KB)`);
if (!existsSync(zipPath)) process.exit(1);
