import { Controller, Get, Param } from 'routing-controllers'
import { rewardHistoryService } from '.'
import { RewardHistory } from './types'

@Controller()
export class RewardHistoryController {
  @Get('/user/:userId/reward-history')
  async 'get user reward history'(
    @Param('userId') userId: number,
  ): Promise<{ rewardHistories: RewardHistory[] }> {
    const history = await rewardHistoryService.findByUserId(userId)

    return {
      rewardHistories: history || [],
    }
  }
}
