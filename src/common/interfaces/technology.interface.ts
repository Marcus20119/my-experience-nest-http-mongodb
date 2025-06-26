import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

import { Technology } from '@/db/entities/technology.entity'

import { IconType } from '../enums'

export class BaseTechnologyResponse {
  @ApiProperty({
    type: String,
  })
  id: string

  @ApiProperty({
    type: String,
  })
  name: string

  @ApiProperty({
    enum: IconType,
    type: String,
  })
  iconType: IconType

  @ApiPropertyOptional({
    nullable: true,
    type: String,
  })
  iconUrl?: string

  @ApiPropertyOptional({
    nullable: true,
    type: String,
  })
  iconName?: string

  @ApiProperty({
    type: String,
  })
  color1: string

  @ApiPropertyOptional({
    nullable: true,
    type: String,
  })
  color2?: string

  @ApiPropertyOptional({
    nullable: true,
    type: String,
  })
  color3?: string

  @ApiPropertyOptional({
    nullable: true,
    type: String,
  })
  description?: string

  @ApiPropertyOptional({
    nullable: true,
    type: Number,
  })
  rate?: number

  constructor(technology: Technology) {
    this.id = technology.id
    this.name = technology.name
    this.iconType = technology.iconType
    this.iconUrl = technology.iconUrl
    this.iconName = technology.iconName
    this.color1 = technology.color1
    this.color2 = technology.color2
    this.color3 = technology.color3
    this.description = technology.description
    this.rate = technology.rate
  }
}
