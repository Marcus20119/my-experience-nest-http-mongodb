import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsEnum, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator'

import { Language } from '../enums'

export class I18nContentTranslation {
  @ApiProperty({
    enum: Language,
    enumName: 'Language',
    type: String,
  })
  @IsNotEmpty()
  @IsEnum(Language)
  lang: Language

  @ApiProperty({
    type: String,
  })
  @IsNotEmpty()
  @IsString()
  content: string
}

export class DisplayName {
  @ApiProperty({
    type: String,
  })
  @IsNotEmpty()
  @IsString()
  original: string

  @ApiPropertyOptional({
    type: [I18nContentTranslation],
  })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => I18nContentTranslation)
  translations: I18nContentTranslation[]
}
