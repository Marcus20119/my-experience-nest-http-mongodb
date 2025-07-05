import { S3Client } from '@aws-sdk/client-s3'
import { Injectable } from '@nestjs/common'

import { config } from '@/config'

@Injectable()
export class S3Service {
  client = new S3Client({
    credentials: {
      accessKeyId: config.aws.accessKeyId,
      secretAccessKey: config.aws.secretAccessKey,
    },
    region: config.aws.region,
  })
}
