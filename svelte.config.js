import staticAdapter from '@sveltejs/adapter-static'
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),

  kit: {
    router: {
      type: process.env.VITE_ROUTER,
    },
    paths: {
      base: process.env.VITE_BASE_URL ?? '',
    },
    adapter: staticAdapter({ fallback: 'index.html' }),
  },
}

export default config
