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
		* {
			font-family: sans-serif;
		}
	</style>
	<Preview preview={previewText} />
	<!-- Turn off Cloudflare email obfuscation: https://www.digitalocean.com/community/questions/appplatform-email-protection-performance-issue -->
	<!--email_off-->
	{@render children()}
	<!--/email_off-->
</Html>
