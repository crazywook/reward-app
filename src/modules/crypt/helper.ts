import { debuglog } from 'util'
import JWT from 'jsonwebtoken'
import { nanoid } from 'nanoid'

const debug = debuglog('transMissionIdHelper')

type AuthenticationIdPayload<T> = T extends string
  ? string
  : T & { authenticationId: string }
export class AuthenticatableRandomIdHelper<T = string | Record<any, string>> {
  static readonly defaultIdLength = 12

  constructor(private secret: string) {}

  createRandomToken(
    data?: T,
    config: {
      length: number
      expiresIn: number
    } = {
      length: AuthenticatableRandomIdHelper.defaultIdLength,
      expiresIn: 60 * 10,
    },
  ): string {
    const randomId = nanoid(config.length)

    const expiredAt = Math.round(Date.now() / 1000) + config.expiresIn

    if (typeof data === 'string') {
      return JWT.sign(`${data}|${expiredAt}`, this.secret)
    }

    const payload = {
      ...data,
      authenticationId: randomId,
    }
    return JWT.sign(payload, this.secret, {
      expiresIn: config.expiresIn,
    })
  }

  verify<P extends T>(token: string): AuthenticationIdPayload<P> | false {
    try {
      const decoded = JWT.verify(token, this.secret)

      if (typeof decoded === 'string') {
        const [id, expiredAt] = decoded.split('|')

        if (!expiredAt) {
          debug('invalid token: malformed')
          return false
        }
        if (Number(expiredAt) * 1000 < Date.now()) {
          debug('invalid token: expired')
          return false
        }

        return id as AuthenticationIdPayload<P>
      }

      return decoded as AuthenticationIdPayload<P>
    } catch (error) {
      if (error instanceof JWT.JsonWebTokenError) {
        debug(error.message)
      } else {
        debug(String(error))
      }
      // invalid signature, jwt malformed, jwt expired
      return false
    }
  }
}
