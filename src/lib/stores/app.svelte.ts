import { SvelteSet } from 'svelte/reactivity'
import type {
  ClientNested,
  ClientNoId,
  EnrichedClient,
  EnrichedInvestment,
  EnrichedPortfolio,
  EnrichedTransaction,
} from '$lib/types'
import { withClientStore } from './client.svelte'

const STORAGE_KEY = 'kalkul-data'

function loadData(): ClientNested[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      return JSON.parse(raw) as ClientNested[]
    }
  } catch (e) {
    console.error('Failed to load data from localStorage', e)
  }
  return []
}

function withAppStore() {
  let clients = $state.raw<EnrichedClient[]>([])
  let loading = $state(true)
  const hiddenInvestmentIds = new SvelteSet<string>()

  function persist(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(clients))
    // Trigger reactivity: $state.raw only signals on reassignment, so create
    // a new array reference after every mutation.
    clients = [...clients]
  }

  function deleteClient(id: string): void {
    const idx = clients.findIndex((c) => c.id === id)
    if (idx !== -1) clients.splice(idx, 1)
    persist()
  }

  const appParent = {
    persist,
    deleteClient,
    hiddenIds: hiddenInvestmentIds,
  }

  function enrichAll(rawClients: ClientNested[]): EnrichedClient[] {
    return rawClients.map((c) => withClientStore(c, appParent))
  }

  return {
    get clients() {
      return clients
    },
    set clients(value: EnrichedClient[]) {
      clients = value
      loading = false
    },
    get loading() {
      return loading
    },
    set loading(value: boolean) {
      loading = value
    },
    reset() {
      clients = []
      loading = true
    },

    persist,
    deleteClient,
    get hiddenIds() {
      return hiddenInvestmentIds
    },

    // --- Load ---

    load(): void {
      clients = enrichAll(loadData())
      loading = false
    },

    // --- Finders ---

    findClient(id: string): EnrichedClient | undefined {
      return clients.find((c) => c.id === id)
    },

    findPortfolio(portfolioId: string): EnrichedPortfolio | undefined {
      for (const client of clients) {
        const portfolio = client.portfolios.find((p) => p.id === portfolioId)
        if (portfolio) return portfolio
      }
      return undefined
    },

    findInvestment(investmentId: string): EnrichedInvestment | undefined {
      for (const client of clients) {
        for (const portfolio of client.portfolios) {
          const investment = portfolio.investments.find((i) => i.id === investmentId)
          if (investment) return investment
          const goal = portfolio.goals.find((i) => i.id === investmentId)
          if (goal) return goal
        }
      }
      return undefined
    },

    findTransaction(transactionId: string): EnrichedTransaction | undefined {
      for (const client of clients) {
        for (const portfolio of client.portfolios) {
          for (const investment of [...portfolio.investments, ...portfolio.goals]) {
            const transaction = investment.transactions.find((t) => t.id === transactionId)
            if (transaction) return transaction
          }
        }
      }
      return undefined
    },

    getPortfolios(clientId: string): EnrichedPortfolio[] {
      return clients.find((c) => c.id === clientId)?.portfolios ?? []
    },

    getInvestments(portfolioId: string): EnrichedInvestment[] {
      for (const client of clients) {
        const portfolio = client.portfolios.find((p) => p.id === portfolioId)
        if (portfolio) return portfolio.investments
      }
      return []
    },

    getTransactions(investmentId: string): EnrichedTransaction[] {
      const investment = this.findInvestment(investmentId)
      return investment?.transactions ?? []
    },

    // --- Clients ---

    addClient(client: ClientNoId): string {
      const id = crypto.randomUUID()
      const newClient: ClientNested = {
        ...client,
        id,
        portfolios: [],
      }
      const enrichedClient = withClientStore(newClient, appParent)
      clients.push(enrichedClient)
      persist()
      return id
    },

    // --- Backup / Restore ---

    exportBackup(): string {
      return JSON.stringify(clients, undefined, 2)
    },

    importBackup(json: string): void {
      const parsed = JSON.parse(json) as unknown
      if (!Array.isArray(parsed)) {
        throw new Error('Invalid backup format')
      }
      clients = enrichAll(parsed as ClientNested[])
      loading = false
      persist()
    },
  }
}

export const appStore = withAppStore()
