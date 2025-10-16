<!-- localization-exclude -->
<script lang="ts">
	import { ArrowRight } from 'carbon-icons-svelte'
	import Button from '$lib/components/ui/button.svelte'
	import routes from '$lib/routes'
	import { base } from '$app/paths'
	import Typography from '$lib/components/ui/typography.svelte'
	import Vertical from '$lib/components/ui/vertical.svelte'
	import { onMount } from 'svelte'
	import { PROMOTION, PROMOTION_STORAGE_KEY } from '$lib/payments'
	import ContentLayout from '$lib/components/content-layout.svelte'
	import BetaBadge from '$lib/components/beta-badge.svelte'
	import { umami, UMAMI_EVENTS } from '$lib/umami-events'

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
			<img src={`${base}/images/manifest-kalkul.svg`} alt="Úvodní obrázek" />
			<img src={`${base}/images/manifest-kalkul-collaboration.svg`} alt="Úvodní obrázek" />
		</Vertical>
		<Vertical --vertical-gap="var(--half-padding)">
			<Typography variant="large">
				<!-- eslint-disable-next-line svelte/no-at-html-tags -->
				{@html "Zaregistrujte se nyní a získejte <span style='font-weight: 700;'>exkluzivní odměny z konference MoneyFest</span>!"}
			</Typography>

			<Typography>
				Získejte bezplatný přístup jako první, ovlivněte produkt svou zpětnou vazbou a získejte 50%
				slevu na cenu při spuštění—očekávané veřejné vydání: začátek roku 2026.
			</Typography>
		</Vertical>

		<Button
			variant="strong"
			dimension="compact"
			onclick={() => umami?.track(UMAMI_EVENTS.MONEYFEST_BUTTON)}
			href={routes.SIGNUP}>Začněte zdarma<ArrowRight size={24} /></Button
		>

		<Typography variant="small">
			Zcela zdarma, není potřeba kreditní karta, žádné závazky.
		</Typography>

		<Vertical --vertical-gap="var(--half-padding)">
			<BetaBadge />
			<Typography variant="small" accent>
				Aktivně vyvíjíme Kalkul se zpětnou vazbou poradců. Některé funkce zvýrazněné na našem webu
				jsou stále ve vývoji a budou postupně uvolňovány, jak budou zdokonalovány.
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
