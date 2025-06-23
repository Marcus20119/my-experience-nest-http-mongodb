import { ApiProperty } from '@nestjs/swagger'

import { Technology } from '@/db/entities/technology.entity'

import { IconType } from '../enums'
import { DisplayName } from './display-name.interface'

export class BaseTechnologyResponse {
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
    type: String,
  })
  description: string

  @ApiProperty({
    type: Number,
  })
  rate: number

  constructor(technology: Technology) {
    this.id = technology.id
    this.name = technology.name
    this.iconType = technology.iconType
    this.iconUrl = technology.iconUrl
    this.iconName = technology.iconName
    this.color = technology.color
    this.description = technology.description
    this.rate = technology.rate
  }
}
