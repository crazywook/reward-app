import 'reflect-metadata'
import { expect } from 'chai'
import supertest from 'supertest'
import { StatusCodes } from 'http-status-codes'

// this shim is required
import { createExpressServer } from 'routing-controllers'
import { HealthCheckController } from '@/modules/health/health.controller'

// creates express app, registers all controller routes and returns you express app instance
// run express application on port 3000

describe('서버 테스트', () => {
  const app = createExpressServer({
    controllers: [HealthCheckController], // we specify controllers we want to use
  })

  const agent = supertest.agent(app)

  it('/health', async () => {
    const response = await agent.get('/health').expect(StatusCodes.OK)

    expect(response.text).to.be.equal('healthy')
  })
})
