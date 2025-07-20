import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsEnum, IsOptional } from 'class-validator'

import { TechnologyType } from '@/common/enums'
import { BaseTechnologyResponse, DisplayName } from '@/common/interfaces'
import { RawFilterDto } from '@/common/types'
import { TechnologySection } from '@/db/entities'

export class BaseTechnologySectionResponse {
  @ApiProperty({
    type: String,
  })
  id: string

  @ApiProperty({
    type: DisplayName,
  })
  name: DisplayName

  @ApiProperty({
    type: String,
  })
  slug: string

  constructor(technologySection: TechnologySection) {
    this.id = technologySection.id
    this.name = technologySection.name
    this.slug = technologySection.slug
  }
}

export class TechnologySectionResponse extends BaseTechnologySectionResponse {
  @ApiProperty({
    enum: TechnologyType,
    enumName: 'TechnologyType',
    type: String,
  })
  technologyType: TechnologyType

  @ApiPropertyOptional({
    type: [BaseTechnologyResponse],
  })
  technologies: BaseTechnologyResponse[]

  constructor(technologySection: TechnologySection) {
    super(technologySection)
    this.technologyType = technologySection.technologyType
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

export class TechnologySectionSkeleton {
  @ApiProperty({
    enum: TechnologyType,
    enumName: 'TechnologyType',
    type: String,
  })
  technologyType: TechnologyType

  @ApiProperty({
    nullable: true,
    type: [BaseTechnologySectionResponse],
  })
  technologySections: BaseTechnologySectionResponse[]
}

export class TechnologySkeletonResponse {
  @ApiProperty({
    type: [TechnologySectionSkeleton],
  })
  technologySkeleton: TechnologySectionSkeleton[]
}
