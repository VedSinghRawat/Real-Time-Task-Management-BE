import { Body, Req, Controller, Post, UseGuards, UsePipes, Get } from '@nestjs/common'
import { SignupValidator } from 'src/validator/auth/signup.validator'
import type { SignupDTO } from 'src/validator/auth/signup.validator'
import { Request } from 'express'
import { AuthService } from './auth.service'
import { JwtAuthGuard } from './jwt.guard'
import { User } from 'src/entities/user.entity'
import { LocalAuthGuard } from './local.guard'

@Controller('')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  login(@Req() req: Request & { user: User }) {
    return this.authService.login(req.user.id)
  }

  @Post('signup')
  @UsePipes(SignupValidator)
  async signup(@Body() signupReq: SignupDTO) {
    const user = await this.authService.signUp(signupReq)

    return this.authService.login(user.id)
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@Req() req: Request & { user: User }) {
    return req.user
  }
}
