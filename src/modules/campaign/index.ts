import { campaignModel } from '@/db/campaign'
import { CampaignRepository } from './campaign.repository'
import { CampaignService } from './campaignService'

export const campaignRepository = new CampaignRepository(campaignModel)

export const campaignService = new CampaignService(campaignRepository)
