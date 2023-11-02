import mongoose from 'mongoose'
import { createAutoIncrementPlugin } from '../plugin/autoIncrement/plugin'

export interface CampaignSchema {
  id: number
  name: string
  image_url: string
  landing_url: string
  weight: number
  target_country: string
  target_gender?: string
  reward: number
  createdAt: Date
  updatedAt: Date
}
export const campaignSchema = new mongoose.Schema<CampaignSchema>(
  {
    id: { type: Number, unique: true },
    name: { type: String, required: true },
    image_url: { type: String, required: true },
    landing_url: { type: String, required: true },
    weight: { type: Number, required: true },
    target_country: { type: String, required: true },
    target_gender: { type: String },
    reward: { type: Number, required: true },
  },
  { timestamps: true },
)

campaignSchema.plugin(createAutoIncrementPlugin({ field: 'id' }))
