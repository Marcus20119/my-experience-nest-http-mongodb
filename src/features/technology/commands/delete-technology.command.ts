import { BadRequestException } from '@nestjs/common'
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { InjectConnection, InjectModel } from '@nestjs/mongoose'
import { Connection, Model } from 'mongoose'

import { SyncAction } from '@/common/enums'
import { t } from '@/common/utils'
import { KnowledgeGroup, KnowledgeItem, Technology, TechnologySection } from '@/db/entities'
import { CloudfrontService } from '@/services/aws/cloud-front/cloudfront.service'
import { S3Service } from '@/services/aws/s3/s3.service'

import { BaseTechnologyCommand } from './base-technology.command'

export class DeleteTechnologyCommand {
  constructor(public readonly id: string) {}
}

@CommandHandler(DeleteTechnologyCommand)
export class DeleteTechnologyCommandHandler
  extends BaseTechnologyCommand
  implements ICommandHandler<DeleteTechnologyCommand>
{
  constructor(
    @InjectModel(Technology.name)
    protected readonly technologyModel: Model<Technology>,
    @InjectModel(TechnologySection.name)
    protected readonly technologySectionModel: Model<TechnologySection>,
    @InjectModel(KnowledgeGroup.name)
    protected readonly knowledgeGroupModel: Model<KnowledgeGroup>,
    @InjectModel(KnowledgeItem.name)
    protected readonly knowledgeItemModel: Model<KnowledgeItem>,
    protected readonly cloudfrontService: CloudfrontService,
    protected readonly s3Service: S3Service,
    @InjectConnection()
    private readonly connection: Connection,
  ) {
    super(technologySectionModel, knowledgeGroupModel, knowledgeItemModel, cloudfrontService)
  }

  async execute(command: DeleteTechnologyCommand): Promise<void> {
    const session = await this.connection.startSession()
    session.startTransaction()

    try {
      // Step 1: Check if the technology exists
      const technology = await this.technologyModel.findById(command.id).session(session)

      if (!technology) {
        throw new BadRequestException(t('message.technology.notFound'))
      }

      // Step 2: Fetch associated knowledgeItems
      const knowledgeItems = await this.knowledgeItemModel
        .find({ technologyId: command.id })
        .session(session)

      // Step 3: Extract iconFileKeys (file keys) from associated knowledgeItems and it own iconFileKey
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

      if (technology.iconFileKey) {
        removedIconFileKeys.push(technology.iconFileKey)
      }

      // Step 4: Delete related documents
      await this.syncData({
        session,
        syncAction: SyncAction.Delete,
        technology,
      })

      // Step 5: Delete the technology itself
      await this.technologyModel.findByIdAndDelete(command.id).session(session)

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
