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
import type { EnrichedTransactionStore } from './stores/transaction.svelte'
import type { EnrichedInvestmentStore } from './stores/investment.svelte'
import type { EnrichedPortfolioStore } from './stores/portfolio.svelte'
import type { EnrichedClientStore } from './stores/client.svelte'

export type ClientNoId = Omit<Client, 'id'>

// --- Enriched types (objects with CRUD methods) ---

export type EnrichedTransaction = EnrichedTransactionStore
export type EnrichedInvestment = EnrichedInvestmentStore
export type EnrichedPortfolio = EnrichedPortfolioStore
export type EnrichedClient = EnrichedClientStore

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
