import { RewardAction } from './constants'
import { RewardHistoryRepository } from './rewardHistory.repository'
import { RewardHistory } from './types'

export class RewardLogger {
  constructor(private readonly rewardHistoryRepository: RewardHistoryRepository) {}

  async findRecentDepositHistoryByTransmissionId(transmissionId: string) {
    return this.rewardHistoryRepository.findOne({
      transmissionId,
      action: RewardAction.DEPOSIT,
    })
  }

  async log({
    userId,
    action,
    amount,
    campaignId,
    transmissionId,
    error,
  }: {
    userId: number
    action: RewardAction
    amount: number
    campaignId?: number
    transmissionId?: string
    error?:
      | {
          message: string
          historyId?: string
        }
      | string
  }): Promise<RewardHistory | { result: 'fail'; error: Record<any, string> }> {
    try {
      return this.rewardHistoryRepository.create({
        userId,
        action,
        amount,
        campaignId,
        transmissionId,
        ...(error && { error }),
      })
    } catch (e) {
      const params = { userId, action, amount, campaignId, transmissionId }
      console.error(`rewardLogger.log(${params})`, e)

      if (e instanceof Error) {
        return {
          result: 'fail',
          error: {
            message: e.message,
          },
        }
      }

      return {
        result: 'fail',
        error: {
          origin: String(e),
        },
      }
    }
  }

  async logDeposit({
    userId,
    amount,
    transmissionId,
    campaignId,
  }: {
    userId: number
    amount: number
    transmissionId: string
    campaignId: number
  }): Promise<RewardHistory | { result: 'fail'; error: Record<any, string> }> {
    return this.log({
      userId,
      action: RewardAction.DEPOSIT,
      amount,
      transmissionId,
      campaignId,
    })
  }

  async logWithdraw({
    userId,
    amount,
  }: {
    userId: number
    amount: number
  }): Promise<RewardHistory | { error: Record<any, string> }> {
    return this.log({
      userId,
      action: RewardAction.WITHDRAW,
      amount,
    })
  }

  async logError({
    userId,
    action,
    amount,
    transmissionId,
    error,
  }: {
    userId: number
    action: RewardAction
    amount: number
    transmissionId?: string
    error:
      | {
          message: string
          historyId?: string
        }
      | string
  }): Promise<RewardHistory | { error: Record<any, string> }> {
    return this.log({
      userId,
      action,
      amount,
      transmissionId,
      error,
    })
  }
}
