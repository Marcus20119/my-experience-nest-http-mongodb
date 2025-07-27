import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsEnum, IsMongoId, IsOptional } from 'class-validator'

import { TechnologyType } from '@/common/enums'
import {
  BaseKnowledgeGroupResponse,
  BaseKnowledgeItemResponse,
  BaseTechnologyResponse,
} from '@/common/interfaces'
import { Maybe, RawFilterDto } from '@/common/types'
import { Technology } from '@/db/entities'
import { CloudfrontService } from '@/services/aws/cloud-front/cloudfront.service'

export class TechnologyResponse extends BaseTechnologyResponse {
  @ApiProperty({
    enum: TechnologyType,
    enumName: 'TechnologyType',
    type: String,
  })
  technologyType: TechnologyType

  @ApiPropertyOptional({
    nullable: true,
    type: String,
  })
  technologySectionId: Maybe<string>

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

export class TechnologyQueryFilter implements RawFilterDto {
  @ApiPropertyOptional({
    enum: TechnologyType,
    enumName: 'TechnologyType',
    type: String,
  })
  @IsOptional()
  @IsEnum(TechnologyType)
  technologyType?: TechnologyType

  @ApiPropertyOptional({
    type: String,
  })
  @IsOptional()
  @IsMongoId()
  technologySectionId?: string
}
