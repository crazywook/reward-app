import { expect } from 'chai'

import { Country, Gender } from '@/modules/user/constants'
import { RecommendationServiceImpl } from '@/modules/adTransmission/recommendationService'
import { CampaignSchema } from '@/db/campaign/schema'

describe('추천 로직', () => {
  const gender = Gender.FEMALE
  const country = Country.HK
  const transmissions: CampaignSchema[] = [
    {
      name: 'test',
      target_gender: gender,
      target_country: country,
      id: 1,
      image_url: 'https://img.wook.com/image_1.jpg',
      landing_url: 'https://landing.wook.com/landing_1',
      weight: 0,
      reward: 2,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      name: 'test',
      target_gender: gender,
      target_country: country,
      id: 2,
      image_url: 'https://img.wook.com/image_1.jpg',
      landing_url: 'https://landing.wook.com/landing_1',
      weight: 5500,
      reward: 2,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      name: 'test',
      target_gender: gender,
      target_country: country,
      id: 3,
      image_url: 'https://img.wook.com/image_1.jpg',
      landing_url: 'https://landing.wook.com/landing_1',
      weight: 6600,
      reward: 2,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      name: 'test',
      target_gender: gender,
      target_country: country,
      id: 4,
      image_url: 'https://img.wook.com/image_1.jpg',
      landing_url: 'https://landing.wook.com/landing_1',
      weight: 6400,
      reward: 2,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      name: 'test',
      target_gender: gender,
      target_country: country,
      id: 5,
      image_url: 'https://img.wook.com/image_1.jpg',
      landing_url: 'https://landing.wook.com/landing_1',
      weight: 600,
      reward: 2,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]

  const service = new RecommendationServiceImpl()

  it('랜덤 추천', () => {
    const recommended = service.recommendByRandom(transmissions)

    const originOrder = transmissions.slice(0, 3).map(tr => tr.id)
    const recommendedOrder = recommended.map(tr => tr.id)

    expect(recommendedOrder).to.be.lengthOf(3)
    expect(recommendedOrder).not.to.be.ordered.members(originOrder)
  })

  it('weight 추천', () => {
    const zeroWeightId = 1

    for (let i = 0; i < 100; i++) {
      const recommended = service.recommendByWeight(transmissions)

      const recommendedIds = recommended.map(tr => tr.id)

      expect(recommendedIds).to.be.instanceOf(Array)
      expect(recommendedIds).to.not.includes(zeroWeightId)
    }
  })
})
