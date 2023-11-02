import mongoose from 'mongoose'

export const counterSchema = new mongoose.Schema({
  model: { type: String, required: true },
  field: { type: String, required: true },
  count: { type: Number, default: 0 },
})
