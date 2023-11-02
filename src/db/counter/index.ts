import mongoose from 'mongoose'
import { counterSchema } from './model'

export const CounterModel = mongoose.model('Counter', counterSchema)
