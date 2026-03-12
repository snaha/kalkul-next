import type { SvelteSet } from 'svelte/reactivity'
import type {
  EnrichedInvestment,
  Investment,
  InvestmentNested,
  Portfolio,
  PortfolioNested,
} from '$lib/types'
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
  addInvestment(data: Omit<Investment, 'id'>): string
  addGoal(data: Omit<Investment, 'id'>): string
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
  let id = $state(portfolio.id)
  let name = $state(portfolio.name)
  let currency = $state(portfolio.currency)
  let start_date = $state(portfolio.start_date)
  let end_date = $state(portfolio.end_date)
  let inflation_rate = $state(portfolio.inflation_rate)
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
      Object.assign(this, updates)
      client.persist()
    },

    delete() {
      client.deletePortfolio(id)
    },

    duplicate(): string | undefined {
      function deepCopyInvestments(invs: InvestmentNested[]) {
        return invs.map((inv) => ({
          ...inv,
          id: crypto.randomUUID(),
          transactions: inv.transactions.map((t) => ({ ...t, id: crypto.randomUUID() })),
        }))
      }

      const { investments: invs, goals: gs, ...rest } = this.toJSON()
      const newPortfolio: PortfolioNested = {
        ...rest,
        id: crypto.randomUUID(),
        name: name + ' - Copy',
        investments: deepCopyInvestments(invs),
        goals: deepCopyInvestments(gs),
      }
      return client.duplicatePortfolio(newPortfolio)
    },

    addInvestment(data: Omit<Investment, 'id'>) {
      const invId = crypto.randomUUID()
      const newInvestment: InvestmentNested = {
        ...data,
        id: invId,
        transactions: [],
      }
      const enrichedInv = withInvestmentStore(newInvestment, this)
      investments.push(enrichedInv)
      client.persist()
      return invId
    },

    addGoal(data: Omit<Investment, 'id'>) {
      const goalId = crypto.randomUUID()
      const newGoal: InvestmentNested = {
        ...data,
        id: goalId,
        transactions: [],
      }
      const enrichedGoal = withInvestmentStore(newGoal, this)
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
      const enrichedInv = withInvestmentStore(newInv, this)
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
        id,
        name,
        currency,
        start_date,
        end_date,
        inflation_rate,
        investments: investments.map((i) => i.toJSON()),
        goals: goals.map((g) => g.toJSON()),
      }
    },
  }

  // Enrich child investments and goals
  investments = portfolio.investments.map((inv) => withInvestmentStore(inv, store))
  goals = portfolio.goals.map((g) => withInvestmentStore(g, store))

  return store
}
