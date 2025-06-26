import { Module } from '@nestjs/common'

import { CreateTechnologyCommandHandler } from './commands/create-technology.command'
import { DeleteTechnologyCommandHandler } from './commands/delete-technology.command'
import { TechnologyController } from './controllers/technology.controller'
import { DetailTechnologyQueryHandler } from './queries/detail-technology.query'
import { ListTechnologyQueryHandler } from './queries/list-technology.query'

@Module({
  controllers: [TechnologyController],
  providers: [
    ListTechnologyQueryHandler,
    DetailTechnologyQueryHandler,
    CreateTechnologyCommandHandler,
    DeleteTechnologyCommandHandler,
  ],
})
export class TechnologyModule {}
