import { Module } from '@nestjs/common'

import { CreatePresignedUrlCommandHandler } from './commands/create-presigned-url.command'
import { S3Controller } from './controllers/s3.controller'
import { S3Service } from './s3.service'

@Module({
  controllers: [S3Controller],
  exports: [S3Service],
  providers: [S3Service, CreatePresignedUrlCommandHandler],
})
export class S3Module {}
