import { BadRequestException } from '@nestjs/common'
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'

import { SyncAction } from '@/common/enums'
import { t } from '@/common/utils'
import { Technology, TechnologySection } from '@/db/entities'

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
  ) {
    super(technologySectionModel)
  }

  async execute(command: DeleteTechnologyCommand): Promise<void> {
    const technology = await this.technologyModel.findById(command.id)

    if (!technology) {
      throw new BadRequestException(t('message.technology.notFound'))
    }

    await this.syncTechnologySectionInfo({
      syncAction: SyncAction.DELETE,
      technology,
      technologySectionId: technology.technologySectionId,
    })
    await this.technologyModel.findByIdAndDelete(command.id)
  }
}
