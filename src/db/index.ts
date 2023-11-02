import mongoose from 'mongoose'
import * as profile from '../config/profile'

const config = profile.getConfig()
const isLocal = config.isLocal

export async function connect(url: string = config.databaseUrl) {
  mongoose.connection
    .on('open', () => console.log('mongoose Connected to', url))
    .on('error', console.error.bind(console, 'connection error:'))

  const options = isLocal
    ? {
        dbName: config.databaseName,
      }
    : {
        authSource: 'admin',
        user: process.env.DB_USER,
        pass: process.env.DB_PASS,
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
  console.log('=== db options', options)
  return mongoose.connect(url, options)
}
