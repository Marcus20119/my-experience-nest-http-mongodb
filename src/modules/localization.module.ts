import path from 'node:path'

import { Module } from '@nestjs/common'
import { AcceptLanguageResolver, I18nModule, QueryResolver } from 'nestjs-i18n'

import { APP_ENV } from '@/common/constants'
import { Language } from '@/common/enums'
import { config } from '@/config'

@Module({
  imports: [
    I18nModule.forRoot({
      fallbackLanguage: Language.Vi,
      loaderOptions: {
        path: path.join(__dirname, '../locales/'),
        watch: config.app.env === APP_ENV.LOCAL,
      },
      logging: config.app.env === APP_ENV.LOCAL,
      resolvers: [{ options: ['lang'], use: QueryResolver }, AcceptLanguageResolver],
      throwOnMissingKey: false,
      typesOutputPath:
        config.app.env === APP_ENV.LOCAL
          ? path.join(__dirname, '../../src/generated/i18n.generated.ts')
          : undefined,
    }),
  ],
})
export class LocalizationModule {}
