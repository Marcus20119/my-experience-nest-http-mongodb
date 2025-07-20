import { Module } from '@nestjs/common'

import { S3Module } from '@/services/aws/s3/s3.module'

import { CreateTechnologySectionCommandHandler } from './commands/create-technology-section.command'
import { DeleteTechnologySectionCommandHandler } from './commands/delete-technology-section.command'
import { UpdateTechnologySectionCommandHandler } from './commands/update-technology-section.command'
import { TechnologySectionController } from './controllers/technology-section.controller'
import { DetailTechnologySectionQueryHandler } from './queries/detail-technology-section.query'
import { ListTechnologySectionQueryHandler } from './queries/list-technology-section.query'
import { TechnologySectionSkeletonQueryHandler } from './queries/technology-section-skeleton.query'

@Module({
  controllers: [TechnologySectionController],
  imports: [S3Module],
  providers: [
    ListTechnologySectionQueryHandler,
    DetailTechnologySectionQueryHandler,
    TechnologySectionSkeletonQueryHandler,
    CreateTechnologySectionCommandHandler,
    UpdateTechnologySectionCommandHandler,
    DeleteTechnologySectionCommandHandler,
  ],
})
export class TechnologySectionModule {}
