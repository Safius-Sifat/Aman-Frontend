import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [sveltekit()],
  server: {
    host: '0.0.0.0',
    port: 5000,
    fs: {
      allow: ['..']
    },
    allowedHosts: ['all']
  },
  preview: {
    host: '0.0.0.0',
    port: 5000
  },
  define: {
    global: 'globalThis'
  },
  optimizeDeps: {
    include: ['better-sqlite3']
  },
  build: {
    commonjsOptions: {
      include: [/node_modules/]
    }
  }
});
