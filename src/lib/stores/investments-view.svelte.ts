import type { InvestmentWithColorIndex } from '$lib/types'
import { SvelteMap } from 'svelte/reactivity'

export interface InvestmentsViewStore {
	allInvestments: InvestmentWithColorIndex[]
	toggleHide: (id: string) => void
	toggleFocus: (id: string) => void
	isHidden: (id: string) => boolean
	isFocused: (id: string) => boolean
}

export function withInvestmentsViewStore(
	investments: InvestmentWithColorIndex[],
): InvestmentsViewStore {
	let allInvestments = $state<InvestmentWithColorIndex[]>(investments)
	const hiddenInvestments = $state<SvelteMap<string, boolean>>(new SvelteMap())
	const visibleInvestments = $derived(
		allInvestments.filter((inv) => !hiddenInvestments.has(inv.id)),
	)
	const focusedInvestment = $derived(
		visibleInvestments.length === 1 ? visibleInvestments[0] : undefined,
	)

	function toggleHide(id: string) {
		if (hiddenInvestments.has(id)) {
			hiddenInvestments.delete(id)
		} else {
			hiddenInvestments.set(id, true)
		}
	}

	function toggleFocus(id: string) {
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

	function isHidden(id: string) {
		return hiddenInvestments.has(id)
	}

	function isFocused(id: string) {
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
