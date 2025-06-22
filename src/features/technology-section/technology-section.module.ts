import { Module } from '@nestjs/common'

import { CreateTechnologySectionHandler } from './commands/create-technology-section.command'
import { DeleteTechnologySectionHandler } from './commands/delete-technology-section.command'
import { UpdateTechnologySectionHandler } from './commands/update-technology-section.command'
import { TechnologySectionController } from './controllers/technology-section.controller'
import { DetailTechnologySectionQueryHandler } from './queries/detail-technology-section.query'
import { ListTechnologySectionQueryHandler } from './queries/list-technology-section.query'

@Module({
  controllers: [TechnologySectionController],
  providers: [
    ListTechnologySectionQueryHandler,
    DetailTechnologySectionQueryHandler,
    CreateTechnologySectionHandler,
    UpdateTechnologySectionHandler,
    DeleteTechnologySectionHandler,
  ],
})
export class TechnologySectionModule {}
