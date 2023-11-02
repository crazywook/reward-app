import { expect } from 'chai'
import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { CounterModel } from '@/db/counter'
import { campaignModel } from '@/db/campaign'
import seed from '@/db/campaign/seed'

describe('seedCampaign', () => {
  let mongoServer: MongoMemoryServer
  // let connection: mongoose.Connection

  before(async () => {
    mongoServer = await MongoMemoryServer.create()
    const uri = mongoServer.getUri()
    await mongoose.connect(uri, {
      dbName: 'verifyMASTER',
    })
  })

  after(async () => {
    mongoose.disconnect()
    mongoServer.stop()
  })

  it('should seed the database', async () => {
    await seed()

    const maxId = await campaignModel
      .aggregate([
        {
          $group: {
            _id: null,
            max: { $max: '$id' },
          },
        },
      ])
      .then(r => r[0].max)
    expect(maxId).to.be.equal(999)

    const campaignCount = await campaignModel.count()
    expect(campaignCount).to.be.equal(999)
    const counter = await CounterModel.findOne(
      { model: 'Campaign', field: 'id' },
      {},
      { lean: true },
    )

    expect(counter?.count).to.be.deep.equal(999)

    const campaignDoc = await campaignModel.create({
      name: 'test',
      image_url: 'test',
      landing_url: 'test',
      weight: 1,
      target_country: 'KR',
      reward: 1,
    })
    expect(campaignDoc.id).to.be.equal(1000)
  }).timeout(1000 * 10)
})
