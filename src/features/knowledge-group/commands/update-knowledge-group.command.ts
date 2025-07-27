import { BadRequestException } from '@nestjs/common'
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { InjectConnection, InjectModel } from '@nestjs/mongoose'
import { OmitType } from '@nestjs/swagger'
import { Connection, Model } from 'mongoose'

import { SyncAction } from '@/common/enums'
import { convertSlug, joinDisplayName, t } from '@/common/utils'
import { KnowledgeGroup, KnowledgeItem, Technology } from '@/db/entities'

import { KnowledgeGroupResponse } from '../core/interfaces/knowledge-group.interface'
import { BaseKnowledgeGroupCommand } from './base-knowledge-group.command'
import { CreateKnowledgeGroupInput } from './create-knowledge-group.command'

export class UpdateKnowledgeGroupInput extends OmitType(CreateKnowledgeGroupInput, [
  'technologyId',
] as const) {}

export class UpdateKnowledgeGroupCommand {
  constructor(
    public readonly id: string,
    public readonly input: UpdateKnowledgeGroupInput,
  ) {}
}

@CommandHandler(UpdateKnowledgeGroupCommand)
export class UpdateKnowledgeGroupCommandHandler
  extends BaseKnowledgeGroupCommand
  implements ICommandHandler<UpdateKnowledgeGroupCommand>
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

  async execute(command: UpdateKnowledgeGroupCommand): Promise<KnowledgeGroupResponse> {
    const { id, input } = command
    const { description, name } = input

    const session = await this.connection.startSession()
    session.startTransaction()

    try {
      // Step 1: Check if the knowledge group exists and update it
      const oldKnowledgeGroup = await this.knowledgeGroupModel.findById(id).session(session)
      const newKnowledgeGroup = await this.knowledgeGroupModel.findOneAndUpdate(
        { _id: id },
        {
          description,
          name,
          search: convertSlug(joinDisplayName(name)),
        },
        { new: true, session },
      )

      if (!newKnowledgeGroup || !oldKnowledgeGroup) {
        throw new BadRequestException(t('message.knowledgeGroup.notFound'))
      }

      // Step 2: Check uniqueness (need to check in step 2 to get the knowledgeGroup from step 1)
      const existedTechnology = await this.technologyModel
        .findOne({
          $or: [{ 'name.original': name.original }, { slug: convertSlug(name.original) }],
          _id: { $ne: id },
          technologyId: newKnowledgeGroup.technologyId,
        })
        .session(session)

      if (existedTechnology) {
        throw new BadRequestException(t('message.technology.existed'))
      }

      // Step 3: Sync data to related documents
      await this.syncData({
        newKnowledgeGroup,
        oldKnowledgeGroup,
        session,
        syncAction: SyncAction.Update,
      })

      await session.commitTransaction()
      return new KnowledgeGroupResponse(newKnowledgeGroup)
    } catch (error) {
      await session.abortTransaction()
      throw error
    } finally {
      session.endSession()
    }
  }
}
