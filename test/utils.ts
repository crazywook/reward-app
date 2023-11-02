import * as http from 'http'
import express from 'express'
import { useExpressServer } from 'routing-controllers'

type ex = ReturnType<typeof express>

export async function createTestSever(
  app: ex,
  controllers: Function[],
): Promise<http.Server> {
  let server: undefined | http.Server = undefined

  await new Promise((resolve, _reject) => {
    server = useExpressServer(app, {
      controllers,
    }).listen(0, () => {
      resolve(app)
    })
  })

  return server as unknown as http.Server
}
