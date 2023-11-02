import chai, { assert } from 'chai'
import sinon from 'sinon'

import { RecommendationServiceImpl } from '@/modules/adTransmission/recommendationService'
import { AdTransMissionService } from '@/modules/adTransmission/transMissionService'
import { Country, Gender } from '@/modules/user/constants'
import sinonChai from 'sinon-chai'
import { transmissionIdHelper } from '@/modules/adTransmission'
import { CampaignRepository } from '@/modules/campaign/campaign.repository'
import { CampaignSchema } from '@/db/campaign/schema'
import { AuthenticatableRandomIdHelper } from '@/modules/crypt/helper'

chai.use(sinonChai)
const expect = chai.expect

/**
 * 광고 송출 API를 구현합니다.
 * 광고 송출 요청은 다음과 같은 정보가 포함됩니다.
 * 유저의 id (Integer)
 * 유저의 성별
 * 유저의 국가
 *
 * 광고 송출에 대한 응답에는 다음과 같은 정보가 포함됩니다.
 * 광고의 image_url
 * 광고의 landing_url
 * 광고의 reward
 * 광고 송출은 다음과 같은 조건을 만족해야 합니다.
 *
 * 광고 정보의 country, gender 조건에 맞는 광고만 송출됩니다.
 * 광고는 한 번에 최대 3개까지 송출이 되며 3개의 순서는 weight 값에 의해 정해집니다.
 * 만약 광고 a, b, c, d의 각 weight가 1, 1, 2, 3인 경우 a는 1/7, b는 1/7, c는 2/7의, d는 3/7의 확률로 처음에 위치해야 합니다.
 * 두 번째, 세 번째 광고도 마찬가지로 weight에 의해 선택됩니다.
 */
describe('광고 송출', () => {
  const recommendationService = new RecommendationServiceImpl()

  const campaigns: CampaignSchema[] = [
    {
      id: 1,
      name: 'test',
      weight: 300,
      target_gender: Gender.FEMALE,
      target_country: Country.HK,
      image_url: 'https://img.wook.com/image_1.jpg',
      landing_url: 'https://landing.wook.com/landing_1',
      reward: 2,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 2,
      name: 'test',
      weight: 301,
      target_gender: Gender.FEMALE,
      target_country: Country.HK,
      image_url: 'https://img.wook.com/image_1.jpg',
      landing_url: 'https://landing.wook.com/landing_1',
      reward: 2,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 3,
      name: 'test',
      weight: 302,
      target_gender: Gender.FEMALE,
      target_country: Country.HK,
      image_url: 'https://img.wook.com/image_1.jpg',
      landing_url: 'https://landing.wook.com/landing_1',
      reward: 2,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]

  const campaignRepository = {
    getCampaignByCountryAndGender: sinon.stub().resolves(campaigns) as any,
  } as CampaignRepository

  it('should transmission by country and gender', async () => {
    const userId = 1
    const gender = Gender.FEMALE
    const country = Country.HK

    const service = new AdTransMissionService(
      campaignRepository,
      recommendationService,
      transmissionIdHelper,
    )

    sinon.spy(transmissionIdHelper, 'createRandomToken')

    // 광고 송출
    const transmissions = await service.transmit({ userId, gender, country })

    expect(transmissionIdHelper.createRandomToken).to.be.calledWith({
      amount: sinon.match.number,
    })
    expect(transmissions).to.be.lengthOf(3)
    expect(campaignRepository.getCampaignByCountryAndGender).to.have.been.calledOnceWith({
      country,
      gender,
    })
    transmissions.forEach(tr => {
      expect(tr.image_url).be.a('string')
      expect(tr.landing_url).be.a('string')
      expect(tr.reward).be.a('number')
      const decoded = transmissionIdHelper.verify(tr.token)
      if (!decoded) {
        assert.fail('토큰 해독 실패')
      }

      expect(decoded.amount).be.equal(tr.reward)
      expect(decoded.authenticationId).be.a('string')
      expect(decoded.authenticationId).be.lengthOf(
        AuthenticatableRandomIdHelper.defaultIdLength,
      )
    })
  })

  it('should transmit by user group policy', async () => {
    const randomPolicyRequest = {
      userId: 1,
      gender: Gender.MALE,
      country: Country.KR,
    }

    const weightPolicyRequest = {
      userId: 2,
      gender: Gender.MALE,
      country: Country.KR,
    }

    const service = new AdTransMissionService(
      campaignRepository,
      recommendationService,
      transmissionIdHelper,
    )

    sinon.spy(recommendationService, 'recommendByRandom')
    await service.transmit(randomPolicyRequest)
    expect(recommendationService.recommendByRandom).to.have.been.calledOnce

    sinon.spy(recommendationService, 'recommendByWeight')
    await service.transmit(weightPolicyRequest)
    expect(recommendationService.recommendByWeight).to.have.been.calledOnce
  }).timeout(1000 * 100)
})
