import { ApiPropertyOptional } from '@nestjs/swagger'

import { TechnologyType } from '@/common/enums'
import {
  BaseKnowledgeGroupResponse,
  BaseKnowledgeItemResponse,
  BaseTechnologyResponse,
} from '@/common/interfaces'
import { Technology } from '@/db/entities'
import { CloudfrontService } from '@/services/aws/cloud-front/cloudfront.service'

export class TechnologyResponse extends BaseTechnologyResponse {
  @ApiPropertyOptional({
    enum: TechnologyType,
    enumName: 'TechnologyType',
    nullable: true,
    type: String,
  })
  type: TechnologyType

  @ApiPropertyOptional({
    nullable: true,
    type: String,
  })
  technologySectionId?: string

  @ApiPropertyOptional({
    nullable: true,
    type: [BaseKnowledgeGroupResponse],
  })
  knowledgeGroups: BaseKnowledgeGroupResponse[]

  @ApiPropertyOptional({
    nullable: true,
    type: [BaseKnowledgeItemResponse],
  })
  knowledgeItems: BaseKnowledgeItemResponse[]

  constructor(technology: Technology, cloudfrontService: CloudfrontService) {
    super(technology, cloudfrontService)
    this.type = technology.technologyType
    this.technologySectionId = technology.technologySectionId
    this.knowledgeGroups = technology.knowledgeGroups
    this.knowledgeItems = technology.knowledgeItems
  }
}
