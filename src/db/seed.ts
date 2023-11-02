import 'dotenv/config'

import { connect } from '.'
import seedCampaign from './campaign/seed'

const defaultDatabaseUrl = process.env.DATABASE_URL || 'mongodb://localhost:27017'

async function run() {
  const con = await connect(defaultDatabaseUrl)
  const result = await Promise.all([seedCampaign()])

  con.disconnect()

  return result
}

run()
  .then(r => {
    console.log(r)
    console.log('done')
  })
  .catch(e => console.error)
