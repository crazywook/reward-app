import mongoose from 'mongoose'
import { connect } from '@/db'
import { MongoMemoryServer } from 'mongodb-memory-server'

let mongoServer: MongoMemoryServer
let connection: typeof mongoose

before(async () => {
  console.log('=== global setup ')
  mongoServer = await MongoMemoryServer.create()
  const uri = mongoServer.getUri()
  connection = await connect(uri)
})

after(async () => {
  console.log('=== teardown')
  connection.disconnect()
  mongoServer.stop()
})
