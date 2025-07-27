import { BadRequestException } from '@nestjs/common'
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { InjectConnection, InjectModel } from '@nestjs/mongoose'
import { Connection, Model } from 'mongoose'

import { SyncAction } from '@/common/enums'
import { t } from '@/common/utils'
import { KnowledgeGroup, KnowledgeItem, Technology } from '@/db/entities'
import { CloudfrontService } from '@/services/aws/cloud-front/cloudfront.service'
import { S3Service } from '@/services/aws/s3/s3.service'

import { BaseKnowledgeItemCommand } from './base-knowledge-item.command'

export class DeleteKnowledgeItemCommand {
  constructor(public readonly id: string) {}
}

@CommandHandler(DeleteKnowledgeItemCommand)
export class DeleteKnowledgeItemCommandHandler
  extends BaseKnowledgeItemCommand
  implements ICommandHandler<DeleteKnowledgeItemCommand>
{
  constructor(
    @InjectModel(KnowledgeItem.name)
    protected readonly knowledgeItemModel: Model<KnowledgeItem>,
    @InjectModel(Technology.name)
    protected readonly technologyModel: Model<Technology>,
    @InjectModel(KnowledgeGroup.name)
    protected readonly knowledgeGroupModel: Model<KnowledgeGroup>,
    protected readonly s3Service: S3Service,
    protected readonly cloudfrontService: CloudfrontService,
    @InjectConnection()
    private readonly connection: Connection,
  ) {
    super(knowledgeGroupModel, cloudfrontService)
  }

  async execute(command: DeleteKnowledgeItemCommand): Promise<void> {
    const session = await this.connection.startSession()
    session.startTransaction()
    try {
      // Step 1: Check if the knowledge item exists
      const knowledgeItem = await this.knowledgeItemModel.findById(command.id).session(session)

      if (!knowledgeItem) {
        throw new BadRequestException(t('message.knowledgeItem.notFound'))
      }

      // Step 2: Delete related documents
      if (knowledgeItem.iconFileKey) {
        await this.syncData({
          knowledgeItem,
          session,
          syncAction: SyncAction.Delete,
        })
      }

      // Step 3: Delete knowledge item itself
      await this.knowledgeItemModel.findByIdAndDelete(command.id, { session })

      // 🧹 Step 6: Cleanup S3 for deleted documents
      const removedIconFileKeys: string[] = [
        ...(knowledgeItem.iconFileKey ? [knowledgeItem.iconFileKey] : []),
        ...(knowledgeItem?.imageFileKeys || []),
      ]

      if (removedIconFileKeys.length > 0) {
        await this.s3Service.deleteFiles(removedIconFileKeys)
      }

      await session.commitTransaction()
    } catch (err) {
      await session.abortTransaction()
      throw err
    } finally {
      await session.endSession()
    }
  }
}
