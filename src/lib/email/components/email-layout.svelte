<script>
	import { Html, Head } from 'svelte-email'
	import Preview from './preview.svelte'

	let { title = 'Kalkul', previewText = '', children } = $props()
</script>

<Html lang="en">
	<Head>
		<meta charset="utf-8" />
		<title>{title}</title>
	</Head>
	<style>
		body {
			background-color: #f9f3eb;
		}
	</style>
	<Preview preview={previewText} />
	{@render children()}
</Html>
