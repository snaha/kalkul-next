<script lang="ts">
	import { ArrowLeft, ArrowsHorizontal } from 'carbon-icons-svelte'
	import { _, locale } from 'svelte-i18n'
	import Button from '$lib/components/ui/button.svelte'
	import LoaderButton from '$lib/components/loader-button.svelte'
	import Typography from '$lib/components/ui/typography.svelte'
	import Vertical from '$lib/components/ui/vertical.svelte'
	import Horizontal from '$lib/components/ui/horizontal.svelte'
	import Chart from '$lib/components/chart.svelte'
	import FormattedNumberInput from '$lib/components/ui/input/formatted-number/input.svelte'
	import { getCSSVariableValue } from '$lib/css-vars'
	import ResponsiveLayout from './ui/responsive-layout.svelte'
	import FlexItem from './ui/flex-item.svelte'
	import DesktopOnly from './desktop-only.svelte'

	type PreviewLabels = {
		pageTitle: string
		budgetLabel: string
	}

	type Props = {
		calculatedDeposit: number
		currency: string
		frequency: string
		depositAmount: number
		desiredBudget: number
		chartLabels: string[]
		whatYouNeedData: number[]
		whatYouHaveData: number[]
		close: () => void
		goBack: () => void
		saveGoal: (depositAmount: number) => void
		labels: PreviewLabels
	}

	let {
		calculatedDeposit,
		currency,
		frequency,
		depositAmount = $bindable(),
		desiredBudget = $bindable(),
		chartLabels,
		whatYouNeedData,
		whatYouHaveData,
		close,
		goBack,
		saveGoal,
		labels,
	}: Props = $props()

	const frequencyLabel = $derived(
		frequency === 'month'
			? $_('common.periodicWithdrawal.perMonth')
			: $_('common.periodicWithdrawal.perYear'),
	)

	const frequencyShort = $derived(frequency === 'month' ? 'm' : 'y')

	// Get CSS color values
	const colorHigh = getCSSVariableValue('--colors-high')
	const colorUltraHigh = getCSSVariableValue('--colors-ultra-high')

	// Calculate grid frequency based on number of years
	const gridlineFrequency = $derived(Math.max(1, Math.ceil(chartLabels.length / 10)))

	function handleSaveGoal() {
		saveGoal(depositAmount)
	}
</script>

<Vertical class="max-width-560" --vertical-gap="var(--double-padding)">
	<Horizontal>
		<Button variant="ghost" dimension="compact" onclick={goBack}>
			<ArrowLeft size={24} />
		</Button>
		<Typography variant="h4">{labels.pageTitle}</Typography>
	</Horizontal>

	<div class="chart-container">
		<Chart
			labels={chartLabels}
			datasets={[
				{
					label: $_('common.periodicWithdrawal.whatYouNeed'),
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
					label: $_('common.periodicWithdrawal.whatYouHave'),
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
						grid: {
							color: ({ index }) =>
								index % gridlineFrequency === 0 ? 'rgba(0, 0, 0, 0.1)' : 'transparent',
						},
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

	<Vertical --vertical-gap="var(--padding)">
		<div class="result-banner">
			<Typography variant="default" element="p" style="color: white; text-align: center;">
				{$_('component.goals-periodic-withdrawal-preview.depositToMatch', {
					values: {
						amount: Math.round(calculatedDeposit),
						currency: currency,
						frequency: frequencyLabel,
					},
				})}
			</Typography>
		</div>

		<Vertical --vertical-gap="var(--quarter-padding)">
			<Horizontal
				--horizontal-gap="0"
				--horizontal-align-items="flex-end"
				--horizontal-justify-content="stretch"
			>
				<FormattedNumberInput
					variant="solid"
					dimension="compact"
					bind:value={depositAmount}
					unit={`${currency} / ${frequencyShort}`}
					locale={$locale}
					label={$_('common.periodicWithdrawal.setDepositAmount')}
					maximumFractionDigits={0}
					min={0}
					step={1}
					class="grower"
				/>
				<div class="arrow">
					<ArrowsHorizontal size={16} />
				</div>
				<FormattedNumberInput
					variant="solid"
					dimension="compact"
					bind:value={desiredBudget}
					unit={`${currency} / ${frequencyShort}`}
					locale={$locale}
					label={labels.budgetLabel}
					maximumFractionDigits={0}
					min={0}
					step={1}
					class="grower"
				/>
			</Horizontal>
			<Typography variant="small">{$_('common.periodicWithdrawal.depositInRealValue')}</Typography>
		</Vertical>
	</Vertical>

	<ResponsiveLayout --responsive-justify-content="stretch" --responsive-gap="var(--half-padding)">
		<LoaderButton variant="strong" dimension="compact" onclick={handleSaveGoal}>
			{$_('common.periodicWithdrawal.createPlan')}
		</LoaderButton>
		<Button variant="ghost" dimension="compact" onclick={close}>
			{$_('common.cancel')}
		</Button>
		<DesktopOnly>
			<FlexItem />
		</DesktopOnly>
		<Button variant="ghost" dimension="compact" onclick={goBack}>
			{$_('common.periodicWithdrawal.modifyParameters')}
		</Button>
	</ResponsiveLayout>
</Vertical>

<style>
	:global(.max-width-560) {
		max-width: 560px;
		width: 100%;
	}
	:global(.horizontal .grower) {
		flex: 1;
		min-width: 0;
	}
	.chart-container {
		width: 100%;
		height: 288px;
	}
	.result-banner {
		background-color: var(--colors-high);
		padding: var(--half-padding);
		border-radius: var(--border-radius);
	}
	.arrow {
		padding: 10px;
		color: var(--colors-high-neutral);
	}
</style>
