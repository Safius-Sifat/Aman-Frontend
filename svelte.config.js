// import adapter from '@sveltejs/adapter-node';
import adapter from '@sveltejs/adapter-cloudflare';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),

  kit: {
    adapter: adapter({
      out: 'build',
      precompress: false,
      envPrefix: '',
      polyfill: true
    }),
    csrf: {
      checkOrigin: false
    }
  }
};

export default config;
