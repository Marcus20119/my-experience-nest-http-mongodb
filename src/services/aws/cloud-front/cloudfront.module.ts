import { Module } from '@nestjs/common'

import { S3Module } from '../s3/s3.module'
import { CloudfrontService } from './cloudfront.service'

@Module({
  exports: [CloudfrontService],
  imports: [S3Module],
  providers: [CloudfrontService],
})
export class CloudfrontModule {}
