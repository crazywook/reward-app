// transmission controller

import { Controller, Get, Param, QueryParam, Res } from 'routing-controllers'
import { adTransMissionService } from '.'
import { Country, Gender } from '../user/constants'
import { Response } from 'express'

@Controller()
export class TransmissionController {
  @Get('/user/:userId/transmission')
  async 'transmit advertisement'(
    @Res() res: Response,
    @Param('userId') userId: number,
    @QueryParam('country') country: Country,
    @QueryParam('gender') gender: Gender,
  ) {
    if (!country) {
      res.status(400).send('country is required')
      return
    }
    if (!gender) {
      res.status(400).send('gender is required')
      return
    }

    const campaigns = await adTransMissionService.transmit({
      userId,
      country,
      gender,
    })

    return {
      campaigns,
    }
  }
}
