import * as http from 'http'
import supertest from 'supertest'
import { assert, expect } from 'chai'

import app from '@/app'
import { RewardController } from '@/modules/reward/reward.controller'
import { createTestSever } from '@test/utils'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { connect } from '@/db'
import mongoose from 'mongoose'
import { transmissionIdHelper } from '@/modules/adTransmission'
import { RewardAction } from '@/modules/reward/constants'
import { RewardHistoryController } from '@/modules/reward/rewardHistory.controller'

// 리워드 적립 테스트
describe('리워드-E2E', () => {
  let server: http.Server
  let request: supertest.SuperTest<supertest.Test>
  let mongoServer: MongoMemoryServer
  let connection: typeof mongoose

  before(async () => {
    console.log('== version', process.versions.node)
    mongoServer = await MongoMemoryServer.create()
    const mongoUri = await mongoServer.getUri()
    connection = await connect(mongoUri)

    server = await createTestSever(app, [RewardController, RewardHistoryController])
    request = supertest.agent(server)
  })

  after(async () => {
    await connection.disconnect()
    await mongoServer.stop()
    await server.close()
  })

  it('리워드 적립 및 잔액 확인', async () => {
    const userId = 1
    const amount = 1
    const campaignId = 1
    const token = transmissionIdHelper.createRandomToken({ amount })

    // 처음 잔액 확인
    const balanceRes = await request
      .get(`/user/${userId}/reward`)
      .expect(200)
      .then(res => res.body)
    if ('error' in balanceRes) {
      assert.fail(balanceRes.error.message)
    }

    const balance = balanceRes.reward[0]?.amount || 0
    // const balanceRes = {} as any
    // const balance = 0

    // 리워드 적립
    const depositRes = await request
      .post(`/user/${userId}/reward/deposit`)
      .send({ token, amount, campaignId })
      .then(res => {
        if (res.statusCode !== 200) {
          assert.fail(res.body.error.message)
        }
        return res.body
      })
    if ('error' in depositRes) {
      assert.fail(depositRes.error.message)
    }

    const balanceAfterDepositRes = await request
      .get(`/user/${userId}/reward`)
      .expect(200)
      .then(res => res.body)
    if ('error' in balanceRes) {
      assert.fail(balanceRes.error.message)
    }

    // 입금된 리워드 확인
    const balanceAfterDeposit = balance + amount
    expect(balanceAfterDepositRes.reward[0]).to.be.deep.includes({
      userId,
      amount: balanceAfterDeposit,
    })

    // 차감
    const withdrawRes = await request
      .post(`/user/${userId}/reward/withdraw`)
      .send({ amount })
      .expect(200)
      .then(res => res.body)
    if ('error' in withdrawRes) {
      assert.fail(balanceRes.error.message)
    }

    // 차감 후 잔액 확인
    const balanceAfterWithdraw = balanceAfterDeposit - amount
    const balanceAfterWithdrawRes = await request
      .get(`/user/${userId}/reward`)
      .expect(200)
      .then(res => res.body)
    expect(balanceAfterWithdrawRes.reward[0]).to.be.deep.includes({
      userId,
      amount: balanceAfterWithdraw,
    })

    // 잔액이 부족한 경우
    const notEnoughAmount = await request
      .post(`/user/${userId}/reward/withdraw`)
      .send({ amount })
      .expect(400)
      .then(res => res.body)
    expect(notEnoughAmount.error.message).to.be.deep.equal('잔액이 부족합니다.')

    // 내역 확인 내림차순 [출금, 입금]
    const historyRes = await request
      .get(`/user/${userId}/reward-history`)
      .expect(200)
      .then(res => res.body)
    if ('error' in historyRes) {
      assert.fail(historyRes.error.message)
    }

    expect(historyRes.rewardHistories).lengthOf(2)
    expect(historyRes.rewardHistories[0]).to.be.includes({
      userId,
      action: RewardAction.WITHDRAW,
      amount,
    })

    const decoded = transmissionIdHelper.verify(token)
    if (!decoded) {
      assert.fail('토큰 해독 실패')
    }
    expect(historyRes.rewardHistories[1]).to.be.includes({
      userId,
      action: RewardAction.DEPOSIT,
      amount: decoded.amount,
      transmissionId: decoded.authenticationId,
    })
  }).timeout(1000 * 120)

  it('유효하지 않은 토큰으로 적립시도', async () => {
    const userId = 1
    const amount = 1
    const campaignId = 1
    const token = 'token'

    const depositRes = await request
      .post(`/user/${userId}/reward/deposit`)
      .send({ token, amount, campaignId })
      .expect(400)
      .then(res => res.body)

    expect(depositRes.error.message).to.be.deep.equal('광고 정보가 잘못되었습니다.')
  })

  it('두번 적립 시도', async () => {
    const userId = 1
    const amount = 1
    const campaignId = 1
    const token = transmissionIdHelper.createRandomToken({ amount })

    const depositRes = await request
      .post(`/user/${userId}/reward/deposit`)
      .send({ token, amount, campaignId })
      .expect(200)
      .then(res => res.body)

    if ('error' in depositRes) {
      assert.fail(depositRes.error.message)
    }

    const depositRes2 = await request
      .post(`/user/${userId}/reward/deposit`)
      .send({ token, amount, campaignId })
      .expect(400)
      .then(res => res.body)

    expect(depositRes2.error.message).to.be.deep.equal('이미 적립한 리워드입니다.')
  })
})
