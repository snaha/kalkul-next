import nodeAdapter from '@sveltejs/adapter-node'
import staticAdapter from '@sveltejs/adapter-static'
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),

	kit: {
		paths: {
			base: process.env.BASE_URL ?? '',
		},
		adapter:
			process.env.ADAPTER === 'static' ? staticAdapter({ fallback: 'index.html' }) : nodeAdapter(),
	},
}

export default config
