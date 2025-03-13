import type { KnipConfig } from 'knip'

const config: KnipConfig = {
	paths: {
		'$app/*': ['node_modules/@sveltejs/kit/src/runtime/app/*'],
		'$env/*': ['.svelte-kit/ambient.d.ts'],
		'$lib/*': ['src/lib/*'],
	},
	ignore: ['src/lib/typesdb.ts'],
	ignoreExportsUsedInFile: true,
}

export default config
