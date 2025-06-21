import { Logger } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import type { NestFastifyApplication } from '@nestjs/platform-fastify'
import { FastifyAdapter } from '@nestjs/platform-fastify'
import { useContainer } from 'class-validator'
import { utilities as winstonUtilities, WinstonModule } from 'nest-winston'
import { I18nValidationPipe } from 'nestjs-i18n'
import * as winston from 'winston'

import { API_VERSION, APP_ENV } from '@/common/constants'
import { TransformInterceptor } from '@/common/interceptors'
import { swaggerSetup } from '@/common/libs/swagger'
import { config } from '@/config'

import { name, version } from '../package.json'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter(), {
    cors: { origin: true },
    logger: WinstonModule.createLogger({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.ms(),
        config.app.env === APP_ENV.LOCAL
          ? winstonUtilities.format.nestLike(name, {
              colors: true,
              prettyPrint: true,
            })
          : winston.format.json(),
      ),
      level: config.app.logLevel,
      transports: [new winston.transports.Console()],
    }),
  })

  app.setGlobalPrefix(API_VERSION)
  swaggerSetup(app)

  useContainer(app.select(AppModule), { fallbackOnErrors: true })
  app.useGlobalPipes(
    new I18nValidationPipe({
      enableDebugMessages: config.app.env === APP_ENV.LOCAL,
      transform: true,
      transformOptions: { exposeUnsetFields: false },
      whitelist: true,
    }),
  )

  app.useGlobalInterceptors(new TransformInterceptor())

  await app.listen(process.env.PORT ?? 3000)

  Logger.log(`🚀 API Server version: ${version} running on port ${config.app.port}`, 'Bootstrap')
}
// eslint-disable-next-line unicorn/prefer-top-level-await
bootstrap().catch((error) => console.error(error))
