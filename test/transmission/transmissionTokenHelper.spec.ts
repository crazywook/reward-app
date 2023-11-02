import { TransmissionPayload } from '@/modules/adTransmission/types'
import { AuthenticatableRandomIdHelper } from '@/modules/crypt/helper'
import { assert, expect } from 'chai'

describe('광고송출 토큰', () => {
  const transmissionTokenHelper = new AuthenticatableRandomIdHelper<TransmissionPayload>(
    'test',
  )

  it('토큰(적립금 포함) 생성, 해독', async () => {
    const payload = {
      amount: 1,
    }
    const token = transmissionTokenHelper.createRandomToken(payload)

    const decoded = transmissionTokenHelper.verify(token)
    if (!decoded) {
      assert.fail('토큰 해독 실패')
    }

    await new Promise(resolve => setTimeout(resolve, 100))
    expect(decoded.amount).to.equal(payload.amount)
    expect(decoded.authenticationId).to.be.a('string')
  })

  it('토큰(string) 생성, 해독', async () => {
    const token = transmissionTokenHelper.createRandomToken()

    const decoded = transmissionTokenHelper.verify(token)
    if (!decoded) {
      assert.fail('토큰 해독 실패')
    }

    await new Promise(resolve => setTimeout(resolve, 100))
    expect(decoded.authenticationId).to.be.a('string')
  })
})
