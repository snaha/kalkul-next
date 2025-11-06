import type { RetirementCalculationInput } from '$lib/@snaha/kalkul-calculators/retirement/retirement'

// Temporary state for goal calculator workflow
class GoalCalculatorStore {
	retirementInput = $state<{
		calculationInput: RetirementCalculationInput
		currency: string
	}>()

	setRetirementInput(input: RetirementCalculationInput, currency: string) {
		this.retirementInput = { calculationInput: input, currency }
	}

	clearRetirementInput() {
		this.retirementInput = undefined
	}
}

export const goalCalculatorStore = new GoalCalculatorStore()
