import { Controller, Get } from 'routing-controllers'

@Controller('/health')
export class HealthCheckController {
  @Get('/')
  public 'health check'() {
    return 'healthy'
  }
}
