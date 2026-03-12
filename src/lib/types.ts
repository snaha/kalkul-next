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

import type {
  Client,
  ClientNested,
  Investment,
  InvestmentNested,
  Portfolio,
  PortfolioNested,
  Transaction,
} from './schemas'

export type MetaFields = 'id' | 'created_at' | 'last_edited_at'

export type ClientNoId = Omit<Client, 'id' | 'created_at'>

// --- Enriched types (objects with CRUD methods) ---

export type EnrichedTransaction = Transaction & {
  update(updates: Partial<Omit<Transaction, 'id'>>): void
  delete(): void
  duplicate(): string
}

export type EnrichedInvestment = Omit<InvestmentNested, 'transactions'> & {
  transactions: EnrichedTransaction[]
  update(updates: Partial<Omit<Investment, 'id'>>): void
  delete(): void
  duplicate(): string | undefined
  addTransaction(data: Omit<Transaction, MetaFields>): string
  hidden: boolean
  toggleHide(): void
  toggleFocus(): void
  focused: boolean
}

export type EnrichedPortfolio = Omit<PortfolioNested, 'investments' | 'goals'> & {
  investments: EnrichedInvestment[]
  goals: EnrichedInvestment[]
  update(updates: Partial<Omit<Portfolio, 'id'>>): void
  delete(): void
  duplicate(): string | undefined
  addInvestment(data: Omit<Investment, MetaFields>): string
  addGoal(data: Omit<Investment, MetaFields>): string
}

export type EnrichedClient = Omit<ClientNested, 'portfolios'> & {
  portfolios: EnrichedPortfolio[]
  update(updates: Partial<Omit<ClientNested, 'id' | 'created_at' | 'portfolios'>>): void
  delete(): void
  addPortfolio(data: Omit<Portfolio, MetaFields>): string
}

export type InvestmentWithColorIndex = Investment & {
  colorIndex?: number
  hidden?: boolean
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
