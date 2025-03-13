import adapters from './adapters'
import { investmentStore } from './stores/investment.svelte'
import { portfolioStore } from './stores/portfolio.svelte'
import { transactionStore } from './stores/transaction.svelte'
import type { InvestmentWithColorIndex, Transaction } from './types'

export async function cascadeDuplicatePortfolio(clientId: number, portfolioId: number) {
	let duplicatedPortfolioId: number | undefined = undefined
	try {
		const portfolios = portfolioStore.filter(clientId)
		const originalPortfolio = portfolios.find((portfolio) => portfolio.id === portfolioId)
		if (!originalPortfolio) {
			return
		}

		const duplicatedPortfolio = {
			...originalPortfolio,
			id: undefined,
			link: null,
			name: originalPortfolio.name + ' - Copy',
		}

		duplicatedPortfolioId = await adapters.addPortfolio(duplicatedPortfolio)

		const investments = investmentStore.filter(portfolioId)
		for (const investment of investments) {
			await cascadeDuplicateInvestment(investment, duplicatedPortfolioId)
		}

		return duplicatedPortfolioId
	} catch (e) {
		if (duplicatedPortfolioId) await adapters.deletePortfolio({ id: duplicatedPortfolioId })
		console.error(e)
		throw e
	}
}

export async function cascadeDuplicateInvestment(
	investment: InvestmentWithColorIndex,
	duplicatedPortfolioId: number,
) {
	let duplicatedInvestmentId: number | undefined = undefined
	try {
		const duplicatedInvestment = {
			...investment,
			id: undefined,
			portfolio: duplicatedPortfolioId,
		}
		delete duplicatedInvestment.colorIndex

		duplicatedInvestmentId = await adapters.addInvestment(duplicatedInvestment)

		const transactions = transactionStore.filter(investment.id)
		for (const transaction of transactions) {
			await cascadeDuplicateTransaction(transaction, duplicatedInvestmentId)
		}
	} catch (e) {
		if (duplicatedInvestmentId) await adapters.deleteInvestment({ id: duplicatedInvestmentId })
		console.error(e)
		throw e
	}
}

async function cascadeDuplicateTransaction(
	transaction: Transaction,
	duplicatedInvestmentId: number,
) {
	try {
		const duplicatedTransaction = {
			...transaction,
			id: undefined,
			investment_id: duplicatedInvestmentId,
		}
		await adapters.addTransaction(duplicatedTransaction)
	} catch (e) {
		console.error(e)
		throw e
	}
}
