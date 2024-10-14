<script lang="ts">
	import { CaretDown, CaretUp, ChevronLeft, ChevronRight, Calendar } from 'carbon-icons-svelte'
	import Button from '../button.svelte'
	import Divider from '../divider.svelte'
	import Input, { type Props } from './input.svelte'
	import type { HTMLInputAttributes } from 'svelte/elements'
	import Typography from '../typography.svelte'

	type Variant = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'large' | 'default' | 'small'

	let {
		dimension = 'default',
		disabled,
		value = $bindable(new Date()),
		class: className = '',
		...restProps
	}: Props & HTMLInputAttributes = $props()

	let stringValue = $state(formatDate(value))

	let currentDate = new Date()
	let selectedMonth = $state(currentDate.getMonth())
	let selectedYear = $state(currentDate.getFullYear())
	let selectedDate = $state(currentDate)
	let showYearPicker = $state(false)
	let showDatePicker = $state(false)
	let isMobile = $state(false)
	let size: 16 | 24 | 32 = $derived(dimension === 'large' ? 32 : dimension === 'small' ? 16 : 24)
	let variant: Variant = $derived(
		isMobile
			? 'small'
			: dimension === 'large'
				? 'large'
				: dimension === 'small'
					? 'small'
					: 'default',
	)
	let daysInMonth = $derived(new Date(selectedYear, selectedMonth + 1, 0).getDate())
	let firstDayOfMonth = $derived((new Date(selectedYear, selectedMonth, 1).getDay() + 6) % 7)
	let prevMonthDays = $derived(new Date(selectedYear, selectedMonth, 0).getDate())
	let totalCells = 42
	let calendarDays = $derived(
		Array.from({ length: totalCells }, (_, i) => {
			const dayNumber = i - firstDayOfMonth + 1
			if (dayNumber <= 0) {
				return {
					date: prevMonthDays + dayNumber,
					type: 'prev',
				}
			} else if (dayNumber > daysInMonth) {
				return {
					date: dayNumber - daysInMonth,
					type: 'next',
				}
			} else {
				return {
					date: dayNumber,
					type: 'current',
				}
			}
		}),
	)

	let datePicker: HTMLDivElement
	let selectedYearElement: HTMLSpanElement | undefined = $state(undefined)

	const months = getLocalMonthNames()
	const days = getLocalDayNames()

	function getLocalMonthNames() {
		const formatter = new Intl.DateTimeFormat(undefined, { month: 'long' })
		const monthNames = []
		for (let month = 0; month < 12; month++) {
			const date = new Date(2020, month, 1)
			monthNames.push(formatter.format(date))
		}
		return monthNames
	}
	function getLocalDayNames() {
		const formatter = new Intl.DateTimeFormat(undefined, { weekday: 'short' })
		const dayNames = []
		for (let day = 0; day < 7; day++) {
			const date = new Date(2020, 0, day - 1)
			dayNames.push(formatter.format(date))
		}
		return dayNames
	}

	function changeMonth(direction: number) {
		selectedMonth += direction
		if (selectedMonth < 0) {
			selectedMonth = 11
			selectedYear--
		} else if (selectedMonth > 11) {
			selectedMonth = 0
			selectedYear++
		}
	}

	function changeYear(year: number) {
		selectedYear = year
		selectDate(currentDate.getDate())
		setTimeout(() => (showDatePicker = true))
	}

	function selectDate(date: number) {
		selectedDate = new Date(selectedYear, selectedMonth, date)
		value = selectedDate
		stringValue = formatDate(selectedDate)
	}

	function isSelected(date: number) {
		return (
			selectedDate.getDate() === date &&
			selectedDate.getMonth() === selectedMonth &&
			selectedDate.getFullYear() === selectedYear
		)
	}

	function isCurrentDay(date: number) {
		return (
			date === currentDate.getDate() &&
			selectedMonth === currentDate.getMonth() &&
			selectedYear === currentDate.getFullYear()
		)
	}

	function parseDate(dateString: string) {
		const [year, month, day] = dateString.split('-').map(Number)
		return new Date(year, month - 1, day)
	}

	function formatDate(date: Date) {
		if (!(date instanceof Date) || isNaN(date.getTime())) {
			return ''
		}
		const year = date.getFullYear()
		const month = String(date.getMonth() + 1).padStart(2, '0')
		const day = String(date.getDate()).padStart(2, '0')
		return `${year}-${month}-${day}`
	}

	function inputChange(event: Event) {
		const input = event.target as HTMLInputElement
		const newDate = parseDate(input.value)
		selectedDate = newDate
		selectedMonth = newDate.getMonth()
		selectedYear = newDate.getFullYear()
		value = newDate
		showYearPicker = false
	}

	function close(e: MouseEvent) {
		const target = e.target as unknown as Node
		if (datePicker.contains(target)) {
			// Clicked on the date picker
		} else {
			showDatePicker = false
			showYearPicker = false
		}
	}

	$effect(() => {
		window.addEventListener('click', close)
		return () => {
			window.removeEventListener('click', close)
		}
	})

	$effect(() => {
		selectedYear = selectedDate.getFullYear()
		selectedMonth = selectedDate.getMonth()
	})

	$effect(() => {
		if (showYearPicker) {
			selectedYearElement?.scrollIntoView({ block: 'center', behavior: 'auto' })
		}
	})
	$effect(() => {
		const resize = () => {
			isMobile = window.innerWidth < 768
		}
		resize()
		window.addEventListener('resize', resize)
		return () => {
			window.removeEventListener('resize', resize)
		}
	})
	$effect(() => {
		const menuButton = document.querySelector('.menu-button-container') as HTMLElement
		const modeButton = document.querySelector('.dark-mode-button-container') as HTMLElement
		if (isMobile && showDatePicker) {
			menuButton.style.zIndex = '1'
			modeButton.style.zIndex = '1'
			document.body.style.overflow = 'hidden'
		} else {
			menuButton.style.zIndex = '100'
			modeButton.style.zIndex = '100'
			document.body.style.overflow = 'auto'
		}
	})
</script>

{#snippet buttons(input: HTMLInputElement)}
	<Button
		{dimension}
		{disabled}
		variant="secondary"
		onclick={(e: MouseEvent) => {
			e.stopPropagation()
			showDatePicker = !showDatePicker
			showYearPicker = false
			input.focus()
		}}
	>
		<Calendar {size} />
	</Button>
{/snippet}

<div class="calendar-root {dimension} {className}">
	<Input
		{dimension}
		{disabled}
		{...restProps}
		value={stringValue}
		oninput={inputChange}
		{buttons}
		type="date"
	/>
	<div class:modal={isMobile}>
		<div class="date-picker" class:showDatePicker bind:this={datePicker}>
			<div class="header">
				<div class="month">
					<Button
						dimension={isMobile ? 'small' : dimension}
						variant="ghost"
						onclick={() => changeMonth(-1)}><ChevronLeft size={isMobile ? 16 : size} /></Button
					>
					<div class="current-month">
						<Typography {variant} bold>{months[selectedMonth]} {selectedYear}</Typography>
						<Button
							dimension={isMobile ? 'small' : dimension}
							variant="ghost"
							onclick={(e: MouseEvent) => {
								e.stopPropagation()
								showYearPicker = !showYearPicker
							}}
						>
							{#if showYearPicker}
								<CaretUp size={isMobile ? 16 : size} />
							{:else}
								<CaretDown size={isMobile ? 16 : size} />
							{/if}
						</Button>
					</div>
					<Button
						dimension={isMobile ? 'small' : dimension}
						variant="ghost"
						onclick={() => changeMonth(1)}><ChevronRight size={isMobile ? 16 : size} /></Button
					>
				</div>
				{#if !showYearPicker}
					<div class="days">
						{#each days as day}
							<Typography {variant}>{day}</Typography>
						{/each}
					</div>
				{/if}
			</div>
			<Divider class="no-margin" />
			{#if showYearPicker}
				<div class="year-picker">
					<!-- eslint-disable-next-line @typescript-eslint/no-unused-vars -->
					{#each Array(200) as _, i}
						{#if selectedYear === 1900 + i}
							<span bind:this={selectedYearElement}>
								<Button
									dimension={isMobile ? 'small' : dimension}
									variant="ghost"
									active={selectedYear === 1900 + i}
									onclick={() => {
										changeYear(1900 + i)
									}}>{1900 + i}</Button
								>
							</span>
						{:else}
							<Button
								dimension={isMobile ? 'small' : dimension}
								variant="ghost"
								active={selectedYear === 1900 + i}
								onclick={() => {
									changeYear(1900 + i)
								}}>{1900 + i}</Button
							>
						{/if}
					{/each}
				</div>
			{:else}
				<div class="calendar">
					{#each calendarDays as { date, type }}
						<Button
							dimension={isMobile ? 'small' : dimension}
							class={type === 'current' && isCurrentDay(date) && !isSelected(date)
								? 'current-day'
								: ''}
							active={type === 'current' && isSelected(date)}
							disabled={type === 'prev' || type === 'next'}
							style="justify-content:center;"
							variant="ghost"
							onclick={() => {
								type === 'current' && selectDate(date)
								showDatePicker = false
							}}
						>
							{date}
						</Button>
					{/each}
				</div>
			{/if}
		</div>
	</div>
</div>

<style lang="postcss">
	:global(input[type='date']::-webkit-calendar-picker-indicator) {
		display: none;
	}
	.calendar-root {
		position: relative;
	}
	.date-picker {
		display: none;
		position: absolute;
		bottom: -0.25rem;
		left: 0;
		flex-direction: column;
		gap: 1rem;
		transform: translateY(100%);
		z-index: 1;
		border: 1px solid var(--colors-low);
		border-radius: var(--border-radius);
		background: var(--colors-base);
		padding: 1rem;
		&.showDatePicker {
			display: flex;
		}
	}
	.modal {
		display: none;
		position: fixed;
		top: 0;
		left: 0;
		z-index: 1;
		background-color: rgba(0, 0, 0, 0.6);
		width: 100%;
		height: 100%;
		overflow: hidden;
		&:has(.showDatePicker) {
			display: flex;
			justify-content: center;
			align-items: center;
		}
		.date-picker {
			bottom: unset;
			left: unset;
			transform: unset;
			width: fit-content;
			height: fit-content;
		}
	}
	.month {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
	.current-month {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}
	.days {
		display: flex;
		justify-content: space-between;
		align-self: stretch;
		padding: 0.75rem;
	}
	:global(.no-margin) {
		margin: 0 !important;
	}
	.calendar {
		display: grid;
		grid-template-columns: repeat(7, 1fr);
		flex-shrink: 1;
		gap: 0.5rem;
	}
	:global(.current-day) {
		text-decoration: underline !important;
		text-underline-offset: 0.25rem !important;
	}
	.year-picker {
		display: grid;
		grid-template-columns: repeat(5, 1fr);
		justify-content: center;
		gap: 0.5rem;
		overflow-y: scroll;
	}
	.default {
		.year-picker {
			max-height: 388px;
		}
	}
	.large {
		.year-picker {
			max-height: 444px;
		}
	}
	.compact {
		.year-picker {
			max-height: 340px;
		}
	}
	.small {
		.year-picker {
			max-height: 284px;
		}
	}
</style>
