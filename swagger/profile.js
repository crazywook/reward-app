const isProd = process.env.NODE_ENV === 'prod'
const isDev = process.env.NODE_ENV === 'dev'

const profile = {
  local: {
    port: 8001,
    apiPort: 3001,
  },
  dev: {
    port: 8002,
    apiPort: 3002,
  },
  prod: {
    port: 8002,
    apiPort: 3002,
  },
}

exports.getConfig = function getConfig() {
  if (isDev) {
    return profile.dev
  }
  if (isProd) {
    return profile.prod
  }

  return {
    ...profile.local,
    isLocal: true,
  }
}
