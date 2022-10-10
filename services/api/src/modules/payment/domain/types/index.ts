export enum Currencies {
	USD = 'USD'
}

export enum CurrencyCountries {
	US = 'US'
}

export enum TransactionStatus {
	initialized = 'initialized',
	fulfilled = 'fulfilled',
	failed = 'failed',
	settled = 'settled'
}

export enum TransactionType {
	PayForConsultation = 'PayForConsultation'
}

export type TransactionData = {
	type: TransactionType.PayForConsultation,
	consultationId: string
}

export type AccountDetails = {
	country: CurrencyCountries
	number: string
	bankCode: string
	bankName: string
}