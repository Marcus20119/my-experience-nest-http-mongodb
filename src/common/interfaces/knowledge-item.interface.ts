import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

import { KnowledgeItem } from '@/db/entities/knowledge-item.entity'

import { IconType } from '../enums'
import { Maybe } from '../types'
import { DisplayName } from './display-name.interface'

export class BaseKnowledgeItemResponse {
  @ApiProperty({
    type: String,
  })
  id: string

  @ApiProperty({
    type: DisplayName,
  })
  name: DisplayName

  @ApiProperty({
    enum: IconType,
    enumName: 'IconType',
    type: String,
  })
  iconType: IconType

  @ApiPropertyOptional({
    nullable: true,
    type: String,
  })
  iconFileKey: Maybe<string>

  @ApiPropertyOptional({
    nullable: true,
    type: String,
  })
  iconName: Maybe<string>

  @ApiProperty({
    type: String,
  })
  color1: string

  @ApiPropertyOptional({
    nullable: true,
    type: String,
  })
  color2: Maybe<string>

  @ApiPropertyOptional({
    nullable: true,
    type: String,
  })
  color3: Maybe<string>

  @ApiPropertyOptional({
    nullable: true,
    type: Number,
  })
  rate?: number

  constructor(knowledgeItem: KnowledgeItem) {
    this.id = knowledgeItem.id
    this.name = knowledgeItem.name
    this.iconType = knowledgeItem.iconType
    this.iconFileKey = knowledgeItem.iconFileKey
    this.iconName = knowledgeItem.iconName
    this.color1 = knowledgeItem.color1
    this.color2 = knowledgeItem.color2
    this.color3 = knowledgeItem.color3
    this.rate = knowledgeItem.rate
  }
}
