import { S3Client } from '@aws-sdk/client-s3'
import { Injectable } from '@nestjs/common'

import { config } from '@/config'
import { BucketType, FileCategory } from '@/common/enums'

@Injectable()
export class S3Service {
  client = new S3Client({
    credentials: {
      accessKeyId: config.aws.accessKeyId,
      secretAccessKey: config.aws.secretAccessKey,
    },
    region: config.aws.region,
  })

  encodeFileName(name: string): string {
    const parts = name.split('.')
    const [fileName, ext] =
      parts.length > 1 ? [parts.slice(0, -1).join('.'), `.${parts.at(-1)}`] : [name, '']

    return Buffer.from(fileName).toString('base64url') + ext
  }

  getFileKey(bucketType: BucketType, key: string) {
    return `${bucketType}|${key}`
  }

  decodeFileKey = (fileKey: string) => {
    if (!/^\w+\|(.+\/).+$/.test(fileKey)) {
      return { bucketType: undefined, key: undefined, category: undefined }
    }

    const [bucketType, key] = fileKey.split('|')

    return {
      bucketType,
      key,
      category: bucketType === BucketType.PUBLIC ? key.split('/')[0] : key.split('/')[1],
    } as { bucketType: BucketType; key: string; category: FileCategory }
  }
}
