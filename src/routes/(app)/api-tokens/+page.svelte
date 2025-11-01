<script lang="ts">
	import { onMount } from 'svelte'
	import { _ } from 'svelte-i18n'
	import Header from '$lib/components/header.svelte'
	import ContentLayout from '$lib/components/content-layout.svelte'
	import Typography from '$lib/components/ui/typography.svelte'
	import Button from '$lib/components/ui/button.svelte'
	import Vertical from '$lib/components/ui/vertical.svelte'
	import Horizontal from '$lib/components/ui/horizontal.svelte'
	import Modal from '$lib/components/ui/modal.svelte'
	import Input from '$lib/components/ui/input/input.svelte'
	import Loader from '$lib/components/ui/loader.svelte'
	import { Copy, TrashCan } from 'carbon-icons-svelte'
	import { formatDate } from '$lib/@snaha/kalkul-maths/date'
	import { authorizedFetch } from '$lib/auth'
	import { PUBLIC_ORIGIN } from '$env/static/public'
	import { apiRoutes } from '$lib/routes'

	interface ApiToken {
		id: string
		token_prefix: string
		name: string
		created_at: string
		last_used_at: string | undefined
		is_active: boolean
	}

	let tokens: ApiToken[] = $state([])
	let loading = $state(true)
	let showCreateModal = $state(false)
	let showTokenModal = $state(false)
	let newTokenName = $state('')
	let createdToken = $state('')
	let tokenCopied = $state(false)
	let error = $state('')
	const kalkulMCPTokenURL = $derived(`${PUBLIC_ORIGIN}${apiRoutes.MCP}?token=${createdToken}`)

	async function loadTokens() {
		try {
			loading = true
			const response = await authorizedFetch('/api/user/tokens')
			if (!response.ok) {
				throw new Error('Failed to load tokens')
			}
			tokens = await response.json()
		} catch (err) {
			console.error(err)
			error = $_('page.apiTokens.loadError')
		} finally {
			loading = false
		}
	}

	async function createToken() {
		if (!newTokenName.trim()) {
			error = $_('page.apiTokens.nameRequired')
			return
		}

		try {
			const response = await authorizedFetch('/api/user/tokens', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ name: newTokenName.trim() }),
			})

			if (!response.ok) {
				throw new Error('Failed to create token')
			}

			const data = await response.json()
			createdToken = data.token
			showCreateModal = false
			showTokenModal = true
			newTokenName = ''
			await loadTokens()
		} catch (err) {
			console.error(err)
			error = $_('page.apiTokens.createError')
		}
	}

	async function deleteToken(id: string) {
		if (!confirm($_('page.apiTokens.deleteConfirm'))) {
			return
		}

		try {
			const response = await authorizedFetch(`/api/user/tokens/${id}`, {
				method: 'DELETE',
			})

			if (!response.ok) {
				throw new Error('Failed to delete token')
			}

			await loadTokens()
		} catch (err) {
			console.error(err)
			error = $_('page.apiTokens.deleteError')
		}
	}

	function copyToken() {
		navigator.clipboard.writeText(kalkulMCPTokenURL)
		tokenCopied = true
		setTimeout(() => {
			tokenCopied = false
		}, 2000)
	}

	function closeTokenModal() {
		showTokenModal = false
		createdToken = ''
		tokenCopied = false
	}

	onMount(() => {
		loadTokens()
	})
</script>

<Header />

<ContentLayout>
	<Vertical --vertical-gap="var(--padding)">
		<Horizontal --horizontal-justify-content="space-between" --horizontal-align-items="center">
			<Typography variant="h3">{$_('page.apiTokens.title')}</Typography>
			<Button
				variant="strong"
				dimension="compact"
				onclick={() => {
					showCreateModal = true
					error = ''
				}}
			>
				{$_('page.apiTokens.createButton')}
			</Button>
		</Horizontal>

		<Typography>{$_('page.apiTokens.description')}</Typography>

		{#if error}
			<div class="error">
				<Typography>{error}</Typography>
			</div>
		{/if}

		{#if loading}
			<Loader />
		{:else if tokens.length === 0}
			<div class="empty">
				<Typography>{$_('page.apiTokens.noTokens')}</Typography>
			</div>
		{:else}
			<div class="tokens-list">
				{#each tokens as token}
					<div class="token-item">
						<Vertical --vertical-gap="var(--half-padding)">
							<Horizontal --horizontal-justify-content="space-between">
								<Typography variant="h5">{token.name}</Typography>
								<Button variant="ghost" dimension="compact" onclick={() => deleteToken(token.id)}>
									<TrashCan size={20} />
								</Button>
							</Horizontal>
							<Horizontal --horizontal-gap="var(--padding)">
								<div>
									<Typography variant="small">{$_('page.apiTokens.prefix')}</Typography>
									<Typography font="mono">{token.token_prefix}...</Typography>
								</div>
								<div>
									<Typography variant="small">{$_('page.apiTokens.created')}</Typography>
									<Typography>{formatDate(new Date(token.created_at))}</Typography>
								</div>
								<div>
									<Typography variant="small">{$_('page.apiTokens.lastUsed')}</Typography>
									<Typography
										>{token.last_used_at
											? formatDate(new Date(token.last_used_at))
											: $_('page.apiTokens.neverUsed')}</Typography
									>
								</div>
							</Horizontal>
						</Vertical>
					</div>
				{/each}
			</div>
		{/if}
	</Vertical>
</ContentLayout>

<!-- Create Token Modal -->
<Modal bind:open={showCreateModal} title={$_('page.apiTokens.createTitle')}>
	<Vertical --vertical-gap="var(--padding)" style="padding: var(--padding)">
		<Typography>{$_('page.apiTokens.createDescription')}</Typography>
		<Input
			bind:value={newTokenName}
			placeholder={$_('page.apiTokens.namePlaceholder')}
			dimension="compact"
		/>
		<Horizontal --horizontal-gap="var(--half-padding)" --horizontal-justify-content="flex-end">
			<Button variant="ghost" dimension="compact" onclick={() => (showCreateModal = false)}>
				{$_('common.cancel')}
			</Button>
			<Button variant="strong" dimension="compact" onclick={createToken}>
				{$_('page.apiTokens.create')}
			</Button>
		</Horizontal>
	</Vertical>
</Modal>

<!-- Show Token Modal -->
<Modal bind:open={showTokenModal} title={$_('page.apiTokens.tokenCreatedTitle')}>
	<Vertical --vertical-gap="var(--padding)" style="padding: var(--padding)">
		<Typography>{$_('page.apiTokens.tokenCreatedWarning')}</Typography>
		<div class="token-display">
			<Typography font="mono" style="word-break: break-all; user-select: all;"
				>{kalkulMCPTokenURL}</Typography
			>
			<Button variant="ghost" dimension="compact" onclick={copyToken}>
				<Copy size={20} />
				{tokenCopied ? $_('page.apiTokens.copied') : $_('page.apiTokens.copy')}
			</Button>
		</div>
		<Button variant="strong" dimension="compact" onclick={closeTokenModal}>
			{$_('page.apiTokens.done')}
		</Button>
	</Vertical>
</Modal>

<style>
	.error {
		padding: var(--padding);
		background-color: var(--colors-error-bg);
		border: 1px solid var(--colors-error);
		border-radius: var(--border-radius);
		color: var(--colors-error);
	}

	.empty {
		padding: var(--double-padding);
		text-align: center;
		background-color: var(--colors-ultra-low);
		border-radius: var(--border-radius);
	}

	.tokens-list {
		display: flex;
		flex-direction: column;
		gap: var(--padding);
	}

	.token-item {
		padding: var(--padding);
		background-color: var(--colors-ultra-low);
		border: 1px solid var(--colors-low);
		border-radius: var(--border-radius);
	}

	.token-display {
		padding: var(--padding);
		background-color: var(--colors-ultra-low);
		border: 1px solid var(--colors-low);
		border-radius: var(--border-radius);
		display: flex;
		flex-direction: column;
		gap: var(--half-padding);
	}
</style>
