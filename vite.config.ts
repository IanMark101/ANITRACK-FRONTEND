import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { Agent } from 'node:http';

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        agent: new Agent({ keepAlive: true })
      }
    }
  },
  test: { environment: 'node' }
});
