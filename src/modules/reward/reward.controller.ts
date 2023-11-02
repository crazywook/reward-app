import 'reflect-metadata'
import { BodyParam, Controller, Get, Param, Post, Res } from 'routing-controllers'
import { rewardService } from '.'
import Express from 'express'

@Controller('/user/:userId/reward')
export class RewardController {
  @Get('/')
  async 'get reward'(@Param('userId') userId: number) {
    const reward = await rewardService.getByUserId(userId)

    return {
      reward: reward || [],
    }
  }

  @Post('/deposit')
  async deposit(
    @Res() res: Express.Response,
    @Param('userId') userId: number,
    @BodyParam('token') token: string,
    @BodyParam('amount') amount: number,
    @BodyParam('campaignId') campaignId: number,
  ) {
    try {
      const reward = await rewardService.deposit({
        transmissionToken: token,
        userId,
        amount,
        campaignId,
      })

      if ('error' in reward) {
        res.status(400)
        return {
          error: {
            message: reward.error.message,
          },
        }
      }

      return {
        reward,
      }
    } catch (e: any) {
      return {
        error: {
          message: e.message,
        },
      }
    }
  }

  @Post('/withdraw')
  async withdraw(
    @Res() res: Express.Response,
    @Param('userId') userId: number,
    @BodyParam('amount') amount: number,
  ) {
    try {
      const reward = await rewardService.withdraw({ userId, amount })

      if ('error' in reward) {
        res.status(400)
        return {
          error: {
            message: reward.error.message,
          },
        }
      }

      return {
        reward,
      }
    } catch (e: any) {
      return {
        error: {
          message: e.message,
        },
      }
    }
  }
}
