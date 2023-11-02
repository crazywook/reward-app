import mongoose from 'mongoose'
import { campaignSchema } from './schema'

export const campaignModel = mongoose.model('Campaign', campaignSchema)
