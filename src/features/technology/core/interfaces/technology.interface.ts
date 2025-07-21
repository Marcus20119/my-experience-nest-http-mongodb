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
    type: String,
  })
  technologyType: TechnologyType

  @ApiPropertyOptional({
    type: String,
  })
  technologySectionId?: string

  @ApiPropertyOptional({
    type: [BaseKnowledgeGroupResponse],
  })
  knowledgeGroups: BaseKnowledgeGroupResponse[]

  @ApiPropertyOptional({
    type: [BaseKnowledgeItemResponse],
  })
  knowledgeItems: BaseKnowledgeItemResponse[]

  constructor(technology: Technology, cloudfrontService: CloudfrontService) {
    super(technology, cloudfrontService)
    this.technologyType = technology.technologyType
    this.technologySectionId = technology.technologySectionId
    this.knowledgeGroups = technology.knowledgeGroups
    this.knowledgeItems = technology.knowledgeItems
  }
}
