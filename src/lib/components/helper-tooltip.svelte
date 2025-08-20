<script lang="ts">
	import { Information } from 'carbon-icons-svelte'
	import Button from '$lib/components/ui/button.svelte'
	import Tooltip from '$lib/components/ui/tooltip.svelte'

	type Props = {
		show: boolean
		helperText: string
	}

	let { show = $bindable(), helperText }: Props = $props()
</script>

<Tooltip {show} large position="bottom" {helperText}
	><Button
		dimension="compact"
		variant="ghost"
		onclick={() => (show = !show)}
		onmouseenter={() => (show = true)}
		onmouseleave={() => (show = false)}><Information size={24} /></Button
	></Tooltip
>
