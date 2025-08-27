import { describe, it, expect } from 'vitest'
import { getCumulativeValues } from './graph-data'
import type { GraphData } from './types'

describe('getCumulativeValues', () => {
	const mockGraphData: GraphData = {
		label: 'Test Investment',
		graphLabels: ['2024-1', '2024-2', '2024-3', '2024-4'],
		graphDeposits: [1000, 500, 200, 0],
		graphWithdrawals: [0, 100, 0, 300],
		graphInvestmentValues: [1000, 1450, 1680, 1420],
		graphFeeValues: [-10, -15, -12, -8],
		graphInflationDeposits: [950, 475, 190, 0],
		graphInflationWithdrawals: [0, 95, 0, 285],
		graphInflationInvestmentValues: [950, 1378, 1596, 1349],
		graphInflationFeeValues: [-9.5, -14.25, -11.4, -7.6],
	}

	describe('without inflation adjustment', () => {
		it('should calculate cumulative values correctly for index 0', () => {
			const result = getCumulativeValues(mockGraphData, 0, false)

			expect(result).toEqual({
				cumulativeDeposits: 1000,
				cumulativeWithdrawals: 0,
				cumulativeFees: -10,
				currentValue: 1000,
				cumulativeInterest: 10, // 1000 - 1000 - 0 - (-10) = 10
			})
		})

		it('should calculate cumulative values correctly for index 1', () => {
			const result = getCumulativeValues(mockGraphData, 1, false)

			expect(result).toEqual({
				cumulativeDeposits: 1500, // 1000 + 500
				cumulativeWithdrawals: 100,
				cumulativeFees: -25, // -10 + (-15)
				currentValue: 1450,
				cumulativeInterest: -125, // Period 0: (1000 - 1000 - 0 - (-10)) = 10, Period 1: (450 - 500 - 100 - (-15)) = -135, Total: 10 + (-135) = -125
			})
		})

		it('should calculate cumulative values correctly for index 2', () => {
			const result = getCumulativeValues(mockGraphData, 2, false)

			expect(result).toEqual({
				cumulativeDeposits: 1700, // 1000 + 500 + 200
				cumulativeWithdrawals: 100,
				cumulativeFees: -37, // -10 + (-15) + (-12)
				currentValue: 1680,
				cumulativeInterest: -83, // Period 0: 10, Period 1: -135, Period 2: (230 - 200 - 0 - (-12)) = 42, Total: 10 + (-135) + 42 = -83
			})
		})

		it('should calculate cumulative values correctly for final index', () => {
			const result = getCumulativeValues(mockGraphData, 3, false)

			expect(result).toEqual({
				cumulativeDeposits: 1700,
				cumulativeWithdrawals: 400, // 0 + 100 + 0 + 300
				cumulativeFees: -45, // -10 + (-15) + (-12) + (-8)
				currentValue: 1420,
				cumulativeInterest: -635, // Period 0: 10, Period 1: -135, Period 2: 42, Period 3: (-260 - 0 - 300 - (-8)) = -552, Total: 10 + (-135) + 42 + (-552) = -635
			})
		})
	})

	describe('with inflation adjustment', () => {
		it('should use inflation-adjusted values for index 0', () => {
			const result = getCumulativeValues(mockGraphData, 0, true)

			expect(result).toEqual({
				cumulativeDeposits: 950,
				cumulativeWithdrawals: 0,
				cumulativeFees: -9.5,
				currentValue: 950,
				cumulativeInterest: 9.5, // 950 - 950 - 0 - (-9.5) = 9.5
			})
		})

		it('should use inflation-adjusted values for index 1', () => {
			const result = getCumulativeValues(mockGraphData, 1, true)

			expect(result).toEqual({
				cumulativeDeposits: 1425, // 950 + 475
				cumulativeWithdrawals: 95,
				cumulativeFees: -23.75, // -9.5 + (-14.25)
				currentValue: 1378,
				cumulativeInterest: -118.25, // Period 0: (950 - 950 - 0 - (-9.5)) = 9.5, Period 1: (428 - 475 - 95 - (-14.25)) = -127.75, Total: 9.5 + (-127.75) = -118.25
			})
		})
	})

	describe('edge cases', () => {
		it('should handle empty arrays gracefully', () => {
			const emptyGraphData: GraphData = {
				label: 'Empty',
				graphLabels: ['2024-1'],
				graphDeposits: [0],
				graphWithdrawals: [0],
				graphInvestmentValues: [0],
				graphFeeValues: [0],
				graphInflationDeposits: [0],
				graphInflationWithdrawals: [0],
				graphInflationInvestmentValues: [0],
				graphInflationFeeValues: [0],
			}

			const result = getCumulativeValues(emptyGraphData, 0, false)

			expect(result).toEqual({
				cumulativeDeposits: 0,
				cumulativeWithdrawals: 0,
				cumulativeFees: 0,
				currentValue: 0,
				cumulativeInterest: 0,
			})
		})

		it('should handle negative investment values', () => {
			const negativeGraphData: GraphData = {
				label: 'Negative',
				graphLabels: ['2024-1', '2024-2'],
				graphDeposits: [1000, 0],
				graphWithdrawals: [0, 0],
				graphInvestmentValues: [800, -200], // Loss scenario
				graphFeeValues: [-50, -20],
				graphInflationDeposits: [1000, 0],
				graphInflationWithdrawals: [0, 0],
				graphInflationInvestmentValues: [800, -200],
				graphInflationFeeValues: [-50, -20],
			}

			const result = getCumulativeValues(negativeGraphData, 1, false)

			expect(result).toEqual({
				cumulativeDeposits: 1000,
				cumulativeWithdrawals: 0,
				cumulativeFees: -70,
				currentValue: -200,
				cumulativeInterest: -1130, // Period 0: (800 - 1000 - 0 - (-50)) = -150, Period 1: ((-200 - 800) - 0 - 0 - (-20)) = -980, Total: -150 + (-980) = -1130
			})
		})

		it('should handle undefined values by treating them as zero', () => {
			const sparseGraphData: GraphData = {
				label: 'Sparse',
				graphLabels: ['2024-1', '2024-2'],
				graphDeposits: [1000], // Missing second element
				graphWithdrawals: [0, 100],
				graphInvestmentValues: [1000, 900],
				graphFeeValues: [-10, -5],
				graphInflationDeposits: [1000],
				graphInflationWithdrawals: [0, 100],
				graphInflationInvestmentValues: [1000, 900],
				graphInflationFeeValues: [-10, -5],
			}

			const result = getCumulativeValues(sparseGraphData, 1, false)

			expect(result).toEqual({
				cumulativeDeposits: 1000, // 1000 + 0 (undefined treated as 0)
				cumulativeWithdrawals: 100,
				cumulativeFees: -15,
				currentValue: 900,
				cumulativeInterest: -185, // Period 0: (1000 - 1000 - 0 - (-10)) = 10, Period 1: ((900 - 1000) - 0 - 100 - (-5)) = -195, Total: 10 + (-195) = -185
			})
		})
	})

	describe('cumulative interest calculation', () => {
		it('should correctly calculate interest when there are only gains', () => {
			const gainsOnlyData: GraphData = {
				label: 'Gains Only',
				graphLabels: ['2024-1', '2024-2'],
				graphDeposits: [1000, 0],
				graphWithdrawals: [0, 0],
				graphInvestmentValues: [1100, 1200], // 10% gain each period
				graphFeeValues: [0, 0],
				graphInflationDeposits: [1000, 0],
				graphInflationWithdrawals: [0, 0],
				graphInflationInvestmentValues: [1100, 1200],
				graphInflationFeeValues: [0, 0],
			}

			const result = getCumulativeValues(gainsOnlyData, 1, false)

			expect(result.cumulativeInterest).toBe(200) // 100 + 100
		})

		it('should correctly calculate interest with mixed deposits, withdrawals, and fees', () => {
			const mixedData: GraphData = {
				label: 'Mixed',
				graphLabels: ['2024-1', '2024-2', '2024-3'],
				graphDeposits: [1000, 500, 0],
				graphWithdrawals: [0, 200, 300],
				graphInvestmentValues: [1050, 1400, 1150], // Including gains and losses
				graphFeeValues: [-25, -15, -10],
				graphInflationDeposits: [1000, 500, 0],
				graphInflationWithdrawals: [0, 200, 300],
				graphInflationInvestmentValues: [1050, 1400, 1150],
				graphInflationFeeValues: [-25, -15, -10],
			}

			const result = getCumulativeValues(mixedData, 2, false)

			// Period 0: 1050 - 1000 - 0 - (-25) = 75
			// Period 1: 350 - 500 - 200 - (-15) = -335
			// Period 2: -250 - 0 - 300 - (-10) = -540
			// Total: 75 + (-335) + (-540) = -800
			expect(result.cumulativeInterest).toBe(-800)
		})
	})
})
