import type { InvestmentWithColorIndex } from '$lib/types'
import { SvelteMap } from 'svelte/reactivity'

export interface InvestmentsViewStore {
	allInvestments: InvestmentWithColorIndex[]
	toggleHide: (id: number) => void
	toggleFocus: (id: number) => void
	isHidden: (id: number) => boolean
	isFocused: (id: number) => boolean
}

export function withInvestmentsViewStore(
	investments: InvestmentWithColorIndex[],
): InvestmentsViewStore {
	let allInvestments = $state<InvestmentWithColorIndex[]>(investments)
	const hiddenInvestments = $state<SvelteMap<number, boolean>>(new SvelteMap())
	const visibleInvestments = $derived(
		allInvestments.filter((inv) => !hiddenInvestments.has(inv.id)),
	)
	const focusedInvestment = $derived(
		visibleInvestments.length === 1 ? visibleInvestments[0] : undefined,
	)

	function toggleHide(id: number) {
		if (hiddenInvestments.has(id)) {
			hiddenInvestments.delete(id)
		} else {
			hiddenInvestments.set(id, true)
		}
	}

	function toggleFocus(id: number) {
		if (hiddenInvestments.size === allInvestments.length - 1 && !hiddenInvestments.has(id)) {
			hiddenInvestments.clear()
		} else {
			allInvestments.forEach((inv) => {
				if (inv.id !== id) {
					hiddenInvestments.set(inv.id, true)
				} else {
					hiddenInvestments.delete(inv.id)
				}
			})
		}
	}

	function isHidden(id: number) {
		return hiddenInvestments.has(id)
	}

	function isFocused(id: number) {
		return focusedInvestment ? focusedInvestment.id === id : false
	}

	return {
		set allInvestments(newValue: InvestmentWithColorIndex[]) {
			allInvestments = newValue
		},
		toggleHide,
		toggleFocus,
		isHidden,
		isFocused,
	}
}
