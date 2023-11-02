import mongoose from 'mongoose'
import { CounterModel } from '../../counter'

export function createAutoIncrementPlugin(config: { field: string }) {
  const field = config.field

  return function setAutoIncrement(
    schema: mongoose.Schema,
    _options: mongoose.SchemaOptions,
  ) {
    if (!field) {
      throw new Error('field is required')
    }

    schema.add({ [field]: { type: Number } })
    schema.set('toJSON', {
      transform(_doc, value, _options) {
        delete value._id
        delete value.__v

        return value
      },
    })

    schema.pre('save', async function hookId(next) {
      if (!this.isNew) {
        return next()
      }

      const modelName = (this.constructor as unknown as { modelName: string }).modelName
      const counter = await CounterModel.findOneAndUpdate(
        { model: modelName, field },
        { $inc: { count: 1 } },
        { new: true, upsert: true, lean: true },
      )

      if (!counter) {
        throw new Error('counter is null')
      }

      this[field] = counter.count

      next()
    })
  }
}
