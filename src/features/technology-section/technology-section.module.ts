import { Module } from '@nestjs/common'

import { TechnologySectionController } from './controllers/technology-section.controller'
import { ListTechnologySectionQueryHandler } from './queries/list-technology-section.query'

@Module({
  controllers: [TechnologySectionController],
  providers: [ListTechnologySectionQueryHandler],
})
export class TechnologySectionModule {}
