import 'dotenv/config'

type ProfileConfig = {
  databaseName: string
  databaseUrl: string
  serverPort: number
  isLocal?: boolean
}
type Profile = Record<'local' | 'dev' | 'prod', ProfileConfig>

const isDev = process.env.NODE_ENV === 'dev'
const isProd = process.env.NODE_ENV === 'prod'
const isLocal = !isDev && !isProd
const databaseName = process.env.DATABASE_NAME || 'test'
const databaseUrl = process.env.DATABASE_URL || 'mongodb://localhost:27017/test'
const serverPort = Number(process.env.SERVER_PORT) || 3001

const profile: Profile = {
  local: {
    databaseName: 'test',
    databaseUrl: 'mongodb://localhost:27017/test',
    serverPort: 3001,
  },
  dev: {
    databaseName,
    databaseUrl,
    serverPort,
  },
  prod: {
    databaseName,
    databaseUrl,
    serverPort,
  },
}

export function getConfig(): {
  isLocal?: boolean
} & ProfileConfig {
  if (isDev) {
    return profile.dev
  }
  if (isProd) {
    return profile.prod
  }

  return {
    ...profile.local,
    isLocal,
  }
}
