import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsMongoId, IsOptional } from 'class-validator'

import { TechnologyType } from '@/common/enums'
import { BaseKnowledgeItemResponse } from '@/common/interfaces'
import { Maybe, RawFilterDto } from '@/common/types'
import { KnowledgeItem } from '@/db/entities'
import { CloudfrontService } from '@/services/aws/cloud-front/cloudfront.service'

export class KnowledgeItemResponse extends BaseKnowledgeItemResponse {
  @ApiProperty({
    enum: TechnologyType,
    enumName: 'TechnologyType',
    type: String,
  })
  technologyType: TechnologyType

  @ApiPropertyOptional({
    required: false,
    type: String,
  })
  technologySectionId: Maybe<string>

  @ApiProperty({
    type: String,
  })
  technologyId: string

  @ApiPropertyOptional({
    type: String,
  })
  knowledgeGroupId?: string

  @ApiPropertyOptional({
    nullable: true,
    type: String,
  })
  content: Maybe<string>

  @ApiPropertyOptional({
    nullable: true,
    type: [String],
  })
  imageFileKeys: Maybe<string[]>

  constructor(knowledgeItem: KnowledgeItem, cloudfrontService: CloudfrontService) {
    super(knowledgeItem, cloudfrontService)
    this.technologyType = knowledgeItem.technologyType
    this.technologySectionId = knowledgeItem.technologySectionId
    this.technologyId = knowledgeItem.technologyId
    this.knowledgeGroupId = knowledgeItem.knowledgeGroupId
    this.content = knowledgeItem.content
    this.imageFileKeys = knowledgeItem.imageFileKeys

    if (this.imageFileKeys) {
      this.imageFileKeys = this.imageFileKeys
        .map((imageUrl) => cloudfrontService.getSignedUrl(imageUrl))
        .filter(Boolean) as string[]
    }
  }
}

export class KnowledgeItemQueryFilter implements RawFilterDto {
  @ApiPropertyOptional({
    type: String,
  })
  @IsOptional()
  @IsMongoId()
  knowledgeGroupId?: string
}
