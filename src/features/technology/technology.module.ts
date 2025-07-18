import { Module } from '@nestjs/common'

import { CloudfrontModule } from '@/services/aws/cloud-front/cloudfront.module'
import { S3Module } from '@/services/aws/s3/s3.module'

import { CreateTechnologyCommandHandler } from './commands/create-technology.command'
import { DeleteTechnologyCommandHandler } from './commands/delete-technology.command'
import { UpdateTechnologyCommandHandler } from './commands/update-technology.command'
import { TechnologyController } from './controllers/technology.controller'
import { DetailTechnologyQueryHandler } from './queries/detail-technology.query'
import { ListTechnologyQueryHandler } from './queries/list-technology.query'

@Module({
  controllers: [TechnologyController],
  imports: [S3Module, CloudfrontModule],
  providers: [
    ListTechnologyQueryHandler,
    DetailTechnologyQueryHandler,
    CreateTechnologyCommandHandler,
    UpdateTechnologyCommandHandler,
    DeleteTechnologyCommandHandler,
  ],
})
export class TechnologyModule {}
