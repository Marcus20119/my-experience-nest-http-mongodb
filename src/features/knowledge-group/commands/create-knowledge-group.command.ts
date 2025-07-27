import { BadRequestException } from '@nestjs/common'
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { InjectConnection, InjectModel } from '@nestjs/mongoose'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsMongoId, IsNotEmpty, IsOptional, ValidateNested } from 'class-validator'
import { Connection, Model } from 'mongoose'

import { SyncAction } from '@/common/enums'
import { DisplayName } from '@/common/interfaces'
import { Maybe } from '@/common/types'
import { convertSlug, joinDisplayName, t } from '@/common/utils'
import { KnowledgeGroup, KnowledgeItem, Technology } from '@/db/entities'

import { KnowledgeGroupResponse } from '../core/interfaces/knowledge-group.interface'
import { BaseKnowledgeGroupCommand } from './base-knowledge-group.command'

export class CreateKnowledgeGroupInput {
  @ApiProperty({
    type: DisplayName,
  })
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => DisplayName)
  name: DisplayName

  @ApiPropertyOptional({
    nullable: true,
    type: String,
  })
  @IsOptional()
  description: Maybe<string>

  @ApiProperty({
    type: String,
  })
  @IsNotEmpty()
  @IsMongoId()
  technologyId: string
}

export class CreateKnowledgeGroupCommand {
  constructor(public readonly input: CreateKnowledgeGroupInput) {}
}

@CommandHandler(CreateKnowledgeGroupCommand)
export class CreateKnowledgeGroupCommandHandler
  extends BaseKnowledgeGroupCommand
  implements ICommandHandler<CreateKnowledgeGroupCommand>
{
  constructor(
    @InjectModel(KnowledgeGroup.name)
    protected readonly knowledgeGroupModel: Model<KnowledgeGroup>,
    @InjectModel(Technology.name)
    protected readonly technologyModel: Model<Technology>,
    @InjectModel(KnowledgeItem.name)
    protected readonly knowledgeItemModel: Model<KnowledgeItem>,
    @InjectConnection()
    private readonly connection: Connection,
  ) {
    super(technologyModel, knowledgeItemModel)
  }

  async execute(command: CreateKnowledgeGroupCommand): Promise<KnowledgeGroupResponse> {
    const { input } = command
    const { description, name, technologyId } = input

    const session = await this.connection.startSession()
    session.startTransaction()

    try {
      const slug = convertSlug(name.original)

      // Step 1: Check uniqueness
      const existedKnowledgeGroup = await this.knowledgeGroupModel
        .findOne({
          $or: [{ 'name.original': name.original }, { slug }],
          technologyId,
        })
        .session(session)

      if (existedKnowledgeGroup) {
        throw new BadRequestException(t('message.knowledgeGroup.existed'))
      }

      // Step 2: Check if the section exists
      const technology = await this.technologyModel.findById(technologyId).session(session)

      if (!technology) {
        throw new BadRequestException(t('message.technology.notFound'))
      }

      // Step 3: Create knowledge group
      const knowledgeGroup = new this.knowledgeGroupModel({
        description,
        name,
        search: convertSlug(joinDisplayName(name)),
        technologyId: technology._id,
        technologySectionId: technology.technologySectionId,
        technologyType: technology.technologyType,
      })

      await knowledgeGroup.save({ session })

      // Step 4: Sync data to related documents
      await this.syncData({
        knowledgeGroup,
        session,
        syncAction: SyncAction.Create,
      })

      await session.commitTransaction()
      return new KnowledgeGroupResponse(knowledgeGroup)
    } catch (error) {
      await session.abortTransaction()
      throw error
    } finally {
      session.endSession()
    }
  }
}
