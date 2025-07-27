import { BadRequestException } from '@nestjs/common'
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { InjectConnection, InjectModel } from '@nestjs/mongoose'
import { Connection, Model } from 'mongoose'

import { SyncAction } from '@/common/enums'
import { convertSlug, t } from '@/common/utils'
import { KnowledgeGroup, KnowledgeItem, Technology, TechnologySection } from '@/db/entities'
import { CloudfrontService } from '@/services/aws/cloud-front/cloudfront.service'
import { S3Service } from '@/services/aws/s3/s3.service'

import { TechnologyResponse } from '../core/interfaces/technology.interface'
import { BaseTechnologyCommand } from './base-technology.command'
import { CreateTechnologyInput } from './create-technology.command'

export class UpdateTechnologyInput extends CreateTechnologyInput {}

export class UpdateTechnologyCommand {
  constructor(
    public readonly id: string,
    public readonly input: UpdateTechnologyInput,
  ) {}
}

@CommandHandler(UpdateTechnologyCommand)
export class UpdateTechnologyCommandHandler
  extends BaseTechnologyCommand
  implements ICommandHandler<UpdateTechnologyCommand>
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

  async execute(command: UpdateTechnologyCommand): Promise<TechnologyResponse> {
    const { id, input } = command
    const {
      color1,
      color2,
      color3,
      description,
      iconFileKey,
      iconName,
      iconType,
      name,
      rate,
      technologySectionId,
      technologyType,
    } = input

    const session = await this.connection.startSession()
    session.startTransaction()

    try {
      // Step 1: Verify icon
      this.verifyIcon(input)

      // Step 2: Check uniqueness
      const existedTechnology = await this.technologyModel
        .findOne({
          $or: [{ name }, { slug: convertSlug(name) }],
          _id: { $ne: id },
          technologySectionId,
        })
        .session(session)

      if (existedTechnology) {
        throw new BadRequestException(t('message.technology.existed'))
      }

      // Step 3: Check if the technology section exists
      if (technologySectionId) {
        const technologySection = await this.technologySectionModel
          .findById(input.technologySectionId)
          .session(session)

        if (!technologySection) {
          throw new BadRequestException(t('message.technologySection.notFound'))
        }

        if (technologySection.technologyType !== technologyType) {
          throw new BadRequestException(t('message.technology.technologyTypeNotMatch'))
        }
      }

      // Step 4: Check if the technology exists and update it
      const oldTechnology = await this.technologyModel.findById(id).session(session)

      const copyIconFileKey = await this.s3Service.copyObjectFromTempToAsset(iconFileKey)
      const newTechnology = await this.technologyModel.findOneAndUpdate(
        { _id: id },
        {
          color1,
          color2,
          color3,
          description,
          iconFileKey: copyIconFileKey,
          iconName,
          iconType,
          name,
          rate,
          search: convertSlug(name),
          slug: convertSlug(name),
          technologySectionId,
          technologyType,
        },
        { new: true, session },
      )

      if (!newTechnology || !oldTechnology) {
        throw new BadRequestException(t('message.technology.notFound'))
      }

      // Step 5: Sync data to related documents
      await this.syncData({
        newTechnology,
        oldTechnology,
        session,
        syncAction: SyncAction.Update,
      })

      // 🧹 Step 6: Cleanup S3 if the iconFileKey is updated
      if (oldTechnology?.iconFileKey !== iconFileKey && oldTechnology?.iconFileKey) {
        await this.s3Service.deleteFile(oldTechnology?.iconFileKey)
      }

      await session.commitTransaction()
      return new TechnologyResponse(newTechnology, this.cloudfrontService)
    } catch (error) {
      await session.abortTransaction()
      throw error
    } finally {
      session.endSession()
    }
  }
}
