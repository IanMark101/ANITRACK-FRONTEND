import { defineConfig } from '#q-app';
import { Agent } from 'node:http';

export default defineConfig((ctx) => {
  if (ctx.mode.capacitor && ctx.prod && !ctx.debug) {
    const api = process.env.VITE_MOBILE_API_URL;
    let url: URL | undefined;
    try { url = api ? new URL(api) : undefined; } catch { /* validated below */ }
    if (!url || url.protocol !== 'https:' || url.username || url.password || url.search || url.hash || !url.pathname.endsWith('/api'))
      throw new Error('Set VITE_MOBILE_API_URL to your deployed HTTPS backend ending in /api before building an Android release.');
  }
  return {
    boot: ['app'],
    css: [],
    extras: [],
    sourceFiles: { router: 'src/router', store: 'src/stores/index' },
    build: {
      env: { clientPrefix: 'VITE_' },
      // Dashboard.vue uses Options API; Quasar 3 disables it by default.
      vueOptionsAPI: true,
      vueRouterMode: ctx.mode.capacitor ? 'hash' : 'history',
      target: { browser: ['es2022', 'chrome109', 'safari16'] },
      typescript: {
        strict: true,
        vueShim: true,
        extendTsConfig(config) {
          config.compilerOptions ??= {};
          config.compilerOptions.allowJs = true;
          config.compilerOptions.checkJs = false;
        }
      }
    },
    devServer: {
      host: '127.0.0.1',
      port: 5173,
      strictPort: true,
      open: false,
      proxy: {
        '/api': {
          target: 'http://127.0.0.1:3001',
          changeOrigin: true,
          agent: new Agent({ keepAlive: true })
        }
      }
    },
    framework: { config: { dark: true }, plugins: [] },
    animations: [],
    capacitor: { hideSplashscreen: true }
  };
});
