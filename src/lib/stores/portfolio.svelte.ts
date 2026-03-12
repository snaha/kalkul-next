import type { SvelteSet } from 'svelte/reactivity'
import type {
  EnrichedInvestment,
  EnrichedPortfolio,
  Investment,
  InvestmentNested,
  MetaFields,
  Portfolio,
  PortfolioNested,
} from '$lib/types'
import { now, spreadInvestment, spreadPortfolio, spreadTransaction } from './store-utils'
import { withInvestmentStore } from './investment.svelte'

type ClientParent = {
  persist(): void
  deletePortfolio(id: string): void
  duplicatePortfolio(newPortfolio: PortfolioNested): string | undefined
  hiddenIds: SvelteSet<string>
}

export type EnrichedPortfolioStore = Omit<PortfolioNested, 'investments' | 'goals'> & {
  investments: EnrichedInvestment[]
  goals: EnrichedInvestment[]
  update(updates: Partial<Omit<Portfolio, 'id'>>): void
  delete(): void
  duplicate(): string | undefined
  addInvestment(data: Omit<Investment, MetaFields>): string
  addGoal(data: Omit<Investment, MetaFields>): string
  removeChild(id: string): void
  duplicateChild(newInv: InvestmentNested): string | undefined
  getSiblingsOf(id: string): EnrichedInvestment[]
  persist(): void
  hiddenIds: SvelteSet<string>
  toJSON(): PortfolioNested
}

export function withPortfolioStore(
  portfolio: PortfolioNested,
  client: ClientParent,
): EnrichedPortfolioStore {
  // Data migration: split investments into investments and goals if goals array is missing
  const rawGoals = (portfolio as { goals?: InvestmentNested[] }).goals
  let investmentData: InvestmentNested[]
  let goalData: InvestmentNested[]
  if (rawGoals) {
    investmentData = portfolio.investments
    goalData = rawGoals
  } else {
    investmentData = []
    goalData = []
    for (const inv of portfolio.investments) {
      if (inv.goal_data !== undefined && inv.goal_data !== null) {
        goalData.push(inv)
      } else {
        investmentData.push(inv)
      }
    }
  }

  let id = $state(portfolio.id)
  let name = $state(portfolio.name)
  let currency = $state(portfolio.currency)
  let start_date = $state(portfolio.start_date)
  let end_date = $state(portfolio.end_date)
  let inflation_rate = $state(portfolio.inflation_rate)
  let created_at = $state(portfolio.created_at)
  let last_edited_at = $state(portfolio.last_edited_at)
  let investments = $state<EnrichedInvestment[]>([])
  let goals = $state<EnrichedInvestment[]>([])

  const store: EnrichedPortfolioStore = {
    get id() {
      return id
    },
    set id(v) {
      id = v
    },
    get name() {
      return name
    },
    set name(v) {
      name = v
    },
    get currency() {
      return currency
    },
    set currency(v) {
      currency = v
    },
    get start_date() {
      return start_date
    },
    set start_date(v) {
      start_date = v
    },
    get end_date() {
      return end_date
    },
    set end_date(v) {
      end_date = v
    },
    get inflation_rate() {
      return inflation_rate
    },
    set inflation_rate(v) {
      inflation_rate = v
    },
    get created_at() {
      return created_at
    },
    set created_at(v) {
      created_at = v
    },
    get last_edited_at() {
      return last_edited_at
    },
    set last_edited_at(v) {
      last_edited_at = v
    },
    get investments() {
      return investments
    },
    set investments(v) {
      investments = v
    },
    get goals() {
      return goals
    },
    set goals(v) {
      goals = v
    },

    get hiddenIds() {
      return client.hiddenIds
    },

    update(updates: Partial<Omit<Portfolio, 'id'>>) {
      Object.assign(this, updates, { last_edited_at: now() })
      client.persist()
    },

    delete() {
      client.deletePortfolio(id)
    },

    duplicate(): string | undefined {
      function deepCopyInvestments(invs: EnrichedInvestment[]) {
        return invs.map((inv) => {
          const newInvestmentId = crypto.randomUUID()
          return {
            ...spreadInvestment(inv),
            id: newInvestmentId,
            created_at: now(),
            last_edited_at: now(),
            transactions: inv.transactions.map((t) => ({
              ...spreadTransaction(t),
              id: crypto.randomUUID(),
              created_at: now(),
              last_edited_at: now(),
            })),
          }
        })
      }

      const newPortfolioId = crypto.randomUUID()
      const newPortfolio: PortfolioNested = {
        ...spreadPortfolio(this),
        id: newPortfolioId,
        name: name + ' - Copy',
        created_at: now(),
        last_edited_at: now(),
        investments: deepCopyInvestments(investments),
        goals: deepCopyInvestments(goals),
      }
      return client.duplicatePortfolio(newPortfolio)
    },

    addInvestment(data: Omit<Investment, MetaFields>) {
      const invId = crypto.randomUUID()
      const newInvestment: InvestmentNested = {
        ...data,
        id: invId,
        created_at: now(),
        last_edited_at: now(),
        transactions: [],
      }
      const enrichedInv = withInvestmentStore(newInvestment, store)
      investments.push(enrichedInv)
      client.persist()
      return invId
    },

    addGoal(data: Omit<Investment, MetaFields>) {
      const goalId = crypto.randomUUID()
      const newGoal: InvestmentNested = {
        ...data,
        id: goalId,
        created_at: now(),
        last_edited_at: now(),
        transactions: [],
      }
      const enrichedGoal = withInvestmentStore(newGoal, store)
      goals.push(enrichedGoal)
      client.persist()
      return goalId
    },

    removeChild(childId: string) {
      let idx = investments.findIndex((i) => i.id === childId)
      if (idx !== -1) {
        investments.splice(idx, 1)
        client.persist()
        return
      }
      idx = goals.findIndex((i) => i.id === childId)
      if (idx !== -1) {
        goals.splice(idx, 1)
        client.persist()
      }
    },

    duplicateChild(newInv: InvestmentNested): string | undefined {
      const isGoal = newInv.goal_data !== undefined
      const enrichedInv = withInvestmentStore(newInv, store)
      if (isGoal) {
        goals.push(enrichedInv)
      } else {
        investments.push(enrichedInv)
      }
      client.persist()
      return newInv.id
    },

    getSiblingsOf(childId: string): EnrichedInvestment[] {
      if (investments.some((i) => i.id === childId)) return investments
      if (goals.some((i) => i.id === childId)) return goals
      return []
    },

    persist() {
      client.persist()
    },

    toJSON(): PortfolioNested {
      return {
        ...spreadPortfolio(this),
        investments: investments.map((i) => i.toJSON()),
        goals: goals.map((g) => g.toJSON()),
      }
    },
  }

  // Enrich child investments and goals
  investments = investmentData.map((inv) => withInvestmentStore(inv, store))
  goals = goalData.map((g) => withInvestmentStore(g, store))

  return store
}
