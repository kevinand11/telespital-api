import { BaseEntity } from '@stranerd/api-commons'
import { PayoutPay, PayoutStatus } from '../types'

export class PayoutEntity extends BaseEntity {
	public readonly id: string
	public readonly userId: string
	public readonly pay: PayoutPay
	public readonly status: PayoutStatus
	public readonly createdAt: number
	public readonly updatedAt: number

	constructor ({
		             id, userId, pay, status, createdAt, updatedAt
	             }: PayoutConstructorArgs) {
		super()
		this.id = id
		this.userId = userId
		this.pay = pay
		this.status = status
		this.createdAt = createdAt
		this.updatedAt = updatedAt
	}

	get amount () {
		return Object.values(this.pay).reduce((acc, cur) => acc + cur.amount, 0)
	}
}

type PayoutConstructorArgs = {
	id: string
	userId: string
	pay: PayoutPay
	status: PayoutStatus
	createdAt: number
	updatedAt: number
}