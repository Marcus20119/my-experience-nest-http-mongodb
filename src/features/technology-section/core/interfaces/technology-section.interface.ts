import { ApiProperty } from '@nestjs/swagger'

import { DisplayName } from '@/common/interfaces'
import { TechnologySection } from '@/db/entities'

export class TechnologySectionResponse {
  @ApiProperty({
    type: String,
  })
  id: string

  @ApiProperty({
    type: DisplayName,
  })
  name: DisplayName

  constructor(technologySection: TechnologySection) {
    this.id = technologySection.id
    this.name = technologySection.name
  }
}
