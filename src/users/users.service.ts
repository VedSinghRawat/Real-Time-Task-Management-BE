import { Injectable } from '@nestjs/common'
import { DatabaseService } from 'src/database/database.service'
import { User } from 'src/entities/user.entity'

@Injectable()
export class UsersService {
  private db: DatabaseService['db']

  constructor(_: DatabaseService) {
    this.db = _.db
  }

  async findById(id: User['id']) {
    return await this.db.query.users.findFirst({ where: (u, o) => o.eq(u.id, id) })
  }
}
