import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

import { KnowledgeGroup } from '@/db/entities/knowledge-group.entity'

import { Maybe } from '../types'
import { DisplayName } from './display-name.interface'
import { BaseKnowledgeItemResponse } from './knowledge-item.interface'

export class BaseKnowledgeGroupResponse {
  @ApiProperty({
    type: String,
  })
  id: string

  @ApiProperty({
    type: DisplayName,
  })
  name: DisplayName

  @ApiPropertyOptional({
    nullable: true,
    type: String,
  })
  description: Maybe<string>

  @ApiProperty({
    type: [BaseKnowledgeItemResponse],
  })
  knowledgeItems: BaseKnowledgeItemResponse[]

  constructor(knowledgeGroup: KnowledgeGroup) {
    this.id = knowledgeGroup.id
    this.name = knowledgeGroup.name
    this.description = knowledgeGroup.description
    this.knowledgeItems = knowledgeGroup.knowledgeItems
  }
}
