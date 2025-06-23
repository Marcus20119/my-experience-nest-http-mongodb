import { ApiProperty } from '@nestjs/swagger'

import { KnowledgeGroup } from '@/db/entities/knowledge-group.entity'

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

  @ApiProperty({
    type: String,
  })
  description: string

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
