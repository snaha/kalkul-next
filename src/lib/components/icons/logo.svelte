<script lang="ts">
	interface Props {
		size?: number | string
		color?: string
	}
	let { size = '1em', color = 'currentColor' }: Props = $props()
</script>

<svg width={size} height={size} viewBox="0 0 32 32" fill={color} xmlns="http://www.w3.org/2000/svg">
	<g clip-path="url(#clip0_6152_7179)">
		<path d="M7.42871 16L13.143 26.2857V16V5.71429L7.42871 16Z" fill={color} />
		<path
			d="M24.5711 5.71429H18.8569L13.1426 16L18.8569 26.2857H24.5711L18.8569 16L24.5711 5.71429Z"
			fill={color}
		/>
	</g>
	<defs>
		<clipPath id="clip0_6152_7179">
			<rect width={size} height={size} fill={color} />
		</clipPath>
	</defs>
</svg>
