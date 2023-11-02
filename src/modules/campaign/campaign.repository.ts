import mongoose, { UpdateWriteOpResult } from 'mongoose'
import { Country, Gender } from '../user/constants'
import { Campaign } from './types'
import { CampaignSchema } from '@/db/campaign/schema'

export class CampaignRepository {
  constructor(private readonly model: mongoose.Model<CampaignSchema>) {}

  async getCampaignByCountryAndGender({
    country,
    gender,
  }: {
    country: Country
    gender: Gender
  }): Promise<CampaignSchema[]> {
    return this.model
      .find({
        target_country: country,
        target_gender: gender,
      })
      .lean()
  }

  async findById(id: number): Promise<Campaign | null> {
    return this.model.findOne({ id })
  }

  async updateReward(id: number, reward: number): Promise<UpdateWriteOpResult | null> {
    const campaign = this.model.findById(id)
    if (!campaign) {
      return null
    }

    return this.model.updateOne({ id }, { reward })
  }
}
