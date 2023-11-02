import mongoose from 'mongoose'
import { rewardHistorySchema, rewardSchema } from './schema'

export const rewardModel = mongoose.model('Reward', rewardSchema)

export const rewardHistoryModel = mongoose.model('RewardHistory', rewardHistorySchema)
