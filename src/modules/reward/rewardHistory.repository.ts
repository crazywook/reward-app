import { RewardAction } from './constants'
import { RewardHistory } from './types'
import { RewardHistorySchema } from '@/db/reward/schema'
import mongoose from 'mongoose'

export class RewardHistoryRepository {
  constructor(private readonly rewardHistoryModel: mongoose.Model<RewardHistorySchema>) {}

  async findByUserId(userId: number) {
    return this.rewardHistoryModel.find({ userId }).sort({ _id: -1 }).exec()
  }

  async findOne({
    transmissionId,
    action,
  }: {
    transmissionId: string
    action: RewardAction
  }): Promise<RewardHistory | null> {
    return this.rewardHistoryModel.findOne({
      transmissionId,
      action,
    })
  }

  async create({
    userId,
    action,
    amount,
    campaignId,
    transmissionId,
  }: {
    userId: number
    action?: RewardAction
    amount: number
    campaignId?: number
    transmissionId?: string
  }): Promise<RewardHistory> {
    return this.rewardHistoryModel
      .create({
        userId,
        action,
        amount,
        campaignId,
        transmissionId,
      })
      .then(r => r.toJSON())
  }
}
