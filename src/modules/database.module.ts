import path from 'node:path'

import { Global, Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { APP_ENV } from '@/common/constants'
import { config } from '@/config'
import { TechnologySection, TechnologySectionSchema } from '@/db/entities'

@Global()
@Module({
  exports: [MongooseModule],
  imports: [
    MongooseModule.forRoot(config.mongo.url, {
      autoIndex: true,
      retryAttempts: Number.MAX_VALUE, // Never stop trying to reconnect
      retryDelay: 500, // Reconnect every 500ms
      retryWrites: false,
      tlsCAFile:
        config.app.env === APP_ENV.RELEASE
          ? path.join(__dirname, '..', 'db', 'global-bundle.pem')
          : undefined,
    }),
    MongooseModule.forFeature([{ name: TechnologySection.name, schema: TechnologySectionSchema }]),
  ],
})
export class DatabaseModule {}
