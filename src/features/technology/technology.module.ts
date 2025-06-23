import { Module } from '@nestjs/common'

import { TechnologyController } from './controllers/technology.controller'
import { DetailTechnologyQueryHandler } from './queries/detail-technology.query'
import { ListTechnologyQueryHandler } from './queries/list-technology.query'

@Module({
  controllers: [TechnologyController],
  providers: [ListTechnologyQueryHandler, DetailTechnologyQueryHandler],
})
export class TechnologyModule {}
