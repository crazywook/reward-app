import { RewardAction } from './constants'
import { RewardHistoryRepository } from './rewardHistory.repository'
import { RewardHistory } from './types'

export class RewardHistoryService {
  constructor(private readonly rewardHistoryRepository: RewardHistoryRepository) {}

  async log({
    userId,
    action,
    amount,
  }: {
    userId: number
    action: RewardAction
    amount: number
  }): Promise<RewardHistory | { error: Record<any, string> }> {
    try {
      return this.rewardHistoryRepository.create({
        userId,
        action,
        amount,
      })
    } catch (e) {
      console.error(e)

      if (e instanceof Error) {
        return {
          error: {
            message: e.message,
          },
        }
      }

      return {
        error: {
          origin: String(e),
        },
      }
    }
  }

  async findByUserId(userId: number): Promise<RewardHistory[]> {
    return this.rewardHistoryRepository.findByUserId(userId).then(rewards =>
      rewards.map(r => ({
        id: r.id,
        userId: r.userId,
        action: r.action,
        amount: r.amount,
        transmissionId: r.transmissionId,
        error: r.error,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
      })),
    )
  }
}
