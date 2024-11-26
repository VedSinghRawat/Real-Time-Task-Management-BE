import { Injectable } from '@nestjs/common'
import { S3Client, PutObjectCommand, PutObjectCommandInput, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { ConfigService } from '@nestjs/config'
import { EnviromentVariables } from 'src/interfaces/config'

@Injectable()
export class S3Service {
  private s3Client: S3Client

  constructor(configService: ConfigService<EnviromentVariables>) {
    const accessKeyId = configService.get('AWS_ACCESS_KEY_ID', { infer: true })
    const secretAccessKey = configService.get('AWS_SECRET_ACCESS_KEY', { infer: true })
    if (accessKeyId && secretAccessKey) {
      this.s3Client = new S3Client({ credentials: { accessKeyId, secretAccessKey }, region: 'ap-south-1' })
    } else throw 'No AWS_ACCESS_KEY_ID or AWS_SECRET_ACCESS_KEY found in env'
  }

  async putObject(
    bucket: string,
    key: string,
    body: PutObjectCommandInput['Body'],
    options?: Omit<PutObjectCommandInput, 'Bucket' | 'Key' | 'Body'>
  ) {
    const uploadCommand = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      CacheControl: 'no-cache',
      ...(options || {}),
    })

    await this.s3Client.send(uploadCommand)
  }

  async deleteObject(bucket: string, key: string) {
    const deleteCommand = new DeleteObjectCommand({
      Bucket: bucket,
      Key: key,
    })

    await this.s3Client.send(deleteCommand)
  }
}
