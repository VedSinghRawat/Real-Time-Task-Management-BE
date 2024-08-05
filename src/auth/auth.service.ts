import { BadRequestException, Injectable } from '@nestjs/common'
import { hash, compare } from 'bcrypt'
import { UsersService } from 'src/users/users.service'
import { SignupDTO } from 'src/validator/auth/signup.validator'
import { JwtService } from '@nestjs/jwt'

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService
  ) {}

  private readonly SALT_ROUNDS = 16

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
      access_token: this.jwtService.sign(payload, { expiresIn: '30days' }),
    }
  }

  async signUp(data: SignupDTO) {
    const { password, ...userData } = data

    const oldUser = await this.usersService.findByEmail(userData.email)
    if (oldUser) {
      throw new BadRequestException('User already exists')
    }

    const hashedPassword = await hash(password, this.SALT_ROUNDS)
    const user = await this.usersService.create({ ...userData, password: hashedPassword })
    return user
  }
}
