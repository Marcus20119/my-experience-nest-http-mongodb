import { BadRequestException } from '@nestjs/common'
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { InjectModel } from '@nestjs/mongoose'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsEnum, IsMongoId, IsNotEmpty, IsNumber, IsOptional } from 'class-validator'
import { Model } from 'mongoose'

import { IsStepInRange } from '@/common/decorators'
import { IconType, SyncAction, TechnologyType } from '@/common/enums'
import { convertSlug, t } from '@/common/utils'
import { Technology, TechnologySection } from '@/db/entities'

import { TechnologyResponse } from '../core/interfaces/technology.interface'
import { BaseTechnologyCommand } from './base-technology.command'

export class CreateTechnologyInput {
  @ApiProperty({
    type: String,
  })
  @IsNotEmpty()
  name: string

  @ApiProperty({
    enum: IconType,
    type: String,
  })
  @IsNotEmpty()
  @IsEnum(IconType)
  iconType: IconType

  @ApiPropertyOptional({
    type: String,
  })
  @IsOptional()
  iconUrl?: string

  @ApiPropertyOptional({
    type: String,
  })
  @IsOptional()
  iconName?: string

  @ApiProperty({
    type: String,
  })
  @IsNotEmpty()
  color1: string

  @ApiPropertyOptional({
    type: String,
  })
  @IsOptional()
  color2?: string

  @ApiPropertyOptional({
    type: String,
  })
  @IsOptional()
  color3?: string

  @ApiPropertyOptional({
    type: String,
  })
  @IsOptional()
  description?: string

  @ApiPropertyOptional({
    maximum: 5,
    minimum: 0,
    type: Number,
  })
  @IsOptional()
  @IsNumber()
  @IsStepInRange(0, 5, 0.5)
  rate?: number

  @ApiProperty({
    enum: TechnologyType,
    type: String,
  })
  @IsNotEmpty()
  @IsEnum(TechnologyType)
  technologyType: TechnologyType

  @ApiProperty({
    type: String,
  })
  @IsOptional()
  @IsMongoId()
  technologySectionId?: string
}

export class CreateTechnologyCommand {
  constructor(public input: CreateTechnologyInput) {}
}

@CommandHandler(CreateTechnologyCommand)
export class CreateTechnologyCommandHandler
  extends BaseTechnologyCommand
  implements ICommandHandler<CreateTechnologyCommand>
{
  constructor(
    @InjectModel(Technology.name)
    protected readonly technologyModel: Model<Technology>,
    @InjectModel(TechnologySection.name)
    protected readonly technologySectionModel: Model<TechnologySection>,
  ) {
    super(technologySectionModel)
  }

  async execute(command: CreateTechnologyCommand): Promise<TechnologyResponse> {
    const { input } = command
    const {
      color1,
      color2,
      color3,
      description,
      iconName,
      iconType,
      iconUrl,
      name,
      rate,
      technologySectionId,
      technologyType,
    } = input

    this.verifyIcon(input)

    const existedTechnology = await this.technologyModel.findOne({
      name,
    })

    if (existedTechnology) {
      throw new BadRequestException(t('message.technology.existed'))
    }

    const newTechnology = await this.technologyModel.create({
      color1,
      color2,
      color3,
      description,
      iconName,
      iconType,
      iconUrl,
      name,
      rate,
      slug: convertSlug(name),
      technologySectionId,
      technologyType,
    })

    if (technologySectionId) {
      const technologySection = await this.technologySectionModel.findById(
        input.technologySectionId,
      )

      if (!technologySection) {
        throw new BadRequestException(t('message.technologySection.notFound'))
      }

      await this.syncTechnologySectionInfo({
        syncAction: SyncAction.CREATE,
        technology: newTechnology,
        technologySectionId,
      })
    }

    await newTechnology.save()

    return new TechnologyResponse(newTechnology)
  }
}
