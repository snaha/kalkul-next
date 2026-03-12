import type { GraphData } from '$lib/@snaha/kalkul-maths'
import type { InvestmentWithColorIndex, Portfolio, ChartDatasetWithColor } from '$lib/types'
import type { InvestmentsViewStore } from './stores/investments-view.svelte'

interface GraphPortfolioValueParams {
  investmentsViewStore: InvestmentsViewStore
  investments: InvestmentWithColorIndex[]
  portfolio: Portfolio
  data: GraphData[]
  total: GraphData
  lowColor: string
  baseColor: string
}

export interface GraphPortfolioValue {
  investmentGraphData: ChartDatasetWithColor[]
  investmentGraphDataWithInflation: ChartDatasetWithColor[]
  totalValue: number[]
  totalWithInflation: number[]
  data: GraphData[]
  total: GraphData
  portfolio: Portfolio
  investmentsViewStore: InvestmentsViewStore
  investments: InvestmentWithColorIndex[]
}

export function deriveGraphValueData(params: GraphPortfolioValueParams): GraphPortfolioValue {
  const { investmentsViewStore, investments, portfolio, data, total, lowColor, baseColor } = params

  // Filter out orphaned graph data where the corresponding investment no longer exists
  const validData = data.filter((_, i) => investments[i] !== undefined)

  const investmentGraphData = validData.map((r, i) => ({
    data: r.graphInvestmentValues,
    label: r.label,
    fill: 'origin',
    stack: 'g1',
    colorIndex: investments[i].colorIndex,
    hidden: investmentsViewStore.isHidden(investments[i].id),
  }))

  const investmentGraphDataWithInflation = [
    ...validData.map((r, i) => ({
      data: r.graphInflationInvestmentValues,
      label: r.label,
      fill: 'origin',
      colorIndex: investments[i].colorIndex,
      stack: 'g1',
      hidden: investmentsViewStore.isHidden(investments[i].id),
    })),
    {
      data: total.graphInvestmentValues,
      label: '_hidden',
      fill: 'origin',
      stack: 'g2',
      borderColor: lowColor,
      backgroundColor: baseColor,
      borderWidth: 1,
    },
  ]

  const filtered = validData.filter((_, i) => !investmentsViewStore.isHidden(investments[i].id))
  const totalValue = total.graphLabels.map((_, i) =>
    filtered.reduce((sum, f) => sum + f.graphInvestmentValues[i], 0),
  )
  const totalWithInflation = total.graphLabels.map((_, i) =>
    filtered.reduce((sum, f) => sum + f.graphInflationInvestmentValues[i], 0),
  )

  return {
    investmentGraphData,
    investmentGraphDataWithInflation,
    totalValue,
    totalWithInflation,
    data: validData,
    total,
    portfolio,
    investmentsViewStore,
    investments,
  }
}

export interface GraphPortfolioTransactions {
  deposits: ChartDatasetWithColor[]
  depositsWithInflation: ChartDatasetWithColor[]
  withdrawals: ChartDatasetWithColor[]
  withdrawalsWithInflation: ChartDatasetWithColor[]
  fees: ChartDatasetWithColor[]
  feesWithInflation: ChartDatasetWithColor[]
  totalDeposits: number[]
  totalDepositsWithInflation: number[]
  totalWithdrawals: number[]
  totalWithdrawalsWithInflation: number[]
  totalFees: number[]
  totalFeesWithInflation: number[]
  data: GraphData[]
  total: GraphData
}

interface GraphPortfolioTransactionsParams {
  data: GraphData[]
  total: GraphData
  investments: InvestmentWithColorIndex[]
  investmentsViewStore: InvestmentsViewStore
  lowColor: string
  baseColor: string
}

export function deriveGraphPortfolioTransactions({
  data,
  total,
  investments,
  investmentsViewStore,
  lowColor,
  baseColor,
}: GraphPortfolioTransactionsParams): GraphPortfolioTransactions {
  // Filter out orphaned graph data where the corresponding investment no longer exists
  const validData = data.filter((_, i) => investments[i] !== undefined)

  const deposits = validData.map((r, i) => ({
    data: r.graphDeposits,
    label: r.label,
    fill: 'origin',
    colorIndex: investments[i].colorIndex ?? i,
    hidden: investmentsViewStore.isHidden(investments[i].id),
  }))
  const depositsWithInflation = [
    ...validData.map((r, i) => ({
      data: r.graphInflationDeposits,
      label: r.label,
      fill: 'origin',
      colorIndex: investments[i].colorIndex ?? i,
      hidden: investmentsViewStore.isHidden(investments[i].id),
    })),
    {
      data: total.graphDeposits.map((w, i) => w - total.graphInflationDeposits[i]),
      label: '_hidden',
      borderColor: lowColor,
      borderWidth: 1,
      backgroundColor: baseColor,
    },
  ]

  const withdrawals = validData.map((r, i) => ({
    data: r.graphWithdrawals,
    label: r.label,
    fill: 'origin',
    colorIndex: investments[i].colorIndex ?? i,
    hidden: investmentsViewStore.isHidden(investments[i].id),
  }))

  const withdrawalsWithInflation = [
    ...validData.map((r, i) => ({
      data: r.graphInflationWithdrawals,
      label: r.label,
      fill: 'origin',
      colorIndex: investments[i].colorIndex ?? i,
      hidden: investmentsViewStore.isHidden(investments[i].id),
    })),
    {
      data: total.graphWithdrawals.map((w, i) => w - total.graphInflationWithdrawals[i]),
      label: '_hidden',
      borderColor: lowColor,
      borderWidth: 1,
      backgroundColor: baseColor,
    },
  ]

  const fees = validData.map((r, i) => ({
    data: r.graphFeeValues,
    label: r.label,
    fill: 'origin',
    backgroundColor: lowColor,
    hidden: investmentsViewStore.isHidden(investments[i].id),
  }))
  const feesWithInflation = [
    ...validData.map((r, i) => ({
      data: r.graphInflationFeeValues,
      label: r.label,
      fill: 'origin',
      backgroundColor: lowColor,
      hidden: investmentsViewStore.isHidden(investments[i].id),
    })),
    {
      data: total.graphFeeValues.map((w, i) => w - total.graphInflationFeeValues[i]),
      label: '_hidden',
      borderColor: lowColor,
      borderWidth: 1,
      backgroundColor: baseColor,
    },
  ]

  function sumSeries(getter: (r: GraphData, i: number) => number[]): number[] {
    const filtered = validData.filter((_, i) => !investmentsViewStore.isHidden(investments[i].id))
    const length = total.graphLabels.length
    const result = new Array(length).fill(0)
    for (let i = 0; i < length; i++) {
      for (const r of filtered) {
        result[i] += getter(r, i)[i]
      }
    }
    return result
  }

  const totalDeposits = sumSeries((r) => r.graphDeposits)
  const totalDepositsWithInflation = sumSeries((r) => r.graphInflationDeposits)
  const totalWithdrawals = sumSeries((r) => r.graphWithdrawals)
  const totalWithdrawalsWithInflation = sumSeries((r) => r.graphInflationWithdrawals)
  const totalFees = sumSeries((r) => r.graphFeeValues)
  const totalFeesWithInflation = sumSeries((r) => r.graphInflationFeeValues)

  return {
    deposits,
    depositsWithInflation,
    withdrawals,
    withdrawalsWithInflation,
    fees,
    feesWithInflation,
    totalDeposits,
    totalDepositsWithInflation,
    totalWithdrawals,
    totalWithdrawalsWithInflation,
    totalFees,
    totalFeesWithInflation,
    data,
    total,
  }
}
