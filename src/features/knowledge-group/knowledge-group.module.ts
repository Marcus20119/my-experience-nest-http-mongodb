import { Module } from '@nestjs/common'

import { CloudfrontModule } from '@/services/aws/cloud-front/cloudfront.module'
import { S3Module } from '@/services/aws/s3/s3.module'

import { CreateKnowledgeGroupCommandHandler } from './commands/create-knowledge-group.command'
import { DeleteKnowledgeGroupCommandHandler } from './commands/delete-knowledge-group.command'
import { UpdateKnowledgeGroupCommandHandler } from './commands/update-knowledge-group.command'
import { KnowledgeGroupController } from './controllers/knowledge-group.controller'
import { DetailKnowledgeGroupQueryHandler } from './queries/detail-knowledge-group.query'
import { ListKnowledgeGroupQueryHandler } from './queries/list-knowledge-group.query'

@Module({
  controllers: [KnowledgeGroupController],
  imports: [S3Module, CloudfrontModule],
  providers: [
    // Queries
    ListKnowledgeGroupQueryHandler,
    DetailKnowledgeGroupQueryHandler,

    // Commands
    CreateKnowledgeGroupCommandHandler,
    UpdateKnowledgeGroupCommandHandler,
    DeleteKnowledgeGroupCommandHandler,
  ],
})
export class KnowledgeGroupModule {}
