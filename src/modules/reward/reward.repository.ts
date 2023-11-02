import { RewardSchema } from '@/db/reward/schema'
import mongoose from 'mongoose'

export class RewardRepository {
  constructor(private readonly model: mongoose.Model<RewardSchema>) {}

  async create({ userId, amount }: { userId: number; amount: number }) {
    return this.model
      .create({
        userId,
        amount,
      })
      .then(r => r.toJSON())
  }

  async findByUserId(userId: number) {
    return this.model.find({ userId })
  }

  async updateRewardByUserId({ userId, amount }: { userId: number; amount: number }) {
    return this.model.updateOne({ userId }, { amount })
  }

  async addRewardByUserId({ userId, amount }: { userId: number; amount: number }) {
    if (!this.model.updateOne) {
      throw new Error('model.updateOne is not defined')
    }

    const reward = await this.model.findOne({ userId })
    if (!reward) {
      return null
    }

    const finalReward = reward.amount + amount
    return this.model.updateOne({ userId, reward: finalReward })
  }
}
