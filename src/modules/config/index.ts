import 'dotenv/config'

export default {
  getTransMissionIdSecret(): string {
    return process.env.TRANSMISSION_ID_SECRET || 'crazywook'
  },
}
