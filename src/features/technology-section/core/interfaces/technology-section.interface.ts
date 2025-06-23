import { ApiProperty } from '@nestjs/swagger'

import { TechnologyType } from '@/common/enums'
import { BaseTechnologyResponse, DisplayName } from '@/common/interfaces'
import { TechnologySection } from '@/db/entities'

export class TechnologySectionResponse {
  @ApiProperty({
    type: String,
  })
  id: string

  @ApiProperty({
    enum: TechnologyType,
    type: String,
  })
  type: string

  @ApiProperty({
    type: DisplayName,
  })
  name: DisplayName

  @ApiProperty({
    type: [BaseTechnologyResponse],
  })
  technologies: BaseTechnologyResponse[]

  constructor(technologySection: TechnologySection) {
    this.id = technologySection.id
    this.type = technologySection.type
    this.name = technologySection.name
    this.technologies = technologySection.technologies
  }
}
