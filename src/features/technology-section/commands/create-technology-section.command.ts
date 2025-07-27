import { BadRequestException } from '@nestjs/common'
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { InjectConnection, InjectModel } from '@nestjs/mongoose'
import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsEnum, IsNotEmpty, ValidateNested } from 'class-validator'
import { Connection, Model } from 'mongoose'

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
    @InjectConnection()
    private readonly connection: Connection,
  ) {}

  async execute(command: CreateTechnologySectionCommand): Promise<TechnologySectionResponse> {
    const { input } = command
    const { name, technologyType } = input

    const session = await this.connection.startSession()
    session.startTransaction()

    try {
      const slug = convertSlug(name.original)

      // Step 1: Check uniqueness
      const existedTechnologySection = await this.technologySectionModel
        .findOne({
          $or: [{ 'name.original': name.original }, { slug }],
          technologyType,
        })
        .session(session)

      if (existedTechnologySection) {
        throw new BadRequestException(t('message.technologySection.existed'))
      }

      // Step 2: Create technology section
      const technologySection = new this.technologySectionModel({
        name,
        search: convertSlug(joinDisplayName(name)),
        slug,
        technologyType,
      })

      await technologySection.save({ session })

      await session.commitTransaction()
      return new TechnologySectionResponse(technologySection)
    } catch (error) {
      await session.abortTransaction()
      throw error
    } finally {
      session.endSession()
    }
  }
}
