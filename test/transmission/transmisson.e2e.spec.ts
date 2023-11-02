import 'reflect-metadata'
import * as http from 'http'
import chai, { expect } from 'chai'
import supertest from 'supertest'
import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose, { connect } from 'mongoose'

import app from '@/app'
import { createTestSever } from '@test/utils'
import { TransmissionController } from '@/modules/adTransmission/transmission.controller'
import seed from '@/db/campaign/seed'
import sinonChai from 'sinon-chai'
import { Country, Gender } from '@/modules/user/constants'
// import { campaignRepository } from '@/modules/campaign'
import { Transmission } from '@/modules/adTransmission/types'

chai.use(sinonChai)

describe('광고 송출-e2e', () => {
  let server: http.Server
  let request: supertest.SuperAgentTest
  let mongoServer: MongoMemoryServer
  let connection: typeof mongoose

  before(async () => {
    mongoServer = await MongoMemoryServer.create()
    const uri = mongoServer.getUri()
    connection = await connect(uri)
    await seed()

    server = await createTestSever(app, [TransmissionController])
    request = supertest.agent(server)
  })

  after(async () => {
    server.close()
    connection.disconnect()
    mongoServer.stop()
  })

  it('송출', async () => {
    const userId = 3
    const country = Country.HK
    const gender = Gender.FEMALE

    // test
    const transmissions: { campaigns: Transmission[] } = await request
      .get(`/user/${userId}/transmission`)
      .query({ country, gender })
      .expect(200)
      .then(res => res.body)

    const { campaigns } = transmissions
    expect(campaigns).to.be.lengthOf(3)
    const ids = campaigns.map(c => c.campaignId)

    ids.forEach(id => expect(id).to.be.a('number'))
    campaigns.forEach((c: any) => {
      expect(c).to.include.all.keys(['token', 'image_url', 'landing_url', 'reward'])
    })
  }).timeout(1000 * 120)
})
