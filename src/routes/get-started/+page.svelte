<script lang="ts">
	import ContentLayout from '$lib/components/content-layout.svelte'
	import Footer from '$lib/components/footer.svelte'
	import Fullscreen from '$lib/components/fullscreen.svelte'
	import GetStarted from '$lib/components/get-started.svelte'
</script>

<Fullscreen
	hasCloseButton={false}
	--header-background-color="var(--colors-ultra-low)"
	--header-position="absolute"
>
	<ContentLayout>
		<GetStarted />
	</ContentLayout>
</Fullscreen>
<Footer />
