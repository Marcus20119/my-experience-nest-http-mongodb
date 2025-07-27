import { Module } from '@nestjs/common'

import { CloudfrontModule } from '@/services/aws/cloud-front/cloudfront.module'
import { S3Module } from '@/services/aws/s3/s3.module'

import { CreateKnowledgeItemCommandHandler } from './commands/create-knowledge-item.command'
import { DeleteKnowledgeItemCommandHandler } from './commands/delete-knowledge-item.command'
import { UpdateKnowledgeItemCommandHandler } from './commands/update-knowledge-item.command'
import { KnowledgeItemController } from './controllers/knowledge-item.controller'
import { DetailKnowledgeItemQueryHandler } from './queries/detail-knowledge-item.query'
import { ListKnowledgeItemQueryHandler } from './queries/list-knowledge-item.query'

@Module({
  controllers: [KnowledgeItemController],
  imports: [S3Module, CloudfrontModule],
  providers: [
    // Queries
    ListKnowledgeItemQueryHandler,
    DetailKnowledgeItemQueryHandler,

    // Commands
    CreateKnowledgeItemCommandHandler,
    UpdateKnowledgeItemCommandHandler,
    DeleteKnowledgeItemCommandHandler,
  ],
})
export class KnowledgeItemModule {}
