import { Prop, Schema } from '@nestjs/mongoose'
import { Types } from 'mongoose'

@Schema()
export class BaseEntityId {
  id: string
  _id: Types.ObjectId
}

@Schema()
export class BaseEntity extends BaseEntityId {
  @Prop()
  createdAt: Date

  @Prop()
  updatedAt: Date
}

@Schema()
export class BaseAuditedEntity extends BaseEntity {
  @Prop({
    required: true,
  })
  createdById: string

  @Prop()
  updatedById: string
}
