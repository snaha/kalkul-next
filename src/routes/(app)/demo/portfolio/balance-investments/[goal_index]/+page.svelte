<script lang="ts">
	import Typography from '$lib/components/ui/typography.svelte'
	import Button from '$lib/components/ui/button.svelte'
	import Slider from '$lib/components/ui/slider.svelte'
	import Horizontal from '$lib/components/ui/horizontal.svelte'
	import Vertical from '$lib/components/ui/vertical.svelte'
	import FlexItem from '$lib/components/ui/flex-item.svelte'
	import Badge from '$lib/components/ui/badge.svelte'
	import { demoStore } from '$lib/demo/stores/demo.svelte'
	import { _ } from 'svelte-i18n'
	import { page } from '$app/state'
	import { Add, Subtract, Locked, Automatic, Close, Information } from 'carbon-icons-svelte'
	import { SERIES_COLORS } from '$lib/colors'

	const goalIndex = $derived(parseInt(page.params.goal_index, 10))
	const goal = $derived(demoStore.goals[goalIndex])
	const portfolio = $derived(demoStore.portfolio)

	let investmentWeights = $state<{ investmentId: number; percentage: number }[]>([])
	let lockedInvestments = $state<Set<number>>(new Set())

	$effect(() => {
		if (goal && investmentWeights.length === 0) {
			investmentWeights = goal.linkedInvestments.map((li) => ({
				investmentId: li.investmentId,
				percentage: li.percentage,
			}))
		}
	})

	const initialGoalTarget = $derived(goal?.type === 'retirement' ? goal.calculationInput.apy : 5.5)
	const totalPercentage = $derived(investmentWeights.reduce((sum, w) => sum + w.percentage, 0))
	const isValid = $derived(Math.abs(totalPercentage - 100) < 0.01)
	const unlockedCount = $derived(
		investmentWeights.filter((w) => !lockedInvestments.has(w.investmentId)).length,
	)
	const weightedAverageReturn = $derived(
		investmentWeights.reduce((sum, w) => {
			const investment = demoStore.investments.find((inv) => inv.id === w.investmentId)
			return sum + (investment?.apy ?? 0) * (w.percentage / 100)
		}, 0),
	)

	function distributeToUnlocked() {
		const locked = investmentWeights
			.filter((w) => lockedInvestments.has(w.investmentId))
			.reduce((sum, w) => sum + w.percentage, 0)
		const unlocked = investmentWeights.filter((w) => !lockedInvestments.has(w.investmentId))

		if (unlocked.length > 0) {
			const remaining = Math.max(0, 100 - locked)
			const perInvestment = remaining / unlocked.length

			unlocked.forEach((weight) => {
				const idx = investmentWeights.findIndex((w) => w.investmentId === weight.investmentId)
				if (idx !== -1) {
					investmentWeights[idx].percentage = perInvestment
				}
			})
		}

		investmentWeights = [...investmentWeights]
	}

	function updateWeight(investmentId: number, newPercentage: number, lockInvestment = true) {
		const index = investmentWeights.findIndex((w) => w.investmentId === investmentId)
		if (index === -1) return

		if (lockInvestment) {
			const otherLockedTotal = investmentWeights
				.filter((w) => w.investmentId !== investmentId && lockedInvestments.has(w.investmentId))
				.reduce((sum, w) => sum + w.percentage, 0)
			const maxAllowed = 100 - otherLockedTotal

			newPercentage = Math.round(Math.max(0, Math.min(maxAllowed, newPercentage)))
			lockedInvestments.add(investmentId)
			lockedInvestments = new Set(lockedInvestments)
		}

		investmentWeights[index].percentage = newPercentage
		distributeToUnlocked()
	}

	function incrementWeight(investmentId: number) {
		const weight = investmentWeights.find((w) => w.investmentId === investmentId)
		if (weight) {
			updateWeight(investmentId, weight.percentage + 1)
		}
	}

	function decrementWeight(investmentId: number) {
		const weight = investmentWeights.find((w) => w.investmentId === investmentId)
		if (weight) {
			updateWeight(investmentId, weight.percentage - 1)
		}
	}

	function toggleLock(investmentId: number) {
		if (lockedInvestments.has(investmentId)) {
			lockedInvestments.delete(investmentId)
			lockedInvestments = new Set(lockedInvestments)
			distributeToUnlocked()
		} else {
			lockedInvestments.add(investmentId)
			lockedInvestments = new Set(lockedInvestments)
		}
	}

	function autoBalance() {
		if (investmentWeights.length === 0) return
		lockedInvestments.clear()
		lockedInvestments = new Set(lockedInvestments)
		const evenPercentage = 100 / investmentWeights.length
		investmentWeights = investmentWeights.map((w) => ({
			...w,
			percentage: evenPercentage,
		}))
	}

	function rebalance() {
		if (!goal) return

		// Always use state 4
		demoStore.setState(4)

		// Update the percentages
		goal.linkedInvestments.forEach((li) => {
			const weight = investmentWeights.find((w) => w.investmentId === li.investmentId)
			if (weight) {
				li.percentage = weight.percentage
			}
		})
		demoStore.regenerateAllTransactions()

		close()
	}

	function close() {
		history.back()
	}

	// DEMO: Keyboard listener to prefill investment balances for demonstration
	$effect(() => {
		function handleKeydown(event: KeyboardEvent) {
			if (event.key === 'ArrowRight') {
				// DEMO PREFILL VALUES
				const eurizonInvestment = demoStore.investments.find((inv) => inv.name === 'Evropské akcie')
				const tatrabanka = demoStore.investments.find((inv) => inv.name === 'Americké akcie')
				const tam = demoStore.investments.find((inv) => inv.name === 'České dluhopisy')
				const gold = demoStore.investments.find((inv) => inv.name === 'Zlato')

				// First clear all locks
				lockedInvestments.clear()
				lockedInvestments = new Set(lockedInvestments)

				// Then set percentages directly
				if (eurizonInvestment) {
					const idx = investmentWeights.findIndex((w) => w.investmentId === eurizonInvestment.id)
					if (idx !== -1) investmentWeights[idx].percentage = 15
				}
				if (tatrabanka) {
					const idx = investmentWeights.findIndex((w) => w.investmentId === tatrabanka.id)
					if (idx !== -1) investmentWeights[idx].percentage = 24
				}
				if (tam) {
					const idx = investmentWeights.findIndex((w) => w.investmentId === tam.id)
					if (idx !== -1) investmentWeights[idx].percentage = 51
				}
				if (gold) {
					const idx = investmentWeights.findIndex((w) => w.investmentId === gold.id)
					if (idx !== -1) investmentWeights[idx].percentage = 10
				}

				investmentWeights = [...investmentWeights]

				// Finally lock all except gold
				if (eurizonInvestment) lockedInvestments.add(eurizonInvestment.id)
				if (tatrabanka) lockedInvestments.add(tatrabanka.id)
				if (tam) lockedInvestments.add(tam.id)
				lockedInvestments = new Set(lockedInvestments)
			}
		}

		window.addEventListener('keydown', handleKeydown)

		return () => {
			window.removeEventListener('keydown', handleKeydown)
		}
	})
</script>

{#if !goal || !portfolio}
	<div class="error-container">
		<Typography variant="h2">404 - {$_('common.notFound')}</Typography>
	</div>
{:else}
	<Vertical --vertical-gap="var(--double-padding)" class="balance-container">
		<!-- Header -->
		<Horizontal --horizontal-gap="var(--padding)" --horizontal-align-items="center">
			<Horizontal --horizontal-gap="var(--padding)" --horizontal-align-items="center">
				<Typography variant="h4">{$_('page.balanceInvestments.title')}</Typography>
				<Badge>
					<Typography variant="small">
						<strong>{weightedAverageReturn.toFixed(1)}%</strong>
						{$_('page.balanceInvestments.weightedAverageReturn')}
					</Typography>
				</Badge>
			</Horizontal>
			<FlexItem />
			<Typography variant="small" class="goal-target">
				{$_('page.balanceInvestments.initialGoalTarget')}: {initialGoalTarget.toFixed(1)}%
			</Typography>
			<Button variant="secondary" dimension="compact" onclick={autoBalance}>
				{$_('page.balanceInvestments.autoBalance')}
			</Button>
			<Button variant="ghost" dimension="compact" onclick={() => {}}>
				<Information size={20} />
			</Button>
			<Button variant="ghost" dimension="compact" onclick={close}>
				<Close size={20} />
			</Button>
		</Horizontal>

		<!-- Main content -->
		<Horizontal --horizontal-gap="var(--double-padding)" class="content">
			<!-- Investment list -->
			<Vertical --vertical-gap="var(--padding)" class="investments-list">
				{#each investmentWeights as weight (weight.investmentId)}
					{@const investment = demoStore.investments.find((inv) => inv.id === weight.investmentId)}
					{@const colorIndex = demoStore.investments.findIndex(
						(inv) => inv.id === weight.investmentId,
					)}
					{#if investment}
						{@const isLocked = lockedInvestments.has(weight.investmentId)}
						{@const isLastUnlocked = unlockedCount === 1 && !isLocked}

						<Vertical --vertical-gap="var(--half-padding)" class="investment-item">
							<!-- Investment label row -->
							<Horizontal --horizontal-gap="var(--padding)" --horizontal-align-items="center">
								<div
									class="color-indicator"
									style="background-color: {SERIES_COLORS[colorIndex % SERIES_COLORS.length]}"
								></div>
								<Typography>{investment.name}</Typography>
								<Badge class="apy-badge">
									<Typography variant="small">{(investment.apy ?? 0).toFixed(2)}% APY</Typography>
								</Badge>
							</Horizontal>

							<!-- Slider and controls row -->
							<Horizontal --horizontal-gap="var(--padding)" --horizontal-align-items="center">
								<div class="slider-wrapper">
									<Slider
										value={weight.percentage}
										oninput={(e: Event) =>
											updateWeight(
												weight.investmentId,
												parseFloat((e.target as HTMLInputElement).value),
											)}
										min={0}
										max={100}
										step={0.1}
										alwaysShowValue={true}
										withoutShowValue={true}
										disabled={isLastUnlocked}
									/>
								</div>

								<Typography class="percentage">
									{#if isLocked}
										<strong>{weight.percentage.toFixed(0)}%</strong>
									{:else}
										{weight.percentage.toFixed(0)}%
									{/if}
								</Typography>

								<Button
									variant="ghost"
									dimension="compact"
									disabled={isLastUnlocked || weight.percentage <= 0}
									onclick={() => decrementWeight(weight.investmentId)}
								>
									<Subtract size={20} />
								</Button>
								<Button
									variant="ghost"
									dimension="compact"
									disabled={isLastUnlocked || weight.percentage >= 100}
									onclick={() => incrementWeight(weight.investmentId)}
								>
									<Add size={20} />
								</Button>
								<Button
									variant="ghost"
									dimension="compact"
									active={isLocked}
									disabled={isLastUnlocked}
									onclick={() => toggleLock(weight.investmentId)}
								>
									{#if isLocked}
										<Locked size={20} />
									{:else}
										<Automatic size={20} />
									{/if}
								</Button>
							</Horizontal>
						</Vertical>
					{/if}
				{/each}
			</Vertical>

			<!-- Donut chart -->
			<div class="chart-container">
				{#snippet chartSegment(weight: { investmentId: number; percentage: number }, index: number)}
					{@const colorIndex = demoStore.investments.findIndex(
						(inv) => inv.id === weight.investmentId,
					)}
					{@const radius = 80}
					{@const innerRadius = 50}
					{@const cx = 100}
					{@const cy = 100}
					{@const startAngle =
						investmentWeights.slice(0, index).reduce((sum, w) => sum + w.percentage, 0) * 3.6}
					{@const angle = weight.percentage * 3.6}
					{@const endAngle = startAngle + angle}

					{@const startX = cx + radius * Math.cos((startAngle - 90) * (Math.PI / 180))}
					{@const startY = cy + radius * Math.sin((startAngle - 90) * (Math.PI / 180))}
					{@const endX = cx + radius * Math.cos((endAngle - 90) * (Math.PI / 180))}
					{@const endY = cy + radius * Math.sin((endAngle - 90) * (Math.PI / 180))}

					{@const innerStartX = cx + innerRadius * Math.cos((startAngle - 90) * (Math.PI / 180))}
					{@const innerStartY = cy + innerRadius * Math.sin((startAngle - 90) * (Math.PI / 180))}
					{@const innerEndX = cx + innerRadius * Math.cos((endAngle - 90) * (Math.PI / 180))}
					{@const innerEndY = cy + innerRadius * Math.sin((endAngle - 90) * (Math.PI / 180))}

					{@const largeArcFlag = angle > 180 ? 1 : 0}

					{#if weight.percentage > 0}
						<path
							d="M {startX} {startY}
							   A {radius} {radius} 0 {largeArcFlag} 1 {endX} {endY}
							   L {innerEndX} {innerEndY}
							   A {innerRadius} {innerRadius} 0 {largeArcFlag} 0 {innerStartX} {innerStartY}
							   Z"
							fill={SERIES_COLORS[colorIndex % SERIES_COLORS.length]}
						/>
					{/if}
				{/snippet}

				<svg viewBox="0 0 200 200" class="donut-chart">
					{#each investmentWeights as weight, index}
						{@render chartSegment(weight, index)}
					{/each}
				</svg>
			</div>
		</Horizontal>

		<!-- Footer -->
		<Horizontal --horizontal-gap="var(--padding)">
			<Button variant="strong" dimension="compact" disabled={!isValid} onclick={rebalance}>
				{$_('page.balanceInvestments.rebalancePortfolio')}
			</Button>
			<Button variant="secondary" dimension="compact" onclick={close}>
				{$_('common.cancel')}
			</Button>
		</Horizontal>
	</Vertical>
{/if}

<style>
	.error-container {
		padding: var(--double-padding);
		text-align: center;
	}

	:global(.balance-container) {
		padding: var(--double-padding);
		max-width: 1200px;
		margin: 0 auto;
	}

	:global(.goal-target) {
		color: var(--colors-ultra-high);
		opacity: 0.5;
	}

	:global(.content) {
		flex: 1;
		align-items: flex-start;
		width: 100%;
	}

	:global(.investments-list) {
		flex: 1;
		width: 100%;
		min-width: 0;
	}

	.chart-container {
		flex-shrink: 0;
		width: 400px;
		height: 400px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.donut-chart {
		width: 100%;
		height: 100%;
		max-width: 400px;
		max-height: 400px;
	}

	.color-indicator {
		width: 24px;
		height: 24px;
		border-radius: var(--border-radius);
		flex-shrink: 0;
	}

	:global(.apy-badge) {
		background-color: var(--colors-ultra-low) !important;
		border: 1px solid var(--colors-low);
	}

	:global(.investment-item) {
		width: 100%;
	}

	.slider-wrapper {
		flex: 1;
		min-width: 430px;
	}

	:global(.percentage) {
		min-width: 50px;
		text-align: right;
		font-weight: 600;
	}
</style>
