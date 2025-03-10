import nodeAdapter from '@sveltejs/adapter-node'
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
		adapter:
			process.env.VITE_ADAPTER === 'static'
				? staticAdapter({ fallback: 'index.html' })
				: nodeAdapter(),
	},
}

export default config
