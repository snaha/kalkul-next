<script lang="ts">
	import { ArrowLeft, Close } from 'carbon-icons-svelte'
	import { _, locale } from 'svelte-i18n'
	import Button from '$lib/components/ui/button.svelte'
	import LoaderButton from '$lib/components/loader-button.svelte'
	import Typography from '$lib/components/ui/typography.svelte'
	import Vertical from '$lib/components/ui/vertical.svelte'
	import Horizontal from '$lib/components/ui/horizontal.svelte'
	import Chart from '$lib/components/chart.svelte'
	import FormattedNumberInput from '$lib/components/ui/input/formatted-number/input.svelte'
	import { getCSSVariableValue } from '$lib/css-vars'

	type Props = {
		calculatedDeposit: number
		currency: string
		frequency: string
		depositAmount: number
		chartLabels: string[]
		whatYouNeedData: number[]
		whatYouHaveData: number[]
		close: () => void
		goBack: () => void
		saveGoal: (depositAmount: number) => void
	}

	let {
		calculatedDeposit,
		currency,
		frequency,
		depositAmount = $bindable(),
		chartLabels,
		whatYouNeedData,
		whatYouHaveData,
		close,
		goBack,
		saveGoal,
	}: Props = $props()

	const frequencyLabel = $derived(
		frequency === 'month' ? $_('page.retirement.perMonth') : $_('page.retirement.perYear'),
	)

	const frequencyShort = $derived(frequency === 'month' ? 'm' : 'y')

	// Get CSS color values
	const colorHigh = getCSSVariableValue('--colors-high')
	const colorUltraHigh = getCSSVariableValue('--colors-ultra-high')

	function handleSaveGoal() {
		saveGoal(depositAmount)
	}
</script>

<Vertical class="max-width-560">
	<Horizontal>
		<Button variant="ghost" dimension="compact" onclick={goBack}>
			<ArrowLeft size={24} />
		</Button>
		<Typography variant="h4">{$_('page.retirement.preview')}</Typography>
		<div class="grower"></div>
		<Button variant="ghost" dimension="compact" onclick={close}><Close size={24} /></Button>
	</Horizontal>
	<div class="spacer"></div>

	<div class="chart-container">
		<Chart
			labels={chartLabels}
			datasets={[
				{
					label: $_('page.retirement.whatYouNeed'),
					data: whatYouNeedData,
					borderColor: colorUltraHigh,
					backgroundColor: 'transparent',
					borderDash: [5, 5],
					borderWidth: 1,
					fill: false,
					tension: 0.4,
					pointRadius: 0,
					pointHoverRadius: 0,
				},
				{
					label: $_('page.retirement.whatYouHave'),
					data: whatYouHaveData,
					borderColor: colorHigh,
					backgroundColor: `${colorHigh}40`,
					borderWidth: 1,
					fill: true,
					tension: 0.4,
					pointRadius: 0,
					pointHoverRadius: 0,
				},
			]}
			type="line"
			options={{
				animation: false,
				plugins: {
					legend: {
						display: true,
						position: 'bottom',
					},
				},
				scales: {
					x: {
						ticks: {
							autoSkip: false,
							maxRotation: 0,
							minRotation: 0,
						},
					},
					y: {
						beginAtZero: true,
					},
				},
			}}
		/>
	</div>

	<div class="result-banner">
		<Typography variant="default" element="p" style="color: white; text-align: center;">
			{$_('page.retirement.depositToMatch', {
				values: {
					amount: calculatedDeposit,
					currency: currency,
					frequency: frequencyLabel,
				},
			})}
		</Typography>
	</div>

	<FormattedNumberInput
		variant="solid"
		dimension="default"
		bind:value={depositAmount}
		unit={`${currency} / ${frequencyShort}`}
		locale={$locale}
		label={$_('page.retirement.setDepositAmount')}
		helperText={$_('page.retirement.depositInRealValue')}
	/>

	<div class="spacer"></div>

	<div class="button-container">
		<div class="left-buttons">
			<LoaderButton variant="strong" dimension="compact" onclick={handleSaveGoal}>
				{$_('page.retirement.createPlan')}
			</LoaderButton>
			<Button variant="ghost" dimension="compact" onclick={close}>
				{$_('common.cancel')}
			</Button>
		</div>
		<Button variant="ghost" dimension="compact" onclick={goBack}>
			{$_('page.retirement.modifyParameters')}
		</Button>
	</div>
</Vertical>

<style>
	.spacer {
		margin-top: var(--half-padding);
	}
	.grower {
		flex: 1;
	}
	:global(.max-width-560) {
		max-width: 560px;
		width: 100%;
	}
	.chart-container {
		width: 100%;
		height: 288px;
		margin: var(--padding) 0;
	}
	.result-banner {
		background-color: var(--colors-high);
		padding: var(--padding);
		border-radius: var(--border-radius);
		margin: var(--padding) 0;
	}
	.button-container {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: var(--half-padding);
		flex-wrap: wrap;
	}
	.left-buttons {
		display: flex;
		gap: var(--half-padding);
		flex-wrap: wrap;
	}
</style>
