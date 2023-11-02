import { rewardHistoryModel, rewardModel } from '@/db/reward'
import { RewardRepository } from './reward.repository'
import { RewardLogger } from './rewardLogger'
import { RewardHistoryRepository } from './rewardHistory.repository'
import { RewardService } from './rewardService'
import { transmissionIdHelper } from '../adTransmission'
import { RewardHistoryService } from './rewardHistoryService'

export const rewardRepository = new RewardRepository(rewardModel)
export const rewardHistoryRepository = new RewardHistoryRepository(rewardHistoryModel)

export const rewardLogger = new RewardLogger(rewardHistoryRepository)

export const rewardService = new RewardService(
  rewardRepository,
  rewardLogger,
  transmissionIdHelper,
)

export const rewardHistoryService = new RewardHistoryService(rewardHistoryRepository)
