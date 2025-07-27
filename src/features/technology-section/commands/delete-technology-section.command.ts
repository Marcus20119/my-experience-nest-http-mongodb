import { BadRequestException } from '@nestjs/common'
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { InjectConnection, InjectModel } from '@nestjs/mongoose'
import { Connection, Model } from 'mongoose'

import { SyncAction } from '@/common/enums'
import { t } from '@/common/utils'
import { KnowledgeGroup, KnowledgeItem, Technology, TechnologySection } from '@/db/entities'
import { S3Service } from '@/services/aws/s3/s3.service'

import { BaseTechnologySectionCommand } from './base-technology-section.command'

export class DeleteTechnologySectionCommand {
  constructor(public readonly id: string) {}
}

@CommandHandler(DeleteTechnologySectionCommand)
export class DeleteTechnologySectionCommandHandler
  extends BaseTechnologySectionCommand
  implements ICommandHandler<DeleteTechnologySectionCommand>
{
  constructor(
    @InjectModel(TechnologySection.name)
    protected readonly technologySectionModel: Model<TechnologySection>,
    @InjectModel(Technology.name)
    protected readonly technologyModel: Model<Technology>,
    @InjectModel(KnowledgeGroup.name)
    protected readonly knowledgeGroupModel: Model<KnowledgeGroup>,
    @InjectModel(KnowledgeItem.name)
    protected readonly knowledgeItemModel: Model<KnowledgeItem>,
    protected readonly s3Service: S3Service,
    @InjectConnection()
    private readonly connection: Connection,
  ) {
    super(technologyModel, knowledgeGroupModel, knowledgeItemModel)
  }

  async execute(command: DeleteTechnologySectionCommand): Promise<void> {
    const session = await this.connection.startSession()
    session.startTransaction()

    try {
      // Step 1: Check if the section exists
      const technologySection = await this.technologySectionModel.findById(command.id)

      if (!technologySection) {
        throw new BadRequestException(t('message.technologySection.notFound'))
      }

      // Step 2: Fetch associated technologies and knowledgeItems
      const technologies = await this.technologyModel
        .find({ technologySectionId: command.id })
        .session(session)
      const knowledgeItems = await this.knowledgeItemModel
        .find({ technologySectionId: command.id })
        .session(session)

      // Step 3: Extract removedIconFileKeys from associated technologies and knowledgeItems
      let removedIconFileKeys: string[] = []

      const technologyIconFileKeys = technologies
        .map((t) => t.iconFileKey)
        .filter((url): url is string => !!url)
      const knowledgeItemIconFileKeys = knowledgeItems
        .map((k) => k.iconFileKey)
        .filter((url): url is string => !!url)
      const knowledgeItemImageFileKeys = knowledgeItems
        .flatMap((k) => k.imageFileKeys)
        .filter((url): url is string => !!url)

      removedIconFileKeys = [
        ...removedIconFileKeys,
        ...technologyIconFileKeys,
        ...knowledgeItemIconFileKeys,
        ...knowledgeItemImageFileKeys,
      ]

      // Step 4: Delete related documents
      await this.syncData({
        session,
        syncAction: SyncAction.Delete,
        technologySection,
      })

      // Step 5: Delete the section itself
      await this.technologySectionModel.findByIdAndDelete(command.id).session(session)

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
