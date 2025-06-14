<script lang="ts">
	import { PUBLIC_ORIGIN } from '$env/static/public'

	const linkPreviewImageURL = `${PUBLIC_ORIGIN}/link-preview.png`

	let {
		title = 'Kalkul',
		description = 'Kalkul helps professional advisors create, visualise and share financial plans with their clients.',
		image = linkPreviewImageURL,
		imageType = 'image/png',
	} = $props()
</script>

<title>{title}</title>
<meta name="description" content={description} />
<meta property="og:title" content={title} />
<meta property="og:description" content={description} />
<meta property="og:image" content={image} />
<meta property="og:image:type" content={imageType} />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content={title} />
<meta name="twitter:description" content={description} />
<meta name="twitter:image:type" content={imageType} />
<meta name="twitter:image" content={image} />
<meta name="twitter:image:width" content="1200" />
<meta name="twitter:image:height" content="630" />
