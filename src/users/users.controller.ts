import { Controller, Get } from '@nestjs/common'

@Controller('users')
export class UsersController {
  @Get('me')
  login() {
    return 'hello world'
  }
}
