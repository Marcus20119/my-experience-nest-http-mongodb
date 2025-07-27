import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsMongoId, IsOptional } from 'class-validator'

import { TechnologyType } from '@/common/enums'
import { BaseKnowledgeGroupResponse } from '@/common/interfaces'
import { RawFilterDto } from '@/common/types'
import { KnowledgeGroup } from '@/db/entities'

export class KnowledgeGroupResponse extends BaseKnowledgeGroupResponse {
  @ApiProperty({
    type: String,
  })
  search: string

  @ApiProperty({
    enum: TechnologyType,
    enumName: 'TechnologyType',
    type: String,
  })
  technologyType: TechnologyType

  @ApiPropertyOptional({
    type: String,
  })
  technologySectionId?: string

  @ApiProperty({
    type: String,
  })
  technologyId: string

  constructor(knowledgeGroup: KnowledgeGroup) {
    super(knowledgeGroup)
    this.search = knowledgeGroup.search
    this.technologyId = knowledgeGroup.technologyId
    this.technologyType = knowledgeGroup.technologyType
  }
}

export class KnowledgeGroupQueryFilter implements RawFilterDto {
  @ApiPropertyOptional({
    type: String,
  })
  @IsOptional()
  @IsMongoId()
  technologyId?: string
}
