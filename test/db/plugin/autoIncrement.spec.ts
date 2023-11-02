import { MongoMemoryServer } from 'mongodb-memory-server'

import { assert, expect } from 'chai'
import { default as mongoose } from 'mongoose'
import { createAutoIncrementPlugin } from '@/db/plugin/autoIncrement/plugin'

describe('autoIncrement', () => {
  let mongoServer: MongoMemoryServer

  before(async () => {
    mongoServer = await MongoMemoryServer.create()
    const uri = mongoServer.getUri()
    await mongoose.connect(uri)
  })

  after(async () => {
    await mongoose.disconnect()
    await mongoServer.stop()
  })

  it('should be ok', async () => {
    const fooSchema = new mongoose.Schema({
      id: { type: Number, required: true, unique: true },
      name: String,
    })

    fooSchema.plugin(createAutoIncrementPlugin({ field: 'id' }))
    const fooModel = mongoose.model('foo', fooSchema)

    await fooModel.create({
      name: 'a',
    })
    const foo = await fooModel.findOne({ id: 1 })
    if (!foo) {
      assert.fail('foo is null')
    }

    expect(foo.id).to.be.equal(1)
    expect(foo.toJSON().id).to.be.equal(1)

    await fooModel.create({
      name: 'b',
    })
    const fooTwo = await fooModel.findOne({ name: 'b' })
    if (fooTwo === null) {
      assert.fail('fooTwo is null')
    }
    const objected2 = fooTwo.toJSON()
    expect(objected2.id).to.be.equal(2)
  }).timeout(1000 * 20)
})
