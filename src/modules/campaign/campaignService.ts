import { CampaignRepository } from './campaign.repository'

export class CampaignService {
  constructor(private readonly campaignRepository: CampaignRepository) {}
  async updateReward(
    id: number,
    reward: number,
  ): Promise<{ result: 'success' } | { error: { message } }> {
    await this.campaignRepository.updateReward(id, reward)

    return {
      result: 'success',
    }
  }
}
