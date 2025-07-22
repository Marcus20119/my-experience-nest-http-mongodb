import { BadRequestException } from '@nestjs/common'
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { InjectConnection, InjectModel } from '@nestjs/mongoose'
import { OmitType, PartialType } from '@nestjs/swagger'
import { Connection, Model } from 'mongoose'

import { convertSlug, joinDisplayName, t } from '@/common/utils'
import { KnowledgeGroup, Technology } from '@/db/entities'

import { KnowledgeGroupResponse } from '../core/interfaces/knowledge-group.interface'
import { BaseKnowledgeGroupCommand } from './base-knowledge-group.command'
import { CreateKnowledgeGroupInput } from './create-knowledge-group.command'

export class UpdateKnowledgeGroupInput extends PartialType(
  OmitType(CreateKnowledgeGroupInput, ['technologyId'] as const),
) {}

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
    @InjectConnection()
    private readonly connection: Connection,
  ) {
    super(technologyModel)
  }

  async execute(command: UpdateKnowledgeGroupCommand): Promise<KnowledgeGroupResponse> {
    const { id, input } = command
    const { description, name } = input

    const session = await this.connection.startSession()
    session.startTransaction()

    try {
      const knowledgeGroup = await this.knowledgeGroupModel.findOneAndUpdate(
        { _id: id },
        {
          description,
          name,
          search: name ? convertSlug(joinDisplayName(name)) : undefined,
        },
        { new: true, session },
      )

      if (!knowledgeGroup) {
        throw new BadRequestException(t('message.knowledgeGroup.notFound'))
      }

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
