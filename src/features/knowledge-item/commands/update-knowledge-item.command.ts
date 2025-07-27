import { BadRequestException } from '@nestjs/common'
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { InjectConnection, InjectModel } from '@nestjs/mongoose'
import { PartialType } from '@nestjs/swagger'
import { Connection, Model } from 'mongoose'

import { SyncAction } from '@/common/enums'
import { convertSlug, t } from '@/common/utils'
import { KnowledgeGroup, KnowledgeItem, Technology } from '@/db/entities'
import { CloudfrontService } from '@/services/aws/cloud-front/cloudfront.service'
import { S3Service } from '@/services/aws/s3/s3.service'

import { KnowledgeItemResponse } from '../core/interfaces/knowledge-item.interface'
import { BaseKnowledgeItemCommand } from './base-knowledge-item.command'
import { CreateKnowledgeItemInput } from './create-knowledge-item.command'

export class UpdateKnowledgeItemInput extends PartialType(CreateKnowledgeItemInput) {}

export class UpdateKnowledgeItemCommand {
  constructor(
    public readonly id: string,
    public readonly input: UpdateKnowledgeItemInput,
  ) {}
}

@CommandHandler(UpdateKnowledgeItemCommand)
export class UpdateKnowledgeItemCommandHandler
  extends BaseKnowledgeItemCommand
  implements ICommandHandler<UpdateKnowledgeItemCommand>
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

  async execute(command: UpdateKnowledgeItemCommand): Promise<KnowledgeItemResponse> {
    const { id, input } = command
    const {
      color1,
      color2,
      color3,
      content,
      iconFileKey,
      iconName,
      iconType,
      imageFileKeys,
      knowledgeGroupId,
      name,
      rate,
      technologyId,
    } = input

    const session = await this.connection.startSession()
    session.startTransaction()

    try {
      // Step 1: Verify icon
      this.verifyIcon(input)

      // Step 2: Check if technology exists
      const technology = await this.technologyModel.findById(technologyId).session(session)

      if (!technology) {
        throw new BadRequestException(t('message.technology.notFound'))
      }

      // Step 3: Check uniqueness
      const existedKnowledgeItem = await this.knowledgeItemModel
        .findOne({
          $or: [{ name }, { slug: convertSlug(name) }],
          knowledgeGroupId,
          technologyId: technologyId || technology.id,
        })
        .session(session)

      if (existedKnowledgeItem) {
        throw new BadRequestException(t('message.knowledgeItem.existed'))
      }

      // Step 4: Check if the knowledge item exists and update it
      const oldKnowledgeItem = await this.knowledgeItemModel.findById(id).session(session)

      const copyIconFileKey = await this.s3Service.copyObjectFromTempToAsset(iconFileKey)
      const copyImageFileKeys = imageFileKeys
        ? await Promise.all(
            imageFileKeys.map(async (imageFileKey) =>
              this.s3Service.copyObjectFromTempToAsset(imageFileKey),
            ),
          )
        : []

      const newKnowledgeItem = await this.knowledgeItemModel.findOneAndUpdate(
        { _id: id },
        {
          color1,
          color2,
          color3,
          content,
          iconFileKey: copyIconFileKey,
          iconName,
          iconType,
          imageFileKeys: copyImageFileKeys,
          knowledgeGroupId,
          name,
          rate,
          search: convertSlug(name),
          slug: convertSlug(name),
          technologyId: technology.id,
          technologySectionId: technology.technologySectionId,
          technologyType: technology.technologyType,
        },
        { new: true, session },
      )

      if (!newKnowledgeItem || !oldKnowledgeItem) {
        throw new BadRequestException(t('message.knowledgeItem.notFound'))
      }

      // Step 5: Sync data to related documents
      await this.syncData({
        newKnowledgeItem,
        oldKnowledgeItem,
        session,
        syncAction: SyncAction.Update,
      })

      // 🧹 Step 6: Cleanup S3 if the iconFileKey or imageFileKeys is updated
      if (copyIconFileKey !== iconFileKey && oldKnowledgeItem.iconFileKey) {
        await this.s3Service.deleteFile(oldKnowledgeItem.iconFileKey)
      }
      const removedImageFileKeys = oldKnowledgeItem?.imageFileKeys?.filter(
        (imageFileKey) => !copyImageFileKeys.includes(imageFileKey),
      )
      if (removedImageFileKeys?.length) {
        await this.s3Service.deleteFiles(removedImageFileKeys)
      }

      await session.commitTransaction()
      return new KnowledgeItemResponse(newKnowledgeItem, this.cloudfrontService)
    } catch (error) {
      await session.abortTransaction()
      throw error
    } finally {
      session.endSession()
    }
  }
}
