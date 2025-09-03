<script lang="ts">
	import Section from './section.svelte'
	import Container from './container.svelte'
	import { LINK_STYLES } from '../utils/constants'
	import { styleToString } from 'svelte-email'
	import { _ } from 'svelte-i18n'
	import type { Snippet } from 'svelte'

	type Props = {
		viewLink: string
		children: Snippet
	}

	let { children, viewLink }: Props = $props()
</script>

<Section style={{ margin: '16px auto', maxWidth: '591px' }}>
	<Container
		style={{
			textAlign: 'right',
			paddingBottom: '16px',
			fontSize: '12px',
		}}
	>
		<a href={viewLink} style={styleToString(LINK_STYLES.primary)}
			>{$_('email.common.viewInBrowser')}</a
		>
	</Container>
	<Container
		style={{
			backgroundColor: '#FFFCF9',
			border: '1px solid #E5DFD5',
			borderRadius: '4px',
			padding: '16px',
		}}
	>
		{@render children()}
	</Container>
</Section>
