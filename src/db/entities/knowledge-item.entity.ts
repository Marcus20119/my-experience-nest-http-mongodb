import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'

import { IconType, TechnologyType } from '@/common/enums'
import { Maybe } from '@/common/types'

import { BaseEntity } from '../base'

@Schema({ collection: 'knowledge_items', timestamps: true })
export class KnowledgeItem extends BaseEntity {
  @Prop({
    required: true,
    type: String,
  })
  name: string

  @Prop({
    enum: IconType,
    required: true,
    type: String,
  })
  iconType: IconType

  @Prop({
    type: String,
  })
  iconFileKey: Maybe<string>

  @Prop({
    type: String,
  })
  iconName: Maybe<string>

  @Prop({
    required: true,
    type: String,
  })
  color1: string

  @Prop({
    type: String,
  })
  color2?: Maybe<string>

  @Prop({
    type: String,
  })
  color3?: Maybe<string>

  @Prop({
    max: 5,
    min: 0,
    required: true,
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
  content: Maybe<string>

  @Prop({
    type: [String],
  })
  imageFileKeys: Maybe<string[]>

  @Prop({
    required: true,
    type: String,
  })
  slug: string

  @Prop({
    required: true,
    type: String,
  })
  search: string

  @Prop({
    enum: TechnologyType,
    required: true,
    type: String,
  })
  technologyType: TechnologyType

  @Prop({
    type: String,
  })
  technologySectionId: Maybe<string>

  @Prop({
    required: true,
    type: String,
  })
  technologyId: string

  @Prop({
    type: String,
  })
  knowledgeGroupId: Maybe<string>
}

export const KnowledgeItemSchema = SchemaFactory.createForClass(KnowledgeItem)
