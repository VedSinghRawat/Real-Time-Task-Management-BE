import { Module } from '@nestjs/common'
import { AppService } from './app.service'
import { DatabaseModule } from '../database/database.module'
import { ConfigModule } from '@nestjs/config'
// This has to imported like this ignore the IDE suggestion
import * as Joi from 'joi'
import { EnviromentVariables } from '../interfaces/config'
import { UsersModule } from '../users/users.module'
import { AuthModule } from '../auth/auth.module'
import { ProjectsModule } from '../projects/projects.module'
import { SeedingModule } from 'src/seeding/seeding.module'
import { S3Module } from 'src/s3/s3.module'

const configValidtionSchema: Joi.PartialSchemaMap<{
  [K in keyof EnviromentVariables]: unknown
}> = {
  DATABASE_URL: Joi.string(),
  JWT_SECRET: Joi.string(),
  BUCKET_NAME: Joi.string(),
  AWS_ACCESS_KEY_ID: Joi.string(),
  AWS_SECRET_ACCESS_KEY: Joi.string(),
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
    S3Module,
  ],
  providers: [AppService],
})
export class AppModule {}
