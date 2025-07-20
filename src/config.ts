import 'dotenv/config'

import { APP_ENV } from '@/common/constants'

import { BucketType } from './common/enums'

export const config = {
  app: {
    adminEndpoint: process.env.ADMIN_WEB_URL,
    env: process.env.APP_ENV ?? APP_ENV.LOCAL,
    logLevel: process.env.APP_LOG_LEVEL ?? 'info',
    port: Number(process.env.APP_PORT ?? 3000),
  },
  aws: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    cloudfront: {
      distributionId: {
        [BucketType.PRIVATE]: process.env.AWS_CLOUDFRONT_PRIVATE_DISTRIBUTION_ID!,
        [BucketType.PUBLIC]: process.env.AWS_CLOUDFRONT_PUBLIC_DISTRIBUTION_ID!,
      },
      domain: {
        [BucketType.PRIVATE]: process.env.AWS_CLOUDFRONT_PRIVATE_DISTRIBUTION_DOMAIN,
        [BucketType.PUBLIC]: process.env.AWS_CLOUDFRONT_PUBLIC_DISTRIBUTION_DOMAIN,
      },
      keyPairId: process.env.AWS_CLOUDFRONT_KEY_PAIR_ID ?? '',
      privateKey: process.env.AWS_CLOUDFRONT_PRIVATE_KEY?.replace(/\\n/g, '\n') ?? '',
      signUrlExpiration: Number(process.env.AWS_CLOUDFRONT_SIGN_URL_EXPIRATION ?? 900), // 15 minutes
    },
    region: process.env.AWS_REGION ?? 'ap-southeast-1',
    s3: {
      bucket: {
        [BucketType.PRIVATE]: process.env.AWS_S3_PRIVATE_BUCKET!,
        [BucketType.PUBLIC]: process.env.AWS_S3_PUBLIC_BUCKET!,
      },
      preSignUrlExpiration: Number(process.env.AWS_S3_PRE_SIGN_URL_EXPIRATION ?? 900), // 15 minutes,
    },
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
  mongo: {
    url: process.env.MONGO_URL!,
  },
}
