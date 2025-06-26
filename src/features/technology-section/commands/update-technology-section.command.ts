import { BadRequestException } from '@nestjs/common'
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { InjectModel } from '@nestjs/mongoose'
import { PartialType } from '@nestjs/swagger'
import { Model } from 'mongoose'

import { convertSlug, joinDisplayName, t } from '@/common/utils'
import { TechnologySection } from '@/db/entities'

import { TechnologySectionResponse } from '../core/interfaces/technology-section.interface'
import { CreateTechnologySectionInput } from './create-technology-section.command'

export class UpdateTechnologySectionInput extends PartialType(CreateTechnologySectionInput) {}

export class UpdateTechnologySectionCommand {
  constructor(
    public readonly id: string,
    public readonly input: UpdateTechnologySectionInput,
  ) {}
}

@CommandHandler(UpdateTechnologySectionCommand)
export class UpdateTechnologySectionCommandHandler
  implements ICommandHandler<UpdateTechnologySectionCommand>
{
  constructor(
    @InjectModel(TechnologySection.name)
    private readonly technologySectionModel: Model<TechnologySection>,
  ) {}

  async execute(command: UpdateTechnologySectionCommand): Promise<TechnologySectionResponse> {
    const { id, input } = command
    const { name, technologyType } = input

    if (name) {
      const existedTechnologySection = await this.technologySectionModel.findOne({
        'name.original': name.original,
        technologyType,
      })

      if (existedTechnologySection) {
        throw new BadRequestException(t('message.technologySection.existed'))
      }
    }

    const updatedTechnologySection = await this.technologySectionModel.findOneAndUpdate(
      { _id: id },
      {
        name,
        slug: name ? convertSlug(joinDisplayName(name)) : undefined,
        technologyType,
      },
      { new: true },
    )

    if (!updatedTechnologySection) {
      throw new BadRequestException(t('message.technologySection.notFound'))
    }

    return new TechnologySectionResponse(updatedTechnologySection)
  }
}
