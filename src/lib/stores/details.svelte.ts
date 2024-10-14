import { detailStoreSchema } from '$lib/schemas'
import type { Deposit, Withdrawal, Currency } from '$lib/types'
import { base64ToBytes, bytesToBase64, compareArrays, initialValues } from '$lib/utils'
import pako from 'pako'

export interface DetailsStoreValues {
	dateOfBirth: Date
	endAge: number
	currency: Currency
	inflation: number
	apy: number
	feeSuccess: number
	feeManagement: number
	entryFee: number
	withdrawalFee: number
}

export interface DetailsStore extends DetailsStoreValues {
	deposits: Deposit[]
	withdrawals: Withdrawal[]

	addDeposit: (deposit: Deposit) => void
	removeDeposit: (index: number) => void
	saveDeposit: (index: number, deposit: Deposit) => void
	addWithdrawal: (withdrawal: Withdrawal) => void
	removeWithdrawal: (index: number) => void
	saveWithdrawal: (index: number, withdrawal: Withdrawal) => void
	toUrl: () => string
	restoreFromUrl: (url: string) => void
}

function add<T>(array: T[], item: T) {
	array.push(item)
}

function remove<T>(array: T[], index: number) {
	if (index >= 0 && index < array.length) {
		array.splice(index, 1)
	}
}
function save<T>(array: T[], index: number, item: T) {
	if (index >= 0 && index < array.length) {
		array[index] = item
	}
}

export function withDetailsStore(): DetailsStore {
	let dateOfBirth = $state<Date>(new Date(initialValues.dateOfBirth))
	let endAge = $state<number>(initialValues.endAge)
	let currency = $state<Currency>(initialValues.currency)
	let inflation = $state<number>(initialValues.inflation)
	let apy = $state<number>(initialValues.apy)
	let feeSuccess = $state<number>(initialValues.feeSuccess)
	let feeManagement = $state<number>(initialValues.feeManagement)
	let entryFee = $state<number>(initialValues.entryFee)
	let withdrawalFee = $state<number>(initialValues.withdrawalFee)
	let deposits = $state<Deposit[]>([])
	let withdrawals = $state<Withdrawal[]>([])

	return {
		get dateOfBirth() {
			return dateOfBirth
		},
		set dateOfBirth(value) {
			dateOfBirth = value
		},
		get endAge() {
			return endAge
		},
		set endAge(value) {
			endAge = value
		},
		get currency() {
			return currency
		},
		set currency(value) {
			currency = value
		},
		get inflation() {
			return inflation
		},
		set inflation(value) {
			inflation = value
		},
		get apy() {
			return apy
		},
		set apy(value) {
			apy = value
		},
		get feeSuccess() {
			return feeSuccess
		},
		set feeSuccess(value) {
			feeSuccess = value
		},
		get feeManagement() {
			return feeManagement
		},
		set feeManagement(value) {
			feeManagement = value
		},
		get entryFee() {
			return entryFee
		},
		set entryFee(value) {
			entryFee = value
		},
		get withdrawalFee() {
			return withdrawalFee
		},
		set withdrawalFee(value) {
			withdrawalFee = value
		},
		get deposits() {
			return deposits
		},
		set deposits(value) {
			deposits = value
		},

		get withdrawals() {
			return withdrawals
		},
		set withdrawals(value) {
			withdrawals = value
		},

		addDeposit(deposit) {
			add(deposits, deposit)
		},
		removeDeposit(index) {
			remove(deposits, index)
		},
		saveDeposit(index, deposit) {
			save(deposits, index, deposit)
		},
		addWithdrawal(withdrawal) {
			add(withdrawals, withdrawal)
		},
		removeWithdrawal(index) {
			remove(withdrawals, index)
		},
		saveWithdrawal(index, withdrawal) {
			save(withdrawals, index, withdrawal)
		},
		toUrl() {
			const data = JSON.stringify({
				dateOfBirth,
				endAge,
				currency,
				inflation,
				apy,
				feeSuccess,
				feeManagement,
				entryFee,
				withdrawalFee,
				deposits,
				withdrawals,
			})
			return bytesToBase64(pako.deflate(data))
		},
		restoreFromUrl(url: string) {
			try {
				const uint8 = base64ToBytes(url)
				const decodedData = pako.inflate(uint8, { to: 'string' })
				const data = JSON.parse(decodedData)

				const res = detailStoreSchema.safeParse(data)

				if (!res.success) {
					console.error('Error restoring from URL', res.error)
					return
				}
				dateOfBirth = res.data.dateOfBirth
				endAge = res.data.endAge
				currency = res.data.currency
				inflation = res.data.inflation
				apy = res.data.apy
				feeSuccess = res.data.feeSuccess
				feeManagement = res.data.feeManagement
				withdrawalFee = res.data.withdrawalFee
				entryFee = res.data.entryFee

				if (!compareArrays(deposits, res.data.deposits)) deposits = res.data.deposits
				if (!compareArrays(withdrawals, res.data.withdrawals)) withdrawals = res.data.withdrawals
			} catch (error) {
				console.error('Error restoring from URL', error)
			}
		},
	}
}

export const detailStore = withDetailsStore()
