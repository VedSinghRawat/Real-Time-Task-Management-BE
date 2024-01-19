import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { DatabaseModule } from './database/database.module'
import { ConfigModule } from '@nestjs/config'
import { PartialSchemaMap, object, string } from 'joi'
import { EnviromentVariables } from './interfaces/config'
import { UsersModule } from './users/users.module'

const configValidtionSchema: PartialSchemaMap<{
  [K in keyof EnviromentVariables]: unknown
}> = {
  DATABASE_URL: string(),
}

@Module({
  imports: [
    DatabaseModule,
    ConfigModule.forRoot({
      validationSchema: object(configValidtionSchema),
      isGlobal: true,
    }),
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
