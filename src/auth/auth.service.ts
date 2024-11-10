import { BadRequestException, Injectable } from '@nestjs/common'
import { compare } from 'bcrypt'
import { UsersService } from 'src/users/users.service'
import { JwtService } from '@nestjs/jwt'
import { AuthDTOSignup } from './dto/auth.dto'
import { encrypt } from 'src/util'

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email)
    if (user && (await compare(password, user.password))) {
      const { password: _, ...userWithoutPassword } = user
      return userWithoutPassword
    }

    return null
  }

  login(id: number) {
    const payload = { id }
    return {
      access_token: this.jwtService.sign(payload, { expiresIn: '14d' }),
    }
  }

  async signUp(data: AuthDTOSignup) {
    const { password, ...userData } = data

    const oldUser = await this.usersService.findByEmail(userData.email)
    if (oldUser) {
      throw new BadRequestException('User already exists')
    }

    const hashedPassword = await encrypt(password)
    const user = await this.usersService.create({ ...userData, password: hashedPassword })
    return user
  }
}
