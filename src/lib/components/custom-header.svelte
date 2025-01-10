<script>
	import { Close } from 'carbon-icons-svelte'
	import Logo from './icons/logo.svelte'
	import Button from './ui/button.svelte'
</script>

<header>
	<a class="logo-link" href="/">
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
		border-bottom: 1px solid var(--colors-ultra-low);
		position: fixed;
		top: 0;
	}
	.logo-link {
		display: flex;
		color: var(--colors-ultra-high);
	}
</style>
