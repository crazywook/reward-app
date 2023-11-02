const express = require('express')
const { serveFiles, setup } = require('swagger-ui-express')
const { readFileSync, readdirSync } = require('fs')
const path = require('path')
const { parse } = require('yaml')
const { getConfig } = require('./profile')

const app = express()
const config = getConfig()
console.log('[swagger]config', config)
const port = config.port
const apiPort = config.apiPort

const dir = path.join(__dirname, 'docs')

const navigationLinks = `**Index**
- [transmission](http://localhost:${port}/api-docs/transmission)
- [reward](http://localhost:${port}/api-docs/reward)
- [reward-history](http://localhost:${port}/api-docs/reward-history)
- [campaign](http://localhost:${port}/api-docs/campaign)`

function readSwaggerFile(filename) {
  const filepath = path.join(dir, filename)
  return parse(readFileSync(filepath, 'utf8'))
}

app.get('/', (_req, res) => {
  res.redirect(`/api-docs`)
})

readdirSync(dir).forEach(filename => {
  const [basename] = filename.split('.')
  const spec = readSwaggerFile(filename)
  console.log('=== spec', basename, spec)

  if (basename === 'index') {
    return
  }

  spec.info.description = navigationLinks

  const serverName = config.isProd ? 'development' : 'local'
  spec.servers = [
    {
      url: `http://localhost:${apiPort}`,
      description: serverName,
    },
  ]

  if (config.isLocal) {
    spec.servers.push({
      url: `http://localhost:3002`,
      description: 'development',
    })
  }

  app.use(`/api-docs/${basename}`, serveFiles(spec), setup(spec))
})

app.get('/', (_req, res) => {
  res.send('Welcome to the Swagger Specification Server')
})

const spec = readSwaggerFile('index.yml')
spec.info.description = navigationLinks

console.log('=== spec index', spec)
app.use(`/api-docs`, serveFiles(spec), setup(spec))
app.get('/', (_req, res) => res.send('index page'))

app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})
