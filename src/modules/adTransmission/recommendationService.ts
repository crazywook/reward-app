import { RecommendationService } from './types'
import { CampaignSchema } from '@/db/campaign/schema'

const TRANSMISSION_COUNT = 3

export class RecommendationServiceImpl implements RecommendationService {
  private transmissionCount: number

  constructor() {
    this.transmissionCount = TRANSMISSION_COUNT
  }
  recommendByPctrAndWeight(
    params: { userId: number; transmissions: CampaignSchema[] },
    options: { count: number },
  ): Promise<CampaignSchema[]> {
    throw new Error('Method not implemented.')
  }

  recommendByUserId({
    userId,
    transmissions,
  }: {
    userId: number
    transmissions: CampaignSchema[]
  }): Promise<CampaignSchema[]> | CampaignSchema[] {
    const groupNumber = userId % 2

    switch (groupNumber) {
      case 1:
        return this.recommendByRandom(transmissions)
      case 0:
        return this.recommendByWeight(transmissions)
      default:
        throw new Error('RecommendationGroup not found')
    }
  }

  recommendByRandom(
    originTransmissions: CampaignSchema[],
    { count }: { count: number } = { count: this.transmissionCount },
  ): CampaignSchema[] {
    const transmissions = originTransmissions.slice()

    return Array.from<number>({ length: count }).reduce(acc => {
      const index = Math.floor(Math.random() * transmissions.length)
      const selected = transmissions.splice(index, 1)
      acc.push(selected[0])

      return acc
    }, [] as CampaignSchema[])
  }

  recommendByWeight(
    originTransmissions: CampaignSchema[],
    { count }: { count: number } = { count: this.transmissionCount },
  ): CampaignSchema[] {
    const campaigns = originTransmissions.slice().sort((a, b) => b.weight - a.weight)
    const totalWeight = campaigns.reduce((acc, campaign) => acc + campaign.weight, 0)
    const transmissionLength = Math.min(campaigns.length, count)

    let selectedCampaigns: CampaignSchema[] = []
    for (let i = 0; i < transmissionLength; i++) {
      // 광고가 기본 송출 개수만큼 나오게 하려면 accumulatedWeight를 사용
      // let accumulatedWeight = 0

      const selectedIndex = campaigns.findIndex(({ weight }) => {
        if (weight <= 0) {
          return false
        }

        // accumulatedWeight += weight
        const num = Math.random() * totalWeight
        return num <= weight
      })

      if (selectedIndex > -1) {
        const selectedCampaign = campaigns.splice(selectedIndex, 1)[0]
        selectedCampaigns.push(selectedCampaign)
      }
    }

    return selectedCampaigns
  }

  getIndexByWeight(transmissions: any[]) {
    return 0
  }
}
