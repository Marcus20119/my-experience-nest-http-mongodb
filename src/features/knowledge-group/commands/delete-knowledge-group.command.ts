import { BadRequestException } from '@nestjs/common'
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { InjectConnection, InjectModel } from '@nestjs/mongoose'
import { Connection, Model } from 'mongoose'

import { SyncAction } from '@/common/enums'
import { t } from '@/common/utils'
import { KnowledgeGroup, Technology } from '@/db/entities'

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
    @InjectConnection()
    private readonly connection: Connection,
  ) {
    super(technologyModel)
  }

  async execute(command: DeleteKnowledgeGroupCommand): Promise<void> {
    const session = await this.connection.startSession()
    session.startTransaction()

    try {
      const knowledgeGroup = await this.knowledgeGroupModel.findById(command.id).session(session)

      if (!knowledgeGroup) {
        throw new BadRequestException(t('message.knowledgeGroup.notFound'))
      }

      await this.syncKnowledgeGroupInfo({
        knowledgeGroup,
        session,
        syncAction: SyncAction.Delete,
      })
      await this.knowledgeGroupModel.findByIdAndDelete(command.id).session(session)
      await session.commitTransaction()
    } catch (error) {
      await session.abortTransaction()
      throw error
    } finally {
      session.endSession()
    }
  }
}
