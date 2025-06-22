import { BadRequestException } from '@nestjs/common'
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'

import { t } from '@/common/utils'
import { TechnologySection } from '@/db/entities'

export class DeleteTechnologySectionCommand {
  constructor(public readonly id: string) {}
}

@CommandHandler(DeleteTechnologySectionCommand)
export class DeleteTechnologySectionHandler
  implements ICommandHandler<DeleteTechnologySectionCommand>
{
  constructor(
    @InjectModel(TechnologySection.name)
    private readonly technologySectionModel: Model<TechnologySection>,
  ) {}

  async execute(command: DeleteTechnologySectionCommand): Promise<void> {
    const technologySection = await this.technologySectionModel.findById(command.id)

    if (!technologySection) {
      throw new BadRequestException(t('message.technologySection.notFound'))
    }

    await this.technologySectionModel.findByIdAndDelete(command.id)
  }
}
