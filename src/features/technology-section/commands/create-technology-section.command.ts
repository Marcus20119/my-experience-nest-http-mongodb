import { BadRequestException } from '@nestjs/common'
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { InjectModel } from '@nestjs/mongoose'
import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsEnum, IsNotEmpty, ValidateNested } from 'class-validator'
import { Model } from 'mongoose'

import { TechnologyType } from '@/common/enums'
import { DisplayName } from '@/common/interfaces'
import { convertSlug, joinDisplayName, t } from '@/common/utils'
import { TechnologySection } from '@/db/entities'

import { TechnologySectionResponse } from '../core/interfaces/technology-section.interface'

export class CreateTechnologySectionInput {
  @ApiProperty({
    enum: TechnologyType,
    enumName: 'TechnologyType',
    type: String,
  })
  @IsNotEmpty()
  @IsEnum(TechnologyType)
  technologyType: TechnologyType

  @ApiProperty({
    type: DisplayName,
  })
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => DisplayName)
  name: DisplayName
}

export class CreateTechnologySectionCommand {
  constructor(public input: CreateTechnologySectionInput) {}
}

@CommandHandler(CreateTechnologySectionCommand)
export class CreateTechnologySectionCommandHandler
  implements ICommandHandler<CreateTechnologySectionCommand>
{
  constructor(
    @InjectModel(TechnologySection.name)
    readonly technologySectionModel: Model<TechnologySection>,
  ) {}

  async execute(command: CreateTechnologySectionCommand): Promise<TechnologySectionResponse> {
    const { input } = command
    const { name, technologyType } = input

    const existedTechnologySection = await this.technologySectionModel.findOne({
      'name.original': name.original,
    })

    if (existedTechnologySection) {
      throw new BadRequestException(t('message.technologySection.existed'))
    }

    const newTechnologySection = await this.technologySectionModel.create({
      name,
      slug: convertSlug(joinDisplayName(name)),
      technologyType,
    })

    await newTechnologySection.save()

    return new TechnologySectionResponse(newTechnologySection)
  }
}
