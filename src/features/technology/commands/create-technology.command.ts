import { BadRequestException } from '@nestjs/common'
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { InjectConnection, InjectModel } from '@nestjs/mongoose'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsEnum, IsMongoId, IsNotEmpty, IsNumber, IsOptional } from 'class-validator'
import { Connection, Model } from 'mongoose'

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
    enumName: 'IconType',
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
    enumName: 'TechnologyType',
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
    @InjectConnection()
    private readonly connection: Connection,
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

    const session = await this.connection.startSession()
    session.startTransaction()

    try {
      const slug = convertSlug(name)

      const existedTechnology = await this.technologyModel
        .findOne({
          $or: [{ name }, { slug }],
        })
        .session(session)

      if (existedTechnology) {
        throw new BadRequestException(t('message.technology.existed'))
      }

      const newTechnology = new this.technologyModel({
        color1,
        color2,
        color3,
        description,
        iconName,
        iconType,
        iconUrl,
        name,
        rate,
        search: convertSlug(name),
        slug,
        technologySectionId,
        technologyType,
      })

      await newTechnology.save({
        session,
      })

      if (technologySectionId) {
        const technologySection = await this.technologySectionModel
          .findById(input.technologySectionId)
          .session(session)

        if (!technologySection) {
          throw new BadRequestException(t('message.technologySection.notFound'))
        }

        if (technologySection.technologyType !== technologyType) {
          throw new BadRequestException(t('message.technology.technologyTypeNotMatch'))
        }

        await this.syncTechnologySectionInfo({
          session,
          syncAction: SyncAction.Create,
          technology: newTechnology,
        })
      }

      await session.commitTransaction()
      return new TechnologyResponse(newTechnology)
    } catch (error) {
      await session.abortTransaction()
      throw error
    } finally {
      session.endSession()
    }
  }
}
