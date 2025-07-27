import { BadRequestException } from '@nestjs/common'
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { InjectConnection, InjectModel } from '@nestjs/mongoose'
import { Connection, Model } from 'mongoose'

import { SyncAction } from '@/common/enums'
import { convertSlug, joinDisplayName, t } from '@/common/utils'
import { KnowledgeGroup, KnowledgeItem, Technology, TechnologySection } from '@/db/entities'

import { TechnologySectionResponse } from '../core/interfaces/technology-section.interface'
import { BaseTechnologySectionCommand } from './base-technology-section.command'
import { CreateTechnologySectionInput } from './create-technology-section.command'

export class UpdateTechnologySectionInput extends CreateTechnologySectionInput {}

export class UpdateTechnologySectionCommand {
  constructor(
    public readonly id: string,
    public readonly input: UpdateTechnologySectionInput,
  ) {}
}

@CommandHandler(UpdateTechnologySectionCommand)
export class UpdateTechnologySectionCommandHandler
  extends BaseTechnologySectionCommand
  implements ICommandHandler<UpdateTechnologySectionCommand>
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
    @InjectConnection()
    private readonly connection: Connection,
  ) {
    super(technologyModel, knowledgeGroupModel, knowledgeItemModel)
  }

  async execute(command: UpdateTechnologySectionCommand): Promise<TechnologySectionResponse> {
    const { id, input } = command
    const { name, technologyType } = input

    const session = await this.connection.startSession()
    session.startTransaction()

    try {
      // Step 1: Check uniqueness
      const existedTechnologySection = await this.technologySectionModel
        .findOne({
          $or: [{ 'name.original': name.original }, { slug: convertSlug(name.original) }],
          _id: { $ne: id },
          technologyType,
        })
        .session(session)

      if (existedTechnologySection) {
        throw new BadRequestException(t('message.technologySection.existed'))
      }

      // Step 2: Check if the technology section exists and update it
      const oldTechnologySection = await this.technologySectionModel.findById(id).session(session)
      const newTechnologySection = await this.technologySectionModel.findOneAndUpdate(
        { _id: id },
        {
          name,
          search: convertSlug(joinDisplayName(name)),
          slug: convertSlug(name.original),
          technologyType,
        },
        { new: true, session },
      )

      if (!oldTechnologySection || !newTechnologySection) {
        throw new BadRequestException(t('message.technologySection.notFound'))
      }

      // Step 3: Sync data to related documents
      await this.syncData({
        newTechnologySection,
        oldTechnologySection,
        session,
        syncAction: SyncAction.Update,
      })

      await session.commitTransaction()
      return new TechnologySectionResponse(oldTechnologySection)
    } catch (error) {
      await session.abortTransaction()
      throw error
    } finally {
      session.endSession()
    }
  }
}
