import { describe, it, expect } from 'vitest'
import { getCumulativeValues, getGraphData } from './graph-data'
import { getBaseData } from './investment-calculations'
import type { Investment, Portfolio } from '$lib/types'
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
		missingAmount: 0,
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
				missingAmount: 0,
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
				missingAmount: 0,
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
				missingAmount: 0,
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
				missingAmount: 0,
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
				missingAmount: 0,
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

describe('inflation-adjusted transactions on graph', () => {
	const DEFAULT_INVESTMENT: Investment = {
		apy: 0,
		entry_fee: 0,
		entry_fee_type: 'upfront',
		exit_fee: 0,
		exit_fee_type: 'upfront',
		id: 1,
		advanced_fees: false,
		created_at: '2024-01-01',
		last_edited_at: '2024-01-01',
		management_fee: 0,
		management_fee_type: 'upfront',
		name: 'Test',
		portfolio_id: 1,
		success_fee: 0,
		ter: null,
		type: '',
	}

	const portfolio: Portfolio = {
		client: 1,
		created_at: '2024-01-01',
		currency: 'USD',
		end_date: '2030-12-31',
		id: 1,
		inflation_rate: 0.03,
		last_edited_at: '2024-01-01',
		link: null,
		name: 'P',
		start_date: '2024-01-01',
	}

	it('shows ~$24,000 real sum per year for $2k/mo withdrawals when showInflation=true', () => {
		const transactions = [
			// Seed portfolio with enough funds to realize withdrawals
			{
				amount: 100000,
				date: '2024-01-01',
				end_date: null,
				repeat: null,
				repeat_unit: null,
				inflation_adjusted: false,
				investment_id: 1,
				created_at: '2024-01-01',
				id: 0,
				label: null,
				last_edited_at: '2024-01-01',
				type: 'deposit' as const,
			},
			{
				amount: 2000,
				date: '2024-01-01',
				end_date: '2024-12-01',
				repeat: 1,
				repeat_unit: 'month' as const,
				inflation_adjusted: true,
				investment_id: 1,
				created_at: '2024-01-01',
				id: 1,
				label: null,
				last_edited_at: '2024-01-01',
				type: 'withdrawal' as const,
			},
		]

		const base = getBaseData(transactions, portfolio.inflation_rate, portfolio.start_date)
		const graph = getGraphData(
			{ ...base, startDate: new Date(portfolio.start_date), endDate: new Date(portfolio.end_date) },
			DEFAULT_INVESTMENT,
			portfolio,
		)

		// Yearly periods: first year's withdrawal sum should be ~ -24000, others ~0
		const idx2024 = graph.graphLabels.findIndex((l) => l === '2024')
		expect(idx2024).toBeGreaterThanOrEqual(0)
		expect(graph.graphInflationWithdrawals[idx2024]).toBeCloseTo(-24000, 1)
		const later = graph.graphInflationWithdrawals.slice(idx2024 + 1)
		for (const v of later) expect(Math.abs(v)).toBeLessThan(1e-6)
	})

	it('should handle simple inflation-adjusted transactions with 10% inflation', () => {
		const transactions = [
			// Regular deposit (no inflation adjustment)
			{
				amount: 5000,
				date: '2024-01-01',
				end_date: null,
				repeat: null,
				repeat_unit: null,
				inflation_adjusted: false,
				investment_id: 1,
				created_at: '2024-01-01',
				id: 0,
				label: null,
				last_edited_at: '2024-01-01',
				type: 'deposit' as const,
			},
			// Inflation-adjusted deposit 1 year later
			{
				amount: 1000,
				date: '2025-01-01',
				end_date: null,
				repeat: null,
				repeat_unit: null,
				inflation_adjusted: true,
				investment_id: 1,
				created_at: '2024-01-01',
				id: 1,
				label: null,
				last_edited_at: '2024-01-01',
				type: 'deposit' as const,
			},
		]

		const base = getBaseData(transactions, 0.1, '2024-01-01') // 10% inflation

		// Verify the base data calculations
		expect(base.deposits.get('2024-01-01')).toBe(5000.0) // No adjustment
		expect(base.deposits.get('2025-01-01')).toBeCloseTo(1100.22, 2) // compound calculation

		const graph = getGraphData(
			{ ...base, startDate: new Date('2024-01-01'), endDate: new Date('2026-12-31') },
			DEFAULT_INVESTMENT,
			portfolio,
		)

		// Verify graph has inflation data structures
		expect(graph.graphInflationDeposits).toBeDefined()
		expect(graph.graphInflationWithdrawals).toBeDefined()
		expect(graph.graphInflationInvestmentValues).toBeDefined()
		expect(graph.graphInflationFeeValues).toBeDefined()
	})

	it('should demonstrate inflation-adjusted vs nominal values in graph data', () => {
		const transactions = [
			{
				amount: 5000,
				date: '2024-01-01',
				end_date: '2027-01-01',
				repeat: 1,
				repeat_unit: 'year' as const,
				inflation_adjusted: true,
				investment_id: 1,
				created_at: '2024-01-01',
				id: 0,
				label: null,
				last_edited_at: '2024-01-01',
				type: 'deposit' as const,
			},
		]

		const base = getBaseData(transactions, 0.04, '2024-01-01')
		const graph = getGraphData(
			{ ...base, startDate: new Date('2024-01-01'), endDate: new Date('2028-12-31') },
			DEFAULT_INVESTMENT,
			portfolio,
		)

		// Find first year index
		const idx2024 = graph.graphLabels.findIndex((l) => l.includes('2024'))
		expect(idx2024).toBeGreaterThanOrEqual(0)

		// Should have both nominal and inflation-adjusted values
		expect(graph.graphDeposits[idx2024]).toBeGreaterThan(0)
		expect(graph.graphInflationDeposits[idx2024]).toBeGreaterThan(0)

		// Graph should contain inflation-adjusted data structures
		expect(graph.graphInflationDeposits).toBeDefined()
		expect(graph.graphInflationWithdrawals).toBeDefined()
		expect(graph.graphInflationInvestmentValues).toBeDefined()
		expect(graph.graphInflationFeeValues).toBeDefined()
	})

	it('should handle yearly deposits with 20% inflation', () => {
		const transactions = [
			{
				amount: 1000,
				date: '2024-01-01',
				end_date: '2026-01-01', // 3 yearly deposits
				repeat: 1,
				repeat_unit: 'year' as const,
				inflation_adjusted: true,
				investment_id: 1,
				created_at: '2024-01-01',
				id: 0,
				label: null,
				last_edited_at: '2024-01-01',
				type: 'deposit' as const,
			},
		]

		const base = getBaseData(transactions, 0.2, '2024-01-01') // 20% inflation

		// Verify the base data calculations
		expect(base.deposits.get('2024-01-01')).toBe(1000.0) // Year 1: 1000
		expect(base.deposits.get('2025-01-01')).toBeCloseTo(1200.45, 2) // Year 2: compound calculation
		expect(base.deposits.get('2026-01-01')).toBeCloseTo(1440.36, 2) // Year 3: compound calculation

		const graph = getGraphData(
			{ ...base, startDate: new Date('2024-01-01'), endDate: new Date('2027-12-31') },
			DEFAULT_INVESTMENT,
			{ ...portfolio, inflation_rate: 0.2 },
		)

		// Verify graph structures exist and have data
		expect(graph.graphInflationDeposits).toBeDefined()
		expect(graph.graphDeposits).toBeDefined()
		expect(graph.graphInflationDeposits.length).toBeGreaterThan(0)
		expect(graph.graphDeposits.length).toBeGreaterThan(0)
	})

	it('should use earliest transaction date as inflation baseline', () => {
		// Portfolio runs from 2025-2055 but first transaction is from 1997
		const portfolio: Portfolio = {
			client: 1,
			created_at: '2025-01-13',
			currency: 'EUR',
			end_date: '2055-01-13',
			id: 1,
			inflation_rate: 0.0225,
			last_edited_at: '2025-01-13',
			link: null,
			name: 'Test Portfolio',
			start_date: '2025-01-13',
		}

		const transactions = [
			// Transaction from 1997 (28 years before portfolio start)
			{
				amount: 1000,
				date: '1997-11-09',
				end_date: null,
				repeat: null,
				repeat_unit: null,
				inflation_adjusted: false,
				investment_id: 1,
				created_at: '1997-11-09',
				id: 1,
				label: null,
				last_edited_at: '1997-11-09',
				type: 'deposit' as const,
			},
			// Transaction from 2025 (portfolio start date)
			{
				amount: 2000,
				date: '2025-01-13',
				end_date: null,
				repeat: null,
				repeat_unit: null,
				inflation_adjusted: false,
				investment_id: 1,
				created_at: '2025-01-13',
				id: 2,
				label: null,
				last_edited_at: '2025-01-13',
				type: 'deposit' as const,
			},
		]

		const base = getBaseData(transactions, portfolio.inflation_rate, portfolio.start_date)
		const graph = getGraphData(
			{ ...base, startDate: new Date('1997-11-09'), endDate: new Date('2055-01-13') },
			DEFAULT_INVESTMENT,
			portfolio,
		)

		// Find the year containing the early transaction (1997)
		const idx1997 = graph.graphLabels.findIndex((l) => l === '1997')
		// Find the year containing the later transaction (2025)
		const idx2025 = graph.graphLabels.findIndex((l) => l === '2025')

		if (idx1997 >= 0 && idx2025 >= 0) {
			// 1997 transaction has no inflation adjustment (baseline year)
			expect(graph.graphInflationDeposits[idx1997]).toBeCloseTo(1000, 0)

			// 2025 transaction is deflated by 28 years of 2.25% inflation
			expect(graph.graphInflationDeposits[idx2025]).toBeLessThan(1500)
			expect(graph.graphInflationDeposits[idx2025]).toBeGreaterThan(800)
		}
	})

	it('should use portfolio start date when it is earlier than first transaction', () => {
		// Portfolio starts in 1990, first transaction is in 2000
		const portfolio: Portfolio = {
			client: 1,
			created_at: '1990-01-01',
			currency: 'USD',
			end_date: '2030-01-01',
			id: 1,
			inflation_rate: 0.05,
			last_edited_at: '1990-01-01',
			link: null,
			name: 'Early Portfolio',
			start_date: '1990-01-01',
		}

		const transactions = [
			// First transaction is 10 years after portfolio start
			{
				amount: 1000,
				date: '2000-01-01',
				end_date: null,
				repeat: null,
				repeat_unit: null,
				inflation_adjusted: false,
				investment_id: 1,
				created_at: '2000-01-01',
				id: 1,
				label: null,
				last_edited_at: '2000-01-01',
				type: 'deposit' as const,
			},
			// Second transaction is 5 years later with same amount
			{
				amount: 1000,
				date: '2005-01-01',
				end_date: null,
				repeat: null,
				repeat_unit: null,
				inflation_adjusted: false,
				investment_id: 1,
				created_at: '2005-01-01',
				id: 2,
				label: null,
				last_edited_at: '2005-01-01',
				type: 'deposit' as const,
			},
		]

		const base = getBaseData(transactions, portfolio.inflation_rate, portfolio.start_date)
		const graph = getGraphData(
			{ ...base, startDate: new Date('1990-01-01'), endDate: new Date('2030-01-01') },
			DEFAULT_INVESTMENT,
			portfolio,
		)

		// Find years containing transactions
		const idx2000 = graph.graphLabels.findIndex((l) => l === '2000')
		const idx2005 = graph.graphLabels.findIndex((l) => l === '2005')

		if (idx2000 >= 0 && idx2005 >= 0) {
			// 2000 transaction is deflated by 10 years of 5% inflation from 1990 baseline
			expect(graph.graphInflationDeposits[idx2000]).toBeLessThan(1000)
			expect(graph.graphInflationDeposits[idx2000]).toBeGreaterThan(500)

			// 2005 transaction (same nominal amount) is deflated by 15 years of 5% inflation from 1990 baseline
			// Should be more deflated (smaller real value) than 2000 transaction
			expect(graph.graphInflationDeposits[idx2005]).toBeLessThan(
				graph.graphInflationDeposits[idx2000],
			)
			expect(graph.graphInflationDeposits[idx2005]).toBeLessThan(500)
		}
	})
})
