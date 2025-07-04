import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'

import { DisplayName } from '@/common/interfaces'
import { BaseKnowledgeItemResponse } from '@/common/interfaces/knowledge-item.interface'

import { BaseEntity } from '../base'

@Schema({ collection: 'knowledge_groups', timestamps: true })
export class KnowledgeGroup extends BaseEntity {
  @Prop({
    required: true,
    type: DisplayName,
  })
  name: DisplayName

  @Prop({
    type: String,
  })
  slug: string

  @Prop({
    type: String,
  })
  search: string

  @Prop({
    type: String,
  })
  description: string

  @Prop({
    type: String,
  })
  technologyId: string

  @Prop({
    type: [BaseKnowledgeItemResponse],
  })
  knowledgeItems: BaseKnowledgeItemResponse[]
}

export const KnowledgeGroupSchema = SchemaFactory.createForClass(KnowledgeGroup)
