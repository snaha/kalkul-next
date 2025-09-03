<script lang="ts">
	import { styleToString } from 'svelte-email'

	let { style = undefined, class: className = '', children, ...restProps } = $props()

	const styles = { maxWidth: '592px', ...style }
	const inlineStyle = styleToString(styles)
</script>

<div {...restProps} style={inlineStyle} class={className}>
	{@render children()}
</div>
