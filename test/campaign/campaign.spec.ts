import { CampaignRepository } from '@/modules/campaign/campaign.repository'
import { CampaignService } from '@/modules/campaign/campaignService'
import { expect, assert } from 'chai'

describe('캠페인', () => {
  const campaignRepository = {
    updateReward: async (id: number, reward: number) => ({}),
  } as CampaignRepository
  const campaignService = new CampaignService(campaignRepository)

  it('reward', async () => {
    const id = 1
    const reward = 3
    const result = await campaignService.updateReward(id, reward)
    if (result === null) {
      assert.fail('no campaign')
    }

    expect(result).to.be.deep.equal({
      result: 'success',
    })
  })
})
