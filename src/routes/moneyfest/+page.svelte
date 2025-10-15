<script lang="ts">
	import { ArrowRight } from 'carbon-icons-svelte'
	import Button from '$lib/components/ui/button.svelte'
	import { _ } from 'svelte-i18n'
	import routes from '$lib/routes'
	import { base } from '$app/paths'
	import Typography from '$lib/components/ui/typography.svelte'
	import Vertical from '$lib/components/ui/vertical.svelte'
	import { onMount } from 'svelte'
	import { PROMOTION, PROMOTION_STORAGE_KEY } from '$lib/payments'
	import ContentLayout from '$lib/components/content-layout.svelte'
	import BetaBadge from '$lib/components/beta-badge.svelte'

	onMount(() => {
		localStorage.setItem(PROMOTION_STORAGE_KEY, PROMOTION.MONEYFEST_SK_2025)
	})
</script>

<ContentLayout>
	<Vertical
		class="max-width560 text-align-center"
		--vertical-gap="var(--padding)"
		--vertical-justify-content="center"
		--vertical-align-items="center"
	>
		<Vertical --vertical-gap="var(--padding)">
			<img src={`${base}/images/manifest-kalkul.svg`} alt={$_('common.introImg')} />
			<img src={`${base}/images/manifest-kalkul-collaboration.svg`} alt={$_('common.introImg')} />
		</Vertical>
		<Vertical --vertical-gap="var(--half-padding)">
			<Typography variant="large">
				<!-- eslint-disable-next-line svelte/no-at-html-tags -->
				{@html $_('page.moneyfest.cta')}
			</Typography>

			<Typography>
				{$_('page.moneyfest.description')}
			</Typography>
		</Vertical>

		<Button variant="strong" dimension="compact" href={routes.SIGNUP}
			>{$_('page.moneyfest.button')}<ArrowRight size={24} /></Button
		>

		<Typography variant="small">
			{$_('page.moneyfest.noCreditCard')}
		</Typography>

		<Vertical --vertical-gap="var(--half-padding)">
			<BetaBadge />
			<Typography variant="small" accent>
				{$_('page.moneyfest.disclaimer')}
			</Typography>
		</Vertical>
	</Vertical>
</ContentLayout>

<style>
	:global(.max-width560) {
		max-width: 560px;
		width: 100%;
	}
	:global(.text-align-center) {
		text-align: center;
	}
	img {
		width: 256px;
		height: auto;
	}
</style>
