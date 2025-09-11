<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements'
	import type { Snippet } from 'svelte'
	interface Props extends Omit<HTMLAttributes<HTMLAnchorElement>, 'style'> {
		style?: object
		href: string
		target?: string
		pX?: number
		pY?: number
		children?: Snippet
	}

	let {
		href = '',
		style = {},
		class: className = undefined,
		pX = 0,
		pY = 0,
		target = '_blank',
		children,
		...restProps
	}: Props = $props()

	const y = pY * 2
	const textRaise = pxToPt(y.toString())

	const buttonStyle = (style?: Record<string, string | number> & { pY?: number; pX?: number }) => {
		const paddingY = style?.pY || 0
		const paddingX = style?.pX || 0

		return {
			lineHeight: '100%',
			textDecoration: 'none',
			display: 'inline-block',
			maxWidth: '100%',
			padding: `${paddingY}px ${paddingX}px`,
		}
	}

	const buttonTextStyle = (
		style?: Record<string, string | number | null> & { pY?: number; pX?: number },
	) => {
		const paddingY = style?.pY || 0

		return {
			maxWidth: '100%',
			display: 'inline-block',
			lineHeight: '120%',
			textDecoration: 'none',
			textTransform: 'none' as const,
			msoPaddingAlt: '0px',
			msoTextRaise: pxToPt(paddingY.toString()),
			...style,
		}
	}

	export function pxToPt(px: string): number | null {
		return isNaN(Number(px)) ? null : (parseInt(px, 10) * 3) / 4
	}

	export function styleToString(style: Record<string, string | number | null>) {
		return Object.keys(style).reduce(
			(acc, key) =>
				acc +
				key
					.split(/(?=[A-Z])/)
					.join('-')
					.toLowerCase() +
				':' +
				style[key] +
				';',
			'',
		)
	}
</script>

<a
	{...restProps}
	{href}
	{target}
	style={styleToString(buttonStyle({ ...style, pX, pY }))}
	class={className}
>
	<span>
		<!-- eslint-disable-next-line svelte/no-at-html-tags -->
		{@html `<!--[if mso]><i style="letter-spacing: ${pX}px;mso-font-width:-100%;mso-text-raise:${textRaise}" hidden>&nbsp;</i><![endif]-->`}
	</span>
	<span style={styleToString(buttonTextStyle({ ...style, pX, pY }))}>
		{@render children?.()}
	</span>
	<span>
		<!-- eslint-disable-next-line svelte/no-at-html-tags -->
		{@html `<!--[if mso]><i style="letter-spacing: ${pX}px;mso-font-width:-100%" hidden>&nbsp;</i><![endif]-->`}
	</span>
</a>
