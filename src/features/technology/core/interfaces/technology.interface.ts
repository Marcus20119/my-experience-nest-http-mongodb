import { ApiProperty } from '@nestjs/swagger'

import { TechnologyType } from '@/common/enums'
import {
  BaseKnowledgeGroupResponse,
  BaseKnowledgeItemResponse,
  BaseTechnologyResponse,
} from '@/common/interfaces'
import { Technology } from '@/db/entities'

export class TechnologyResponse extends BaseTechnologyResponse {
  @ApiProperty({
    enum: TechnologyType,
    type: String,
  })
  type: TechnologyType

  @ApiProperty({
    type: String,
  })
  technologySectionId: string

  @ApiProperty({
    type: [BaseKnowledgeGroupResponse],
  })
  knowledgeGroups: BaseKnowledgeGroupResponse[]

  @ApiProperty({
    type: [BaseKnowledgeItemResponse],
  })
  knowledgeItems: BaseKnowledgeItemResponse[]

  constructor(technology: Technology) {
    super(technology)
    this.type = technology.type
    this.technologySectionId = technology.technologySectionId
    this.knowledgeGroups = technology.knowledgeGroups
    this.knowledgeItems = technology.knowledgeItems
  }
}
