import { RewardAction } from '@/modules/reward/constants'
import mongoose from 'mongoose'

export interface RewardSchema {
  id: string
  userId: number
  amount: number
}

export const rewardSchema = new mongoose.Schema<RewardSchema>(
  {
    userId: { type: Number, required: true },
    amount: { type: Number, required: true },
  },
  { timestamps: true, id: true },
)

export interface RewardHistorySchema {
  id: string
  userId: number
  action: RewardAction
  amount: number
  transmissionId?: string
  campaignId?: number
  error?:
    | {
        message: string
        historyId?: string
      }
    | string
  createdAt: Date
  updatedAt: Date
}

export const rewardHistorySchema = new mongoose.Schema<RewardHistorySchema>(
  {
    userId: { type: Number, required: true },
    action: { type: String, required: true },
    amount: { type: Number, required: true },
    transmissionId: { type: String },
    campaignId: { type: Number },
    error: { type: String },
  },
  { timestamps: true, id: true },
)
