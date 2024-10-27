import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { DatabaseModule } from '../database/database.module'
import { ConfigModule } from '@nestjs/config'
import * as Joi from 'joi'
import { EnviromentVariables } from '../interfaces/config'
import { UsersModule } from '../users/users.module'
import { AuthModule } from '../auth/auth.module'
import { ProjectsModule } from '../projects/projects.module'
import { SeedingModule } from 'src/seeding/seeding.module'

const configValidtionSchema: Joi.PartialSchemaMap<{
  [K in keyof EnviromentVariables]: unknown
}> = {
  DATABASE_URL: Joi.string(),
  JWT_SECRET: Joi.string(),
}

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env.dev', '.env'],
      validationSchema: Joi.object(configValidtionSchema),
      isGlobal: true,
    }),
    DatabaseModule,
    UsersModule,
    AuthModule,
    ProjectsModule,
    SeedingModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
