import type { GoalData } from '$lib/types'

// Temporary state for goal calculator workflow
class GoalCalculatorStore {
	goalInput = $state<{
		goalData: GoalData
		currency: string
	}>()

	setGoalInput(goalData: GoalData, currency: string) {
		this.goalInput = { goalData, currency }
	}

	clearGoalInput() {
		this.goalInput = undefined
	}
}

export const goalCalculatorStore = new GoalCalculatorStore()
