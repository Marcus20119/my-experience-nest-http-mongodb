import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsArray, IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator'
import { FilterQuery } from 'mongoose'

export class RangeNumberQueryDto {
  @IsNotEmpty()
  @IsNumber()
  @ApiProperty()
  fieldName: string

  @IsOptional()
  @IsNumber()
  @ApiPropertyOptional({
    type: Number,
  })
  eq?: number

  @IsOptional()
  @IsNumber()
  @ApiPropertyOptional({
    type: Number,
  })
  ne?: number

  @IsOptional()
  @IsNumber()
  @ApiPropertyOptional({
    type: Number,
  })
  gte?: number

  @IsOptional()
  @IsNumber()
  @ApiPropertyOptional({
    type: Number,
  })
  lte?: number

  @IsOptional()
  @IsNumber()
  @ApiPropertyOptional({
    type: Number,
  })
  gt?: number

  @IsOptional()
  @IsNumber()
  @ApiPropertyOptional({
    type: Number,
  })
  lt?: number;

  @IsOptional()
  @IsArray()
  @ApiPropertyOptional({ type: [Number] })
  in?: number[]

  @IsOptional()
  @IsArray()
  @ApiPropertyOptional({ type: [Number] })
  nin?: number[]
}

export class RangeDateQueryDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  fieldName: string

  @IsOptional()
  @IsDateString()
  @ApiPropertyOptional({
    type: Date,
  })
  eq?: Date

  @IsOptional()
  @IsDateString()
  @ApiPropertyOptional({
    type: Date,
  })
  ne?: Date

  @IsOptional()
  @IsDateString()
  @ApiPropertyOptional({
    type: Date,
  })
  gte?: Date

  @IsOptional()
  @IsDateString()
  @ApiPropertyOptional({
    type: Date,
  })
  lte?: Date

  @IsOptional()
  @IsDateString()
  @ApiPropertyOptional({
    type: Date,
  })
  gt?: Date

  @IsOptional()
  @IsDateString()
  @ApiPropertyOptional({
    type: Date,
  })
  lt?: Date;

  @IsOptional()
  @IsArray()
  @ApiPropertyOptional({ type: [Date] })
  in?: Date[]

  @IsOptional()
  @IsArray()
  @ApiPropertyOptional({ type: [Date] })
  nin?: Date[]
}

export class RangeStringQueryDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  fieldName: string

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ type: String })
  eq?: string

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ type: String })
  ne?: string

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ type: String })
  gte?: string

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ type: String })
  lte?: string

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ type: String })
  gt?: string

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ type: String })
  lt?: string;

  @IsOptional()
  @IsString({ each: true })
  @ApiPropertyOptional({ type: [String] })
  in?: string[]

  @IsOptional()
  @IsString({ each: true })
  @ApiPropertyOptional({ type: [String] })
  nin?: string[]
}

export class WhereInputDto {
  @IsNotEmpty()
  @IsString()
  fieldName: string

  @IsNotEmpty()
  value: any
}

export class SearchInputDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  fieldName: string

  @IsNotEmpty()
  @ApiProperty()
  keyword: string
}

export class ManyRequestType {
  filters: FilterQuery<any>
  sort?: { [key: string]: -1 | 1 }
  limit: number
  offset: number
  select?: string
}

export class SingleRequestType {
  filters: FilterQuery<any>
  select: string
}
