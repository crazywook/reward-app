import 'reflect-metadata'
import * as http from 'http'
import { expect, assert } from 'chai'
import { useExpressServer } from 'routing-controllers'
import supertest from 'supertest'
import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'

import app from '@/app'
import seed from '@/db/campaign/seed'
import { campaignRepository } from '@/modules/campaign'
import { CampaignController } from '@/modules/campaign/campaign.controller'
import { connect } from '@/db'

describe('캠페인-e2e', () => {
  let server: http.Server
  let request: supertest.SuperAgentTest
  let mongoServer: MongoMemoryServer
  let connection: typeof mongoose

  before(async () => {
    mongoServer = await MongoMemoryServer.create()
    const uri = mongoServer.getUri()
    connection = await connect(uri)
    await seed()

    server = await useExpressServer(app, {
      controllers: [CampaignController],
    }).listen(0)

    request = supertest.agent(server)
  })

  after(async () => {
    server.close()
    connection.disconnect()
    mongoServer.stop()
  })

  it('reward', async () => {
    const id = 1
    const reward = 3
    const result = await request
      .patch(`/campaign/${id}/reward`)
      .send({ reward })
      .expect(200)
      .then(res => res.body)

    if (result === null) {
      assert.fail('no campaign')
    }

    expect(result).to.be.deep.equal({
      result: 'success',
    })

    const campaign = await campaignRepository.findById(id)
    expect(campaign?.reward).to.be.equal(reward)
  })
})
