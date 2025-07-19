import { getSignedUrl as getCloudFrontSignedUrl } from '@aws-sdk/cloudfront-signer'
import { Injectable } from '@nestjs/common'

import { config } from '@/config'

import { S3Service } from '../s3/s3.service'

@Injectable()
export class CloudfrontService {
  constructor(private readonly s3Service: S3Service) {}

  getSignedUrl(fileKey?: string): string | undefined {
    if (!fileKey) return undefined

    const { bucketType, key } = this.s3Service.decodeFileKey(fileKey)

    if (!bucketType || !key) {
      // FIX_ME: Handle invalid file key format
      throw new Error('Invalid file key format')
    }

    const distribution = config.aws.cloudfront.distribution[bucketType]

    if (!distribution) {
      // FIX_ME: Handle unsupported bucket type
      throw new Error(`Unsupported bucket type: ${bucketType}`)
    }

    const url = `${distribution}/${key}`

    const policy = {
      Statement: [
        {
          Condition: {
            DateLessThan: {
              'AWS:EpochTime': Math.round(
                Date.now() / 1000 + config.aws.cloudfront.signUrlExpiration,
              ),
            },
          },
          Resource: url,
        },
      ],
    }

    const signedUrl = getCloudFrontSignedUrl({
      keyPairId: config.aws.cloudfront.keyPairId,
      policy: JSON.stringify(policy),
      privateKey: config.aws.cloudfront.privateKey,
      url,
    })

    return `${bucketType}|${key}>${signedUrl}`
  }
}
