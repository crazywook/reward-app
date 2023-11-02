import { RewardAction } from './constants'

export interface Reward {
  userId: number
  amount: number
}

export interface RewardHistory {
  id: string
  userId: number
  action: RewardAction
  amount: number
  transmissionId?: string
  error?:
    | {
        message: string
        historyId?: string
      }
    | string
  createdAt: Date
  updatedAt: Date
}
