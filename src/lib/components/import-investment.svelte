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

	type Props = {
		name: string
		type: string
		apy: number
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

	let isinNumber = $state('')
	let isFetchingISINData = $state(false)
	let isinImportError: string | undefined = $state()
	let figiValues: FigiSchema[] = $state([])
	let disableImportButton = $state(false)
	let apyPerSymbol: Record<string, number> = $state({})
	let isHelpOpen = $state(false)
	let page: 'input' | 'listing' = $state('input')

	async function fetchISINData(identifier: string) {
		try {
			isinImportError = undefined
			isFetchingISINData = true
			disableImportButton = true

			const response = await authorizedFetch(`/api/market/id/${identifier}/${currency}`)
			const jsonValue = await response.json()

			console.debug({ jsonValue })

			const returnValue = figiResponseSchema.safeParse(jsonValue)
			if (returnValue.error) {
				isinImportError = $_('There was an error during fetching ISIN number')
				return
			}

			const values = returnValue.data
			if (values.length === 0) {
				isinImportError = $_('No investment found')
				return
			}

			if ('warning' in values[0]) {
				console.debug({ value: values[0] })
				if (values[0].warning === 'No identifier found.') {
					isinImportError = $_('This identifier is not supported with the current currency')
				} else {
					isinImportError = $_('No investment found')
				}
				return
			}

			figiValues = values[0].data
				.filter((value) => EXCHANGE_CODE_TO_CURRENCY[value.exchCode] === currency)
				.sort((a, b) => b.ticker.localeCompare(a.ticker))
				.filter(
					(value, i, values) =>
						i === 0 ||
						(i > 0 &&
							`${value.ticker}.${exchangeOperatingMicOrCode(value.exchCode)}` !==
								`${values[i - 1].ticker}.${exchangeOperatingMicOrCode(values[i - 1].exchCode)}`),
				)

			page = 'listing'

			await fetchAPY()
		} catch (e) {
			console.error({ e })
		} finally {
			isFetchingISINData = false
			disableImportButton = false
			if (isinImportError) {
				console.debug({ isinImportError })
			}
		}
	}

	async function fetchAPY() {
		try {
			const symbols = figiValues
				.map((figiValue) => figiValue.ticker)
				.sort((a, b) => b.localeCompare(a))
				.filter((value, i, values) => i === 0 || (i > 0 && value !== values[i - 1]))
				.join(',')
			const apyResponse = await authorizedFetch(`/api/market/apy/${symbols}`)
			const jsonResponse = await apyResponse.json()

			apyPerSymbol = jsonResponse
		} catch (e) {
			console.error({ e })
		}
	}

	function formatAPY(value: number | undefined) {
		if (!value) {
			return 0
		}

		// round to two decimals
		return parseFloat(value.toFixed(2))
	}

	function exchangeOperatingMicOrCode(code: string) {
		if (EXCHANGES[code].operatingMic) {
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
					active={isHelpOpen}><InformationFilled size={16} />{$_("What's this?")}</Button
				></Horizontal
			>
			<Vertical
				--vertical-gap="var(--half-padding)"
				style="height: {isHelpOpen
					? '88px'
					: '0'}; transition: height 0.3s ease-in; overflow: hidden;"
			>
				<div style="padding-top: var(--half-padding)"></div>
				<Typography variant="small"
					>An International Securities Identification Number (ISIN) is a unique twelve-digit code
					that is assigned to every security issuance in the world.</Typography
				>
				<Typography variant="small"
					>A ticker symbol, also known as a stock symbol, is a unique combination of letters
					assigned to publicly traded companies on stock exchanges.</Typography
				>
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
					}}><ArrowLeft size={24} /></Button
				>
				<Typography variant="h5">{$_('component.editInvestment.importData')}</Typography>
			</Horizontal>
			<Button variant="ghost" dimension="compact" onclick={() => (open = false)}
				><Close size={24} /></Button
			>
		</Horizontal>

		<Vertical --vertical-gap="var(--quarter-padding">
			<li class="header">
				<Typography variant="small" bold>{$_('Name')}</Typography>
				<Typography variant="small" bold>{$_('Type')}</Typography>
				<Typography variant="small" bold>{$_('Symbol')}</Typography>
				<Typography variant="small" bold>{$_('Exchange')}</Typography>
			</li>
			<ul>
				{#each figiValues as figiValue}
					<!-- svelte-ignore a11y_click_events_have_key_events -->
					<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
					<li class="value" onclick={() => selectFigi(figiValue)}>
						<div>{figiValue.name}</div>
						<div>{figiValue.securityType2}</div>
						<div>{figiValue.ticker}</div>
						<div>{exchangeOperatingMicOrCode(figiValue.exchCode)}</div>
						<Button variant="strong" dimension="compact" onclick={() => selectFigi(figiValue)}
							><ArrowRight size={24} /></Button
						>
					</li>
				{/each}
			</ul>
		</Vertical>
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
		max-width: 560px;
		width: 100%;
		max-height: calc(100vh - var(--quadruple-padding));
	}
	ul {
		margin: 0;
		padding: 0;
		overflow-y: auto;
		background: var(--colors-base);
	}
	li {
		display: grid;
		grid-template-columns: 180px 1fr 1fr 1fr 42px;
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
