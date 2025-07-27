import { BadRequestException } from '@nestjs/common'
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { InjectConnection, InjectModel } from '@nestjs/mongoose'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsEnum, IsMongoId, IsNotEmpty, IsNumber, IsOptional } from 'class-validator'
import { Connection, Model } from 'mongoose'

import { IsStepInRange } from '@/common/decorators'
import { IconType, SyncAction } from '@/common/enums'
import { Maybe } from '@/common/types'
import { convertSlug, t } from '@/common/utils'
import { KnowledgeGroup, KnowledgeItem, Technology } from '@/db/entities'
import { CloudfrontService } from '@/services/aws/cloud-front/cloudfront.service'
import { S3Service } from '@/services/aws/s3/s3.service'

import { KnowledgeItemResponse } from '../core/interfaces/knowledge-item.interface'
import { BaseKnowledgeItemCommand } from './base-knowledge-item.command'

export class CreateKnowledgeItemInput {
  @ApiProperty({
    type: String,
  })
  @IsNotEmpty()
  name: string

  @ApiProperty({
    enum: IconType,
    enumName: 'IconType',
    type: String,
  })
  @IsNotEmpty()
  @IsEnum(IconType)
  iconType: IconType

  @ApiPropertyOptional({
    nullable: true,
    type: String,
  })
  @IsOptional()
  iconFileKey: Maybe<string>

  @ApiPropertyOptional({
    nullable: true,
    type: String,
  })
  @IsOptional()
  iconName: Maybe<string>

  @ApiProperty({
    type: String,
  })
  @IsNotEmpty()
  color1: string

  @ApiPropertyOptional({
    nullable: true,
    type: String,
  })
  @IsOptional()
  color2: Maybe<string>

  @ApiPropertyOptional({
    nullable: true,
    type: String,
  })
  @IsOptional()
  color3: Maybe<string>

  @ApiPropertyOptional({
    nullable: true,
    type: String,
  })
  @IsOptional()
  content: Maybe<string>

  @ApiPropertyOptional({
    nullable: true,
    type: [String],
  })
  @IsOptional()
  imageFileKeys: Maybe<string[]>

  @ApiProperty({
    maximum: 5,
    minimum: 0,
    type: Number,
  })
  @IsNumber()
  @IsStepInRange(0, 5, 0.5)
  rate: number

  @ApiProperty({
    type: String,
  })
  @IsNotEmpty()
  @IsMongoId()
  technologyId: string

  @ApiPropertyOptional({
    nullable: true,
    type: String,
  })
  @IsOptional()
  @IsMongoId()
  knowledgeGroupId: Maybe<string>
}

export class CreateKnowledgeItemCommand {
  constructor(public input: CreateKnowledgeItemInput) {}
}

@CommandHandler(CreateKnowledgeItemCommand)
export class CreateKnowledgeItemCommandHandler
  extends BaseKnowledgeItemCommand
  implements ICommandHandler<CreateKnowledgeItemCommand>
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

  async execute(command: CreateKnowledgeItemCommand): Promise<KnowledgeItemResponse> {
    const { input } = command
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

    this.verifyIcon(input)

    const session = await this.connection.startSession()
    session.startTransaction()

    try {
      // Step 1: Verify icon
      this.verifyIcon(input)

      const slug = convertSlug(name)

      // Step 2: Check uniqueness
      const existedKnowledgeItem = await this.knowledgeItemModel
        .findOne({
          $or: [{ name }, { slug }],
          knowledgeGroupId,
          technologyId,
        })
        .session(session)

      if (existedKnowledgeItem) {
        throw new BadRequestException(t('message.knowledgeItem.existed'))
      }

      // Step 3: Check if technology exists
      const technology = await this.technologyModel.findById(technologyId).session(session)

      if (!technology) {
        throw new BadRequestException(t('message.technology.notFound'))
      }

      // Step 4: Check if the knowledge group exists
      if (knowledgeGroupId) {
        const knowledgeGroup = await this.knowledgeGroupModel
          .findById(knowledgeGroupId)
          .session(session)

        if (!knowledgeGroup) {
          throw new BadRequestException(t('message.knowledgeGroup.notFound'))
        }
      }

      // Step 5: Create knowledge item
      const copyIconFileKey = await this.s3Service.copyObjectFromTempToAsset(iconFileKey)
      const copyImageFileKeys = imageFileKeys
        ? await Promise.all(
            imageFileKeys.map(async (imageFileKey) =>
              this.s3Service.copyObjectFromTempToAsset(imageFileKey),
            ),
          )
        : []

      const knowledgeItem = new this.knowledgeItemModel({
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
        slug,
        technologyId,
        technologySectionId: technology.technologySectionId,
        technologyType: technology.technologyType,
      })

      await knowledgeItem.save({ session })

      // Step 6: Sync data to related documents
      await this.syncData({
        knowledgeItem,
        session,
        syncAction: SyncAction.Create,
      })

      await session.commitTransaction()
      return new KnowledgeItemResponse(knowledgeItem, this.cloudfrontService)
    } catch (error) {
      await session.abortTransaction()
      throw error
    } finally {
      await session.endSession()
    }
  }
}
