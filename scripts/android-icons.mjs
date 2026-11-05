import { chromium } from '@playwright/test';
import { readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// The website's mark is the canonical source for Android launcher/splash exports.
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const resources = resolve(root, 'src-capacitor/android/app/src/main/res');
const svg = await readFile(resolve(root, 'public/images/anitrack-mark.svg'), 'utf8');
const path = svg.match(/<path\s+d="([^"]+)"/)?.[1];
const fill = svg.match(/<rect[^>]+fill="(#[a-f0-9]+)"/i)?.[1];
const stroke = svg.match(/stroke="(#[a-f0-9]+)"/i)?.[1];
if (!path || !fill || !stroke) throw new Error('The canonical AniTrack mark format changed; review the Android exporter.');
const foreground = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 108 108" fill="none"><g transform="translate(20 20) scale(2.125)">' +
  svg.match(/<path[^>]+\/>/)[0] + '</g></svg>';
const browser = await chromium.launch({ headless: true, ...(process.platform === 'win32' ? { channel: 'msedge' } : {}) });
try {
  const page = await browser.newPage();
  for (const [density, scale] of [['mdpi', 1], ['hdpi', 1.5], ['xhdpi', 2], ['xxhdpi', 3], ['xxxhdpi', 4]]) {
    for (const [name, image, size] of [
      ['ic_launcher', svg, 48 * scale],
      ['ic_launcher_round', svg.replace('rx="8"', 'rx="16"'), 48 * scale],
      ['ic_launcher_foreground', foreground, 108 * scale]
    ]) {
      await page.setViewportSize({ width: size, height: size });
      await page.setContent('<html><body style="margin:0;background:transparent">' + image + '</body></html>');
      await page.locator('svg').evaluate(el => { el.style.width = '100vw'; el.style.height = '100vh'; el.style.display = 'block'; });
      await page.screenshot({ path: resolve(resources, 'mipmap-' + density, name + '.png'), omitBackground: true });
    }
  }
} finally { await browser.close(); }
const vectorPath = '<group android:translateX="20" android:translateY="20" android:scaleX="2.125" android:scaleY="2.125">' +
  '<path android:fillColor="@android:color/transparent" android:strokeColor="' + stroke +
  '" android:strokeWidth="1.8" android:strokeLineCap="round" android:strokeLineJoin="round" android:pathData="' + path + '"/></group>';
const vector = content => '<vector xmlns:android="http://schemas.android.com/apk/res/android" android:width="108dp" android:height="108dp" android:viewportWidth="108" android:viewportHeight="108">' + content + '</vector>\n';
await writeFile(resolve(resources, 'drawable/anitrack_mark_foreground.xml'), vector(vectorPath));
await writeFile(resolve(resources, 'drawable/anitrack_splash.xml'), vector(
  '<path android:fillColor="' + fill + '" android:pathData="M36,18H72Q90,18 90,36V72Q90,90 72,90H36Q18,90 18,72V36Q18,18 36,18Z"/>' + vectorPath));
await writeFile(resolve(resources, 'values/ic_launcher_background.xml'),
  '<resources><color name="ic_launcher_background">' + fill + '</color></resources>\n');
console.log('Exported AniTrack website mark to all Android launcher densities, adaptive foreground and splash.');
