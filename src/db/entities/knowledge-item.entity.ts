import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'

import { IconType } from '@/common/enums'
import { DisplayName } from '@/common/interfaces'

import { BaseEntity } from '../base'

@Schema({ collection: 'knowledge_items', timestamps: true })
export class KnowledgeItem extends BaseEntity {
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
  content: string

  @Prop({
    type: [String],
  })
  imageUrls: string[]

  @Prop({
    type: String,
  })
  slug: string

  @Prop({
    type: String,
  })
  knowledgeGroupId: string

  @Prop({
    type: String,
  })
  technologyId: string
}

export const KnowledgeItemSchema = SchemaFactory.createForClass(KnowledgeItem)
