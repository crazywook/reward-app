import { AuthenticatableRandomIdHelper } from '../crypt/helper'
import config from '../config'
import { AdTransMissionService } from './transMissionService'
import { campaignRepository } from '../campaign'
import { RecommendationServiceImpl } from './recommendationService'
import { TransmissionPayload } from './types'

export const transmissionIdHelper =
  new AuthenticatableRandomIdHelper<TransmissionPayload>(config.getTransMissionIdSecret())

export const recommendationService = new RecommendationServiceImpl()
export const adTransMissionService = new AdTransMissionService(
  campaignRepository,
  recommendationService,
  transmissionIdHelper,
)
