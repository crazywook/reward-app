import 'dotenv/config'
import * as db from './db'
import { bootServer } from './loader'
import { campaignModel } from './db/campaign'
import seed from './db/campaign/seed'

async function startServer() {
  await bootServer()
  await db.connect()

  const campaignCount = await campaignModel.count()
  if (campaignCount === 0) {
    await seed()
  }
}

startServer()
