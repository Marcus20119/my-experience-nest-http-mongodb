import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

import { Technology } from '@/db/entities/technology.entity'
import { CloudfrontService } from '@/services/aws/cloud-front/cloudfront.service'

import { IconType } from '../enums'
import { Maybe } from '../types'

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
    enumName: 'IconType',
    type: String,
  })
  iconType: IconType

  @ApiPropertyOptional({
    nullable: true,
    type: String,
  })
  iconFileKey: Maybe<string>

  @ApiPropertyOptional({
    nullable: true,
    type: String,
  })
  iconName: Maybe<string>

  @ApiProperty({
    type: String,
  })
  color1: string

  @ApiPropertyOptional({
    nullable: true,
    type: String,
  })
  color2: Maybe<string>

  @ApiPropertyOptional({
    nullable: true,
    type: String,
  })
  color3: Maybe<string>

  @ApiPropertyOptional({
    nullable: true,
    type: String,
  })
  description: Maybe<string>

  @ApiPropertyOptional({
    type: Number,
  })
  rate: number

  @ApiProperty({
    type: String,
  })
  slug: string

  constructor(technology: Technology, cloudfrontService: CloudfrontService) {
    this.id = technology.id
    this.name = technology.name
    this.iconType = technology.iconType
    this.iconFileKey = technology.iconFileKey
    this.iconName = technology.iconName
    this.color1 = technology.color1
    this.color2 = technology.color2
    this.color3 = technology.color3
    this.description = technology.description
    this.rate = technology.rate
    this.slug = technology.slug

    if (this.iconFileKey) {
      this.iconFileKey = cloudfrontService.getSignedUrl(this.iconFileKey)
    }
  }
}
