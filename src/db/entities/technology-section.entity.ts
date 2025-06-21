import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'

import { TechnologyType } from '@/common/enums'
import { DisplayName } from '@/common/interfaces'

import { BaseEntity } from '../base'

@Schema({ timestamps: true })
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
}

export const TechnologySectionSchema = SchemaFactory.createForClass(TechnologySection)
