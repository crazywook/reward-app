import { CampaignSchema } from '@/db/campaign/schema'
import { Campaign } from '../campaign/types'

export interface RecommendationService {
  recommendByUserId(arg0: {
    userId: number
    transmissions: CampaignSchema[]
  }): CampaignSchema[] | Promise<CampaignSchema[]>
  recommendByRandom(
    transmissions: CampaignSchema[],
    options: { count: number },
  ): CampaignSchema[]
  recommendByWeight(
    transmissions: CampaignSchema[],
    options: { count: number },
  ): CampaignSchema[]
  recommendByPctrAndWeight(
    params: { userId: number; transmissions: CampaignSchema[] },
    options: { count: number },
  ): Promise<CampaignSchema[]>
}

export interface TransmissionRequest {
  userId: number
  id: number
  imageUrl: string
  landingUrl: string
  weight: number
  country: string
  gender: string
  reward: number
}

export interface TransmissionPayload {
  amount: number
}

export interface Transmission extends Campaign {
  token: string
}
