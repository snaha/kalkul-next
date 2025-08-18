<script lang="ts">
	import Typography from './ui/typography.svelte'
	import type { Client, Investment, Portfolio } from '$lib/types'
	import Avatar from './avatar.svelte'
	import Horizontal from './ui/horizontal.svelte'

	type Props = {
		client: Client
		portfolio: Portfolio
		investments?: Investment[]
		adjustWithInflation?: boolean
		avatarSize?: number
	}

	let { client, portfolio, adjustWithInflation = $bindable(), avatarSize = 40 }: Props = $props()
</script>

<Avatar size={avatarSize} name={client.name} birthDate={new Date(client.birth_date)} />
<Horizontal>
	<Typography variant="h4" bold>{portfolio.name}</Typography>
</Horizontal>
