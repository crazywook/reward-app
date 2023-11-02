import { CounterModel } from '../counter'
import { campaignModel } from '.'

export default async function seed() {
  const { default: bulkData } = await import('../../../resources/ad_campaigns.json')
  await campaignModel.insertMany(bulkData)
  const maxId = await campaignModel
    .aggregate([
      {
        $group: {
          _id: null,
          max: { $max: '$id' },
        },
      },
    ])
    .then(r => r[0].max)

  await CounterModel.findOneAndUpdate(
    { model: 'Campaign', field: 'id' },
    { count: maxId },
    { new: true, upsert: true },
  )

  const campaignCount = await campaignModel.count()
  if (campaignCount !== maxId) {
    console.error('Campaign count does not match maxId')
  }

  return 'campaigns seeded'
}
