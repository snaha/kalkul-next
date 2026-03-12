import { SvelteSet } from 'svelte/reactivity'
import type {
  ClientNested,
  ClientNoId,
  ClientStore,
  InvestmentStore,
  PortfolioStore,
  TransactionStore,
} from '$lib/types'
import { clientNestedSchema } from '$lib/schemas'
import { withClientStore } from './client.svelte'

const STORAGE_KEY = 'kalkul-data'

function loadData(): ClientNested[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed: unknown = JSON.parse(raw)
      return clientNestedSchema.array().parse(parsed)
    }
  } catch (e) {
    console.error('Failed to load data from localStorage', e)
  }
  return []
}

function withAppStore() {
  let clients = $state.raw<ClientStore[]>([])
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
    if (idx === -1) return
    clients.splice(idx, 1)
    persist()
  }

  const appParent = {
    persist,
    deleteClient,
    hiddenIds: hiddenInvestmentIds,
  }

  function enrichAll(rawClients: ClientNested[]): ClientStore[] {
    return rawClients.map((c) => withClientStore(c, appParent))
  }

  return {
    get clients() {
      return clients
    },
    set clients(value: ClientStore[]) {
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

    findClient(id: string): ClientStore | undefined {
      return clients.find((c) => c.id === id)
    },

    findPortfolio(portfolioId: string): PortfolioStore | undefined {
      for (const client of clients) {
        const portfolio = client.portfolios.find((p) => p.id === portfolioId)
        if (portfolio) return portfolio
      }
      return undefined
    },

    findInvestment(investmentId: string): InvestmentStore | undefined {
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

    findTransaction(transactionId: string): TransactionStore | undefined {
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

    getPortfolios(clientId: string): PortfolioStore[] {
      return clients.find((c) => c.id === clientId)?.portfolios ?? []
    },

    getInvestments(portfolioId: string): InvestmentStore[] {
      for (const client of clients) {
        const portfolio = client.portfolios.find((p) => p.id === portfolioId)
        if (portfolio) return portfolio.investments
      }
      return []
    },

    getTransactions(investmentId: string): TransactionStore[] {
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
      const parsed: unknown = JSON.parse(json)
      const validated = clientNestedSchema.array().parse(parsed)
      clients = enrichAll(validated)
      loading = false
      persist()
    },
  }
}

export const appStore = withAppStore()
