<script lang="ts" module>
	import Button, { type Props as ButtonProps } from '$lib/components/ui/button.svelte'
	import Tooltip, { type Props as TooltipProps } from '$lib/components/ui/tooltip.svelte'
	import { Checkmark, Copy } from 'carbon-icons-svelte'

	export type CopyButtonProps = ButtonProps &
		TooltipProps & {
			copyText: string
			iconSize?: 16 | 20 | 24 | 32
			showIcon?: boolean
			onCopy?: () => void
		}
</script>

<script lang="ts">
	let {
		copyText,
		iconSize = 24,
		showIcon = true,
		position = 'bottom',
		onCopy,
		children,
		...props
	}: CopyButtonProps = $props()
	let icon: 'copy' | 'check' = $state('copy')
	let iconTimeout: ReturnType<typeof setTimeout> | undefined = $state(undefined)

	function onclick() {
		if (onCopy) {
			onCopy()
		}
		navigator.clipboard.writeText(copyText)

		icon = 'check'
		clearTimeout(iconTimeout)
		iconTimeout = setTimeout(() => (icon = 'copy'), 2000)
	}
</script>

<Tooltip {...props} {position} show={icon === 'check'}>
	<Button {...props} {onclick}>
		{#if children}
			{@render children()}
		{/if}
		{#if showIcon}
			{#if icon === 'copy'}
				<Copy size={iconSize} />
			{:else}
				<Checkmark size={iconSize} />
			{/if}
		{/if}
	</Button>
</Tooltip>
