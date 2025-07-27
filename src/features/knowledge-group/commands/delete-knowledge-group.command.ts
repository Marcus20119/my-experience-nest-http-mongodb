import { BadRequestException } from '@nestjs/common'
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { InjectConnection, InjectModel } from '@nestjs/mongoose'
import { Connection, Model } from 'mongoose'

import { SyncAction } from '@/common/enums'
import { t } from '@/common/utils'
import { KnowledgeGroup, KnowledgeItem, Technology } from '@/db/entities'
import { S3Service } from '@/services/aws/s3/s3.service'

import { BaseKnowledgeGroupCommand } from './base-knowledge-group.command'

export class DeleteKnowledgeGroupCommand {
  constructor(public readonly id: string) {}
}

@CommandHandler(DeleteKnowledgeGroupCommand)
export class DeleteKnowledgeGroupCommandHandler
  extends BaseKnowledgeGroupCommand
  implements ICommandHandler<DeleteKnowledgeGroupCommand>
{
  constructor(
    @InjectModel(KnowledgeGroup.name)
    protected readonly knowledgeGroupModel: Model<KnowledgeGroup>,
    @InjectModel(Technology.name)
    protected readonly technologyModel: Model<Technology>,
    @InjectModel(KnowledgeItem.name)
    protected readonly knowledgeItemModel: Model<KnowledgeItem>,
    protected readonly s3Service: S3Service,
    @InjectConnection()
    private readonly connection: Connection,
  ) {
    super(technologyModel, knowledgeItemModel)
  }

  async execute(command: DeleteKnowledgeGroupCommand): Promise<void> {
    const session = await this.connection.startSession()
    session.startTransaction()

    try {
      // Step 1: Check if the knowledge group exists
      const knowledgeGroup = await this.knowledgeGroupModel.findById(command.id).session(session)

      if (!knowledgeGroup) {
        throw new BadRequestException(t('message.knowledgeGroup.notFound'))
      }

      // Step 2: Fetch associated  knowledgeItems
      const knowledgeItems = await this.knowledgeItemModel
        .find({ knowledgeGroupId: command.id })
        .session(session)

      // Step 3: Extract iconFileKeys (file keys) from associated knowledgeItems
      let removedIconFileKeys: string[] = []

      const knowledgeItemIconFileKeys = knowledgeItems
        .map((k) => k.iconFileKey)
        .filter((url): url is string => !!url)
      const knowledgeItemImageFileKeys = knowledgeItems
        .flatMap((k) => k.imageFileKeys)
        .filter((url): url is string => !!url)

      removedIconFileKeys = [
        ...removedIconFileKeys,
        ...knowledgeItemIconFileKeys,
        ...knowledgeItemImageFileKeys,
      ]

      // Step 4: Delete related documents
      await this.syncData({
        knowledgeGroup,
        session,
        syncAction: SyncAction.Delete,
      })

      // Step 5: Delete the knowledge group itself
      await this.knowledgeGroupModel.findByIdAndDelete(command.id).session(session)

      // 🧹 Step 6: Cleanup S3 for deleted documents
      if (removedIconFileKeys.length > 0) {
        await this.s3Service.deleteFiles(removedIconFileKeys)
      }

      await session.commitTransaction()
    } catch (error) {
      await session.abortTransaction()
      throw error
    } finally {
      session.endSession()
    }
  }
}
