import type { ChartDataset, ChartTypeRegistry } from 'chart.js'

// Re-export schema-derived types
export type {
  Json,
  Client,
  Portfolio,
  Investment,
  Transaction,
  InvestmentNested,
  PortfolioNested,
  ClientNested,
  PeriodicWithdrawalGoalData,
  RetirementGoalData,
  EducationGoalData,
  GoalData,
} from './schemas'

import type { Client, Investment } from './schemas'
export type { TransactionStore } from './stores/transaction.svelte'
export type { InvestmentStore } from './stores/investment.svelte'
export type { PortfolioStore } from './stores/portfolio.svelte'
export type { ClientStore } from './stores/client.svelte'

export type ClientNoId = Omit<Client, 'id'>

export type InvestmentWithColorIndex = Investment & {
  colorIndex?: number
  hidden?: boolean
  toggleHide?: () => void
}

export type TooltipData = {
  dataIndex: number
  value: number
  colorIndex: number
  name: string
  type?: string
}

export type CustomDataset<T extends keyof ChartTypeRegistry> = ChartDataset<T> & {
  colorIndex: number
  label: string
}

export type ChartDatasetWithColor = ChartDataset & {
  colorIndex?: number
}
