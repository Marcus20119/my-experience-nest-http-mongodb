import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsMongoId, IsOptional } from 'class-validator'

import { BaseKnowledgeGroupResponse } from '@/common/interfaces'
import { RawFilterDto } from '@/common/types'
import { KnowledgeGroup } from '@/db/entities'

export class KnowledgeGroupResponse extends BaseKnowledgeGroupResponse {
  @ApiProperty({
    type: String,
  })
  search: string

  @ApiProperty({
    type: String,
  })
  technologyId: string

  @ApiPropertyOptional({
    nullable: true,
    type: String,
  })
  technologySectionId?: string

  constructor(knowledgeGroup: KnowledgeGroup) {
    super(knowledgeGroup)
    this.search = knowledgeGroup.search
    this.technologyId = knowledgeGroup.technologyId
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
