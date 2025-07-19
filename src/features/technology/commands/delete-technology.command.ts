import { BadRequestException } from '@nestjs/common'
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { InjectConnection, InjectModel } from '@nestjs/mongoose'
import { Connection, Model } from 'mongoose'

import { SyncAction } from '@/common/enums'
import { t } from '@/common/utils'
import { Technology, TechnologySection } from '@/db/entities'
import { CloudfrontService } from '@/services/aws/cloud-front/cloudfront.service'

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
    protected readonly cloudfrontService: CloudfrontService,
    @InjectConnection()
    private readonly connection: Connection,
  ) {
    super(technologySectionModel, cloudfrontService)
  }

  async execute(command: DeleteTechnologyCommand): Promise<void> {
    const session = await this.connection.startSession()
    session.startTransaction()

    try {
      const technology = await this.technologyModel.findById(command.id).session(session)

      if (!technology) {
        throw new BadRequestException(t('message.technology.notFound'))
      }

      await this.syncTechnologySectionInfo({
        session,
        syncAction: SyncAction.Delete,
        technology,
      })
      await this.technologyModel.findByIdAndDelete(command.id).session(session)
      await session.commitTransaction()
    } catch (error) {
      await session.abortTransaction()
      throw error
    } finally {
      session.endSession()
    }
  }
}
