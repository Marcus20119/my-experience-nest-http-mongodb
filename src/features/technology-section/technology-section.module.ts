import { Module } from '@nestjs/common'

import { CreateTechnologySectionCommandHandler } from './commands/create-technology-section.command'
import { DeleteTechnologySectionCommandHandler } from './commands/delete-technology-section.command'
import { UpdateTechnologySectionCommandHandler } from './commands/update-technology-section.command'
import { TechnologySectionController } from './controllers/technology-section.controller'
import { DetailTechnologySectionQueryHandler } from './queries/detail-technology-section.query'
import { ListTechnologySectionQueryHandler } from './queries/list-technology-section.query'

@Module({
  controllers: [TechnologySectionController],
  providers: [
    ListTechnologySectionQueryHandler,
    DetailTechnologySectionQueryHandler,
    CreateTechnologySectionCommandHandler,
    UpdateTechnologySectionCommandHandler,
    DeleteTechnologySectionCommandHandler,
  ],
})
export class TechnologySectionModule {}
