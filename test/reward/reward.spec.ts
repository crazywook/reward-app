import chai, { assert, expect } from 'chai'
import sinon from 'sinon'
import sinonChai from 'sinon-chai'

import { RewardAction } from '@/modules/reward/constants'
import { RewardRepository } from '@/modules/reward/reward.repository'
import { RewardHistoryRepository } from '@/modules/reward/rewardHistory.repository'
import { RewardHistoryService } from '@/modules/reward/rewardHistoryService'
import { RewardLogger } from '@/modules/reward/rewardLogger'
import { Reward, RewardHistory } from '@/modules/reward/types'
import { RewardService } from '@/modules/reward/rewardService'
import { transmissionIdHelper } from '@/modules/adTransmission'

chai.use(sinonChai)

describe('리워드', () => {
  it('리워드 적립', async () => {
    const testUserId = 1
    const userRewardAmount = 3
    const userReward = {
      userId: testUserId,
      amount: userRewardAmount,
    }
    const rewardToDeposit = 2
    const transmissionToken = transmissionIdHelper.createRandomToken({
      amount: rewardToDeposit,
    })
    const campaignId = 1

    const rewardRepository = {
      async updateRewardByUserId({
        amount,
      }: {
        userId: number
        amount: number
      }): Promise<any> {
        userReward.amount = amount
        return userReward
      },
      async findByUserId(userId: number): Promise<Reward[]> {
        return [userReward]
      },
    } as RewardRepository

    const rewardHistoryRepository = {
      create: (({
        userId,
        action,
        amount,
        campaignId,
        transmissionId,
      }): RewardHistory => ({
        id: 'a1',
        userId,
        action,
        amount,
        transmissionId,
        updatedAt: new Date(),
        createdAt: new Date(),
      })) as any,
      async findOne({ transmissionId, action }) {
        return null
      },
    } as RewardHistoryRepository

    const rewardLogger = new RewardLogger(rewardHistoryRepository)
    const service = new RewardService(
      rewardRepository,
      rewardLogger,
      transmissionIdHelper,
    )
    const logDepositSpy = sinon.spy(rewardLogger, 'logDeposit')

    // 테스트 시작
    const result = await service.deposit({
      userId: 1,
      amount: rewardToDeposit,
      transmissionToken,
      campaignId,
    })

    expect(result).to.be.deep.equal({
      userId: testUserId,
      amount: userRewardAmount + rewardToDeposit,
    })

    const decoded = transmissionIdHelper.verify(transmissionToken)
    if (!decoded) {
      assert.fail('토큰 해독 실패')
    }

    expect(logDepositSpy).to.be.calledWith({
      userId: testUserId,
      amount: decoded.amount,
      transmissionId: decoded.authenticationId,
      campaignId,
    })
  })

  it('리워드 동일 송출 중복 적립 방지', async () => {
    const testUserId = 1
    const userReward = 3
    const rewardToDeposit = 2
    const transmissionToken = transmissionIdHelper.createRandomToken()
    const payload = transmissionIdHelper.verify(transmissionToken)
    if (!payload) {
      assert.fail('토큰 해독 실패')
    }

    const campaignId = 1

    const rewardRepository = {
      async updateRewardByUserId({
        userId,
        amount,
      }: {
        userId: number
        amount: number
      }): Promise<any> {
        return {
          userId,
          amount,
        }
      },
      async findByUserId(userId: number): Promise<any> {
        return {
          userId,
          amount: userReward,
        }
      },
    } as RewardRepository

    const rewardHistoryRepository = {
      async findOne({ transmissionId, action }) {
        // 이미 적립한 리워드 모킹
        if (transmissionId === payload.authenticationId) {
          return { transmissionId } as any
        } else {
          return null
        }
      },
    } as RewardHistoryRepository

    const rewardLogger = new RewardLogger(rewardHistoryRepository)
    const service = new RewardService(
      rewardRepository,
      rewardLogger,
      transmissionIdHelper,
    )

    // 테스트 시작
    const result = await service.deposit({
      userId: testUserId,
      campaignId,
      amount: rewardToDeposit,
      transmissionToken,
    })

    expect(result).to.be.deep.equal({
      error: {
        message: '이미 적립한 리워드입니다.',
      },
    })
  })

  it('리워드 transmissionId 암호화', async () => {
    const testUserId = 1
    const userReward = 3
    const rewardToDeposit = 2
    const transmissionId = 'a'
    const campaignId = 1

    const rewardRepository = {
      async updateRewardByUserId({
        userId,
        amount,
      }: {
        userId: number
        amount: number
      }): Promise<any> {
        return {
          userId,
          amount,
        }
      },
      async findByUserId(userId: number): Promise<any> {
        return {
          userId,
          amount: userReward,
        }
      },
    } as RewardRepository

    const rewardHistoryRepository = {
      async findOne({ transmissionId, action }) {
        // 이미 적립한 리워드 모킹
        return { transmissionId } as any
      },
    } as RewardHistoryRepository

    const rewardLogger = new RewardLogger(rewardHistoryRepository)
    const service = new RewardService(
      rewardRepository,
      rewardLogger,
      transmissionIdHelper,
    )
    sinon.spy(rewardLogger, 'logDeposit')

    // 테스트 시작
    const failResult = await service.deposit({
      userId: testUserId,
      campaignId,
      amount: rewardToDeposit,
      transmissionToken: transmissionId,
    })

    expect(failResult).to.be.deep.equal({
      error: {
        message: '광고 정보가 잘못되었습니다.',
      },
    })
  })

  it('리워드 차감', async () => {
    const testUserId = 1
    const initReward = 3
    const reward: Reward = {
      userId: testUserId,
      amount: initReward,
    }

    const rewardToWithdraw = 2

    const rewardRepository = {
      async updateRewardByUserId({
        userId,
        amount,
      }: {
        userId: number
        amount: number
      }): Promise<any> {
        reward.amount = amount
        return reward
      },
      async findByUserId(userId: number): Promise<any> {
        return [reward]
      },
    } as RewardRepository

    const rewardHistoryRepository = {
      async create() {},
    } as unknown as RewardHistoryRepository

    const transmissionIdService = {
      validate(str: string) {
        return false
      },
    } as any

    const rewardLogger = new RewardLogger(rewardHistoryRepository)
    const service = new RewardService(
      rewardRepository,
      rewardLogger,
      transmissionIdService,
    )
    sinon.spy(rewardLogger, 'logWithdraw')

    // 테스트 시작
    const result = await service.withdraw({ userId: 1, amount: 2 })

    const rewardAmountOne = initReward - rewardToWithdraw
    expect(result).to.be.deep.equal({
      userId: testUserId,
      amount: rewardAmountOne,
    })
    expect(rewardLogger.logWithdraw).to.be.calledOnce

    // 잔액이 부족한 경우
    const resultTwo = await service.withdraw({ userId: 1, amount: 2 })
    expect(resultTwo).to.be.deep.equal({
      error: {
        message: '잔액이 부족합니다.',
      },
    })
  })

  it('리워드 잔액 확인', async () => {
    const testUserId = 1
    const userReward = 3
    const reward: Reward = {
      userId: testUserId,
      amount: userReward,
    }

    const rewardRepository = {
      async findByUserId(userId: number): Promise<Reward[]> {
        return [reward]
      },
    } as RewardRepository

    const rewardLogger = {} as any
    const service = new RewardService(
      rewardRepository,
      rewardLogger,
      transmissionIdHelper,
    )
    const result = await service.getByUserId(testUserId)

    expect(result[0]).to.be.deep.equal(reward)
  })

  it('리워드 내역 확인', async () => {
    const testUserId = 1

    const rewardHistories = [
      {
        userId: testUserId,
        action: RewardAction.DEPOSIT,
        amount: 5,
      },
      {
        userId: testUserId,
        action: RewardAction.WITHDRAW,
        amount: 3,
      },
    ]

    const rewardHistoryRepository = {
      async create({
        userId,
        action,
        amount,
      }: {
        userId: number
        action: RewardAction
        amount: number
      }): Promise<any> {
        return {
          userId,
          action,
          amount,
        }
      },
      async findByUserId(userId: number): Promise<any> {
        return rewardHistories.filter(rh => rh.userId === userId)
      },
    } as any as RewardHistoryRepository

    const service = new RewardHistoryService(rewardHistoryRepository)
    const result = await service.findByUserId(testUserId)

    expect(result[0]).to.be.includes(rewardHistories[0])
    expect(result[1]).to.be.includes(rewardHistories[1])
  })
})
