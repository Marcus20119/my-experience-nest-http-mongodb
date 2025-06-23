import { INestApplication } from '@nestjs/common'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'

import { API_VERSION, APP_ENV } from '@/common/constants'
import { config } from '@/config'
import { TechnologyModule } from '@/features/technology/technology.module'
import { TechnologySectionModule } from '@/features/technology-section/technology-section.module'

import { version } from '../../../../package.json'

export function swaggerSetup(app: INestApplication) {
  const commonConfig = new DocumentBuilder()
    .setTitle('Base API Service')
    .setVersion(version)
    .addServer(API_VERSION)
    .addBearerAuth()
    .build()

  const globalDocument = SwaggerModule.createDocument(app, commonConfig, {
    ignoreGlobalPrefix: true,
  })

  const technologyDocument = SwaggerModule.createDocument(app, commonConfig, {
    ignoreGlobalPrefix: true,
    include: [TechnologySectionModule, TechnologyModule],
  })

  const httpAdapter = app.getHttpAdapter()

  httpAdapter.get('/technology-docs-json', (request, response) => {
    return response.send(technologyDocument)
  })

  SwaggerModule.setup('docs', app, globalDocument, {
    explorer: true,
    swaggerOptions: {
      urls: [
        {
          name: 'Technology Module',
          url: '/technology-docs-json',
        },
      ],
    },
    swaggerUiEnabled: config.app.env !== APP_ENV.RELEASE,
  })
}
