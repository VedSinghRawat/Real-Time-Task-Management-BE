import { Injectable } from '@nestjs/common'
import { users } from 'src/database/database.schema'
import { DatabaseService } from 'src/database/database.service'
import { User } from 'src/entities/user.entity'
import { SignupDTO } from 'src/validator/auth/signup.validator'

@Injectable()
export class UsersService {
  private db: DatabaseService['db']

  constructor(_: DatabaseService) {
    this.db = _.db
  }

  async findById(id: User['id']) {
    return await this.db.query.users.findFirst({ where: (u, o) => o.eq(u.id, id), columns: { password: false } })
  }

  async findByEmail(email: User['email']) {
    return await this.db.query.users.findFirst({ where: (u, o) => o.eq(u.email, email) })
  }

  async create(data: SignupDTO) {
    return (await this.db.insert(users).values(data).returning({ id: users.id, email: users.email, username: users.username }))[0]!
  }
}
