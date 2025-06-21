import 'dotenv/config'

import { APP_ENV } from '@/common/constants'
import { parseRedisOptionsFromUrl } from '@/common/utils'

export const config = {
  app: {
    adminEndpoint: process.env.ADMIN_WEB_URL,
    env: process.env.APP_ENV ?? APP_ENV.LOCAL,
    logLevel: process.env.APP_LOG_LEVEL ?? 'info',
    port: Number(process.env.APP_PORT ?? 3000),
  },
  aws: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    region: process.env.AWS_REGION ?? 'ap-southeast-1',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    ses: {
      from: process.env.AWS_SES_FROM!,
    },
    sqs: process.env.QUEUE_URL_EXPORT_EXCEL,
  },
  bcrypt: {
    salt: Number.parseInt(process.env.SALT_ROUND as string) || 5,
  },
  fraxionConfig: {
    apiUrl: process.env.FRAXION_API_URL,
    password: process.env.FRAXION_AUTH_PASSWORD as string,
    username: process.env.FRAXION_AUTH_USERNAME as string,
  },
  jwt: {
    accessTokenTtl: Number(process.env.JWT_ACCESS_TOKEN_TTL ?? 5 * 60), //  5 minutes
    refreshTokenTtl: Number(process.env.JWT_REFRESH_TOKEN_TTL ?? 7 * 24 * 60 * 60), // 7 days
    secret: process.env.JWT_SECRET!,
  },
  mongo: {
    url: process.env.MONGO_URL!,
  },
  redis: {
    url: new URL(process.env.REDIS_URL ?? 'redis://localhost:6379/0'),
  },
  sentry: {
    dsn: process.env.SENTRY_DSN,
  },
  worker: {
    apiUrl: process.env.ZONE_CRAWLER_URL,
  },
}

export const redisOptions = parseRedisOptionsFromUrl(config.redis.url)
