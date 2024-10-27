import { Controller, Get } from '@nestjs/common'
import { SeedingService } from './seeding.service'

@Controller('seed')
export class SeedingController {
  constructor(private seedingService: SeedingService) {}

  @Get('/')
  async seed() {
    await this.seedingService.seed()
    return 'Seeding done'
  }
}
