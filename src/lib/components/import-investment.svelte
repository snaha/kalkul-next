<script lang="ts">
	import { ArrowLeft, ArrowRight, Close, InformationFilled } from 'carbon-icons-svelte'
	import Input from './ui/input/input.svelte'
	import Typography from './ui/typography.svelte'
	import { _ } from 'svelte-i18n'
	import Button from './ui/button.svelte'
	import Loader from './ui/loader.svelte'
	import { authorizedFetch } from '$lib/auth'
	import { figiResponseSchema, type FigiSchema } from '$lib/schemas'
	import Horizontal from './ui/horizontal.svelte'
	import { EXCHANGE_CODE_TO_CURRENCY, EXCHANGES } from '$lib/exchanges'
	import Vertical from './ui/vertical.svelte'
	import { layoutStore } from '$lib/stores/layout.svelte'

	type Props = {
		name: string
		type: string
		apy: number | undefined
		open?: boolean
		currency: string
	}

	let {
		name = $bindable(),
		type = $bindable(),
		apy = $bindable(),
		open = $bindable(),
		currency,
	}: Props = $props()

	// Comparison function for figiValues - sorts by ticker first, then by name
	function compareFigiValues(a: FigiSchema, b: FigiSchema): number {
		const tickerCompare = b.ticker.localeCompare(a.ticker)
		return tickerCompare !== 0 ? tickerCompare : b.name.localeCompare(a.name)
	}

	let isinNumber = $state('')
	let isFetchingISINData = $state(false)
	let isinImportError: string | undefined = $state()
	let figiValues: FigiSchema[] = $state([])
	let disableImportButton = $state(false)
	let apyPerSymbol: Record<string, number> = $state({})
	let isHelpOpen = $state(false)
	let page: 'input' | 'listing' = $state('input')
	let isFiltered = $state(true)
	const filteredFigiValues = $derived(
		isFiltered
			? figiValues.filter(
					(value) => value.exchCode && EXCHANGE_CODE_TO_CURRENCY[value.exchCode] === currency,
				)
			: figiValues,
	)
	$effect(() => {
		if (open === false) {
			// reset to the input page when closed
			page = 'input'
			isFiltered = true
		}
	})

	async function reportISINError(identifier: string, error: object) {
		try {
			await authorizedFetch(`/api/market/error/${identifier}`, {
				method: 'POST',
				body: JSON.stringify(error),
			})
		} catch (e) {
			console.error(e)
		}
	}

	async function fetchISINData(identifier: string) {
		try {
			isinImportError = undefined
			isFetchingISINData = true
			disableImportButton = true

			const response = await authorizedFetch(`/api/market/id/${identifier}`)
			const jsonValue = await response.json()

			const returnValue = figiResponseSchema.safeParse(jsonValue)
			if (returnValue.error) {
				isinImportError = $_('component.editInvestment.errorFetchingIsin')
				await reportISINError(identifier, { error: returnValue.error })
				return
			}

			const values = returnValue.data
			if (values.length === 0) {
				figiValues = []
				page = 'listing'
				await reportISINError(identifier, { error: 'empty result' })
				return
			}

			if ('warning' in values[0]) {
				if (values[0].warning === 'No identifier found.') {
					figiValues = []
					page = 'listing'
					await reportISINError(identifier, { error: 'no identifier found' })
					return
				} else {
					isinImportError = $_('component.editInvestment.noInvestmentFound')
					await reportISINError(identifier, { error: 'no investment found' })
				}
				return
			}

			if (values[0].data.some((value) => value.securityType2 === 'Index')) {
				// handle index funds differently
				figiValues = values[0].data.sort(compareFigiValues)
				isFiltered = false

				page = 'listing'

				await fetchIndexAPY()
			} else {
				figiValues = values[0].data
					.filter((value) => exchangeCurrency(value.exchCode) !== '')
					.sort(compareFigiValues)
					.filter(
						(value, i, values) =>
							i === 0 ||
							(i > 0 &&
								`${value.ticker}.${exchangeOperatingMicOrCode(value.exchCode)}` !==
									`${values[i - 1].ticker}.${exchangeOperatingMicOrCode(values[i - 1].exchCode)}`),
					)

				page = 'listing'

				if (figiValues.length === 0) {
					await reportISINError(identifier, { error: 'no valid exchange' })
					return
				}

				await fetchAPY()
			}
		} catch (e) {
			console.error({ e })
			await reportISINError(identifier, { e })
		} finally {
			isFetchingISINData = false
			disableImportButton = false
		}
	}

	function figiValueToSymbols(values: FigiSchema[]): string {
		const symbols = values
			.map((figiValue) => encodeURIComponent(figiValue.ticker))
			.sort((a, b) => b.localeCompare(a))
			.filter((value, i, values) => i === 0 || (i > 0 && value !== values[i - 1]))
			.join(',')

		return symbols
	}

	async function fetchAPY() {
		const symbols = figiValueToSymbols(figiValues)
		if (symbols === '') {
			return
		}
		const apyResponse = await authorizedFetch(`/api/market/apy/${symbols}`)
		const jsonResponse = await apyResponse.json()

		apyPerSymbol = jsonResponse
	}

	async function fetchIndexAPY() {
		const symbols = figiValueToSymbols(figiValues)
		if (symbols === '') {
			return
		}
		const apyResponse = await authorizedFetch(`/api/market/apy/index/${symbols}`)
		const jsonResponse = await apyResponse.json()

		apyPerSymbol = jsonResponse
	}

	function formatAPY(value: number | undefined) {
		if (!value) {
			return undefined
		}

		// round to two decimals
		return parseFloat(value.toFixed(2))
	}

	function exchangeOperatingMicOrCode(code: string | null) {
		if (!code) {
			return ''
		}
		if (EXCHANGES[code]?.operatingMic) {
			return EXCHANGES[code].operatingMic
		}
		return code
	}

	function selectFigi(value: FigiSchema) {
		name = value.name
		type = value.securityType2
		apy = formatAPY(apyPerSymbol[value.ticker])

		open = false

		isinNumber = ''
		page = 'input'
	}

	function exchangeCurrency(code: string | null) {
		if (!code) {
			return ''
		}
		return EXCHANGE_CODE_TO_CURRENCY[code] ?? ''
	}

	function showAll(e: Event) {
		e.stopPropagation()
		isFiltered = false
	}
</script>

{#snippet inputError()}
	{isinImportError}
{/snippet}

<div class="dropdown">
	{#if page === 'input'}
		<Horizontal --horizontal-justify-content="space-between">
			<Typography variant="h5">{$_('component.editInvestment.importData')}</Typography>
			<Button variant="ghost" dimension="compact" onclick={() => (open = false)}
				><Close size={24} /></Button
			>
		</Horizontal>
		<Typography>{$_('component.editInvestment.isin')}</Typography>
		<Horizontal
			--horizontal-gap="var(--half-padding)"
			--horizontal-align-items="start"
			--horizontal-justify-content="stretch"
		>
			<Input
				dimension="compact"
				variant="solid"
				bind:value={isinNumber}
				disabled={isFetchingISINData}
				oninput={() => (disableImportButton = false)}
				placeholder={$_('component.editInvestment.isinInputPlaceholder')}
				class="flex"
				onkeydown={(e: KeyboardEvent) => {
					if (e.key === 'Enter') {
						fetchISINData(isinNumber.trim())
					}
				}}
				error={isinImportError ? inputError : undefined}
				autofocus={!layoutStore.mobile}
			></Input>
			<Button
				variant="strong"
				dimension="compact"
				onclick={() => fetchISINData(isinNumber.trim())}
				disabled={isinNumber === '' || isFetchingISINData || disableImportButton}
			>
				{$_('component.editInvestment.findProducts')}
				{#if isFetchingISINData}
					<Loader color="low" dimension="large" />
				{:else}
					<ArrowRight size={24} />
				{/if}
			</Button>
		</Horizontal>
		<Vertical --vertical-gap="0">
			<Horizontal
				><Button
					variant="ghost"
					dimension="small"
					onclick={() => (isHelpOpen = !isHelpOpen)}
					active={isHelpOpen}
					><InformationFilled size={16} />{$_('component.editInvestment.whatsThis')}</Button
				></Horizontal
			>
			<Vertical
				--vertical-gap="var(--half-padding)"
				style="height: {isHelpOpen
					? '88px'
					: '0'}; transition: height 0.3s ease-in; overflow: hidden;"
			>
				<div style="padding-top: var(--half-padding)"></div>
				<Typography variant="small">{$_('component.editInvestment.isinExplanation')}</Typography>
				<Typography variant="small">{$_('component.editInvestment.tickerExplanation')}</Typography>
			</Vertical>
		</Vertical>
	{:else if page === 'listing'}
		<Horizontal --horizontal-justify-content="space-between">
			<Horizontal --horizontal-gap="var(--half-padding)">
				<Button
					variant="ghost"
					dimension="compact"
					onclick={(e: Event) => {
						e.stopPropagation()
						page = 'input'
						isFiltered = true
					}}><ArrowLeft size={24} /></Button
				>
				<Typography variant="h5">{$_('component.editInvestment.matchingProducts')}</Typography>
			</Horizontal>
			<Button variant="ghost" dimension="compact" onclick={() => (open = false)}
				><Close size={24} /></Button
			>
		</Horizontal>

		{#if figiValues.length === 0}
			<Horizontal --horizontal-justify-content="center">
				<img
					src="/images/no-client.svg"
					width="180"
					height="180"
					alt={$_('component.editInvestment.noProductAlt')}
				/>
			</Horizontal>
			<Vertical --vertical-align-items="center" --vertical-gap="0">
				<Typography --typography-color="var(--colors-high)"
					>{$_('component.editInvestment.noProductsFound', {
						values: { currency },
					})}</Typography
				>
				<Typography variant="small">{$_('component.editInvestment.tryDifferentSearch')}</Typography>
			</Vertical>
			<Horizontal --horizontal-justify-content="center">
				<Button
					variant="secondary"
					dimension="compact"
					onclick={(e: Event) => {
						e.stopPropagation()
						page = 'input'
					}}>{$_('component.editInvestment.tryAgain')}</Button
				>
			</Horizontal>
		{:else if filteredFigiValues.length === 0}
			<Horizontal --horizontal-justify-content="center">
				<img
					src="/images/currencies.svg"
					width="200"
					height="200"
					alt={$_('component.editInvestment.noProductInCurrencyAlt')}
				/>
			</Horizontal>
			<Vertical --vertical-align-items="center" --vertical-gap="0">
				<Typography style="text-align: center"
					>{$_('component.editInvestment.noProductsInCurrencyButFoundInOthers', {
						values: { currency, numMatching: figiValues.length },
					})}</Typography
				>
				<Typography variant="small"
					>{$_('component.editInvestment.matchingSearchButNotCurrency')}</Typography
				>
			</Vertical>
			<Horizontal --horizontal-justify-content="center">
				<Button variant="secondary" dimension="compact" onclick={showAll}
					>{$_('component.editInvestment.showProducts')}</Button
				>
			</Horizontal>
		{:else}
			{#if isFiltered}
				<Vertical --vertical-align-items="center" --vertical-gap="0">
					<Typography --typography-color="var(--colors-high)"
						>{$_('component.editInvestment.foundMatchingProducts', {
							values: { numProducts: filteredFigiValues.length, currency },
						})}</Typography
					>
					<Typography variant="small"
						>{$_('component.editInvestment.matchingProductExplanation')}</Typography
					>
				</Vertical>
			{/if}

			<Vertical --vertical-gap="var(--quarter-padding">
				<li class="header">
					<Typography variant="small" bold>{$_('component.editInvestment.listingName')}</Typography>
					<Typography variant="small" bold>{$_('component.editInvestment.listingType')}</Typography>
					<Typography variant="small" bold
						>{$_('component.editInvestment.listingSymbol')}</Typography
					>
					<Typography variant="small" bold>{$_('common.currency')}</Typography>
					<Typography variant="small" bold
						>{$_('component.editInvestment.listingExchange')}</Typography
					>
				</li>
				<ul>
					{#each isFiltered ? filteredFigiValues : figiValues as figiValue}
						<!-- svelte-ignore a11y_click_events_have_key_events -->
						<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
						<li class="value" onclick={() => selectFigi(figiValue)}>
							<div>{figiValue.name}</div>
							<div>{figiValue.securityType2}</div>
							<div>{figiValue.ticker}</div>
							<div>{exchangeCurrency(figiValue.exchCode)}</div>
							<div>{exchangeOperatingMicOrCode(figiValue.exchCode)}</div>
							<Button variant="strong" dimension="compact" onclick={() => selectFigi(figiValue)}
								><ArrowRight size={24} /></Button
							>
						</li>
					{/each}
				</ul>
			</Vertical>

			{#if isFiltered && figiValues.length !== filteredFigiValues.length}
				<Vertical --vertical-align-items="center" --vertical-gap="var(--half-padding)">
					<Typography
						>{$_('component.editInvestment.foundMoreInOtherCurrencies', {
							values: { numMatching: figiValues.length - filteredFigiValues.length },
						})}</Typography
					>
					<Typography variant="small"
						>{$_('component.editInvestment.matchingButNotPortfolioCurrency')}</Typography
					>
				</Vertical>

				<Horizontal --horizontal-align-items="stretch" --horizontal-justify-content="center">
					<Button variant="secondary" dimension="compact" onclick={showAll}
						>{$_('component.editInvestment.showAll')}</Button
					>
				</Horizontal>
			{/if}
		{/if}
	{/if}
</div>

<style>
	.dropdown {
		display: flex;
		flex-direction: column;
		gap: var(--padding);
		padding: var(--padding);
		border: 1px solid var(--colors-low);
		border-radius: 0.25rem;
		background: var(--colors-base);
		max-width: 100%;
		width: 100%;
		max-height: calc(100vh - var(--quadruple-padding));
		overflow: auto;
	}
	ul {
		margin: 0;
		padding: 0;
		overflow-y: auto;
		background: var(--colors-base);
	}
	li {
		display: grid;
		grid-template-columns: 180px 1fr 1fr 1fr 1fr 42px;
		flex-direction: row;
		gap: var(--half-padding);
		padding: var(--quarter-padding);
		div {
			display: flex;
			align-items: center;
		}
	}
	li.value:first-child {
		border-top: 1px solid var(--colors-low);
	}
	li.value {
		padding: var(--half-padding) 0;
		border-bottom: 1px solid var(--colors-low);
	}
	li.value:hover {
		/* background-color: var(--colors-low); */
		cursor: pointer;
	}
	:global(.right) {
		display: flex;
		justify-content: end;
	}
	:global(.flex) {
		flex: 1;
	}
</style>
