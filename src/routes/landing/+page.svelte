<script>
	import LandingPage from '$lib/components/landing-page.svelte'
	import { layoutStore } from '$lib/stores/layout.svelte'
</script>

<LandingPage isMobile={layoutStore.mobile} />
