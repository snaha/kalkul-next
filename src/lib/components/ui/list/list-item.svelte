<script lang="ts">
	import Button from '../button.svelte'
	import { type Props } from '../button.svelte'

	let { children, onclick, ...restProps }: Props = $props()

	function onClick(e: MouseEvent) {
		e.stopPropagation()
		if (onclick) {
			onclick(
				e as MouseEvent & { currentTarget: EventTarget & HTMLAnchorElement } & {
					currentTarget: EventTarget & HTMLButtonElement
				},
			)
		}
	}
</script>

<Button leftAlign dimension="compact" variant="ghost" onclick={onClick} {...restProps}>
	{#if children}
		{@render children()}
	{/if}
</Button>
