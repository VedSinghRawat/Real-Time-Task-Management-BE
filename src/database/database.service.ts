import { Injectable } from '@nestjs/common'
import postgres from 'postgres'
import { PostgresJsDatabase, drizzle } from 'drizzle-orm/postgres-js'
import * as schema from './database.schema'
import { ConfigService } from '@nestjs/config'
import { EnviromentVariables } from 'src/interfaces/config'

@Injectable()
export class DatabaseService {
  private client

  public db: PostgresJsDatabase<typeof schema>

  constructor(configService: ConfigService<EnviromentVariables>) {
    const dbURL = configService.get('DATABASE_URL', { infer: true })

    if (dbURL) {
      this.client = postgres(dbURL)
      this.db = drizzle(this.client, { schema })
    } else throw 'No DATABASE_URL found in env'
  }
}
