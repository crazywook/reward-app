import { Country, Gender } from '../user/constants'
import { RecommendationService, Transmission, TransmissionPayload } from './types'
import { CampaignRepository } from '../campaign/campaign.repository'
import { AuthenticatableRandomIdHelper } from '../crypt/helper'

export class AdTransMissionService {
  policies: (() => void)[] = []

  constructor(
    private readonly campaignRepository: CampaignRepository,
    private readonly recommendationService: RecommendationService,
    private readonly transmissionIdHelper: AuthenticatableRandomIdHelper<TransmissionPayload>,
  ) {}

  async transmit({
    userId,
    gender,
    country,
  }: {
    userId: number
    gender: Gender
    country: Country
  }): Promise<Transmission[]> {
    const transmissions = await this.campaignRepository.getCampaignByCountryAndGender({
      country,
      gender,
    })

    const campaigns = await this.recommendationService.recommendByUserId({
      userId,
      transmissions,
    })

    return campaigns.map(campaign => ({
      image_url: campaign.image_url,
      landing_url: campaign.landing_url,
      reward: campaign.reward,
      campaignId: campaign.id,
      token: this.transmissionIdHelper.createRandomToken({ amount: campaign.reward }),
    }))
  }
}
