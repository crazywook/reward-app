import 'dotenv/config'
import express from 'express'
import morgan from 'morgan'
import cors from 'cors'

const SWAGGER_PORT = process.env.SWAGGER_PORT || 3003
const swaggerUrlContainer = `http://localhost:${SWAGGER_PORT}`
const swaggerUrlLocal = 'http://localhost:8001'
const swaggerUrlDev = 'http://localhost:8002'
const origin = [swaggerUrlContainer, swaggerUrlLocal, swaggerUrlDev]

const app = express()
app.use(
  cors({
    origin,
    credentials: true,
  }),
)
app.use(morgan('dev'))
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

export default app
