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
  technologyType: TechnologyType

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
    default: [],
    required: true,
    type: [BaseTechnologyResponse],
  })
  technologies: BaseTechnologyResponse[]
}

export const TechnologySectionSchema = SchemaFactory.createForClass(TechnologySection)
