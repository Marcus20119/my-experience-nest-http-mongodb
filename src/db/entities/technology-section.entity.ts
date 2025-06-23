import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'

import { TechnologyType } from '@/common/enums'
import { BaseTechnologyResponse, DisplayName } from '@/common/interfaces'

import { BaseEntity } from '../base'

@Schema({ collection: 'technology_sections', timestamps: true })
export class TechnologySection extends BaseEntity {
  @Prop({
    enum: TechnologyType,
    required: true,
    type: String,
  })
  type: TechnologyType

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
    type: [BaseTechnologyResponse],
  })
  technologies: BaseTechnologyResponse[]
}

export const TechnologySectionSchema = SchemaFactory.createForClass(TechnologySection)
