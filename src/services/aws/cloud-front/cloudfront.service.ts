import {
  CloudFrontClient,
  CreateInvalidationCommand,
  CreateInvalidationCommandInput,
} from '@aws-sdk/client-cloudfront'
import { getSignedUrl as getCloudFrontSignedUrl } from '@aws-sdk/cloudfront-signer'
import { Injectable } from '@nestjs/common'

import { config } from '@/config'

import { S3Service } from '../s3/s3.service'

@Injectable()
export class CloudfrontService {
  constructor(private readonly s3Service: S3Service) {}

  client = new CloudFrontClient({
    credentials: {
      accessKeyId: config.aws.accessKeyId,
      secretAccessKey: config.aws.secretAccessKey,
    },
    region: config.aws.region,
  })

  getSignedUrl(fileKey?: string): string | undefined {
    if (!fileKey) return undefined

    const { bucketType, key } = this.s3Service.decodeFileKey(fileKey)

    if (!bucketType || !key) return undefined

    const domain = config.aws.cloudfront.domain[bucketType]

    if (!domain) return undefined

    const url = `${domain}/${key}`

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

  async invalidateCache(fileKeys: string[]): Promise<void> {
    if (!fileKeys.length) return

    // Group paths by distribution
    const distributionMap: Record<string, string[]> = {}

    for (const fileKey of fileKeys) {
      const { bucketType, key } = this.s3Service.decodeFileKey(fileKey)
      if (!bucketType || !key) continue

      const distributionId = config.aws.cloudfront.distributionId[bucketType]
      if (!distributionId) continue

      if (!distributionMap[distributionId]) {
        distributionMap[distributionId] = []
      }

      distributionMap[distributionId].push(`/${key}`)
    }

    // Invalidate by distribution
    for (const [distributionId, paths] of Object.entries(distributionMap)) {
      const input: CreateInvalidationCommandInput = {
        DistributionId: distributionId,
        InvalidationBatch: {
          CallerReference: `${Date.now()}`,
          Paths: {
            Items: paths,
            Quantity: paths.length,
          },
        },
      }

      const command = new CreateInvalidationCommand(input)
      await this.client.send(command)
    }
  }
}
