import type { Snippet } from 'svelte'

export type TabStore = {
	selected: number
	readonly items: (string | Snippet)[]
	readonly ids: (string | undefined)[]

	addItem: (item: string | Snippet, id: string | undefined) => void
}

export function withTabStore(): TabStore {
	let selected = $state(0)
	const items: (string | Snippet)[] = $state([])
	const ids: (string | undefined)[] = $state([])

	return {
		get selected() {
			return selected
		},
		set selected(newValue) {
			selected = newValue
		},
		items,
		ids,
		addItem(item, id) {
			if (items.includes(item)) {
				console.warn(`Duplicate tab item, ignored: ${item}`)
				return
			}
			items.push(item)
			ids.push(id)
		},
	}
}
