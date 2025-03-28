<script>
	import { Close } from 'carbon-icons-svelte'
	import Logo from './icons/logo.svelte'
	import Button from './ui/button.svelte'
	import routes from '$lib/routes'
</script>

<header>
	<a class="logo-link" href={routes.HOME}>
		<Logo size={40} />
	</a>
	<Button dimension="compact" variant="ghost" onclick={() => history.back()}>
		<Close size={24} />
	</Button>
</header>

<style>
	header {
		width: 100%;
		padding: var(--double-padding);
		display: flex;
		justify-content: space-between;
		align-items: center;
		position: sticky;
		top: 0;
		background-color: var(--colors-ultra-low);
		z-index: 1;
	}
	.logo-link {
		display: flex;
		color: var(--colors-ultra-high);
	}
</style>
