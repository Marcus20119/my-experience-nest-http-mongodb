import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'

import { DisplayName } from '@/common/interfaces'
import { BaseKnowledgeItemResponse } from '@/common/interfaces/knowledge-item.interface'
import { Maybe } from '@/common/types'

import { BaseEntity } from '../base'

@Schema({ collection: 'knowledge_groups', timestamps: true })
export class KnowledgeGroup extends BaseEntity {
  @Prop({
    required: true,
    type: DisplayName,
  })
  name: DisplayName

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
    type: String,
  })
  description: Maybe<string>

  @Prop({
    required: true,
    type: String,
  })
  technologyId: string

  @Prop({
    default: [],
    required: true,
    type: [BaseKnowledgeItemResponse],
  })
  knowledgeItems: BaseKnowledgeItemResponse[]
}

export const KnowledgeGroupSchema = SchemaFactory.createForClass(KnowledgeGroup)
