import { BadRequestException } from '@nestjs/common'
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { InjectModel } from '@nestjs/mongoose'
import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsEnum, IsNotEmpty, ValidateNested } from 'class-validator'
import { Model } from 'mongoose'

import { TechnologyType } from '@/common/enums'
import { DisplayName } from '@/common/interfaces'
import { t } from '@/common/utils'
import { TechnologySection } from '@/db/entities'

import { TechnologySectionResponse } from '../core/interfaces/technology-section.interface'

export class UpdateTechnologySectionInput {
  @ApiProperty({
    enum: TechnologyType,
    type: String,
  })
  @IsNotEmpty()
  @IsEnum(TechnologyType)
  type: TechnologyType

  @ApiProperty({
    type: DisplayName,
  })
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => DisplayName)
  name: DisplayName
}

export class UpdateTechnologySectionCommand {
  constructor(
    public readonly id: string,
    public readonly input: UpdateTechnologySectionInput,
  ) {}
}

@CommandHandler(UpdateTechnologySectionCommand)
export class UpdateTechnologySectionHandler
  implements ICommandHandler<UpdateTechnologySectionCommand>
{
  constructor(
    @InjectModel(TechnologySection.name)
    private readonly technologySectionModel: Model<TechnologySection>,
  ) {}

  async execute(command: UpdateTechnologySectionCommand): Promise<TechnologySectionResponse> {
    const { id, input } = command
    const { name, type } = input

    const existedTechnologySection = await this.technologySectionModel.findOne({
      'name.original': name.original,
      type,
    })

    if (existedTechnologySection) {
      throw new BadRequestException(t('message.technologySection.existed'))
    }

    const updatedTechnologySection = await this.technologySectionModel.findOneAndUpdate(
      { _id: id },
      { name, type },
      { new: true },
    )

    if (!updatedTechnologySection) {
      throw new BadRequestException(t('message.technologySection.notFound'))
    }

    return new TechnologySectionResponse(updatedTechnologySection)
  }
}
