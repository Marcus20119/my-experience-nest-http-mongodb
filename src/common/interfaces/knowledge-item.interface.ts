import { ApiProperty } from '@nestjs/swagger'

import { KnowledgeItem } from '@/db/entities/knowledge-item.entity'

import { IconType } from '../enums'
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

  @ApiProperty({
    type: String,
  })
  iconUrl: string

  @ApiProperty({
    type: String,
  })
  iconName: string

  @ApiProperty({
    type: String,
  })
  color: string

  @ApiProperty({
    type: Number,
  })
  rate: number

  constructor(knowledgeItem: KnowledgeItem) {
    this.id = knowledgeItem.id
    this.name = knowledgeItem.name
    this.iconType = knowledgeItem.iconType
    this.iconUrl = knowledgeItem.iconUrl
    this.iconName = knowledgeItem.iconName
    this.color = knowledgeItem.color
    this.rate = knowledgeItem.rate
  }
}
