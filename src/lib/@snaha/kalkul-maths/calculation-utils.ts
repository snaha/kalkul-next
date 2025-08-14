import { type TransactionMap } from './types'

export function calculateTotalDepositAmount(deposits: TransactionMap): number {
	let total = 0
	for (const [, amount] of deposits) {
		total += amount
	}
	return total
}
