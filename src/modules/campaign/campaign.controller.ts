import { BodyParam, Controller, Param, Patch } from 'routing-controllers'
import { campaignService } from '.'

@Controller('/campaign')
export class CampaignController {
  @Patch('/:id/reward')
  public async 'update reward'(
    @Param('id') id: number,
    @BodyParam('reward') reward: number,
  ) {
    await campaignService.updateReward(id, reward)

    return {
      result: 'success',
    }
  }
}
