import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

import { Language } from '../enums'

export class I18nContentTranslation {
  @ApiProperty({
    enum: Language,
    type: String,
  })
  lang: Language

  @ApiProperty({
    type: String,
  })
  content: string
}

export class DisplayName {
  @ApiProperty({
    type: String,
  })
  original: string

  @ApiPropertyOptional({
    type: [I18nContentTranslation],
  })
  translations: I18nContentTranslation[]
}
