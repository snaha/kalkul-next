import { SvelteSet } from 'svelte/reactivity'
import type { ClientNested, ClientNoId, ClientStore } from '$lib/types'
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
  let dataVersion = $state(0)
  const hiddenInvestmentIds = new SvelteSet<string>()

  function persist(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(clients))
    // Trigger reactivity: $state.raw only signals on reassignment, so create
    // a new array reference after every mutation.
    clients = [...clients]
    dataVersion++
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
    get dataVersion() {
      return dataVersion
    },
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
