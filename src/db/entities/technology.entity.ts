import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'

import { IconType, TechnologyType } from '@/common/enums'
import { BaseKnowledgeGroupResponse, DisplayName } from '@/common/interfaces'
import { BaseKnowledgeItemResponse } from '@/common/interfaces/knowledge-item.interface'

import { BaseEntity } from '../base'

@Schema({ collection: 'technologies', timestamps: true })
export class Technology extends BaseEntity {
  @Prop({
    required: true,
    type: DisplayName,
  })
  name: DisplayName

  @Prop({
    enum: IconType,
    required: true,
    type: String,
  })
  iconType: IconType

  @Prop({
    type: String,
  })
  iconUrl: string

  @Prop({
    type: String,
  })
  iconName: string

  @Prop({
    type: String,
  })
  color: string

  @Prop({
    type: String,
  })
  description: string

  @Prop({
    max: 5,
    min: 0,
    type: Number,
    validate: {
      message: 'Rate must be in 0.5 steps',
      validator: (value: number) => (value * 10) % 5 === 0, // checks if it's in 0.5 step
    },
  })
  rate: number

  @Prop({
    type: String,
  })
  slug: string

  @Prop({
    enum: TechnologyType,
    required: true,
    type: String,
  })
  type: TechnologyType

  @Prop({
    type: String,
  })
  technologySectionId: string

  @Prop({
    type: [BaseKnowledgeGroupResponse],
  })
  knowledgeGroups: BaseKnowledgeGroupResponse[]

  @Prop({
    type: [BaseKnowledgeItemResponse],
  })
  knowledgeItems: BaseKnowledgeItemResponse[]
}

export const TechnologySchema = SchemaFactory.createForClass(Technology)
