import 'reflect-metadata'
import { useExpressServer } from 'routing-controllers'
import 'dotenv/config'
import { rootDir } from '../../dir'
import path from 'path'
import app from '@/app'
import { getConfig } from '@/config/profile'

const config = getConfig()
const port = config.serverPort

export function bootServer() {
  const controllerPath = path.resolve(rootDir, 'src', 'modules/**/*.controller.{js,ts}')

  return useExpressServer(app, {
    controllers: [controllerPath],
  }).listen(port, () => {
    console.log('listen at', port)
  })
}
