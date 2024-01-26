import { Body, Controller, Post, UsePipes } from '@nestjs/common'
import { LoginValidator } from 'src/validator/auth/login.validator'
import { SignupValidator } from 'src/validator/auth/signup.validator'
import type { LoginDTO } from 'src/validator/auth/login.validator'
import type { SignupDTO } from 'src/validator/auth/signup.validator'

@Controller('')
export class AuthController {
  @Post('login')
  @UsePipes(LoginValidator)
  login(@Body() loginReq: LoginDTO) {
    console.log(loginReq)
  }

  @Post('signup')
  @UsePipes(SignupValidator)
  signup(@Body() signupReq: SignupDTO) {
    console.log(signupReq)
  }
}
