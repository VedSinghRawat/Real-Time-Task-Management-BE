import { Controller, Get } from '@nestjs/common'
import { DatabaseService } from './database/database.service'
import { users } from './database/database.schema'

@Controller()
export class AppController {
  constructor(private readonly dbService: DatabaseService) {}

  @Get('test')
  test() {
    const a = this.dbService.db.insert(users).values({ email: 'hello@gmail.com', password: 'something123', username: 'hello world' })
    return a
  }
}
