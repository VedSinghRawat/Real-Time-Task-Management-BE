import { Body, Req, Controller, Post, UseGuards, UsePipes, Get } from '@nestjs/common'
import { Request } from 'express'
import { AuthService } from './auth.service'
import { JwtAuthGuard } from './gaurds/jwt/jwt.guard'
import { User } from 'src/database/database.schema'
import { LocalAuthGuard } from './gaurds/local/local.guard'
import { AuthDTOSignup, AuthValidatorSignup } from './dto/auth.dto'

@Controller('')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  login(@Req() req: Request & { user: User }) {
    const data = this.authService.login(req.user.id)
    return { access_token: data.access_token, user: req.user }
  }

  @Post('signup')
  @UsePipes(AuthValidatorSignup)
  async signup(@Body() signupReq: AuthDTOSignup) {
    const user = await this.authService.signUp(signupReq)
    const data = this.authService.login(user.id)

    return { access_token: data.access_token, user }
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@Req() req: Request & { user: User }) {
    return { user: req.user }
  }
}
