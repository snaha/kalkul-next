<script>
	import { styleToString } from 'svelte-email'

	export let style = {}
	let className = undefined
	export { className as class }
	export let children

	const styleDefaultTable = {
		width: '100%',
		...style,
	}
</script>

<table
	style={styleToString(styleDefaultTable)}
	align="center"
	border={0}
	cellPadding={0}
	cellSpacing={0}
	role="presentation"
	{...$$restProps}
	class={className}
>
	<tbody>
		<tr>
			<td>
				{@render children()}
			</td>
		</tr>
	</tbody>
</table>
