import { TransmissionPayload } from '../adTransmission/types'
import { AuthenticatableRandomIdHelper } from '../crypt/helper'
import { RewardAction } from './constants'
import { RewardRepository } from './reward.repository'
import { RewardLogger } from './rewardLogger'
import { Reward, RewardHistory } from './types'

export class RewardService {
  constructor(
    private readonly rewardRepository: RewardRepository,
    private readonly rewardLogger: RewardLogger,
    private readonly transmissionIdHelper: AuthenticatableRandomIdHelper<TransmissionPayload>,
  ) {}

  async getByUserId(testUserId: number) {
    return this.rewardRepository.findByUserId(testUserId).then(rewards =>
      rewards.map(r => ({
        userId: r.userId,
        amount: r.amount,
      })),
    )
  }

  async deposit({
    userId,
    amount,
    transmissionToken,
    campaignId,
  }: {
    userId: number
    amount: number
    transmissionToken: string
    campaignId: number
  }): Promise<
    | Reward
    | {
        error: { message: string }
      }
  > {
    const payload = this.transmissionIdHelper.verify(transmissionToken)
    if (!payload) {
      return {
        error: {
          message: '광고 정보가 잘못되었습니다.',
        },
      }
    }

    let currentHistory: RewardHistory | undefined
    try {
      const recentHistory =
        await this.rewardLogger.findRecentDepositHistoryByTransmissionId(
          payload.authenticationId,
        )
      if (
        recentHistory &&
        recentHistory.transmissionId === payload.authenticationId &&
        !recentHistory.error
      ) {
        return {
          error: {
            message: '이미 적립한 리워드입니다.',
          },
        }
      }

      const history = await this.rewardLogger.logDeposit({
        userId,
        amount,
        transmissionId: payload.authenticationId,
        campaignId,
      })
      if ('result' in history) {
        throw new Error(history.error.message)
      }
      currentHistory = history

      const [reward] = await this.rewardRepository.findByUserId(userId)
      const currentAmount = reward?.amount || 0
      const finalAmount = currentAmount + amount

      if (!reward) {
        await this.rewardRepository.create({
          userId,
          amount: finalAmount,
        })
      } else {
        await this.rewardRepository.updateRewardByUserId({
          userId,
          amount: finalAmount,
        })
      }

      const [finalReward] = await this.rewardRepository.findByUserId(userId)

      if (!finalReward) {
        throw new Error('리워드 정보가 잘못되었습니다.')
      }

      return {
        userId: finalReward.userId,
        amount: finalReward.amount,
      }
    } catch (e) {
      const historyId = currentHistory ? currentHistory.id : undefined
      console.error(
        `depositByUserId({ userId: ${userId}, reward: ${amount}}) historyId: ${historyId}`,
        e,
      )

      const errorMessage = e instanceof Error ? e.message : String(e)

      await this.rewardLogger.logError({
        userId,
        amount: amount,
        action: RewardAction.DEPOSIT,
        transmissionId: transmissionToken,
        error: {
          historyId,
          message: errorMessage,
        },
      })

      throw e
    }
  }

  async withdraw({
    userId,
    amount,
  }: {
    userId: number
    amount: number
  }): Promise<Reward | { error: { message: string } }> {
    let history: any
    try {
      const [reward] = await this.rewardRepository.findByUserId(userId)
      if (!reward) {
        return {
          error: {
            message: '리워드 정보가 잘못되었습니다.',
          },
        }
      }

      const finalAmount = reward.amount - amount
      if (finalAmount < 0) {
        return {
          error: {
            message: '잔액이 부족합니다.',
          },
        }
      }

      history = await this.rewardLogger.logWithdraw({
        userId,
        amount: amount,
      })

      await this.rewardRepository.updateRewardByUserId({
        userId,
        amount: finalAmount,
      })

      const [finalReward] = await this.rewardRepository.findByUserId(userId)
      if (!finalReward) {
        throw new Error('리워드 정보가 잘못되었습니다.')
      }

      return {
        userId: finalReward.userId,
        amount: finalReward.amount,
      }
    } catch (e) {
      console.error(
        `depositByUserId({ userId: ${userId}, reward: ${amount}}) historyId: ${history?.id}`,
        e,
      )

      const errorMessage = e instanceof Error ? e.message : String(e)
      const historyId = history?.id
      await this.rewardLogger.logError({
        userId,
        amount: amount,
        action: RewardAction.DEPOSIT,
        error: {
          historyId,
          message: errorMessage,
        },
      })

      throw e
    }
  }
}
