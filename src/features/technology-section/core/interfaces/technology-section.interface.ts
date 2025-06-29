import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsEnum, IsOptional } from 'class-validator'

import { TechnologyType } from '@/common/enums'
import { BaseTechnologyResponse, DisplayName } from '@/common/interfaces'
import { RawFilterDto } from '@/common/types'
import { TechnologySection } from '@/db/entities'

export class TechnologySectionResponse {
  @ApiProperty({
    type: String,
  })
  id: string

  @ApiProperty({
    enum: TechnologyType,
    enumName: 'TechnologyType',
    type: String,
  })
  technologyType: TechnologyType

  @ApiProperty({
    type: DisplayName,
  })
  name: DisplayName

  @ApiPropertyOptional({
    nullable: true,
    type: [BaseTechnologyResponse],
  })
  technologies: BaseTechnologyResponse[]

  constructor(technologySection: TechnologySection) {
    this.id = technologySection.id
    this.technologyType = technologySection.technologyType
    this.name = technologySection.name
    this.technologies = technologySection.technologies
  }
}

export class TechnologySectionQueryFilter implements RawFilterDto {
  @ApiPropertyOptional({
    enum: TechnologyType,
    enumName: 'TechnologyType',
    type: String,
  })
  @IsOptional()
  @IsEnum(TechnologyType)
  technologyType?: TechnologyType
}
